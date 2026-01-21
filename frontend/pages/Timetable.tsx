
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_SCHEDULE, MOCK_CLASSES, MOCK_SUBJECTS, MOCK_TEACHERS, MOCK_ASSIGNMENTS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CalendarDays, Clock, MapPin, ChevronDown, Sun, Moon, Search, X, 
  User as UserIcon, Plus, Edit2, Trash2, Check, BookUser, FileDown, 
  ExternalLink, ChevronLeft, ChevronRight, Filter, Users, GraduationCap
} from 'lucide-react';
import { ScheduleItem, TeachingAssignment, User, UserRole } from '../types';

interface TimetableProps {
  currentUser: User | null;
  onNavigate?: (page: string, params?: any) => void;
}

interface TimeSlot {
  period: number;
  time: string;
}

const MORNING_SLOTS: TimeSlot[] = [
  { period: 1, time: '07:15 - 08:00' },
  { period: 2, time: '08:05 - 08:50' },
  { period: 3, time: '09:05 - 09:50' },
  { period: 4, time: '09:55 - 10:40' },
  { period: 5, time: '10:45 - 11:30' },
];

const AFTERNOON_SLOTS: TimeSlot[] = [
  { period: 1, time: '13:30 - 14:15' },
  { period: 2, time: '14:20 - 15:05' },
  { period: 3, time: '15:20 - 16:05' },
  { period: 4, time: '16:10 - 16:55' },
];

interface SelectedSlotInfo {
  item: ScheduleItem;
  timeSlot: TimeSlot;
  date: string; // Display date string
}

interface EditingSlotInfo {
  item?: ScheduleItem;
  period: number;
  day: string;
  session: 'Morning' | 'Afternoon';
}

type ViewMode = 'class' | 'teacher';

