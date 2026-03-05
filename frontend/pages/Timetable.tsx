import React, { useState, useEffect, useMemo } from 'react';
import api from '../src/api/client';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { 
  CalendarDays, Clock, MapPin, ChevronDown, Sun, Moon, Search, X, 
  User as UserIcon, Plus, Edit2, Trash2, Check, FileDown, 
  ExternalLink, ChevronLeft, ChevronRight, Filter, Users, GraduationCap
} from 'lucide-react';
import { ScheduleItem, User, UserRole, Subject, Teacher, ClassGroup } from '../types';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const isStudent = currentUser?.role === UserRole.STUDENT;
  const isTeacher = currentUser?.role === UserRole.TEACHER;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  
  // --- State ---
  const [viewMode, setViewMode] = useState<ViewMode>('class');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  // Local state for schedule
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [classesList, setClassesList] = useState<ClassGroup[]>([]);
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
     const sub = subjectsList.find(s => s.code === code || s.id === code);
     return sub ? sub.name : code;
  }

  function getClassName(id: string) {
      return classesList.find(c => c.id === id)?.name || id;
  }

  function getTeacherName(id: string) {
      return teachersList.find(t => t.id === id)?.name || 'Unknown';
  }

  // --- Effects ---

    // Fetch Reference Data
    useEffect(() => {
    const fetchData = async () => {
        try {
            const [subjRes, classRes, teachRes, allocRes] = await Promise.all([
                api.get('/subjects'),
                api.get('/classes'),
                api.get('/teachers').catch(() => ({ data: [] })), // Safe fallback
                api.get('/teaching-assignments').catch(() => ({ data: [] }))
            ]);
            setSubjectsList(subjRes.data);
            setClassesList(classRes.data);
            setTeachersList(teachRes.data.map((t: any) => ({ ...t, name: t.user?.name || t.name })));
            
            const allocData = allocRes.data?.data || allocRes.data || [];
            setAllocations(allocData);

        } catch (error) {
            console.error("Failed to fetch reference data", error);
        }
    };
    fetchData();
  }, []);

  // Fetch Schedule
  const fetchSchedule = async () => {
    try {
        const { data } = await api.get('/schedule'); // Fetch all for now due to complex filter logic on client vs server
        setSchedule(data);
    } catch (error) {
        console.error("Failed to fetch schedule", error);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentWeekStart, selectedClassId, selectedTeacherId, isAdmin]);

  // Initialization Logic
  useEffect(() => {
    if (classesList.length > 0 && teachersList.length > 0) {
        if (isTeacher) {
            setViewMode('teacher');
            setSelectedTeacherId(currentUser!.id); // Assuming currentUser.id matches teacher.userId or teacher.id. 
            // In backend User.id != Teacher.id. Teacher has userId.
            const teacherProfile = teachersList.find(t => (t as any).userId === currentUser!.id);
            if(teacherProfile) setSelectedTeacherId(teacherProfile.id);

            const homeroom = classesList.find(c => c.teacherId === teacherProfile?.id);
            if (homeroom) setSelectedClassId(homeroom.id);
            else setSelectedClassId(classesList[0]?.id);
        } else if (isStudent) {
            setViewMode('class');
            const myClass = classesList.find(c => c.id === currentUser?.classId) || classesList[0];
            setSelectedClassId(myClass?.id);
        } else {
            const defaultClass = classesList.find(c => c.name === '10A1') || classesList[0];
            if (defaultClass) setSelectedClassId(defaultClass.id);
            setSelectedTeacherId(teachersList[0]?.id);
        }
    }
  }, [currentUser, isTeacher, isStudent, classesList, teachersList]);

  // Permission Check for Edit
  const canEditSlot = (slotItem?: ScheduleItem) => {
      if (isStudent) return false; // Students cannot edit
      if (!isEditing) return false;
      if (isAdmin) return true;
      if (isTeacher) {
          // In Teacher View: Can edit their own slots
          // Note: currentUser.id expected to match teacher's userId. 
          // If selectedTeacherId matches teacher profile ID associated with currentUser.
          const myTeacherProfile = teachersList.find(t => (t as any).userId === currentUser!.id);
          if (viewMode === 'teacher') return selectedTeacherId === myTeacherProfile?.id;
          
          // In Class View: Can edit if it's their homeroom class OR if the slot belongs to them
          const isHomeroom = classesList.find(c => c.id === selectedClassId)?.teacherId === myTeacherProfile?.id;
          if (isHomeroom) return true;
          if (slotItem && slotItem.teacherId === myTeacherProfile?.id) return true;
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

  const handleSaveSlot = async (e: React.FormEvent, formData: Partial<ScheduleItem>) => {
    e.preventDefault();
    if(!formData.subjectId) return;

    // Determine context based on view mode
    const targetClassId = viewMode === 'class' ? selectedClassId : formData.classId;
    const targetTeacherId = viewMode === 'teacher' ? selectedTeacherId : formData.teacherId;

    if (!targetClassId || !targetTeacherId) {
        showToast('error', t('timetable.missingInfo'));
        return;
    }

    // Check allocation limit
    const teacherAllocations = allocations.filter(a => a.teacherId === targetTeacherId);
    const specificAllocation = teacherAllocations.find(a => a.classId === targetClassId && a.subjectId === formData.subjectId);
    
    if (specificAllocation) {
        const currentCount = schedule.filter(s => 
            s.teacherId === targetTeacherId && 
            s.classId === targetClassId && 
            s.subjectId === formData.subjectId &&
            (!editingSlot?.item || s.id !== editingSlot.item.id)
        ).length;
        
        if (currentCount + 1 > specificAllocation.sessionsPerWeek) {
            const confirmMsg = `Cảnh báo: Giáo viên này đã được xếp ${currentCount + 1}/${specificAllocation.sessionsPerWeek} tiết đăng ký cho môn này ở lớp này. Bạn có chắc chắn muốn lưu không?`;
            const isConfirmed = await confirm({ title: 'Cảnh báo vượt quá số tiết', message: confirmMsg, isDanger: true });
            if (!isConfirmed) {
                return;
            }
        }
    } else if (isAdmin) {
       const confirmMsg = `Cảnh báo: Giáo viên này chưa được Phân công dạy môn này ở lớp này. Bạn có muốn xếp lịch chéo không?`;
       const isConfirmed = await confirm({ title: 'Xếp lịch chéo', message: confirmMsg, isDanger: true });
       if (!isConfirmed) {
           return;
       }
    }

    try {
        if (editingSlot?.item) {
          // Update existing
          const { data } = await api.patch(`/schedule/${editingSlot.item.id}`, formData);
          const updatedSchedule = schedule.map(s => 
            s.id === editingSlot.item!.id 
              ? { ...s, ...data } 
              : s
          );
          setSchedule(updatedSchedule);
        } else {
          // Create new
          const newItemPayload = {
            day: editingSlot!.day,
            period: editingSlot!.period,
            session: editingSlot!.session,
            classId: targetClassId,
            subjectId: formData.subjectId,
            teacherId: targetTeacherId,
            room: formData.room || '', // Default room if not provided or handle in backend
          };
          const { data } = await api.post('/schedule', newItemPayload);
          setSchedule([...schedule, data]);
        }
        setEditingSlot(null);
        showToast('success', 'Đã lưu thiết lập tiết học thành công.');
    } catch(e) {
        console.error("Save slot failed", e);
        showToast('error', t('timetable.saveFailed'));
    }
  };

const handleExportExcel = async () => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'School Management System';
        workbook.created = new Date();

        const sheetTitle = viewMode === 'class' 
            ? `Thời Khóa Biểu - Lớp ${getClassName(selectedClassId)}`
            : `Thời Khóa Biểu - GV ${getTeacherName(selectedTeacherId)}`;
        const sheet = workbook.addWorksheet('Timetable', {
            pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
            views: [{ showGridLines: false }]
        });

        // Set column widths
        sheet.columns = [
            { header: '', key: 'ca', width: 12 },
            { header: '', key: 'tiet', width: 10 },
            { header: '', key: 'thu2', width: 22 },
            { header: '', key: 'thu3', width: 22 },
            { header: '', key: 'thu4', width: 22 },
            { header: '', key: 'thu5', width: 22 },
            { header: '', key: 'thu6', width: 22 },
        ];

        // Title Row
        sheet.mergeCells('A1:G2');
        const titleCell = sheet.getCell('A1');
        titleCell.value = sheetTitle.toUpperCase();
        titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF1F2937' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Subtitle Row (Date range)
        sheet.mergeCells('A3:G3');
        const subTitleCell = sheet.getCell('A3');
        const endOfWeek = addDays(currentWeekStart, 4);
        subTitleCell.value = `Tuần từ ${formatDate(currentWeekStart)} đến ${formatDate(endOfWeek)}`;
        subTitleCell.font = { name: 'Arial', size: 12, italic: true, color: { argb: 'FF4B5563' } };
        subTitleCell.alignment = { horizontal: 'center' };
        
        sheet.addRow([]); // Empty row 4

        // Header Row (Days)
        const headerRow = sheet.getRow(5);
        headerRow.values = ['Ca', 'Tiết', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
        headerRow.height = 30;
        headerRow.eachCell((cell, colNumber) => {
            cell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
            };
        });

        const writeSessionSlots = (sessionName: string, slots: TimeSlot[], startRowIndex: number, fillColor: string, fontColor: string) => {
            let currentRow = startRowIndex;
            slots.forEach((slot, index) => {
                const row = sheet.getRow(currentRow);
                row.height = 70; // Set enough height for multiline text

                // Session name merge cell
                if (index === 0) {
                    sheet.mergeCells(`A${currentRow}:A${currentRow + slots.length - 1}`);
                    const sessionCell = sheet.getCell(`A${currentRow}`);
                    sessionCell.value = sessionName;
                    sessionCell.font = { bold: true, size: 14, color: { argb: fontColor } };
                    sessionCell.alignment = { vertical: 'middle', horizontal: 'center', textRotation: 90 };
                    sessionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
                }

                // Period cell
                const periodCell = sheet.getCell(`B${currentRow}`);
                periodCell.value = `Tiết ${slot.period}\n(${slot.time})`;
                periodCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                periodCell.font = { size: 10, bold: true };
                periodCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

                // Fill days
                days.forEach((day, dayIdx) => {
                    const colLetter = String.fromCharCode(67 + dayIdx); // C, D, E, F, G (67 = C)
                    const cell = sheet.getCell(`${colLetter}${currentRow}`);
                    
                    const sessionFilter = sessionName === 'SÁNG' ? 'Morning' : 'Afternoon';
                    const entry = schedule.find(s => 
                        s.day === day && 
                        s.session === sessionFilter &&
                        s.period === slot.period &&
                        (viewMode === 'class' ? s.classId === selectedClassId : s.teacherId === selectedTeacherId)
                    );

                    if (entry) {
                        const subjectName = getSubjectName(entry.subjectId);
                        const subText = viewMode === 'class' ? getTeacherName(entry.teacherId) : getClassName(entry.classId);
                        cell.value = `${subjectName}\nPhòng: ${entry.room}\n${subText}`;
                        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1F2937' } };
                        // Highlight slightly based on session
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sessionName === 'SÁNG' ? 'FFFFFBEB' : 'FFF5F3FF' } }; // Amber-50 / Indigo-50
                    } else {
                        cell.value = '';
                    }

                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    cell.border = { top: {style:'thin', color: {argb: 'FFE5E7EB'}}, left: {style:'thin', color: {argb: 'FFE5E7EB'}}, bottom: {style:'thin', color: {argb: 'FFE5E7EB'}}, right: {style:'thin', color: {argb: 'FFE5E7EB'}} };
                });

                // Re-apply outer borders to merged A cell
                const aCell = sheet.getCell(`A${currentRow}`);
                aCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

                currentRow++;
            });
            return currentRow;
        };

        let nextRow = writeSessionSlots('SÁNG', MORNING_SLOTS, 6, 'FFFEF3C7', 'FF92400E'); // Amber-100, Amber-900
        writeSessionSlots('CHIỀU', AFTERNOON_SLOTS, nextRow, 'FFE0E7FF', 'FF3730A3'); // Indigo-100, Indigo-900

        // Export Buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        let filename = 'ThoiKhoaBieu.xlsx';
        if (viewMode === 'class') {
            filename = `TKB_Lop_${getClassName(selectedClassId)}.xlsx`;
        } else {
            filename = `TKB_GV_${getTeacherName(selectedTeacherId)}.xlsx`;
        }
        saveAs(blob, filename);

    } catch (error) {
        console.error("Export Excel failed", error);
        showToast('error', "Có lỗi xảy ra khi xuất file Excel!");
    }
};

  const handleDeleteSlot = async (id: string) => {
    const isConfirmed = await confirm({ title: t('common.confirmDelete'), message: t('common.confirmDelete') || 'Bạn có chắc chắn muốn xóa?', isDanger: true });
    if(isConfirmed) {
      try {
          await api.delete(`/schedule/${id}`);
          setSchedule(schedule.filter(s => s.id !== id));
          setEditingSlot(null);
          showToast('success', 'Đã xóa tiết học thành công.');
      } catch(e) {
          console.error("Delete failed", e);
          showToast('error', t('timetable.deleteFailed'));
      }
    }
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
                   {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
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
                       {(() => {
                          const selectedSubject = subjectsList.find(s => s.id === formData.subjectId);
                          let displayTeachers = teachersList;
                          
                          if (selectedSubject) {
                              const subjectName = selectedSubject.name;
                              const exactMatches = teachersList.filter(t => t.subjects?.includes(subjectName) || t.subjects?.includes(selectedSubject.code));
                              const otherTeachers = teachersList.filter(t => !exactMatches.includes(t));
                              
                              if (exactMatches.length > 0) {
                                 return (
                                    <>
                                       <optgroup label={`Giáo viên bộ môn ${subjectName}`}>
                                          {exactMatches.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subjects?.join(', ') || ''})</option>)}
                                       </optgroup>
                                       <optgroup label="Các giáo viên khác">
                                          {otherTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                       </optgroup>
                                    </>
                                 );
                              }
                          }
                          
                          return displayTeachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subjects?.join(', ') || ''})</option>);
                       })()}
                     </select>
                  </div>
              ) : (
                  <div>
                     <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('class.name')}</label>
                     <select disabled={!isAdmin} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})}>
                       <option value="">-- Select Class --</option>
                       {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
    const subject = subjectsList.find(s => s.id === info.item.subjectId);
    const classGroup = classesList.find(c => c.id === info.item.classId);
    const teacher = teachersList.find(t => t.id === info.item.teacherId);
    // teacher.userId check might be needed if teacher.id != currentUser.id directly (which is true in backend)
    // const canViewJournal = isTeacher && ((teacher as any)?.userId === currentUser!.id);
    const canViewJournal = isTeacher && (info.item.teacherId === teachersList.find(t => (t as any).userId === currentUser!.id)?.id);

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
                            <ExternalLink className="h-4 w-4 mr-2" /> {t('timetable.openJournal')}
                        </button>
                    )}
                </div>
             </div>
        </div>
      </div>
    );
  };

  const renderScheduleTable = (session: 'Morning' | 'Afternoon', slots: TimeSlot[]) => (
    <div className={`bg-white rounded-[24px] shadow-sm border overflow-hidden mb-8 transition-all duration-500 ${isEditing ? 'border-indigo-300 ring-4 ring-indigo-50 shadow-lg' : 'border-gray-100 hover:shadow-md'}`}>
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center gap-3 sm:gap-4 ${session === 'Morning' ? 'bg-amber-50/50' : 'bg-indigo-50/50'}`}>
         <div className={`p-2 sm:p-2.5 rounded-xl ${session === 'Morning' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
           {session === 'Morning' ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
         </div>
         <h3 className={`font-heading font-bold text-lg sm:text-xl tracking-tight ${session === 'Morning' ? 'text-amber-900' : 'text-indigo-900'}`}>
            {session === 'Morning' ? t('timetable.morning') : t('timetable.afternoon')}
         </h3>
         {isEditing && <span className="ml-auto text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm border border-indigo-100 flex items-center"><Edit2 className="h-3 w-3 sm:mr-1.5" /><span className="hidden sm:inline">{t('timetable.editingMode')}</span></span>}
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-full lg:min-w-[900px]">
          <div className="grid grid-cols-[3fr_4fr_4fr_4fr_4fr_4fr] sm:grid-cols-6 border-b border-gray-100 bg-gray-50/50">
             <div className="p-1 sm:p-4 font-bold text-slate-400 text-[9px] sm:text-[11px] uppercase text-center border-r border-gray-100 tracking-widest flex items-center justify-center">
                <span className="hidden sm:inline">{t('timetable.periodTime')}</span>
                <span className="sm:hidden"><Clock className="w-4 h-4" /></span>
             </div>
             {days.map((day, idx) => {
                 const date = addDays(currentWeekStart, idx);
                 const dateStr = formatDate(date);
                 const isToday = new Date().toDateString() === date.toDateString();
                 // Shorten day names for mobile
                 const shortDay = day.substring(0, 3);
                 return (
                   <div key={day} className={`p-1 sm:p-4 text-center border-r border-gray-100 last:border-r-0 relative overflow-hidden flex flex-col justify-center ${isToday ? 'bg-indigo-50/50' : ''}`}>
                     {isToday && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>}
                     <div className={`font-heading font-bold text-[12px] sm:text-[15px] ${isToday ? 'text-indigo-700' : 'text-slate-700'}`}>
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{shortDay}</span>
                     </div>
                     <div className={`text-[9px] sm:text-xs mt-0 sm:mt-0.5 ${isToday ? 'text-indigo-500 font-bold' : 'text-slate-400 font-medium'}`}>{dateStr}</div>
                   </div>
                 )
             })}
          </div>
          
          <div className="divide-y divide-gray-100 bg-white">
            {slots.map((slot) => (
              <div key={slot.period} className="grid grid-cols-[3fr_4fr_4fr_4fr_4fr_4fr] sm:grid-cols-6 min-h-[80px] sm:min-h-[125px] group/row">
                <div className="p-1 sm:p-4 flex flex-col items-center justify-center text-sm border-r border-gray-100 bg-gray-50/30 group-hover/row:bg-gray-50 transition-colors">
                   <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-[8px] sm:rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-0 sm:mb-1.5 font-bold text-slate-700 text-xs sm:text-sm">
                      {slot.period}
                   </div>
                   <span className="text-[8px] sm:text-[11px] text-slate-400 font-medium tracking-tight sm:tracking-wide mt-1 sm:mt-0 leading-tight text-center">{slot.time}</span>
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
                    <div key={`${day}-${slot.period}`} className={`p-1 sm:p-2.5 border-r border-gray-100 last:border-r-0 relative transition-colors ${isEditing && editable ? 'hover:bg-indigo-50/30 cursor-pointer' : isEditing ? 'bg-gray-50/80' : isToday ? 'bg-indigo-50/10' : 'hover:bg-gray-50/50'}`}>
                      {entry ? (
                        <div 
                          onClick={() => {
                             if(isEditing) {
                               if (editable) setEditingSlot({ item: entry, day, period: slot.period, session });
                             } else {
                               setSelectedSlot({ item: entry, timeSlot: slot, date: `${day} ${dateStr}` });
                             }
                          }}
                          className={`h-full w-full rounded-[8px] sm:rounded-[16px] p-1.5 sm:p-3.5 border transition-all duration-300 flex flex-col relative overflow-hidden group/card ${
                             isEditing 
                               ? (editable ? 'border-indigo-200 ring-2 ring-indigo-100 bg-white hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer' : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed')
                               : session === 'Morning' 
                                  ? 'bg-gradient-to-br from-amber-50 to-white border-amber-100/60 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(251,191,36,0.15)] hover:border-amber-200 cursor-pointer' 
                                  : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100/60 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,102,241,0.15)] hover:border-indigo-200 cursor-pointer'
                          }`}
                        >
                           <div className="absolute top-0 right-0 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-bl from-white/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-bl-full pointer-events-none"></div>
                           {isEditing && editable && <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-indigo-500 bg-white shadow-sm p-1 sm:p-1.5 rounded-full"><Edit2 className="h-2 w-2 sm:h-3 sm:w-3" /></div>}
                           
                          <div className={`font-heading font-bold text-[10px] sm:text-[14px] leading-tight mb-1 sm:mb-2 line-clamp-3 sm:line-clamp-2 break-words ${session === 'Morning' && !isEditing ? 'text-amber-900' : isEditing ? 'text-slate-800' : 'text-indigo-900'}`}>
                             {getSubjectName(entry.subjectId)}
                          </div>
                          
                          {/* Dynamic Content based on View Mode */}
                          <div className="flex flex-col gap-1 sm:gap-1.5 mt-auto relative z-10 w-full">
                            <div className="hidden sm:flex text-[11px] font-medium text-slate-500 items-center w-fit bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white max-w-full">
                              <MapPin className="h-3 w-3 mr-1 shrink-0 text-slate-400" /> 
                              <span className="truncate">{entry.room}</span>
                            </div>
                            <div className="sm:hidden text-[8px] font-medium text-slate-500 truncate w-full">
                               {entry.room}
                            </div>
                             {viewMode === 'class' ? (
                                <div className="hidden sm:block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white border border-white text-slate-600 truncate w-fit max-w-full shadow-[0_2px_4px_rgba(0,0,0,0.02)]" title={getTeacherName(entry.teacherId)}>
                                    {getTeacherName(entry.teacherId)}
                                </div>
                             ) : (
                                <div className="hidden sm:block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white border border-white text-slate-600 truncate w-fit max-w-full shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
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
      <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-3 sm:gap-5 mb-4">
        <div>
           <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-800 tracking-tight">{t('timetable.title')}</h2>
           <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium">{t('timetable.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
           {/* View Toggle */}
           {!isStudent && (
           <div className="bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60 shadow-inner flex items-center">
               <button 
                  onClick={() => setViewMode('class')}
                  className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${viewMode === 'class' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
               >
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" /> {t('timetable.byClass')}
               </button>
               <button 
                  onClick={() => setViewMode('teacher')}
                  className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${viewMode === 'teacher' ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
               >
                  <Users className="h-3.5 w-3.5 mr-1.5" /> {t('timetable.byTeacher')}
               </button>
           </div>
           )}

           {/* Week Navigator */}
           <div className="flex flex-1 sm:flex-none justify-between sm:justify-start items-center bg-white rounded-lg border border-gray-200 shadow-sm p-0.5 w-full sm:w-auto mt-2 sm:mt-0 order-last sm:order-none">
                <button onClick={() => handleWeekChange('prev')} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                <div className="px-2 sm:px-3 text-center flex-1 sm:min-w-[120px]">
                    <div className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-bold tracking-wider">{t('timetable.weekOf')}</div>
                    <div className="text-[11px] sm:text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors" onClick={jumpToToday}>{formatDate(currentWeekStart)}</div>
                </div>
                <button onClick={() => handleWeekChange('next')} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 transition-colors"><ChevronRight className="h-4 w-4" /></button>
           </div>

           {/* Dynamic Selector based on View Mode */}
           <div className="relative flex-1 sm:flex-none min-w-[140px] sm:min-w-[160px]">
               {viewMode === 'class' ? (
                   <div className="relative">
                       <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                       <select 
                          disabled={isStudent}
                          className={`w-full pl-8 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none font-semibold text-slate-700 shadow-sm transition-all ${isStudent ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'hover:border-gray-300'}`}
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                       >
                         {classesList.map(cls => (
                           <option key={cls.id} value={cls.id}>{cls.name} - {cls.room}</option>
                         ))}
                       </select>
                       {!isStudent && <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />}
                   </div>
               ) : (
                   <div className="relative">
                       <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                       <select 
                          disabled={isTeacher} // Teachers can only view themselves
                          className={`w-full pl-8 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none font-semibold text-slate-700 shadow-sm transition-all ${isTeacher ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-300'}`}
                          value={selectedTeacherId}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                       >
                         {teachersList.map(t => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                   </div>
               )}
           </div>

           {/* Actions */}
           <div className="flex gap-2">
               {!isStudent && (
                 <button 
                   onClick={() => setIsEditing(!isEditing)} 
                   className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center border ${
                      isEditing 
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60' 
                      : 'bg-white hover:bg-gray-50 text-slate-700 border-gray-200'
                   }`}
                 >
                   {isEditing ? <Check className="h-3.5 w-3.5 mr-1.5 text-amber-600" /> : <Edit2 className="h-3.5 w-3.5 mr-1.5 text-slate-500" />}
                   {isEditing ? t('timetable.done') : t('common.edit')}
                 </button>
               )}

               <button 
                 onClick={handleExportExcel}
                 className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center"
               >
                 <FileDown className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                 Xuất Excel
               </button>
           </div>
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
           <p className="text-gray-500 font-medium">{t('timetable.selectPrompt')}</p>
        </div>
      )}
      
      {selectedSlot && <ScheduleDetailModal info={selectedSlot} onClose={() => setSelectedSlot(null)} />}
      {editingSlot && <EditSlotModal info={editingSlot} onClose={() => setEditingSlot(null)} />}
    </div>
  );
};
