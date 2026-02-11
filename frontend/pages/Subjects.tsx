
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../src/api/client';
import { Subject, Teacher, User, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, Plus, BookOpen, Eye, X, Check, MessageSquare, Send, 
  School, Trash2, Pencil, Users, BarChart3, Tag, Layers, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface SubjectsProps {
  currentUser: User | null;
}

export const Subjects: React.FC<SubjectsProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Form State
  const defaultSubjectState: Partial<Subject> = {
    name: '',
    code: '',
    department: 'Natural Sciences',
    description: '',
    notes: []
  };

  const [formSubject, setFormSubject] = useState<Partial<Subject>>(defaultSubjectState);

  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);

  // Fetch Subjects & Departments
  const fetchData = async () => {
    try {
        const [subjectsRes, departmentsRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/subjects/departments')
        ]);
        
        // Backend returns subjects. We need to map or ensure format.
        // Backend doesn't return averageGpaHistory yet, so we mock it for UI consistency if needed
        const mappedData = subjectsRes.data.map((s: any) => ({
            ...s,
            averageGpaHistory: s.averageGpaHistory || [],
            notes: s.notes || []
        }));
        setSubjects(mappedData);
        setAvailableDepartments(departmentsRes.data);
    } catch (error) {
        console.error("Failed to fetch data", error);
    } finally {
        setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to count teachers for a subject - Mock for now as backend doesn't explicitly link 
  // (though backend has teachingAssignments, we might not have loaded them all here)
  const getTeachersForSubject = (subject: Subject): Teacher[] => {
    // In a real app, we might fetch this detail or include it in the getAll response
    return [];
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormSubject({ ...defaultSubjectState });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormSubject({ ...subject });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await api.delete(`/subjects/${id}`);
        setSubjects(subjects.filter(s => s.id !== id));
        if (selectedSubject?.id === id) setSelectedSubject(null);
      } catch (error) {
        console.error("Failed to delete subject", error);
        alert(t('common.error'));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.name || !formSubject.code) return;

    try {
        if (editingSubject) {
            const { data } = await api.patch(`/subjects/${editingSubject.id}`, formSubject);
             setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, ...data } : s));
        } else {
            const { data } = await api.post('/subjects', formSubject);
            // Ensure local shape matches
            const newSubject = { ...data, averageGpaHistory: [], notes: [] };
            setSubjects([...subjects, newSubject]);
        }
        setIsFormOpen(false);
    } catch (error) {
        console.error("Failed to save subject", error);
        alert(t('common.error'));
    }
  };

  const handleAddNote = (subjectId: string, note: string) => {
    // Note implementation: In backend we don't have a specific endpoint for notes on Subject yet, 
    // unless we treat it as an update to 'notes' field (assuming we added it to schema/dto? We didn't add 'notes' to Subject Schema)
    // For now, we'll just handle it client side or assume it fails silently on backend if we try to patch it.
    // The previous schema didn't have notes on Subject.
    if (!note.trim()) return;
    const updatedSubjects = subjects.map(s => {
      if (s.id === subjectId) return { ...s, notes: [...(s.notes || []), note] };
      return s;
    });
    setSubjects(updatedSubjects);
    if (selectedSubject && selectedSubject.id === subjectId) {
      setSelectedSubject(prev => prev ? { ...prev, notes: [...(prev.notes || []), note] } : null);
    }
  };

  // --- Components ---



  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('menu.subjects')}</h2>
          <p className="text-gray-500 mt-1">{t('subjects.subtitle')}</p>
        </div>
        {isAdmin && (
        <button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all flex items-center whitespace-nowrap">
            <Plus className="h-5 w-5 mr-2" /> {t('subjects.add')}
        </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input type="text" placeholder={t('subjects.searchPlaceholder')} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                <th className="px-6 py-5 pl-8">{t('subject.name')}</th>
                <th className="px-6 py-5">{t('subject.department')}</th>
                <th className="px-6 py-5">{t('subject.teacherCount')}</th>
                <th className="px-6 py-5">{t('subjects.table.avgGpa')}</th>
                <th className="px-6 py-5 text-right pr-8">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubjects.map((subject) => {
                const teachers = getTeachersForSubject(subject);
                const latestGpa = subject.averageGpaHistory.length > 0 ? subject.averageGpaHistory[subject.averageGpaHistory.length - 1].gpa : 0;
                
                return (
                  <tr key={subject.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                    <td className="px-6 py-4 pl-8">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200">
                              <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                              <div className="font-bold text-gray-900 text-sm">{subject.name}</div>
                              <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 rounded inline-block mt-0.5">{subject.code}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {subject.department}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                           <Users className="h-4 w-4 text-gray-400" />
                           <span className="text-sm font-medium text-gray-900">{teachers.length}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`font-bold text-sm ${latestGpa >= 8.0 ? 'text-emerald-600' : latestGpa >= 6.5 ? 'text-indigo-600' : 'text-orange-600'}`}>
                         {latestGpa}
                       </span>
                    </td>
                    <td className="px-6 py-4 pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedSubject(subject)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye className="h-4 w-4" /></button>
                        {isAdmin && (
                        <>
                        <button onClick={() => handleOpenEdit(subject)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(subject.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSubjects.length === 0 && (
             <div className="p-12 text-center">
               <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No subjects found</h3>
               <p className="text-gray-500 mt-1">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </div>

      {selectedSubject && (
        <SubjectDetailModal 
            subject={selectedSubject} 
            onClose={() => setSelectedSubject(null)} 
            isAdmin={isAdmin}
            onEdit={handleOpenEdit}
            onAddNote={handleAddNote}
            getTeachersForSubject={getTeachersForSubject}
        />
      )}
      {isFormOpen && isAdmin && (
        <SlideOverForm 
            editingSubject={editingSubject}
            formSubject={formSubject}
            setFormSubject={setFormSubject}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
            availableDepartments={availableDepartments}
        />
      )}
    </div>
  );
};

// --- Extracted Components ---

interface SlideOverFormProps {
    editingSubject: Subject | null;
    formSubject: Partial<Subject>;
    setFormSubject: (val: Partial<Subject>) => void;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    availableDepartments: string[];
}

const SlideOverForm: React.FC<SlideOverFormProps> = ({ editingSubject, formSubject, setFormSubject, onClose, onSave, availableDepartments }) => {
    const { t } = useLanguage();
    return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden w-screen h-screen">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex pointer-events-none">
        <div className="w-screen max-w-md pointer-events-auto">
          <div className="h-full flex flex-col bg-white shadow-2xl animate-slide-in-right">
             <div className="px-6 py-6 bg-indigo-600 text-white shrink-0 shadow-md flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{editingSubject ? t('subjects.form.edit') : t('subjects.form.new')}</h2>
                  <p className="text-indigo-100 text-sm mt-1">{t('subject.description')}</p>
                </div>
                <button onClick={onClose} className="text-indigo-100 hover:text-white"><X className="h-6 w-6" /></button>
             </div>
             
             <form onSubmit={onSave} className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6 space-y-6">
                   <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <BookOpen className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('subjects.form.courseInfo')}</h3>
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">{t('subject.name')} <span className="text-red-500">*</span></label>
                         <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formSubject.name} onChange={e => setFormSubject({...formSubject, name: e.target.value})} placeholder="e.g. Mathematics" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('subject.code')} <span className="text-red-500">*</span></label>
                             <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formSubject.code} onChange={e => setFormSubject({...formSubject, code: e.target.value})} placeholder="e.g. Math" />
                          </div>
                          <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">{t('subject.department')}</label>
                             <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={formSubject.department} onChange={e => setFormSubject({...formSubject, department: e.target.value})}>
                                <option value="">{t('subject.selectDepartment')}</option>
                                {availableDepartments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                             </select>
                          </div>
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-gray-500 mb-1">{t('subject.description')}</label>
                         <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={4} value={formSubject.description} onChange={e => setFormSubject({...formSubject, description: e.target.value})} placeholder="Enter course description..." />
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

interface SubjectDetailModalProps {
    subject: Subject;
    onClose: () => void;
    isAdmin: boolean;
    onEdit: (s: Subject) => void;
    onAddNote: (id: string, note: string) => void;
    getTeachersForSubject: (s: Subject) => Teacher[];
}

const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({ subject, onClose, isAdmin, onEdit, onAddNote, getTeachersForSubject }) => {
    const { t } = useLanguage();
    const teachingFaculty = getTeachersForSubject(subject);
    const [noteInput, setNoteInput] = useState('');
    const latestGpa = subject.averageGpaHistory.length > 0 ? subject.averageGpaHistory[subject.averageGpaHistory.length - 1].gpa : 0;

    const submitNote = () => {
        if(noteInput.trim()) {
            onAddNote(subject.id, noteInput);
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
               <div className="h-40 bg-gradient-to-r from-teal-600 to-emerald-500 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
               </div>

               <div className="px-8 pb-8 relative">
                   {/* Main Header Card */}
                   <div className="relative -mt-16 mb-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start z-10">
                       <div className="h-24 w-24 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 border-4 border-white shadow-sm shrink-0">
                          <BookOpen className="h-10 w-10" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div>
                                <h2 className="text-3xl font-bold text-gray-900">{subject.name}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-sm font-mono font-bold border border-gray-200">{subject.code}</span>
                                    <span className="flex items-center text-gray-500 text-sm"><Layers className="h-4 w-4 mr-1"/> {subject.department}</span>
                                </div>
                             </div>
                             {isAdmin && (
                             <div className="flex gap-2">
                                <button onClick={() => { onClose(); onEdit(subject); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm flex items-center">
                                    <Pencil className="h-4 w-4 mr-2" /> Edit Subject
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
                           <div className="grid grid-cols-2 gap-4">
                               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                  <div>
                                      <p className="text-xs text-gray-500 font-bold uppercase">{t('subject.teacherCount')}</p>
                                      <p className="text-2xl font-bold text-gray-900 mt-1">{teachingFaculty.length}</p>
                                  </div>
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                      <Users className="h-6 w-6 text-blue-500" />
                                  </div>
                                </div>
                               <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                  <div>
                                      <p className="text-xs text-gray-500 font-bold uppercase">{t('subject.avgGpa')}</p>
                                      <p className="text-2xl font-bold text-emerald-600 mt-1">{latestGpa}</p>
                                  </div>
                                  <div className="p-3 bg-emerald-50 rounded-lg">
                                      <BarChart3 className="h-6 w-6 text-emerald-500" />
                                  </div>
                               </div>
                           </div>

                           {/* GPA History Chart */}
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-2 text-indigo-500" /> {t('subject.gpaHistory')}
                              </h3>
                              <div className="h-64 w-full">
                                  {subject.averageGpaHistory && subject.averageGpaHistory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={subject.averageGpaHistory}>
                                            <defs>
                                                <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="year" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 10]} hide />
                                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} />
                                            <Area type="monotone" dataKey="gpa" stroke="#059669" fillOpacity={1} fill="url(#colorGpa)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                  ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No history data available</div>
                                  )}
                              </div>
                           </div>
                           
                           {/* Description */}
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">{t('subject.description')}</h3>
                              <p className="text-sm text-gray-600 leading-relaxed">{subject.description || 'No description provided.'}</p>
                           </div>
                       </div>

                       {/* Right: Teachers & Notes */}
                       <div className="space-y-6">
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{t('subjects.modal.teachingFaculty')}</h3>
                               <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                   {teachingFaculty.length > 0 ? teachingFaculty.map(t => (
                                       <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                           <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                               {t.name.charAt(0)}
                                           </div>
                                           <div className="overflow-hidden">
                                               <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                                               <p className="text-xs text-gray-500 truncate">{t.email}</p>
                                           </div>
                                       </div>
                                   )) : <p className="text-sm text-gray-400 italic">No teachers assigned.</p>}
                               </div>
                           </div>

                           <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                              <div className="px-6 py-4 border-b border-gray-200 bg-gray-100/50 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-gray-500" />
                                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('teachers.modal.notes')}</h3>
                              </div>
                              <div className="p-6">
                                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                      {subject.notes?.map((n, i) => (
                                          <div key={i} className="p-2.5 bg-white text-xs text-gray-600 rounded border border-gray-100 shadow-sm">{n}</div>
                                      ))}
                                      {(!subject.notes || subject.notes.length === 0) && <p className="text-xs text-gray-400 italic">No notes.</p>}
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