export const Timetable: React.FC<TimetableProps> = ({ currentUser, onNavigate }) => {
  const { t } = useLanguage();
  const isStudent = currentUser?.role === UserRole.STUDENT;
  const isTeacher = currentUser?.role === UserRole.TEACHER;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  
  // --- State ---
  const [viewMode, setViewMode] = useState<ViewMode>('class');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  // Local state for schedule (in a real app, this would fetch based on date range)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(MOCK_SCHEDULE);
  
  // Local state for assignments
  const [assignments, setAssignments] = useState<TeachingAssignment[]>(MOCK_ASSIGNMENTS);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);

  // Modes
  const [isEditing, setIsEditing] = useState(false);
  
  // Modals
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(null);
  const [editingSlot, setEditingSlot] = useState<EditingSlotInfo | null>(null);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // --- Helpers ---
  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }); // e.g. 23/10
  }

  function getSubjectName(code: string) {
     const sub = MOCK_SUBJECTS.find(s => s.code === code || s.id === code);
     return sub ? sub.name : code;
  }

  function getClassName(id: string) {
      return MOCK_CLASSES.find(c => c.id === id)?.name || id;
  }

  function getTeacherName(id: string) {
      return MOCK_TEACHERS.find(t => t.id === id)?.name || 'Unknown';
  }

  // --- Effects ---

  // Initialization Logic
  useEffect(() => {
    if (isTeacher) {
        // Teachers default to seeing their own schedule
        setViewMode('teacher');
        setSelectedTeacherId(currentUser!.id);
        
        // Also find their homeroom class for potential class view
        const homeroom = MOCK_CLASSES.find(c => c.teacherId === currentUser!.id);
        if (homeroom) setSelectedClassId(homeroom.id);
        else setSelectedClassId(MOCK_CLASSES[0].id);
    } else if (isStudent) {
        // Students default to class view of their own class
        setViewMode('class');
        setSelectedClassId(currentUser!.classId || MOCK_CLASSES[0].id);
    } else {
        // Admin defaults to Class View of the first class
        const defaultClass = MOCK_CLASSES.find(c => c.name === '10A1') || MOCK_CLASSES[0];
        if (defaultClass) setSelectedClassId(defaultClass.id);
        setSelectedTeacherId(MOCK_TEACHERS[0].id);
    }
  }, [currentUser, isTeacher, isStudent]);

  // Permission Check for Edit
  const canEditSlot = (slotItem?: ScheduleItem) => {
      if (isStudent) return false; // Students cannot edit
      if (!isEditing) return false;
      if (isAdmin) return true;
      if (isTeacher) {
          // In Teacher View: Can edit their own slots
          if (viewMode === 'teacher') return selectedTeacherId === currentUser!.id;
          
          // In Class View: Can edit if it's their homeroom class OR if the slot belongs to them
          const isHomeroom = MOCK_CLASSES.find(c => c.id === selectedClassId)?.teacherId === currentUser!.id;
          if (isHomeroom) return true;
          if (slotItem && slotItem.teacherId === currentUser!.id) return true;
      }
      return false;
  };

  // --- Handlers ---

  const handleWeekChange = (direction: 'prev' | 'next') => {
      setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const jumpToToday = () => {
      setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  const handleSaveSlot = (e: React.FormEvent, formData: Partial<ScheduleItem>) => {
    e.preventDefault();
    if(!formData.subjectId) return;

    // Determine context based on view mode
    const targetClassId = viewMode === 'class' ? selectedClassId : formData.classId;
    const targetTeacherId = viewMode === 'teacher' ? selectedTeacherId : formData.teacherId;

    if (!targetClassId || !targetTeacherId) {
        alert("Missing Class or Teacher information");
        return;
    }

    if (editingSlot?.item) {
      // Update existing
      const updatedSchedule = schedule.map(s => 
        s.id === editingSlot.item!.id 
          ? { ...s, ...formData } 
          : s
      );
      setSchedule(updatedSchedule);
    } else {
      // Create new
      const newItem: ScheduleItem = {
        id: `SCH-${Date.now()}`,
        day: editingSlot!.day,
        period: editingSlot!.period,
        session: editingSlot!.session,
        classId: targetClassId,
        subjectId: formData.subjectId,
        teacherId: targetTeacherId,
        room: formData.room || '',
      };
      setSchedule([...schedule, newItem]);
    }
    setEditingSlot(null);
  };

  const handleDeleteSlot = (id: string) => {
    if(window.confirm(t('common.confirmDelete'))) {
      setSchedule(schedule.filter(s => s.id !== id));
      setEditingSlot(null);
    }
  };
  
  // Assignment Handlers (kept same)
  const handleAssignmentChange = (id: string, field: keyof TeachingAssignment, value: any) => {
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };
  const handleAddAssignment = () => {
      const newAssignment: TeachingAssignment = {
          id: `ASN-${Date.now()}`,
          teacherId: MOCK_TEACHERS[0].id,
          subjectId: MOCK_SUBJECTS[0].id,
          classId: MOCK_CLASSES[0].id,
          sessionsPerWeek: 1
      };
      setAssignments([...assignments, newAssignment]);
  };
  const handleDeleteAssignment = (id: string) => {
      setAssignments(prev => prev.filter(a => a.id !== id));
  };

  // --- Render Components ---

  const AssignmentsModal = ({ onClose }: { onClose: () => void }) => {
      // ... (Same implementation as before, keeping it for brevity but fully functional in real code)
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
              <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center rounded-t-xl">
                  <div>
                      <h3 className="font-bold text-lg text-gray-900">{t('timetable.assignments')}</h3>
                      <p className="text-sm text-gray-500">Define teaching load per class</p>
                  </div>
                  <button onClick={onClose} className="hover:bg-gray-100 rounded-full p-2 transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
              </div>
              <div className="flex-1 overflow-auto p-0">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                              <th className="px-6 py-3">{t('timetable.teacher')}</th>
                              <th className="px-6 py-3">{t('subject.name')}</th>
                              <th className="px-6 py-3">{t('class.name')}</th>
                              <th className="px-6 py-3">{t('timetable.sessionsPerWeek')}</th>
                              {isAdmin && <th className="px-6 py-3 text-right"></th>}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {assignments.map(assign => (
                              <tr key={assign.id} className="hover:bg-gray-50/50 group">
                                  <td className="px-6 py-2">
                                      <select disabled={!isAdmin} className={`w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`} value={assign.teacherId} onChange={(e) => handleAssignmentChange(assign.id, 'teacherId', e.target.value)}>
                                          {MOCK_TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                      </select>
                                  </td>
                                  <td className="px-6 py-2">
                                      <select disabled={!isAdmin} className={`w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`} value={assign.subjectId} onChange={(e) => handleAssignmentChange(assign.id, 'subjectId', e.target.value)}>
                                          {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                      </select>
                                  </td>
                                  <td className="px-6 py-2">
                                      <select disabled={!isAdmin} className={`w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`} value={assign.classId} onChange={(e) => handleAssignmentChange(assign.id, 'classId', e.target.value)}>
                                          {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                      </select>
                                  </td>
                                  <td className="px-6 py-2"><input type="number" min="1" max="30" disabled={!isAdmin} className={`w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-center text-sm font-bold text-indigo-600 focus:outline-none focus:border-indigo-500 ${!isAdmin && 'opacity-70'}`} value={assign.sessionsPerWeek} onChange={(e) => handleAssignmentChange(assign.id, 'sessionsPerWeek', parseInt(e.target.value) || 0)} /></td>
                                  {isAdmin && <td className="px-6 py-2 text-right"><button onClick={() => handleDeleteAssignment(assign.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button></td>}
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between">
                  {isAdmin ? <button onClick={handleAddAssignment} className="flex items-center text-indigo-600 font-bold text-sm hover:text-indigo-800 px-2 py-1"><Plus className="h-4 w-4 mr-1" /> Add New Assignment</button> : <div></div>}
                  <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Done</button>
              </div>
          </div>
        </div>
      );
  };

  const EditSlotModal = ({ info, onClose }: { info: EditingSlotInfo, onClose: () => void }) => {
    const isNew = !info.item;
    // Context-aware defaults
    const defaultClassId = viewMode === 'class' ? selectedClassId : (info.item?.classId || '');
    const defaultTeacherId = viewMode === 'teacher' ? selectedTeacherId : (info.item?.teacherId || '');

    const [formData, setFormData] = useState<Partial<ScheduleItem>>({
       subjectId: info.item?.subjectId || '',
       teacherId: defaultTeacherId,
       classId: defaultClassId,
       room: info.item?.room || ''
    });

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
           <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-sm">
              <h3 className="font-bold text-lg tracking-tight">
                {isNew ? t('timetable.addSlot') : t('timetable.editSlot')}
              </h3>
              <button onClick={onClose} className="hover:bg-indigo-500 rounded-full p-1 transition-colors"><X className="h-5 w-5" /></button>
           </div>
           
           <form onSubmit={(e) => handleSaveSlot(e, formData)} className="p-6 space-y-4">
              <div className="text-xs text-gray-500 font-medium mb-2 bg-gray-50 p-2 rounded border border-gray-100 flex justify-between">
                 <span>{info.day} - {info.session}</span>
                 <span>Period {info.period}</span>
              </div>

              {/* Subject */}
              <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('timetable.selectSubject')}</label>
                 <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})}>
                   <option value="">-- Select Subject --</option>
                   {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                 </select>
              </div>

              {/* Room */}
              <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('timetable.enterRoom')}</label>
                 <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} placeholder="e.g. 101, Lab A" />
              </div>

              {/* Conditional Fields based on View Mode */}
              {viewMode === 'class' ? (
                  <div>
                     <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('timetable.selectTeacher')}</label>
                     <select disabled={isTeacher && !isAdmin} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})}>
                       <option value="">-- Select Teacher --</option>
                       {MOCK_TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subjects.join(', ')})</option>)}
                     </select>
                  </div>
              ) : (
                  <div>
                     <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('class.name')}</label>
                     <select disabled={!isAdmin} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})}>
                       <option value="">-- Select Class --</option>
                       {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>
              )}

              <div className="pt-4 flex gap-2">
                 {!isNew && (
                   <button type="button" onClick={() => handleDeleteSlot(info.item!.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center">
                      <Trash2 className="h-4 w-4 mr-2" /> {t('common.delete')}
                   </button>
                 )}
                 <button type="submit" className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Check className="h-4 w-4 mr-2" /> {t('common.save')}
                 </button>
              </div>
           </form>
        </div>
      </div>
    );
  };

  const ScheduleDetailModal = ({ info, onClose }: { info: SelectedSlotInfo, onClose: () => void }) => {
    const subject = MOCK_SUBJECTS.find(s => s.id === info.item.subjectId);
    const classGroup = MOCK_CLASSES.find(c => c.id === info.item.classId);
    const teacher = MOCK_TEACHERS.find(t => t.id === info.item.teacherId);
    const canViewJournal = isTeacher && (info.item.teacherId === currentUser!.id);

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
             <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-sm">
                <h3 className="font-bold text-lg tracking-tight">{t('timetable.details')}</h3>
                <button onClick={onClose} className="hover:bg-indigo-500 rounded-full p-1 transition-colors"><X className="h-5 w-5" /></button>
             </div>
             <div className="p-6 space-y-5">
                <div className="border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t('subject.name')}</label>
                            <p className="text-xl font-bold text-gray-900">{subject?.name || info.item.subjectId}</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{info.date}</span>
                    </div>
                    <p className="text-sm font-mono text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">{subject?.code}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t('timetable.time')}</label>
                        <div className="flex items-center text-gray-800 font-medium">
                            <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                            {info.timeSlot.time}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-6">{info.item.day} - {info.item.session}</p>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t('class.room')}</label>
                         <div className="flex items-center text-gray-800 font-medium">
                            <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                            {info.item.room}
                        </div>
                     </div>
                </div>

                {viewMode === 'class' ? (
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t('timetable.teacher')}</label>
                       <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {teacher ? teacher.name.charAt(0) : <UserIcon className="h-4 w-4" />}
                          </div>
                          <div>
                             <p className="font-medium text-gray-900">{teacher ? teacher.name : 'Unknown'}</p>
                             {teacher && <p className="text-xs text-gray-500">{teacher.email}</p>}
                          </div>
                       </div>
                    </div>
                ) : (
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t('class.name')}</label>
                       <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {classGroup ? classGroup.gradeLevel : 'C'}
                          </div>
                          <div>
                             <p className="font-medium text-gray-900">{classGroup ? classGroup.name : 'Unknown Class'}</p>
                             <p className="text-xs text-gray-500">{classGroup ? `${classGroup.studentCount} Students` : ''}</p>
                          </div>
                       </div>
                    </div>
                )}

                 <div className="pt-4 border-t border-gray-50 flex items-center justify-end">
                    {canViewJournal && onNavigate && (
                        <button 
                            onClick={() => onNavigate('my-classes', { classId: classGroup?.id })}
                            className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-indigo-100"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" /> Open Class Journal
                        </button>
                    )}
                </div>
             </div>
        </div>
      </div>
    );
  };

  const renderScheduleTable = (session: 'Morning' | 'Afternoon', slots: TimeSlot[]) => (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden mb-8 transition-colors duration-300 ${isEditing ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'}`}>
      <div className={`px-6 py-4 border-b border-gray-200 flex items-center gap-2 ${session === 'Morning' ? 'bg-amber-50' : 'bg-indigo-50'}`}>
         {session === 'Morning' ? <Sun className="h-5 w-5 text-amber-600" /> : <Moon className="h-5 w-5 text-indigo-600" />}
         <h3 className={`font-bold text-lg ${session === 'Morning' ? 'text-amber-800' : 'text-indigo-800'}`}>
            {session === 'Morning' ? t('timetable.morning') : t('timetable.afternoon')}
         </h3>
         {isEditing && <span className="ml-auto text-xs font-bold uppercase text-indigo-600 bg-white px-2 py-1 rounded shadow-sm">Editing Mode</span>}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50/50">
             <div className="p-4 font-bold text-gray-500 text-xs uppercase text-center border-r border-gray-100 tracking-wider">
                {t('timetable.period')} / Time
             </div>
             {days.map((day, idx) => {
                 const date = addDays(currentWeekStart, idx);
                 const dateStr = formatDate(date);
                 const isToday = new Date().toDateString() === date.toDateString();
                 return (
                   <div key={day} className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                     <div className={`font-bold text-sm ${isToday ? 'text-indigo-700' : 'text-gray-800'}`}>{day}</div>
                     <div className={`text-xs mt-1 ${isToday ? 'text-indigo-500 font-bold' : 'text-gray-400'}`}>{dateStr}</div>
                   </div>
                 )
             })}
          </div>
          
          <div className="divide-y divide-gray-100">
            {slots.map((slot) => (
              <div key={slot.period} className="grid grid-cols-6 min-h-[110px]">
                <div className="p-4 flex flex-col items-center justify-center text-sm bg-gray-50/30 border-r border-gray-100">
                   <span className="font-bold text-gray-900 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center mb-1 shadow-sm">
                      {slot.period}
                   </span>
                   <span className="text-xs text-gray-500 font-medium">{slot.time}</span>
                </div>

                {days.map((day, idx) => {
                  const date = addDays(currentWeekStart, idx);
                  const dateStr = formatDate(date);
                  const isToday = new Date().toDateString() === date.toDateString();

                  // Filter logic based on view mode
                  const entry = schedule.find(s => 
                    s.day === day && 
                    s.session === session &&
                    s.period === slot.period &&
                    (viewMode === 'class' ? s.classId === selectedClassId : s.teacherId === selectedTeacherId)
                  );
                  
                  const editable = canEditSlot(entry);

                  return (
                    <div key={`${day}-${slot.period}`} className={`p-2 border-r border-gray-100 last:border-r-0 relative group transition-colors ${isEditing && editable ? 'hover:bg-indigo-50/30 cursor-pointer' : isEditing ? 'bg-gray-50/50' : isToday ? 'bg-indigo-50/20' : 'hover:bg-gray-50'}`}>
                      {entry ? (
                        <div 
                          onClick={() => {
                             if(isEditing) {
                               if (editable) setEditingSlot({ item: entry, day, period: slot.period, session });
                             } else {
                               setSelectedSlot({ item: entry, timeSlot: slot, date: `${day} ${dateStr}` });
                             }
                          }}
                          className={`h-full w-full rounded-lg p-3 border shadow-sm transition-all flex flex-col justify-center relative ${
                             isEditing 
                               ? (editable ? 'border-indigo-300 ring-1 ring-indigo-200 bg-white hover:scale-[1.02] shadow-md cursor-pointer' : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed')
                               : session === 'Morning' 
                                  ? 'bg-amber-50/50 border-amber-100 hover:bg-amber-100/50 hover:shadow-md hover:-translate-y-1 cursor-pointer' 
                                  : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100/50 hover:shadow-md hover:-translate-y-1 cursor-pointer'
                          }`}
                        >
                           {isEditing && editable && <div className="absolute top-1 right-1 text-indigo-500"><Edit2 className="h-3 w-3" /></div>}
                           
                          <div className={`font-bold text-sm mb-1.5 line-clamp-2 ${session === 'Morning' && !isEditing ? 'text-amber-900' : 'text-indigo-900'}`}>
                             {getSubjectName(entry.subjectId)}
                          </div>
                          
                          {/* Dynamic Content based on View Mode */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="text-xs text-gray-500 flex items-center bg-white/60 px-1.5 py-0.5 rounded">
                              <MapPin className="h-3 w-3 mr-1" /> {entry.room}
                            </div>
                             {viewMode === 'class' ? (
                                <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60 text-gray-600 truncate max-w-[60px]" title={getTeacherName(entry.teacherId)}>
                                    {getTeacherName(entry.teacherId).split(' ').pop()}
                                </div>
                             ) : (
                                <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60 text-gray-600">
                                    {getClassName(entry.classId)}
                                </div>
                             )}
                          </div>
                        </div>
                      ) : (
                        <div 
                           className={`h-full w-full flex items-center justify-center rounded-lg transition-all ${isEditing && editable ? 'border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer group-hover:visible' : ''}`}
                           onClick={() => {
                              if(isEditing && editable) {
                                setEditingSlot({ day, period: slot.period, session });
                              }
                           }}
                        >
                          {isEditing && editable && <Plus className="h-6 w-6 text-gray-300 group-hover:text-indigo-500" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-6">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('timetable.title')}</h2>
           <p className="text-gray-500 mt-1">{t('timetable.subtitle')}</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
           {/* View Toggle */}
           {!isStudent && (
           <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex">
               <button 
                  onClick={() => setViewMode('class')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'class' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                  <GraduationCap className="h-4 w-4 mr-2" /> By Class
               </button>
               <button 
                  onClick={() => setViewMode('teacher')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'teacher' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                  <Users className="h-4 w-4 mr-2" /> By Teacher
               </button>
           </div>
           )}

           {/* Week Navigator */}
           <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                <button onClick={() => handleWeekChange('prev')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"><ChevronLeft className="h-5 w-5" /></button>
                <div className="px-4 text-center min-w-[140px]">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Week of</div>
                    <div className="text-sm font-bold text-gray-900 cursor-pointer hover:text-indigo-600" onClick={jumpToToday}>{formatDate(currentWeekStart)}</div>
                </div>
                <button onClick={() => handleWeekChange('next')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"><ChevronRight className="h-5 w-5" /></button>
           </div>

           {/* Dynamic Selector based on View Mode */}
           <div className="relative min-w-[200px]">
               {viewMode === 'class' ? (
                   <div className="relative">
                       <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                       <select 
                          disabled={isStudent} // Students locked to their class
                          className={`w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-medium shadow-sm ${isStudent ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                       >
                         {MOCK_CLASSES.map(cls => (
                           <option key={cls.id} value={cls.id}>{cls.name} - {cls.room}</option>
                         ))}
                       </select>
                       {!isStudent && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />}
                   </div>
               ) : (
                   <div className="relative">
                       <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                       <select 
                          disabled={isTeacher} // Teachers can only view themselves
                          className={`w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-medium shadow-sm ${isTeacher ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                          value={selectedTeacherId}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                       >
                         {MOCK_TEACHERS.map(t => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                   </div>
               )}
           </div>

           {/* Actions */}
           {!isStudent && (
           <div className="flex gap-2">
               <button 
                 onClick={() => setShowAssignmentsModal(true)}
                 className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition shadow-sm"
                 title="Manage Assignments"
               >
                 <BookUser className="h-5 w-5" />
               </button>

               <button 
                 onClick={() => setIsEditing(!isEditing)} 
                 className={`px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-lg flex items-center ${
                    isEditing 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                 }`}
               >
                 {isEditing ? <Check className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                 {isEditing ? 'Done' : 'Edit'}
               </button>
           </div>
           )}
        </div>
      </div>

      {(viewMode === 'class' && selectedClassId) || (viewMode === 'teacher' && selectedTeacherId) ? (
        <>
          {renderScheduleTable('Morning', MORNING_SLOTS)}
          {renderScheduleTable('Afternoon', AFTERNOON_SLOTS)}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
           <CalendarDays className="h-16 w-16 text-gray-300 mb-4" />
           <p className="text-gray-500 font-medium">Please select a class or teacher to view schedule</p>
        </div>
      )}
      
      {selectedSlot && <ScheduleDetailModal info={selectedSlot} onClose={() => setSelectedSlot(null)} />}
      {editingSlot && <EditSlotModal info={editingSlot} onClose={() => setEditingSlot(null)} />}
      {showAssignmentsModal && <AssignmentsModal onClose={() => setShowAssignmentsModal(false)} />}
    </div>
  );
};
