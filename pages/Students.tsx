
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_STUDENTS, MOCK_CLASSES } from '../constants';
import { Student, User, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, Plus, Mail, BookOpen, Eye, X, GraduationCap, Check, User as UserIcon, 
  MessageSquare, Send, Filter, Award, Calendar, MapPin, Phone, 
  Briefcase, CreditCard, Lock, History, UserCheck, Trash2, Pencil, ChevronDown, EyeOff, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateAge, isValidPhone, isValidCitizenId, toTitleCase } from '../utils';

interface StudentsProps {
  currentUser: User | null;
}

export const Students: React.FC<StudentsProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Validation Error State
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Security Modal State
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [studentToReveal, setStudentToReveal] = useState<Student | null>(null);
  const [securityCode, setSecurityCode] = useState('');
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isTeacher = currentUser?.role === UserRole.TEACHER;

  // Determine which classes the current teacher is the homeroom teacher for
  const teacherHomeroomClassId = isTeacher 
      ? MOCK_CLASSES.find(c => c.teacherId === currentUser.id)?.id 
      : null;

  const defaultStudentState: Partial<Student> = {
    id: '', name: '', username: '', password: '', classId: MOCK_CLASSES[0]?.id || '',
    email: '', gpa: 0, enrollmentYear: new Date().getFullYear(), dateOfBirth: '',
    address: '', guardianName: '', guardianCitizenId: '', guardianYearOfBirth: 1980,
    guardianJob: '', guardianPhone: ''
  };

  const [formStudent, setFormStudent] = useState<Partial<Student>>(defaultStudentState);

  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass === 'All' || student.classId === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormStudent({ ...defaultStudentState, id: `S${Date.now().toString().slice(-5)}` });
    setFormErrors([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormStudent({ ...student });
    setFormErrors([]);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
        setStudents(students.filter(s => s.id !== id));
        if (selectedStudent?.id === id) setSelectedStudent(null);
    }
  };

  const validateStudentForm = (data: Partial<Student>): string[] => {
      const errors: string[] = [];

      // Required fields (Address is optional)
      if (!data.name?.trim()) errors.push("Họ tên không được để trống.");
      if (!data.username?.trim()) errors.push("Tên đăng nhập không được để trống.");
      if (!editingStudent && !data.password?.trim()) errors.push("Mật khẩu không được để trống.");
      if (!data.dateOfBirth) errors.push("Ngày sinh không được để trống.");
      if (!data.email?.trim()) errors.push("Email không được để trống.");
      if (!data.guardianName?.trim()) errors.push("Tên người giám hộ không được để trống.");
      if (!data.guardianPhone?.trim()) errors.push("SĐT người giám hộ không được để trống.");
      if (!data.guardianCitizenId?.trim()) errors.push("CCCD người giám hộ không được để trống.");

      // Age Validation (10 - 20)
      if (data.dateOfBirth) {
          const age = calculateAge(data.dateOfBirth);
          if (age < 10 || age > 20) {
              errors.push(`Tuổi học sinh phải từ 10 đến 20 (Hiện tại: ${age} tuổi).`);
          }
      }

      // Phone Validation
      if (data.guardianPhone && !isValidPhone(data.guardianPhone)) {
          errors.push("SĐT người giám hộ phải bắt đầu bằng số 0 và có đủ 10 số.");
      }

      // Citizen ID Validation
      if (data.guardianCitizenId && !isValidCitizenId(data.guardianCitizenId)) {
          errors.push("CCCD người giám hộ phải có đủ 12 số.");
      }

      return errors;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-format Name & Address & Guardian Name before validation
    const formattedData = {
        ...formStudent,
        name: toTitleCase(formStudent.name || ''),
        address: toTitleCase(formStudent.address || ''),
        guardianName: toTitleCase(formStudent.guardianName || '')
    };
    setFormStudent(formattedData);

    const errors = validateStudentForm(formattedData);
    if (errors.length > 0) {
        setFormErrors(errors);
        return;
    }

    const studentData: Student = {
      id: formattedData.id || `S${Date.now()}`,
      name: formattedData.name!,
      username: formattedData.username!,
      password: formattedData.password,
      classId: formattedData.classId || 'C101',
      email: formattedData.email || '',
      enrollmentYear: formattedData.enrollmentYear || new Date().getFullYear(),
      gpa: formattedData.gpa || 0,
      dateOfBirth: formattedData.dateOfBirth || '',
      address: formattedData.address || '',
      guardianName: formattedData.guardianName || '',
      guardianCitizenId: formattedData.guardianCitizenId || '',
      guardianYearOfBirth: formattedData.guardianYearOfBirth || 1980,
      guardianJob: formattedData.guardianJob || '',
      guardianPhone: formattedData.guardianPhone || '',
      academicHistory: editingStudent ? editingStudent.academicHistory : [],
      notes: editingStudent ? editingStudent.notes : []
    };

    if (editingStudent) {
        setStudents(students.map(s => s.id === editingStudent.id ? studentData : s));
    } else {
        setStudents([...students, studentData]);
    }
    setIsFormOpen(false);
  };

  const handleAddNote = (studentId: string, note: string) => {
    if (!note.trim()) return;
    const updatedStudents = students.map(s => s.id === studentId ? { ...s, notes: [...(s.notes || []), note] } : s);
    setStudents(updatedStudents);
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(prev => prev ? { ...prev, notes: [...(prev.notes || []), note] } : null);
    }
  };

  const handleRevealPassword = (student: Student) => {
      setStudentToReveal(student);
      setSecurityCode('');
      setRevealedPassword(null);
      setSecurityModalOpen(true);
  };

  const verifySecurityCode = () => {
      if (securityCode === 'password') {
          setRevealedPassword(studentToReveal?.password || 'No Password Set');
      } else {
          alert("Incorrect security code.");
      }
  };

  // Helper to check if current teacher can edit a student
  const canEditStudent = (student: Student) => {
      if (isAdmin) return true;
      if (isTeacher && student.classId === teacherHomeroomClassId) return true;
      return false;
  };

  // --- Components ---

  const StudentDetailModal = ({ student, onClose }: { student: Student, onClose: () => void }) => {
    const className = MOCK_CLASSES.find(c => c.id === student.classId)?.name || student.classId;
    const [noteInput, setNoteInput] = useState('');
    const history = student.academicHistory || [];
    const chartData = [...history.map(r => ({ year: r.year, gpa: r.gpa })), { year: 'Now', gpa: student.gpa }];
    const canEdit = canEditStudent(student);

    // Using Portal to render at document.body level
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 w-screen h-screen">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose}/>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
           {/* Absolute Close Button */}
           <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
              <X className="h-5 w-5" />
           </button>

           {/* Single Scrollable Container */}
           <div className="flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
              {/* Header with Pattern */}
              <div className="h-40 bg-indigo-900 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400 via-indigo-500 to-blue-500"></div>
              </div>

              <div className="px-6 md:px-8 pb-8 relative">
                 {/* Student Identity Card */}
                 <div className="relative -mt-14 mb-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start z-10">
                     <div className="h-28 w-28 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600 border-4 border-white shadow-sm shrink-0">
                        {student.name.charAt(0)}
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2 text-sm">
                           <span className="flex items-center text-gray-500"><UserIcon className="h-4 w-4 mr-1 text-gray-400"/> {student.id}</span>
                           <span className="flex items-center text-gray-500"><GraduationCap className="h-4 w-4 mr-1 text-gray-400"/> {className}</span>
                           <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-bold text-xs flex items-center"><Award className="h-3 w-3 mr-1"/> {student.gpa.toFixed(1)} GPA</span>
                        </div>
                     </div>
                     {canEdit && (
                     <div className="flex gap-2">
                        <button onClick={() => { onClose(); handleOpenEdit(student); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm">Edit Profile</button>
                     </div>
                     )}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                     {/* Left: Personal & Guardian */}
                     <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                           <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('students.modal.details')}</h3>
                           <div className="space-y-3 text-sm">
                              <div className="flex justify-between"><span className="text-gray-500">Date of Birth</span> <span className="font-medium text-gray-900">{student.dateOfBirth} ({calculateAge(student.dateOfBirth)} years old)</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Enrollment Year</span> <span className="font-medium text-gray-900">{student.enrollmentYear}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Email</span> <span className="font-medium text-gray-900 break-all">{student.email}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Address</span> <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">{student.address || 'N/A'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Username</span> <span className="font-mono text-gray-700 bg-gray-100 px-2 rounded">{student.username}</span></div>
                           </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                           <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                              <UserCheck className="h-4 w-4 text-indigo-500" />
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('student.guardianInfo')}</h3>
                           </div>
                           <div className="space-y-3 text-sm">
                              <div className="flex justify-between"><span className="text-gray-500">Name</span> <span className="font-bold text-gray-900">{student.guardianName}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Relation</span> <span className="font-medium text-gray-900">Parent/Guardian</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Phone</span> <span className="font-medium text-indigo-600">{student.guardianPhone}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Job</span> <span className="font-medium text-gray-900">{student.guardianJob}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Citizen ID</span> <span className="font-medium text-gray-900">{student.guardianCitizenId}</span></div>
                           </div>
                        </div>
                     </div>

                     {/* Right: Academic & Notes */}
                     <div className="space-y-6">
                        {/* Admin Security Section */}
                        {isAdmin && (
                            <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden ring-1 ring-red-50">
                                <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-red-600" />
                                    <h3 className="text-sm font-bold text-red-900 uppercase">{t('security.accountSecurity')}</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Username</p>
                                            <p className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded text-sm">{student.username}</p>
                                        </div>
                                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Role</p>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">STUDENT</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRevealPassword(student)} 
                                        className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-bold flex items-center justify-center shadow-sm"
                                    >
                                        <EyeOff className="h-4 w-4 mr-2" /> {t('security.viewPass')}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                           <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('students.modal.academic')}</h3>
                           <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="year" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 4]} hide />
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} />
                                        <Line type="monotone" dataKey="gpa" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} />
                                    </LineChart>
                                </ResponsiveContainer>
                           </div>
                           <div className="mt-4 space-y-2">
                                {student.academicHistory.map((rec, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                                        <span className="font-medium text-gray-600">{rec.year} - {rec.className}</span>
                                        <span className="font-bold text-indigo-600">{rec.gpa} GPA</span>
                                    </div>
                                ))}
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-100/50 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Notes</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
                                    {student.notes?.map((n, i) => (
                                        <div key={i} className="p-2.5 bg-white text-xs text-gray-600 rounded border border-gray-100 shadow-sm">{n}</div>
                                    ))}
                                    {(!student.notes || student.notes.length === 0) && <p className="text-xs text-gray-400 italic">No notes.</p>}
                                </div>
                                {canEdit && (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={noteInput} 
                                        onChange={(e) => setNoteInput(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && (handleAddNote(student.id, noteInput), setNoteInput(''))} 
                                        placeholder="Add note..." 
                                        className="flex-1 w-full min-w-0 text-xs border border-gray-300 bg-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none text-gray-700" 
                                    />
                                    <button onClick={() => { handleAddNote(student.id, noteInput); setNoteInput(''); }} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm shrink-0 flex items-center justify-center"><Send className="h-3 w-3" /></button>
                                </div>
                                )}
                            </div>
                        </div>
                     </div>
                 </div>
              </div>
           </div>
        </div>
      </div>,
      document.body
    );
  };

  const SlideOverForm = () => createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden w-screen h-screen">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsFormOpen(false)} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pointer-events-none">
        <div className="w-full sm:max-w-lg pointer-events-auto">
          <div className="h-full flex flex-col bg-white shadow-2xl animate-slide-in-right">
            <div className="px-6 py-6 bg-indigo-600 text-white shrink-0 shadow-md flex justify-between items-start">
                <div>
                   <h2 className="text-xl font-bold">{editingStudent ? t('students.form.edit') : t('students.form.new')}</h2>
                   <p className="text-indigo-100 text-sm mt-1">Complete the academic & personal profile</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-indigo-100 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto bg-gray-50">
               <div className="p-6 space-y-8">
                  
                  {/* Validation Errors */}
                  {formErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                          <h4 className="flex items-center text-red-700 font-bold text-sm mb-2">
                              <AlertTriangle className="h-4 w-4 mr-2" /> Vui lòng kiểm tra lại:
                          </h4>
                          <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                              {formErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                          </ul>
                      </div>
                  )}

                  {/* Section 1: Academic */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <GraduationCap className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('students.form.academic')}</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Student ID</label>
                             <input type="text" disabled value={formStudent.id} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Enrollment Year</label>
                             <input type="number" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.enrollmentYear} onChange={e => setFormStudent({...formStudent, enrollmentYear: parseInt(e.target.value) || 2024})} />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Class</label>
                             <div className="relative">
                                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none appearance-none" value={formStudent.classId} onChange={e => setFormStudent({...formStudent, classId: e.target.value})}>
                                    {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Current GPA</label>
                             <input type="number" step="0.1" max="4" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.gpa} onChange={e => setFormStudent({...formStudent, gpa: parseFloat(e.target.value) || 0})} />
                        </div>
                     </div>
                  </div>

                  {/* Section 2: Account */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <Lock className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Account</h3>
                     </div>
                     <div className="space-y-3">
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Username <span className="text-red-500">*</span></label>
                            <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.username} onChange={e => setFormStudent({...formStudent, username: e.target.value})} />
                         </div>
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Password {editingStudent ? '(Leave blank to keep unchanged)' : <span className="text-red-500">*</span>}</label>
                            <input type="password" placeholder={editingStudent ? "Unchanged" : "••••••"} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.password} onChange={e => setFormStudent({...formStudent, password: e.target.value})} />
                         </div>
                     </div>
                  </div>

                   {/* Section 3: Personal */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <UserIcon className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Personal</h3>
                     </div>
                     <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.name} onChange={e => setFormStudent({...formStudent, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                <input type="date" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.dateOfBirth} onChange={e => setFormStudent({...formStudent, dateOfBirth: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Email <span className="text-red-500">*</span></label>
                                <input type="email" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.email} onChange={e => setFormStudent({...formStudent, email: e.target.value})} />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                            <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.address} onChange={e => setFormStudent({...formStudent, address: e.target.value})} />
                         </div>
                     </div>
                  </div>

                   {/* Section 4: Guardian */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <UserCheck className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Guardian</h3>
                     </div>
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Guardian Name <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianName} onChange={e => setFormStudent({...formStudent, guardianName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone <span className="text-red-500">*</span></label>
                                <input type="tel" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" placeholder="0xxxxxxxxx" value={formStudent.guardianPhone} onChange={e => setFormStudent({...formStudent, guardianPhone: e.target.value})} />
                            </div>
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Year of Birth</label>
                                <input type="number" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianYearOfBirth} onChange={e => setFormStudent({...formStudent, guardianYearOfBirth: parseInt(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Job</label>
                                <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianJob} onChange={e => setFormStudent({...formStudent, guardianJob: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Citizen ID (12 số) <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianCitizenId} onChange={e => setFormStudent({...formStudent, guardianCitizenId: e.target.value})} />
                            </div>
                        </div>
                     </div>
                  </div>
               </div>
            </form>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-end gap-3">
               <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm">{t('common.cancel')}</button>
               <button onClick={handleSave} type="button" className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-2" /> {t('common.save')}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ... (Existing render code for table, etc) ... */}
      {/* Keeping existing render structure unchanged for brevity as requested change is logical */}
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('menu.students')}</h2>
          <p className="text-gray-500 mt-1">{t('students.subtitle')}</p>
        </div>
        {isAdmin && (
        <button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all flex items-center whitespace-nowrap">
            <Plus className="h-5 w-5 mr-2" /> {t('students.add')}
        </button>
        )}
      </div>

      {/* Filters & Table Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
           <div className="relative w-full md:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input type="text" placeholder={t('students.searchPlaceholder')} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <select className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none appearance-none cursor-pointer" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                    <option value="All">{t('students.filter.allClasses')}</option>
                    {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                <th className="px-6 py-5 pl-8">{t('students.table.name')}</th>
                <th className="px-6 py-5">{t('class.name')}</th>
                <th className="px-6 py-5">{t('student.gpa')}</th>
                <th className="px-6 py-5">{t('students.table.guardian')}</th>
                <th className="px-6 py-5 text-right pr-8">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => {
                const className = MOCK_CLASSES.find(c => c.id === student.classId)?.name || student.classId;
                const canEdit = canEditStudent(student);

                return (
                  <tr key={student.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                    <td className="px-6 py-4 pl-8">
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                           {student.name.substring(0, 2).toUpperCase()}
                         </div>
                         <div>
                           <div className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{student.name}</div>
                           <div className="text-xs text-gray-400 font-mono mt-0.5">{student.id}</div>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 group-hover:border-indigo-200 transition-colors">
                            {className}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                           <span className={`font-bold text-sm ${student.gpa >= 3.5 ? 'text-emerald-600' : student.gpa >= 2.5 ? 'text-indigo-600' : 'text-orange-600'}`}>
                             {student.gpa.toFixed(1)}
                           </span>
                           <span className="text-xs text-gray-400">/ 4.0</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 font-medium">{student.guardianPhone}</div>
                        <div className="text-xs text-gray-400">{student.guardianName}</div>
                    </td>
                    <td className="px-6 py-4 pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedStudent(student)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Profile"><Eye className="h-4 w-4" /></button>
                        {canEdit && (
                            <button onClick={() => handleOpenEdit(student)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                        )}
                        {isAdmin && (
                            <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
             <div className="p-12 text-center">
               <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No students found</h3>
               <p className="text-gray-500 mt-1">Try changing class filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {isFormOpen && <SlideOverForm />}
      {securityModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md w-screen h-screen">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('security.check')}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t('security.enterPass')} <strong>{studentToReveal?.name}</strong>.</p>
                  
                  {!revealedPassword ? (
                      <div className="space-y-4">
                          <input 
                              type="password" 
                              placeholder="Enter admin password" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={securityCode}
                              onChange={(e) => setSecurityCode(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && verifySecurityCode()}
                              autoFocus
                          />
                          <div className="flex gap-2">
                              <button onClick={() => setSecurityModalOpen(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">{t('common.cancel')}</button>
                              <button onClick={verifySecurityCode} className="flex-1 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">{t('security.verify')}</button>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <p className="text-xs text-green-600 uppercase font-bold mb-1">User Password</p>
                              <p className="text-lg font-mono font-bold text-green-800">{revealedPassword}</p>
                          </div>
                          <button onClick={() => setSecurityModalOpen(false)} className="w-full py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
                      </div>
                  )}
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};
