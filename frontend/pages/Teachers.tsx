import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Teacher, User, UserRole, ClassGroup } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { 
  Search, Plus, Mail, Phone, BookOpen, Eye, X, 
  Clock, Users, GraduationCap, Check, User as UserIcon, MessageSquare, Send, 
  MapPin, Calendar, CreditCard, Lock, Trash2, Pencil, ChevronRight, Briefcase, EyeOff, ShieldCheck, AlertTriangle, Key, Download
} from 'lucide-react';
import { calculateAge, isValidPhone, isValidCitizenId, toTitleCase, generatePagination } from '../utils';
import api from '../src/api/client';
import ReAuthModal from '../components/ReAuthModal';
import PasswordManagementModal from '../components/PasswordManagementModal';
import CredentialRevealModal from '../components/CredentialRevealModal';
import ExcelImportModal from '../components/ExcelImportModal';
import DateInput from '../components/DateInput';

interface TeachersProps {
  currentUser: User | null;
}

interface SlideOverFormProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  editingId?: string;
  formTeacher: Partial<Teacher>;
  setFormTeacher: (val: Partial<Teacher>) => void;
  onSave: (e: React.FormEvent) => void;
  formErrors: Record<string, string>;
  availableSubjects: string[];
  onChangePassword?: () => void;
}

interface TeacherDetailModalProps {
  teacher: Teacher;
  onClose: () => void;
  isAdmin: boolean;

  onEdit: (teacher: Teacher, action?: string) => void;
  onAddNote: (teacherId: string, note: string) => void;
}

// --- Helper Functions ---
const calculateExperience = (joinYear: number) => Math.max(0, new Date().getFullYear() - joinYear);

// --- Extracted Components ---

