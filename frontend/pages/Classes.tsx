
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_CLASSES, MOCK_TEACHERS } from '../constants';
import { ClassGroup, User, UserRole, Teacher } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, Plus, MapPin, Users, Eye, MoreVertical, X, Check, School, 
  User as UserIcon, MessageSquare, Send, Calendar, TrendingUp, Award, BarChart2, Pencil, Trash2, Filter, ChevronDown
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { getCurrentAcademicYear } from '../utils';
import api from '../src/api/client';

interface ClassesProps {
  currentUser: User | null;
}

export const Classes: React.FC<ClassesProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<ClassGroup[]>(MOCK_CLASSES);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const currentYearDefault = getCurrentAcademicYear(); 
  const [selectedYear, setSelectedYear] = useState<string>(currentYearDefault);

  // Get unique academic years from data + current default
  const availableYears = useMemo(() => {
    const years = new Set(classes.map(c => c.academicYear));
    years.add(currentYearDefault);
    return Array.from(years).sort().reverse();
  }, [classes, currentYearDefault]);

  // Form State
  const defaultClassState: Partial<ClassGroup> = {
    id: '',
    name: '',
    gradeLevel: 10,
    room: '',
    teacherId: '',
    academicYear: currentYearDefault,
    studentCount: 0,
    maleStudentCount: 0,
    femaleStudentCount: 0,
    averageGpa: 0,
    currentWeeklyScore: 100,
    weeklyScoreHistory: [],
    description: ''
  };

  const [formClass, setFormClass] = useState<Partial<ClassGroup>>(defaultClassState);

  // Auto-calculate grade from name (e.g., "10A1" -> 10)
  useEffect(() => {
    if (formClass.name) {
      const match = formClass.name.match(/^(\d+)/);
      if (match && match[1]) {
        setFormClass(prev => ({ ...prev, gradeLevel: parseInt(match[1]) }));
      }
    }
  }, [formClass.name]);
  
  // Fetch Teachers for Dropdown
  useEffect(() => {
      const fetchTeachers = async () => {
          try {
              const res = await api.get('/teachers');
              setTeachers(res.data);
          } catch (err) {
              console.error("Failed to fetch teachers", err);
          }
      };
      
      const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
      };

      fetchTeachers();
      fetchClasses();
  }, []);

  const filteredClasses = classes.filter(c => 
    c.academicYear === selectedYear &&
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.room.toLowerCase().includes(searchTerm.toLowerCase()) || 
     getTeacherName(c.teacherId).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  function getTeacherName(id: string) {
    return teachers.find(t => t.id === id)?.name || 'Unknown';
  }

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormClass({ 
      ...defaultClassState, 
      id: `C${Date.now()}`,
      academicYear: currentYearDefault 
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cls: ClassGroup) => {
    setEditingClass(cls);
    setFormClass({ ...cls });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await api.delete(`/classes/${id}`);
        setClasses(classes.filter(c => c.id !== id));
        if (selectedClass?.id === id) setSelectedClass(null);
      } catch (err) {
        console.error("Failed to delete class", err);
        alert("Failed to delete class");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClass.name || !formClass.room) return;

    const classData: ClassGroup = {
      id: formClass.id || `C${Date.now()}`,
      name: formClass.name!,
      gradeLevel: formClass.gradeLevel || 10,
      room: formClass.room!,
      academicYear: formClass.academicYear || selectedYear,
      teacherId: formClass.teacherId || '',
      studentCount: formClass.studentCount || 0,
      maleStudentCount: formClass.maleStudentCount || 0,
      femaleStudentCount: formClass.femaleStudentCount || 0,
      averageGpa: formClass.averageGpa || 0,
      currentWeeklyScore: formClass.currentWeeklyScore || 100,
      weeklyScoreHistory: formClass.weeklyScoreHistory || [],
      description: formClass.description || '',
      notes: editingClass ? editingClass.notes : []
    };

    const classPayload = {
      ...classData,
      gradeLevel: Number(classData.gradeLevel), // Ensure number
    };

    try {
      setIsSubmitting(true);
      if (editingClass) {
        const response = await api.patch(`/classes/${editingClass.id}`, classPayload);
        setClasses(classes.map(c => c.id === editingClass.id ? response.data : c));
      } else {
        const response = await api.post('/classes', classPayload);
        setClasses([...classes, response.data]);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to save class", err);
      // alert("Failed to save class"); // Optional: show user error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = (classId: string, note: string) => {
    if (!note.trim()) return;
    const updatedClasses = classes.map(c => {
      if (c.id === classId) return { ...c, notes: [...(c.notes || []), note] };
      return c;
    });
    setClasses(updatedClasses);
    if (selectedClass?.id === classId) {
      setSelectedClass(prev => prev ? { ...prev, notes: [...(prev.notes || []), note] } : null);
    }
  };

  // --- Components ---





  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('menu.classes')}</h2>
          <p className="text-gray-500 mt-1">{t('classes.subtitle')}</p>
        </div>
        {isAdmin && (
        <button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all flex items-center whitespace-nowrap">
            <Plus className="h-5 w-5 mr-2" /> {t('classes.add')}
        </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
           <div className="relative w-full md:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input type="text" placeholder={t('classes.searchPlaceholder')} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <select 
                    className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none appearance-none cursor-pointer font-medium text-gray-700"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                 >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year} {year === currentYearDefault ? '(Current)' : ''}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                <th className="px-6 py-5 pl-8">{t('class.name')}</th>
                <th className="px-6 py-5">{t('class.grade')}</th>
                <th className="px-6 py-5">{t('classes.table.students')}</th>
                <th className="px-6 py-5">{t('timetable.teacher')}</th>
                <th className="px-6 py-5">{t('classes.table.stats')}</th>
                <th className="px-6 py-5 text-right pr-8">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map((cls) => (
                <tr key={cls.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                  <td className="px-6 py-4 pl-8">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                            <School className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">{cls.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> {cls.room}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        {t('class.grade')} {cls.gradeLevel}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div>
                        <span className="font-bold text-gray-900 text-sm">{cls.studentCount} {t('teachers.modal.students')}</span>
                        <div className="text-xs flex gap-2 mt-0.5">
                            <span className="text-blue-500 font-medium">{cls.maleStudentCount} M</span>
                            <span className="text-pink-500 font-medium">{cls.femaleStudentCount} F</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-sm font-medium text-indigo-600">{getTeacherName(cls.teacherId)}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase font-bold">GPA</div>
                            <div className={`font-bold text-sm ${cls.averageGpa >= 8.0 ? 'text-emerald-600' : 'text-gray-700'}`}>{cls.averageGpa}</div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase font-bold">Score</div>
                            <div className="font-bold text-sm text-indigo-600">{cls.currentWeeklyScore}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedClass(cls)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye className="h-4 w-4" /></button>
                      {isAdmin && (
                        <>
                        <button onClick={() => handleOpenEdit(cls)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(cls.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClasses.length === 0 && (
             <div className="p-12 text-center">
               <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
               <p className="text-gray-500 mt-1">Try changing the academic year or search query.</p>
            </div>
          )}
        </div>
      </div>

      {selectedClass && (
        <ClassDetailModal 
            classGroup={selectedClass} 
            onClose={() => setSelectedClass(null)} 
            isAdmin={isAdmin}
            onEdit={handleOpenEdit}
            onAddNote={handleAddNote}
            getTeacherName={getTeacherName} 
        />
      )}
      {isFormOpen && isAdmin && (
        <SlideOverForm 
            editingClass={editingClass}
            formClass={formClass}
            setFormClass={setFormClass}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
            teachers={teachers}
        />
      )}
    </div>
  );
};

// --- Extracted Components ---

interface SlideOverFormProps {
    editingClass: ClassGroup | null;
    formClass: Partial<ClassGroup>;
    setFormClass: (val: Partial<ClassGroup>) => void;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    teachers: Teacher[];
}

const SlideOverForm: React.FC<SlideOverFormProps> = ({ editingClass, formClass, setFormClass, onClose, onSave, teachers }) => {
    const { t } = useLanguage();
    return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden w-screen h-screen">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex pointer-events-none">
        <div className="w-screen max-w-md pointer-events-auto">
          <div className="h-full flex flex-col bg-white shadow-2xl animate-slide-in-right">
             <div className="px-6 py-6 bg-indigo-600 text-white shrink-0 shadow-md flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{editingClass ? t('classes.form.edit') : t('classes.form.new')}</h2>
                  <p className="text-indigo-100 text-sm mt-1">{formClass.academicYear}</p>
                </div>
                <button onClick={onClose} className="text-indigo-100 hover:text-white"><X className="h-6 w-6" /></button>
             </div>
             
             <form onSubmit={onSave} className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6 space-y-6">
                   {/* Basic Info */}
                   <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">{t('classes.form.details')}</h3>
                      <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.name')}</label>
                         <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formClass.name} onChange={e => setFormClass({...formClass, name: e.target.value})} placeholder="e.g. 10A1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.grade')}</label>
                             <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" value={formClass.gradeLevel} readOnly />
                          </div>
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.room')}</label>
                             <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formClass.room} onChange={e => setFormClass({...formClass, room: e.target.value})} />
                          </div>
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.academicYear')}</label>
                         <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formClass.academicYear} onChange={e => setFormClass({...formClass, academicYear: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.homeroomTeacher')}</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={formClass.teacherId} onChange={e => setFormClass({...formClass, teacherId: e.target.value})}>
                             <option value="">{t('timetable.selectTeacher')}</option>
                             {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subjects?.join(', ') || 'N/A'})</option>)}
                          </select>
                      </div>
                       <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.description')}</label>
                         <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} value={formClass.description} onChange={e => setFormClass({...formClass, description: e.target.value})} />
                      </div>
                   </div>

                   {/* Statistics (Manual Entry for now, ideally calculated) */}
                   <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">{t('classes.form.initialStats')}</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.totalStudents')}</label>
                             <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formClass.studentCount} onChange={e => setFormClass({...formClass, studentCount: parseInt(e.target.value)})} />
                          </div>
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.avgGpa')}</label>
                             <input type="number" step="0.1" max="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formClass.averageGpa} onChange={e => setFormClass({...formClass, averageGpa: parseFloat(e.target.value)})} />
                          </div>
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.male')}</label>
                             <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formClass.maleStudentCount} onChange={e => setFormClass({...formClass, maleStudentCount: parseInt(e.target.value)})} />
                          </div>
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('class.female')}</label>
                             <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formClass.femaleStudentCount} onChange={e => setFormClass({...formClass, femaleStudentCount: parseInt(e.target.value)})} />
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
}

