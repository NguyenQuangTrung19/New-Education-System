import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Student, User, UserRole, ClassGroup } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, Plus, Mail, BookOpen, Eye, X, GraduationCap, Check, User as UserIcon, 
  MessageSquare, Send, Filter, Award, Calendar, MapPin, Phone, 
  Briefcase, CreditCard, Lock, History, UserCheck, Trash2, Pencil, ChevronDown, EyeOff, ShieldCheck, AlertTriangle, Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateAge, isValidPhone, isValidCitizenId, toTitleCase } from '../utils';
import api from '../src/api/client';
import ReAuthModal from '../components/ReAuthModal';
import PasswordManagementModal from '../components/PasswordManagementModal';
import CredentialRevealModal from '../components/CredentialRevealModal';
import ExcelImportModal from '../components/ExcelImportModal';

interface StudentsProps {
  currentUser: User | null;
}

// --- Extracted Interfaces ---

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
  onEdit: (student: Student, action?: string) => void;
  onAddNote: (studentId: string, note: string) => void;
  onRevealPassword: (student: Student) => void;
  isAdmin: boolean;
  canEdit: boolean;
  classes: ClassGroup[];
}

interface SlideOverFormProps {
  onClose: () => void;
  editingStudent: Student | null;
  formStudent: Partial<Student>;
  setFormStudent: (data: Partial<Student>) => void;
  onSave: (e: React.FormEvent) => void;
  formErrors: string[];
  classes: ClassGroup[];
  onChangePassword?: () => void;
}