const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({ teacher, onClose, isAdmin, onEdit, onAddNote }) => {
  const { t } = useLanguage();
  const assignedClasses: ClassGroup[] = []; // MOCK_CLASSES removed. Implement fetching if needed.
  const totalStudents = assignedClasses.reduce((sum, cls) => sum + cls.studentCount, 0);
  const [noteInput, setNoteInput] = useState('');
  const experience = calculateExperience(teacher.joinYear);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 w-screen h-screen">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
         <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
           <X className="h-5 w-5" />
         </button>
         
         <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>
            
            <div className="px-6 md:px-8 pb-8">
               <div className="flex flex-col md:flex-row gap-6 items-start -mt-14 mb-8 relative z-10">
                  <div className="h-32 w-32 rounded-2xl bg-white p-1.5 shadow-xl shrink-0">
                     <div className="h-full w-full rounded-xl bg-indigo-50 flex items-center justify-center text-5xl font-bold text-indigo-600 border border-indigo-100">
                        {(teacher.name || "").charAt(0).toUpperCase()}
                     </div>
                  </div>
                  <div className="flex-1 pt-16 md:pt-16">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                             <h2 className="text-3xl font-bold text-gray-900">{teacher.name}</h2>
                             <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                 <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium border border-indigo-200">{teacher.id}</span>
                                 <span className="flex items-center text-gray-500"><Briefcase className="h-4 w-4 mr-1"/> {t('teachers.modal.joined')} {teacher.joinYear}</span>
                                 <span className="flex items-center text-gray-500"><Clock className="h-4 w-4 mr-1"/> {experience} {t('teachers.modal.exp')}</span>
                                 <span className="flex items-center text-gray-500">
                                    <Users className="h-4 w-4 mr-1"/> 
                                    {t('teachers.modal.homeroom')}: {teacher.classes && teacher.classes.length > 0 ? teacher.classes.map(c => c.name).join(', ') : 'None'}
                                 </span>
                             </div>
                         </div>
                         {isAdmin && (
                          <div className="flex gap-2">
                              <button onClick={() => { onClose(); onEdit(teacher); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium flex items-center text-sm">
                                 <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                              </button>
                         </div>
                         )}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="grid grid-cols-3 gap-4">
                         <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('teachers.modal.classes')}</p>
                            <div className="flex items-end justify-between mt-2">
                               <span className="text-3xl font-bold text-gray-800">{teacher.classesAssigned}</span>
                               <Users className="h-6 w-6 text-emerald-300" />
                            </div>
                         </div>
                         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{t('teachers.modal.students')}</p>
                            <div className="flex items-end justify-between mt-2">
                               <span className="text-3xl font-bold text-gray-800">{totalStudents}</span>
                               <GraduationCap className="h-6 w-6 text-blue-300" />
                            </div>
                         </div>
                          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl border border-purple-100">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{t('teachers.modal.subjects')}</p>
                            <div className="flex items-end justify-between mt-2">
                               <span className="text-3xl font-bold text-gray-800">{teacher.subjects.length}</span>
                               <BookOpen className="h-6 w-6 text-purple-300" />
                            </div>
                         </div>
                     </div>

                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                             <UserIcon className="h-4 w-4 text-gray-500" />
                             <h3 className="text-sm font-bold text-gray-800 uppercase">{t('teachers.modal.personal')}</h3>
                         </div>
                         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                             <div>
                                 <label className="text-xs text-gray-400 font-medium uppercase block mb-1">{t('teacher.email')}</label>
                                 <div className="text-sm font-medium text-gray-900 flex items-center break-all"><Mail className="h-4 w-4 mr-2 text-indigo-400 shrink-0"/> {teacher.email}</div>
                             </div>
                             <div>
                                 <label className="text-xs text-gray-400 font-medium uppercase block mb-1">{t('teacher.phone')}</label>
                                 <div className="text-sm font-medium text-gray-900 flex items-center"><Phone className="h-4 w-4 mr-2 text-indigo-400 shrink-0"/> {teacher.phone}</div>
                             </div>
                             <div>
                                 <label className="text-xs text-gray-400 font-medium uppercase block mb-1">{t('teacher.dob')}</label>
                                 <div className="text-sm font-medium text-gray-900 flex items-center"><Calendar className="h-4 w-4 mr-2 text-indigo-400 shrink-0"/> {new Date(teacher.dateOfBirth || '').toLocaleDateString('vi-VN')} ({calculateAge(teacher.dateOfBirth)} years)</div>
                             </div>
                             <div>
                                 <label className="text-xs text-gray-400 font-medium uppercase block mb-1">{t('teacher.address')}</label>
                                 <div className="text-sm font-medium text-gray-900 flex items-start"><MapPin className="h-4 w-4 mr-2 text-indigo-400 mt-0.5 shrink-0"/> {teacher.address}</div>
                             </div>
                              <div>
                                 <label className="text-xs text-gray-400 font-medium uppercase block mb-1">{t('teacher.citizenId')}</label>
                                 <div className="text-sm font-medium text-gray-900 flex items-center"><CreditCard className="h-4 w-4 mr-2 text-indigo-400 shrink-0"/> {teacher.citizenId}</div>
                             </div>
                              <div>
                                 <label className="text-xs text-gray-400 font-medium uppercase block mb-1">{t('teacher.gender')}</label>
                                 <div className="text-sm font-medium text-gray-900">
                                     {t(`common.${(teacher.gender || 'Male').toLowerCase()}`)}
                                 </div>
                             </div>
                         </div>
                     </div>
                  </div>

                  <div className="space-y-8">
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
                                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">{t('teacher.username')}</p>
                                          <p className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded text-sm">{teacher.username}</p>
                                      </div>
                                      <div className="h-8 w-px bg-gray-200 mx-2"></div>
                                      <div>
                                          <p className="text-xs text-gray-500 font-medium uppercase mb-1">Role</p>
                                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">TEACHER</span>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => onEdit(teacher, 'VIEW_PASSWORD')} 
                                      className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-bold flex items-center justify-center shadow-sm"
                                  >
                                      <EyeOff className="h-4 w-4 mr-2" /> {t('security.viewPass')}
                                  </button>
                              </div>
                          </div>
                      )}

                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                             <h3 className="text-sm font-bold text-gray-800 uppercase">{t('teachers.modal.teachingSubjects')}</h3>
                         </div>
                         <div className="p-6">
                             <div className="flex flex-wrap gap-2">
                                 {teacher.subjects.map(sub => (
                                     <span key={sub} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">{sub}</span>
                                 ))}
                             </div>
                         </div>
                     </div>

                     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                             <h3 className="text-sm font-bold text-gray-800 uppercase">{t('teachers.modal.schedule')}</h3>
                         </div>
                          <div className="divide-y divide-gray-100">
                             {assignedClasses.length > 0 ? assignedClasses.map(cls => (
                                 <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                     <div className="flex items-center gap-3">
                                         <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">{cls.gradeLevel}</div>
                                         <div>
                                             <p className="text-sm font-bold text-gray-900">{cls.name}</p>
                                             <p className="text-xs text-gray-500">{cls.studentCount} Students</p>
                                         </div>
                                     </div>
                                     <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{cls.room}</span>
                                 </div>
                             )) : <div className="p-6 text-center text-gray-400 italic text-sm">No classes assigned</div>}
                         </div>
                     </div>

                     <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-100/50">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('teachers.modal.notes')}</h3>
                        </div>
                        <div className="p-6">
                           <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                              {teacher.notes?.map((note, idx) => (
                                <div key={idx} className="p-3 bg-white rounded-lg text-sm text-gray-600 shadow-sm border border-gray-100">{note}</div>
                              ))}
                              {(!teacher.notes || teacher.notes.length === 0) && <p className="text-xs text-gray-400 italic">No notes yet.</p>}
                           </div>
                           {isAdmin && (
                           <div className="flex gap-2">
                              <input 
                                 type="text" 
                                 value={noteInput} 
                                 onChange={(e) => setNoteInput(e.target.value)} 
                                 onKeyDown={(e) => e.key === 'Enter' && (onAddNote(teacher.id, noteInput), setNoteInput(''))}
                                 placeholder="Add note..." 
                                 className="flex-1 w-full min-w-0 text-xs border border-gray-300 bg-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none text-gray-700" 
                              />
                              <button onClick={() => { onAddNote(teacher.id, noteInput); setNoteInput(''); }} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shrink-0 flex items-center justify-center"><Send className="h-3 w-3" /></button>
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

const SlideOverForm: React.FC<SlideOverFormProps & { isLoading?: boolean }> = ({
  isOpen, onClose, isEditing, editingId,
  formTeacher, setFormTeacher, onSave, formErrors = {}, availableSubjects, onChangePassword, isLoading
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleAddSubject = (subject: string) => {
    if (subject && !formTeacher.subjects?.includes(subject)) {
      setFormTeacher({ ...formTeacher, subjects: [...(formTeacher.subjects || []), subject] });
    }
  };

  const handleRemoveSubject = (sub: string) => {
      setFormTeacher({...formTeacher, subjects: formTeacher.subjects?.filter(s => s !== sub)});
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none ${
      formErrors[field] ? 'border-red-400 input-error' : 'border-gray-300'
    }`;

  const renderError = (field: string) =>
    formErrors[field] ? (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1 animate-shake">
        <AlertTriangle className="h-3 w-3 shrink-0" /> {formErrors[field]}
      </p>
    ) : null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-screen h-screen">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-backdrop-enter" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-enter">
            {/* Header */}
            <div className="px-6 py-5 bg-indigo-600 text-white shrink-0 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{isEditing ? t('teachers.form.edit') : t('teachers.form.new')}</h2>
                  <p className="text-indigo-100 text-sm mt-1">{isEditing ? `Updating ${editingId}` : 'Fill in the details below'}</p>
                </div>
                <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={onSave} className="flex-1 overflow-y-auto bg-gray-50">
               <div className="p-6 space-y-6">

                  {/* Section 1 */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <Lock className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('teachers.form.account')}</h3>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('student.name')} <span className="text-red-500">*</span></label>
                           <input type="text" className={inputClass('name')} placeholder="e.g. Sarah Connor" value={formTeacher.name} onChange={e => setFormTeacher({...formTeacher, name: e.target.value})} disabled={isLoading} />
                           {renderError('name')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.username')} <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className={`${inputClass('username')} ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`} 
                                    value={formTeacher.username} 
                                    onChange={e => setFormTeacher({...formTeacher, username: e.target.value})} 
                                    disabled={isEditing || isLoading}
                                />
                                {renderError('username')}
                             </div>
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.joinYear')}</label>
                                <input type="number" className={inputClass('joinYear')} value={formTeacher.joinYear} onChange={e => setFormTeacher({...formTeacher, joinYear: parseInt(e.target.value) || new Date().getFullYear()})} disabled={isLoading} />
                             </div>
                        </div>
                        {!isEditing && (
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.password')} <span className="text-red-500">*</span></label>
                             <input type="password" placeholder="••••••" className={inputClass('password')} value={formTeacher.password} onChange={e => setFormTeacher({...formTeacher, password: e.target.value})} disabled={isLoading} />
                             {renderError('password')}
                        </div>
                        )}
                        {isEditing && (
                             <div className="flex items-end">
                                 <button type="button" onClick={onChangePassword} className="w-full py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-bold flex items-center justify-center" disabled={isLoading}>
                                     <Key className="h-4 w-4 mr-2" /> {t('common.changePassword')}
                                 </button>
                             </div>
                        )}
                     </div>
                  </div>

                  {/* Section 2 */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <UserIcon className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('teachers.form.personal')}</h3>
                     </div>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.dob')} <span className="text-red-500">*</span></label>
                                <DateInput className={inputClass('dateOfBirth')} value={formTeacher.dateOfBirth ? new Date(formTeacher.dateOfBirth).toISOString().split('T')[0] : ''} onChange={val => setFormTeacher({...formTeacher, dateOfBirth: val})} disabled={isLoading} />
                                {renderError('dateOfBirth')}
                             </div>
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.gender')}</label>
                                 <select className={inputClass('gender')} value={formTeacher.gender} onChange={e => setFormTeacher({...formTeacher, gender: e.target.value as any})} disabled={isLoading}>
                                   <option value="Male">{t('common.male')}</option>
                                   <option value="Female">{t('common.female')}</option>
                                   <option value="Other">{t('common.other')}</option>
                                </select>
                             </div>
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.citizenId')} (12 số)</label>
                           <input type="text" className={inputClass('citizenId')} value={formTeacher.citizenId} onChange={e => setFormTeacher({...formTeacher, citizenId: e.target.value})} disabled={isLoading} />
                           {renderError('citizenId')}
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.email')} <span className="text-red-500">*</span></label>
                           <input type="email" className={inputClass('email')} value={formTeacher.email} onChange={e => setFormTeacher({...formTeacher, email: e.target.value})} disabled={isLoading} />
                           {renderError('email')}
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.phone')} <span className="text-red-500">*</span></label>
                           <input type="tel" className={inputClass('phone')} placeholder="0xxxxxxxxx" value={formTeacher.phone} onChange={e => setFormTeacher({...formTeacher, phone: e.target.value})} disabled={isLoading} />
                           {renderError('phone')}
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.address')}</label>
                           <input type="text" className={inputClass('address')} value={formTeacher.address} onChange={e => setFormTeacher({...formTeacher, address: e.target.value})} disabled={isLoading} />
                        </div>
                     </div>
                  </div>

                  {/* Section 3 */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <BookOpen className="h-4 w-4 text-indigo-500"/>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t('teachers.form.expertise')}</h3>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">{t('teacher.subjects')}</label>
                        <select 
                           className={`${inputClass('subjects')} mb-3`}
                           onChange={(e) => { handleAddSubject(e.target.value); e.target.value = ''; }}
                           disabled={isLoading}
                        >
                           <option value="">+ {t('common.addSubject')}</option>
                           {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="flex flex-wrap gap-2">
                           {formTeacher.subjects?.map(sub => (
                              <span key={sub} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                                 {sub}
                                 <button type="button" onClick={() => handleRemoveSubject(sub)} className="ml-2 hover:text-indigo-900" disabled={isLoading}><X className="h-3 w-3"/></button>
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0 flex justify-end gap-3">
               <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50">{t('common.cancel')}</button>
               <button 
                onClick={onSave} 
                type="button" 
                disabled={isLoading}
                className={`px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 text-sm flex items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
               >
                  {isLoading ? (
                    <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {t('common.saving')}
                    </>
                  ) : (
                    <>
                        <Check className="h-4 w-4 mr-2" /> {t('common.save')}
                    </>
                  )}
               </button>
            </div>
      </div>
    </div>,
    document.body
  );
};


export const Teachers: React.FC<TeachersProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Pagination & Search Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when subject filter changes
  useEffect(() => {
     setCurrentPage(1);
  }, [selectedSubject]);
  
  // Validation State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Security Modal State
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [teacherToReveal, setTeacherToReveal] = useState<Teacher | null>(null);
  // Removed legacy security state
  
  // State for Add/Edit Teacher Form
  const defaultTeacherState: Partial<Teacher> = {
    id: '', name: '', username: '', password: '', subjects: [], email: '', phone: '',
    address: '', citizenId: '', gender: 'Male', dateOfBirth: '', joinYear: new Date().getFullYear(),
  };

  const [formTeacher, setFormTeacher] = useState<Partial<Teacher>>(defaultTeacherState);
  
  // Re-Auth and Password Management State
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{ id: string; name: string; userId?: string } | null>(null);
  const [reAuthAction, setReAuthAction] = useState<'CHANGE' | 'VIEW' | null>(null);
  
  // Credential Reveal State
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [revealedCredentials, setRevealedCredentials] = useState<{ name: string; username: string; password?: string } | null>(null);

  const handleOpenPasswordManage = (teacher: Teacher, action: string = 'CHANGE') => {
      // Close detail modal if open
      if (action === 'VIEW' || action === 'VIEW_PASSWORD') {
         setSelectedTeacher(null);
      }
      // Need to find the userId from the teacher object.
      // In fetchTeachers mapping, we mapped t.user?.name, etc.
      // We should assume t.userId is available if we fetched it, or t.user.id.
      // Let's rely on t.userId which exists in Teacher model, BUT the frontend interface might not have it strictly defined?
      // Actually Teacher interface has id, name, username...
      // Let's pass the whole teacher object and let the modal handle it or extract here.
      // We mapped t.user?.username to t.username.
      // IMPORTANT: We need the USER UUID (userId) for the password update, NOT the Teacher ID (GV...)
      // The backend Teacher model has `userId`. The response from backend likely included it.
      // Let's assume teacher.userId exists or teacher.user.id exists.
      // We'll pass a constructed object.
      const userId = (teacher as any).userId || (teacher as any).user?.id;
      if (!userId) {
          showToast('error', "Không thể tìm thấy ID người dùng hệ thống. Vui lòng kiểm tra lại dữ liệu.");
          return;
      }
      setSelectedUserForPassword({ id: teacher.id, name: teacher.name, userId: userId }); // pass password for View? Or fetch it? The teacher object has it currently.
      setReAuthAction(action as any);
      setIsReAuthOpen(true);
  };

  const handleReAuthSuccess = async () => {
      setIsReAuthOpen(false);
      if (reAuthAction === 'CHANGE') {
          setIsPasswordModalOpen(true);
      } else if (reAuthAction === 'VIEW' || reAuthAction === 'VIEW_PASSWORD') {
          try {
              // Fetch password securely from backend
              // We need the User ID (UUID), not the Teacher ID (GV...)
              const userId = selectedUserForPassword?.userId;
              if (!userId) {
                  showToast('error', "Không tìm thấy ID người dùng.");
                  return;
              }
              
              const res = await api.get(`/users/${userId}/credentials`);
              const password = res.data?.password;
              
              setRevealedCredentials({
                  name: selectedUserForPassword?.name || 'User',
                  username: teachers.find(t => t.id === selectedUserForPassword?.id)?.username || '',
                  password: password
              });
              setRevealModalOpen(true);
          } catch (error) {
              console.error("Failed to fetch credentials:", error);
              showToast('error', "Không thể lấy mật khẩu. Vui lòng kiểm tra quyền admin.");
          }
      }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Fetch Teachers & Subjects
  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersRes, subjectsRes] = await Promise.all([
         api.get(`/teachers?page=${currentPage}&limit=10&search=${encodeURIComponent(debouncedSearch)}&subject=${encodeURIComponent(selectedSubject)}`),
         api.get('/subjects')
      ]);

      if (teachersRes.data.data) {
        setTeachers(teachersRes.data.data);
        setTotalPages(teachersRes.data.meta.totalPages);
        setTotalItems(teachersRes.data.meta.total);
      } else {
        setTeachers(teachersRes.data);
        setTotalPages(1);
        setTotalItems(teachersRes.data.length);
      }
      
      const subjectNames = subjectsRes.data.map((s: any) => s.name);
      setAvailableSubjects(subjectNames);

    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, debouncedSearch, selectedSubject]);

  const handleOpenAdd = () => {
    if (editingTeacher !== null) {
      setEditingTeacher(null);
      setFormTeacher({ ...defaultTeacherState, id: `GV${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` });
    } else {
      if (!formTeacher.id) {
         setFormTeacher(prev => ({ ...prev, id: `GV${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` }));
      }
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher, action?: string) => {
    if (action === 'VIEW_PASSWORD') {
        handleOpenPasswordManage(teacher, 'VIEW');
        return;
    }
    setEditingTeacher(teacher);
    setFormTeacher({ ...teacher });
    setFormErrors([]);
    setIsFormOpen(true);
  };

  const handleChangePassword = () => {
      if (editingTeacher) {
          setIsFormOpen(false);
          handleOpenPasswordManage(editingTeacher, 'CHANGE');
      }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({ title: t('common.confirmDelete'), message: t('common.confirmDelete') || 'Bạn có chắc chắn muốn xóa?', isDanger: true });
    if (isConfirmed) {
        try {
            await api.delete(`/teachers/${id}`);
            setTeachers(teachers.filter(t => t.id !== id));
            if (selectedTeacher?.id === id) setSelectedTeacher(null);
            showToast('success', 'Đã xóa thành công.');
        } catch (err) {
            console.error("Failed to delete teacher", err);
            showToast('error', "Failed to delete teacher");
        }
    }
  };

  const validateTeacherForm = (data: Partial<Teacher>): Record<string, string> => {
      const errors: Record<string, string> = {};

      // Required fields
      if (!data.name?.trim()) errors.name = "Họ tên không được để trống.";
      if (!data.username?.trim()) errors.username = "Tên đăng nhập không được để trống.";
      if (!data.email?.trim()) errors.email = "Email không được để trống.";
      if (!data.phone?.trim()) errors.phone = "Số điện thoại không được để trống.";
      if (!data.dateOfBirth) errors.dateOfBirth = "Ngày sinh không được để trống.";

      // Age Check (> 18)
      if (data.dateOfBirth) {
          const age = calculateAge(data.dateOfBirth);
          if (age < 18) {
              errors.dateOfBirth = `Giáo viên phải trên 18 tuổi (Hiện tại: ${age} tuổi).`;
          }
      }

      // Email Check
      if (data.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.email)) {
              errors.email = "Email không hợp lệ.";
          }
      }

      // Phone Check
      if (data.phone) {
          const phoneRegex = /^(0|84)\d+$/;
          if (!phoneRegex.test(data.phone)) {
              errors.phone = "Số điện thoại phải bắt đầu bằng 0 hoặc 84 và chỉ chứa số.";
          }
      }

      // Citizen ID Check
      if (data.citizenId && data.citizenId.trim() !== '') {
          if (!isValidCitizenId(data.citizenId)) {
              errors.citizenId = "Số CCCD phải có đủ 12 số.";
          }
      }

      return errors;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-format
    const formattedData = {
        ...formTeacher,
        name: toTitleCase(formTeacher.name || ''),
        address: toTitleCase(formTeacher.address || '')
    };
    setFormTeacher(formattedData);

    const errors = validateTeacherForm(formattedData);
    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
    }

    const teacherData: Teacher = {
      id: formattedData.id || `GV${Date.now().toString().slice(-4)}`,
      username: formattedData.username!,
      password: formattedData.password || '123456',
      name: formattedData.name!,
      subjects: formattedData.subjects || [],
      email: formattedData.email!,
      phone: formattedData.phone || '',
      address: formattedData.address || '',
      citizenId: formattedData.citizenId || '',
      gender: formattedData.gender || 'Male',
      dateOfBirth: formattedData.dateOfBirth || '',
      joinYear: formattedData.joinYear || new Date().getFullYear(),
      classesAssigned: editingTeacher ? editingTeacher.classesAssigned : 0,
       notes: editingTeacher ? editingTeacher.notes : []
    };

    try {
        setIsSubmitting(true);
        if (editingTeacher) {
            // Only send fields that UpdateTeacherDto accepts
            const { id, username, password, user, avatarUrl, classes, ...updatePayload } = teacherData as any;
            const response = await api.patch(`/teachers/${editingTeacher.id}`, updatePayload);
            await fetchData();
        } else {
            // Strip the generated ID since backend DTO forbids non-whitelisted properties and id is not in CreateTeacherDto
            const { id, classesAssigned, ...createPayload } = teacherData;
            const response = await api.post('/teachers', createPayload);
             await fetchData();
        }
        setIsFormOpen(false);
        setTimeout(() => {
            setFormTeacher(defaultTeacherState);
            setEditingTeacher(null);
        }, 300);
        showToast('success', 'Đã lưu giáo viên thành công.');
    } catch (error: any) {
        console.error("Failed to save teacher", error);
        const errorMsg = error.response?.data?.message || t('common.error') || "Failed to save teacher. Please try again.";
        showToast('error', errorMsg);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddNote = (teacherId: string, note: string) => {
    if (!note.trim()) return;
    const updatedTeachers = teachers.map(t => t.id === teacherId ? { ...t, notes: [...(t.notes || []), note] } : t);
    setTeachers(updatedTeachers);
    if (selectedTeacher?.id === teacherId) {
      setSelectedTeacher(prev => prev ? { ...prev, notes: [...(prev.notes || []), note] } : null);
    }
  };



  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('menu.teachers')}</h2>
          <p className="text-gray-500 mt-1">{t('teachers.subtitle')}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t('teachers.searchPlaceholder')} 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
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
                   <Plus className="h-5 w-5 mr-2" /> {t('teachers.add')}
                 </button>
             </div>
             )}
        </div>
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500 tracking-wider">
                <th className="px-6 py-5 pl-8">{t('teachers.table.teacher')}</th>
                <th className="px-6 py-5">{t('teachers.table.expertise')}</th>
                <th className="px-6 py-5">{t('teachers.table.contact')}</th>
                <th className="px-6 py-5">{t('teachers.table.status')}</th>
                <th className="px-6 py-5 text-right pr-8">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                  <td className="px-6 py-4 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-300">
                        {(teacher.name || "").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{teacher.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{teacher.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {teacher.subjects.slice(0, 3).map((subj, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                                {subj}
                            </span>
                        ))}
                        {teacher.subjects.length > 3 && <span className="text-xs text-gray-400 font-medium">+{teacher.subjects.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-gray-600 font-medium"><Mail className="h-3 w-3 mr-1.5 text-gray-400" /> {teacher.email}</div>
                      <div className="flex items-center text-xs text-gray-600"><Phone className="h-3 w-3 mr-1.5 text-gray-400" /> {teacher.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {t('teachers.status.active')}
                     </span>
                  </td>
                  <td className="px-6 py-4 pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedTeacher(teacher)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Profile">
                         <Eye className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <>
                        <button onClick={() => handleOpenEdit(teacher)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(teacher.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                        </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && !loading && (
            <div className="p-12 text-center">
               <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No teachers found</h3>
               <p className="text-gray-500 mt-1">Try adjusting your search query.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{teachers.length}</span> of <span className="font-medium text-gray-900">{totalItems}</span> teachers
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Previous
              </button>
              <div className="hidden sm:flex items-center gap-1">
                {generatePagination(currentPage, totalPages).map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors shadow-sm ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedTeacher && (
        <TeacherDetailModal 
          teacher={selectedTeacher} 
          onClose={() => setSelectedTeacher(null)} 
          isAdmin={isAdmin}
          onEdit={handleOpenEdit}
          onAddNote={handleAddNote}
        />
      )}
      
      {isFormOpen && isAdmin && (
        <SlideOverForm 
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            isEditing={!!editingTeacher}
            editingId={editingTeacher?.id}
            formTeacher={formTeacher}
            setFormTeacher={setFormTeacher}
            onSave={handleSave}
            formErrors={formErrors}
            availableSubjects={availableSubjects}
            onChangePassword={handleChangePassword}
            isLoading={isSubmitting}
        />
      )}
      
      {/* Legacy Security Modal Removed */}
      {/* Re-Auth and Password Management Modals */}
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
        type="teachers"
        onSuccess={fetchData}
      />

      {isSubmitting && (
        <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="font-medium text-gray-700">Saving changes...</span>
          </div>
        </div>
      )}
    </div>
  );
};