interface ClassDetailModalProps {
    classGroup: ClassGroup;
    onClose: () => void;
    isAdmin: boolean;
    onEdit: (c: ClassGroup) => void;
    onAddNote: (id: string, note: string) => void;
    getTeacherName: (id: string) => string;
}

const ClassDetailModal: React.FC<ClassDetailModalProps> = ({ classGroup, onClose, isAdmin, onEdit, onAddNote, getTeacherName }) => {
    const { t } = useLanguage();
    const teacherName = getTeacherName(classGroup.teacherId);
    const [noteInput, setNoteInput] = useState('');

    const submitNote = () => {
        if(noteInput.trim()) {
            onAddNote(classGroup.id, noteInput);
            setNoteInput('');
        }
    };

    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 w-screen h-screen">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
           <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
              <X className="h-5 w-5" />
           </button>

           <div className="flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
               {/* Cover Area */}
               <div className="h-40 bg-gradient-to-r from-indigo-600 to-blue-500 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
               </div>

               <div className="px-8 pb-8 relative">
                   {/* Main Header Card */}
                   <div className="relative -mt-16 mb-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start z-10">
                       <div className="h-24 w-24 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 border-4 border-white shadow-sm shrink-0">
                          <School className="h-10 w-10" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div>
                                <h2 className="text-3xl font-bold text-gray-900">{classGroup.name}</h2>
                                <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <MapPin className="h-4 w-4" /> {classGroup.room} • {t('class.academicYear')}: <span className="text-indigo-600 font-bold">{classGroup.academicYear}</span>
                                </p>
                             </div>
                             {isAdmin && (
                             <div className="flex gap-2">
                                <button onClick={() => { onClose(); onEdit(classGroup); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm flex items-center">
                                    <Pencil className="h-4 w-4 mr-2" /> Edit Class
                                </button>
                             </div>
                             )}
                          </div>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                       {/* Left: Stats & Charts */}
                       <div className="lg:col-span-2 space-y-6">
                           {/* Quick Stats */}
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                  <p className="text-xs text-gray-500 font-bold uppercase">{t('class.totalStudents')}</p>
                                  <p className="text-2xl font-bold text-gray-900 mt-1">{classGroup.studentCount}</p>
                                  <div className="flex justify-center gap-2 mt-2 text-xs">
                                     <span className="text-blue-600 font-medium">{classGroup.maleStudentCount} M</span>
                                     <span className="text-pink-600 font-medium">{classGroup.femaleStudentCount} F</span>
                                  </div>
                               </div>
                               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                  <p className="text-xs text-gray-500 font-bold uppercase">{t('class.grade')}</p>
                                  <p className="text-2xl font-bold text-gray-900 mt-1">{classGroup.gradeLevel}</p>
                               </div>
                               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                  <p className="text-xs text-gray-500 font-bold uppercase">{t('class.avgGpa')}</p>
                                  <p className="text-2xl font-bold text-emerald-600 mt-1">{classGroup.averageGpa.toFixed(2)}</p>
                               </div>
                               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                  <p className="text-xs text-gray-500 font-bold uppercase">{t('class.weeklyScore')}</p>
                                  <p className="text-2xl font-bold text-indigo-600 mt-1">{classGroup.currentWeeklyScore}</p>
                               </div>
                           </div>

                           {/* Activity Chart */}
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center">
                                  <BarChart2 className="h-4 w-4 mr-2 text-indigo-500" /> {t('class.scoreHistory')}
                              </h3>
                              <div className="h-56 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={classGroup.weeklyScoreHistory}>
                                          <defs>
                                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                              </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                          <XAxis dataKey="week" tickFormatter={(v) => `W${v}`} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                          <YAxis domain={[0, 100]} hide />
                                          <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} />
                                          <Area type="monotone" dataKey="score" stroke="#4f46e5" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                      </AreaChart>
                                  </ResponsiveContainer>
                              </div>
                           </div>
                       </div>

                       {/* Right: Info & Notes */}
                       <div className="space-y-6">
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('common.information')}</h3>
                               <div className="space-y-4">
                                   <div>
                                       <label className="text-xs text-gray-500 font-bold uppercase block mb-1">{t('class.homeroomTeacher')}</label>
                                       <div className="flex items-center gap-2">
                                           <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                               {teacherName.charAt(0)}
                                           </div>
                                           <span className="text-sm font-medium text-gray-900">{teacherName}</span>
                                       </div>
                                   </div>
                                   <div>
                                       <label className="text-xs text-gray-500 font-bold uppercase block mb-1">{t('class.description')}</label>
                                       <p className="text-sm text-gray-600 italic">{classGroup.description}</p>
                                   </div>
                               </div>
                           </div>

                           <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                              <div className="px-6 py-4 border-b border-gray-200 bg-gray-100/50 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-gray-500" />
                                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('teachers.modal.notes')}</h3>
                              </div>
                              <div className="p-6">
                                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                      {classGroup.notes?.map((n, i) => (
                                          <div key={i} className="p-2.5 bg-white text-xs text-gray-600 rounded border border-gray-100 shadow-sm">{n}</div>
                                      ))}
                                      {(!classGroup.notes || classGroup.notes.length === 0) && <p className="text-xs text-gray-400 italic">No notes.</p>}
                                  </div>
                                  {isAdmin && (
                                  <div className="flex gap-2">
                                      <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitNote()} placeholder="Add note..." className="flex-1 text-xs border-0 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                                      <button onClick={submitNote} className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 shadow-sm"><Send className="h-3 w-3" /></button>
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