// --- Extracted Components ---

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ 
  student, onClose, onEdit, onAddNote, onRevealPassword, isAdmin, canEdit, classes 
}) => {
  const { t } = useLanguage();
  const className = classes.find(c => c.id === student.classId)?.name || student.classId;
  const [noteInput, setNoteInput] = useState('');
  const history = student.academicHistory || [];
  const chartData = [...history.map(r => ({ year: r.year, gpa: r.gpa })), { year: 'Now', gpa: student.gpa }];

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
                      {(student.name || "").charAt(0).toUpperCase()}
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
                      <button onClick={() => { onClose(); onEdit(student); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm">Edit Profile</button>
                   </div>
                   )}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                   {/* Left: Personal & Guardian */}
                   <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                         <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('students.modal.details')}</h3>
                         <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.dob')}</span> <span className="font-medium text-gray-900">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'} ({calculateAge(student.dateOfBirth)} {t('student.yearsOld')})</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.gender')}</span> <span className="font-medium text-gray-900">{student.gender ? (student.gender === 'Male' ? t('common.male') : student.gender === 'Female' ? t('common.female') : t('common.other')) : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.enrollmentYear')}</span> <span className="font-medium text-gray-900">{student.enrollmentYear}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.email')}</span> <span className="font-medium text-gray-900 break-all">{student.email}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.address')}</span> <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">{student.address || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.username')}</span> <span className="font-mono text-gray-700 bg-gray-100 px-2 rounded">{student.username}</span></div>
                         </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                         <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                            <UserCheck className="h-4 w-4 text-indigo-500" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('student.guardianInfo')}</h3>
                         </div>
                         <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.guardianName')}</span> <span className="font-bold text-gray-900">{student.guardianName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.relation')}</span> <span className="font-medium text-gray-900">{t('student.parentGuardian')}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.guardianPhone')}</span> <span className="font-medium text-indigo-600">{student.guardianPhone}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.guardianJob')}</span> <span className="font-medium text-gray-900">{student.guardianJob}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{t('student.guardianCitizenId')}</span> <span className="font-medium text-gray-900">{student.guardianCitizenId}</span></div>
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
                                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">{t('student.username')}</p>
                                          <p className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded text-sm">{student.username}</p>
                                      </div>
                                      <div className="h-8 w-px bg-gray-200 mx-2"></div>
                                      <div>
                                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Role</p>
                                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">STUDENT</span>
                                      </div>
                                  </div>
                                  <button
                                      onClick={() => onEdit(student, 'VIEW_PASSWORD')} 
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
                                      <YAxis domain={[0, 10]} hide />
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
                              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('common.notes')}</h3>
                          </div>
                          <div className="p-6">
                              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
                                  {student.notes?.map((n, i) => (
                                      <div key={i} className="p-2.5 bg-white text-xs text-gray-600 rounded border border-gray-100 shadow-sm">{n}</div>
                                  ))}
                                  {(!student.notes || student.notes.length === 0) && <p className="text-xs text-gray-400 italic">{t('common.noNotes')}</p>}
                              </div>
                              {canEdit && (
                              <div className="flex gap-2">
                                  <input 
                                      type="text" 
                                      value={noteInput} 
                                      onChange={(e) => setNoteInput(e.target.value)} 
                                      onKeyDown={(e) => e.key === 'Enter' && (onAddNote(student.id, noteInput), setNoteInput(''))} 
                                      placeholder={t('common.addNote')}
                                      className="flex-1 w-full min-w-0 text-xs border border-gray-300 bg-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none text-gray-700" 
                                  />
                                  <button onClick={() => { onAddNote(student.id, noteInput); setNoteInput(''); }} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm shrink-0 flex items-center justify-center"><Send className="h-3 w-3" /></button>
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

const SlideOverForm: React.FC<SlideOverFormProps> = ({ 
  onClose, editingStudent, formStudent, setFormStudent, onSave, formErrors = [], classes, onChangePassword
}) => {
  const { t } = useLanguage();

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden w-screen h-screen">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pointer-events-none">
        <div className="w-full sm:max-w-lg pointer-events-auto">
          <div className="h-full flex flex-col bg-white shadow-2xl animate-slide-in-right">
            <div className="px-6 py-6 bg-indigo-600 text-white shrink-0 shadow-md flex justify-between items-start">
                <div>
                   <h2 className="text-xl font-bold">{editingStudent ? t('students.form.edit') : t('students.form.new')}</h2>
                   <p className="text-indigo-100 text-sm mt-1">{t('student.form.subtitle')}</p>
                </div>
                <button onClick={onClose} className="text-indigo-100 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={onSave} className="flex-1 overflow-y-auto bg-gray-50">
               <div className="p-6 space-y-8">
                  
                  {/* Validation Errors */}
                  {formErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                          <h4 className="flex items-center text-red-700 font-bold text-sm mb-2">
                              <AlertTriangle className="h-4 w-4 mr-2" /> {t('student.form.validationTitle')}
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
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.id')}</label>
                             <input type="text" disabled value={formStudent.id} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.enrollmentYear')}</label>
                             <input type="number" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.enrollmentYear} onChange={e => setFormStudent({...formStudent, enrollmentYear: parseInt(e.target.value) || 2024})} />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Class</label>
                             <div className="relative">
                                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none appearance-none" value={formStudent.classId} onChange={e => setFormStudent({...formStudent, classId: e.target.value})}>
                                    <option value="">{t('student.noClass')}</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Current GPA (0-10)</label>
                             <input type="number" step="0.1" max="10" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.gpa} onChange={e => setFormStudent({...formStudent, gpa: parseFloat(e.target.value) || 0})} />
                        </div>
                     </div>
                  </div>

                  {/* Section 2: Account */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <Lock className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('student.form.account')}</h3>
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
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('student.form.personal')}</h3>
                     </div>
                     <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.name')} <span className="text-red-500">*</span></label>
                            <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.name} onChange={e => setFormStudent({...formStudent, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.dob')} <span className="text-red-500">*</span></label>
                                <input type="date" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.dateOfBirth ? new Date(formStudent.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => setFormStudent({...formStudent, dateOfBirth: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.gender')} <span className="text-red-500">*</span></label>
                                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.gender || 'Male'} onChange={e => setFormStudent({...formStudent, gender: e.target.value as any})}>
                                    <option value="Male">{t('common.male')}</option>
                                    <option value="Female">{t('common.female')}</option>
                                    <option value="Other">{t('common.other')}</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.email')} <span className="text-red-500">*</span></label>
                            <input type="email" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.email} onChange={e => setFormStudent({...formStudent, email: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.address')}</label>
                            <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.address} onChange={e => setFormStudent({...formStudent, address: e.target.value})} />
                         </div>
                     </div>
                  </div>

                   {/* Section 4: Guardian */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <UserCheck className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('student.form.guardian')}</h3>
                     </div>
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.guardianName')} <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianName} onChange={e => setFormStudent({...formStudent, guardianName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.guardianPhone')} <span className="text-red-500">*</span></label>
                                <input type="tel" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" placeholder="0xxxxxxxxx" value={formStudent.guardianPhone} onChange={e => setFormStudent({...formStudent, guardianPhone: e.target.value})} />
                            </div>
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.guardianYOB')}</label>
                                <input type="number" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianYearOfBirth} onChange={e => setFormStudent({...formStudent, guardianYearOfBirth: parseInt(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.guardianJob')}</label>
                                <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianJob} onChange={e => setFormStudent({...formStudent, guardianJob: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">{t('student.guardianCitizenId')} <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none" value={formStudent.guardianCitizenId} onChange={e => setFormStudent({...formStudent, guardianCitizenId: e.target.value})} />
                            </div>
                        </div>
                     </div>
                  </div>
               </div>
            </form>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-end gap-3">
               <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm">{t('common.cancel')}</button>
               <button onClick={onSave} type="button" className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-2" /> {t('common.save')}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const Students: React.FC<StudentsProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Validation Error State
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Re-Auth and Password Management State
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{ id: string; name: string; userId?: string } | null>(null);
  const [reAuthAction, setReAuthAction] = useState<'CHANGE' | 'VIEW' | null>(null);

  // Credential Reveal State
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [revealedCredentials, setRevealedCredentials] = useState<{ name: string; username: string; password?: string } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleOpenPasswordManage = (student: Student, action: string = 'CHANGE') => {
      // Close detail modal if open for VIEW
      if (action === 'VIEW' || action === 'VIEW_PASSWORD') {
         setSelectedStudent(null);
      }
      // Assuming student.userId is available from fetch
      const userId = (student as any).userId || (student as any).user?.id;
      if (!userId) {
          alert("Không thể tìm thấy ID người dùng hệ thống.");
          return;
      }
      setSelectedUserForPassword({ id: student.id, name: student.name, userId: userId });
      setReAuthAction(action as any);
      setIsReAuthOpen(true);
  };

  const handleReAuthSuccess = async () => {
      setIsReAuthOpen(false);
      if (reAuthAction === 'CHANGE') {
          setIsPasswordModalOpen(true);
      } else if (reAuthAction === 'VIEW' || reAuthAction === 'VIEW_PASSWORD') {
          try {
              const userId = selectedUserForPassword?.userId;
              if (!userId) return;
              
              const res = await api.get(`/users/${userId}/credentials`);
              const password = res.data?.password;
              
              setRevealedCredentials({
                  name: selectedUserForPassword?.name || 'Student',
                  username: students.find(s => s.id === selectedUserForPassword?.id)?.username || '',
                  password: password
              });
              setRevealModalOpen(true);
          } catch (error) {
              console.error("Failed to fetch credentials:", error);
              alert("Không thể lấy mật khẩu. Kiểm tra quyền admin.");
          }
      }
  };

  const handleOpenEdit = (student: Student, action?: string) => {
    if (action === 'VIEW_PASSWORD') {
        handleOpenPasswordManage(student, 'VIEW');
        return;
    }
    setEditingStudent(student);
    setFormStudent({ ...student });
    setFormErrors([]);
    setIsFormOpen(true);
  };
  
  const handleChangePassword = () => {
      if (editingStudent) {
          setIsFormOpen(false);
          handleOpenPasswordManage(editingStudent, 'CHANGE');
      }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isTeacher = currentUser?.role === UserRole.TEACHER;

  // Determine which classes the current teacher is the homeroom teacher for
  const teacherHomeroomClassId = isTeacher 
      ? classes.find(c => c.teacherId === currentUser.id)?.id 
      : null;

  const defaultStudentState: Partial<Student> = {
    id: '', name: '', username: '', password: '', classId: '',
    email: '', gpa: 0, enrollmentYear: new Date().getFullYear(), dateOfBirth: '',
    address: '', guardianName: '', guardianCitizenId: '', guardianYearOfBirth: 1980,
    guardianJob: '', guardianPhone: ''
  };

  const [formStudent, setFormStudent] = useState<Partial<Student>>(defaultStudentState);

  // Fetch Students Logic
  // Fetch Students Logic
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      const mapped = response.data.map((s: any) => ({
        ...s,
        name: s.user?.name || 'Unknown',
        email: s.user?.email || '',
      }));
      setStudents(mapped);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes');
            setClasses(response.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    fetchStudents();
    fetchClasses();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
        try {
            await api.delete(`/students/${id}`);
            setStudents(students.filter(s => s.id !== id));
            if (selectedStudent?.id === id) setSelectedStudent(null);
        } catch (err) {
            console.error("Failed to delete student", err);
            alert("Failed to delete student");
        }
    }
  };

  const validateStudentForm = (data: Partial<Student>): string[] => {
      const errors: string[] = [];

       // Required fields (Address is optional)
       if (!data.name?.trim()) errors.push(`${t('student.name')} ${t('student.validation.required')}`);
       if (!data.username?.trim()) errors.push(`${t('student.username')} ${t('student.validation.required')}`);
       if (!editingStudent && !data.password?.trim()) errors.push(`${t('student.password')} ${t('student.validation.required')}`);
       if (!data.dateOfBirth) errors.push(`${t('student.dob')} ${t('student.validation.required')}`);
       if (!data.email?.trim()) errors.push(`${t('student.email')} ${t('student.validation.required')}`);
       if (!data.guardianName?.trim()) errors.push(`${t('student.guardianName')} ${t('student.validation.required')}`);
       if (!data.guardianPhone?.trim()) errors.push(`${t('student.guardianPhone')} ${t('student.validation.required')}`);
       if (!data.guardianCitizenId?.trim()) errors.push(`${t('student.guardianCitizenId')} ${t('student.validation.required')}`);

       // Age Validation (10 - 20)
       if (data.dateOfBirth) {
           const age = calculateAge(data.dateOfBirth);
           // Custom logic typically requires custom messages or constructing them. 
           // For simplicity, we assume the key covers the main rule.
           if (age < 10 || age > 20) {
              errors.push(`${t('student.validation.age')} (Current: ${age})`);
           }
       }

       // Phone Validation
       if (data.guardianPhone && !isValidPhone(data.guardianPhone)) {
           errors.push(t('student.validation.phone'));
       }

       // Citizen ID Validation
       if (data.guardianCitizenId && !isValidCitizenId(data.guardianCitizenId)) {
           errors.push(t('student.validation.citizenId'));
       }

       return errors;
  };

  const handleSave = async (e: React.FormEvent) => {
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

    const studentPayload = {
      ...formattedData,
      classId: formattedData.classId || null, // Send null if empty
      enrollmentYear: formattedData.enrollmentYear || new Date().getFullYear(),
      gpa: formattedData.gpa || 0,
      guardianYearOfBirth: formattedData.guardianYearOfBirth || 1980,
    };

    try {
        setIsSubmitting(true);
        if (editingStudent) {
            const response = await api.patch(`/students/${editingStudent.id}`, studentPayload);
            // Re-fetch to guarantee data consistency
            await fetchStudents();
        } else {
            const response = await api.post('/students', studentPayload);
             // Re-fetch to guarantee data consistency
            await fetchStudents();
        }
        setIsFormOpen(false);
    } catch (error) {
        console.error("Failed to save student", error);
        alert(t('common.error'));
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddNote = (studentId: string, note: string) => {
    if (!note.trim()) return;
    const updatedStudents = students.map(s => s.id === studentId ? { ...s, notes: [...(s.notes || []), note] } : s);
    setStudents(updatedStudents);
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(prev => prev ? { ...prev, notes: [...(prev.notes || []), note] } : null);
    }
  };





  // Helper to check if current teacher can edit a student
  const canEditStudent = (student: Student) => {
      if (isAdmin) return true;
      if (isTeacher && student.classId === teacherHomeroomClassId) return true;
      return false;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('menu.students')}</h2>
          <p className="text-gray-500 mt-1">{t('students.subtitle')}</p>
        </div>
        {isAdmin && (
        <div className="flex gap-2">
            <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
            >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline font-bold">{t('import.title')}</span>
            </button>
            <button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all flex items-center whitespace-nowrap">
                <Plus className="h-5 w-5 mr-2" /> {t('students.add')}
            </button>
        </div>
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
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                const className = classes.find(c => c.id === student.classId)?.name || student.classId;
                const canEdit = canEditStudent(student);

                return (
                  <tr key={student.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                    <td className="px-6 py-4 pl-8">
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                           {(student.name || "").substring(0, 2).toUpperCase()}
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
                           <span className={`font-bold text-sm ${student.gpa >= 8.0 ? 'text-emerald-600' : student.gpa >= 6.5 ? 'text-indigo-600' : 'text-orange-600'}`}>
                             {student.gpa.toFixed(1)}
                           </span>
                           <span className="text-xs text-gray-400">/ 10.0</span>
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

      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onEdit={handleOpenEdit}
          onAddNote={handleAddNote}
          onRevealPassword={(s) => handleOpenEdit(s, 'VIEW_PASSWORD')}
          isAdmin={isAdmin}
          canEdit={canEditStudent(selectedStudent)}
          classes={classes}
        />
      )}
      
      {isFormOpen && (
        <SlideOverForm 
          onClose={() => setIsFormOpen(false)}
          editingStudent={editingStudent}
          formStudent={formStudent}
          setFormStudent={setFormStudent}
          onSave={handleSave}
          formErrors={formErrors}
          classes={classes}
        />
      )}

      <ReAuthModal 
        isOpen={isReAuthOpen} 
        onClose={() => setIsReAuthOpen(false)} 
        onSuccess={handleReAuthSuccess}
      />
      
      <PasswordManagementModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetUser={selectedUserForPassword}
      />

      <CredentialRevealModal
        isOpen={revealModalOpen}
        onClose={() => setRevealModalOpen(false)}
        credentials={revealedCredentials}
      />
      <ExcelImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        type="students" 
        onSuccess={fetchStudents} 
      />

    </div>
  );
};
