import React, { useState, useEffect, useCallback } from 'react';
import api from '../src/api/client';
import { User, Teacher, ClassGroup, Subject } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import {
  Users, BookOpen, School, Calendar, Save, Trash2, Plus, 
  MapPin, CheckCircle, AlertCircle, RefreshCcw
} from 'lucide-react';

interface TeachingAssignmentsProps {
  currentUser: User;
}

interface AllocationRecord {
  id?: string;
  teacherId: string;
  classIds: string[];
  subjectId: string;
  sessionsPerWeek: number;
}

export const TeachingAssignments: React.FC<TeachingAssignmentsProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Current working set of allocations
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

  // Toast from global context
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tchRes, clsRes, subRes, allocRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/teaching-assignments')
      ]);
      setTeachers(tchRes.data?.data || tchRes.data);
      setClasses(clsRes.data?.data || clsRes.data);
      setSubjects(subRes.data);
      
      const parsedAllocations: AllocationRecord[] = [];
      (allocRes.data || []).forEach((a: any) => {
          const existing = parsedAllocations.find(pa => 
              pa.teacherId === a.teacherId && 
              pa.subjectId === a.subjectId && 
              pa.sessionsPerWeek === (a.sessionsPerWeek || 1)
          );
          if (existing) {
              if (!existing.classIds.includes(a.classId)) {
                  existing.classIds.push(a.classId);
              }
          } else {
              parsedAllocations.push({
                  id: a.id || `temp-${Date.now()}-${Math.random()}`,
                  teacherId: a.teacherId,
                  classIds: [a.classId],
                  subjectId: a.subjectId,
                  sessionsPerWeek: a.sessionsPerWeek || 1
              });
          }
      });
      setAllocations(parsedAllocations);
    } catch (e) {
      console.error("Failed to load reference data", e);
      showToast('error', 'Lỗi khi tải dữ liệu phân công giảng dạy.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAllocation = () => {
    setAllocations([
      ...allocations,
      {
        id: `temp-${Date.now()}`,
        teacherId: '',
        classIds: [],
        subjectId: '',
        sessionsPerWeek: 1
      }
    ]);
  };

  const updateAllocation = (index: number, field: keyof AllocationRecord, value: any) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    
    // Auto-select subject if teacher changes
    if (field === 'teacherId' && value) {
        const teacher = teachers.find(t => t.id === value);
        if (teacher && teacher.subjects && teacher.subjects.length > 0) {
            const matchedSubjects = subjects.filter(s => teacher.subjects!.includes(s.name) || teacher.subjects!.includes(s.code));
            if (matchedSubjects.length === 1) {
                newAllocations[index].subjectId = matchedSubjects[0].id;
            } else if (!matchedSubjects.some(s => s.id === newAllocations[index].subjectId)) {
                // Current subject not in teacher's subjects → reset
                newAllocations[index].subjectId = '';
            }
        }
    }

    // When subject changes, check if current teacher teaches it
    if (field === 'subjectId' && value && newAllocations[index].teacherId) {
        const currentTeacher = teachers.find(t => t.id === newAllocations[index].teacherId);
        const selectedSubject = subjects.find(s => s.id === value);
        if (currentTeacher && selectedSubject && currentTeacher.subjects && currentTeacher.subjects.length > 0) {
            const teachesSubject = currentTeacher.subjects.some(
                ts => ts === selectedSubject.name || ts === selectedSubject.code
            );
            if (!teachesSubject) {
                newAllocations[index].teacherId = '';
            }
        }
    }

    setAllocations(newAllocations);
  };

  const removeAllocation = (index: number) => {
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
  };

  const handleSaveAll = async () => {
    // Validate
    const invalid = allocations.find(a => !a.teacherId || !a.classIds || a.classIds.length === 0 || !a.subjectId);
    if (invalid) {
      showToast('error', 'Vui lòng điền đủ Giáo viên, chọn ít nhất 1 Lớp học và Môn học cho tất cả các phân công.');
      return;
    }

    setSaving(true);
    try {
      const payload: any[] = [];
      allocations.forEach(a => {
          a.classIds.forEach(cid => {
              payload.push({
                  teacherId: a.teacherId,
                  classId: cid,
                  subjectId: a.subjectId,
                  sessionsPerWeek: a.sessionsPerWeek
              });
          });
      });
        
      // payload expects: { teacherId, classId, subjectId, sessionsPerWeek }
      await api.post('/teaching-assignments/bulk', payload);
      showToast('success', 'Đã lưu danh sách phân công giảng dạy thành công.');
      fetchData(); // Refresh to get proper IDs
    } catch (e: any) {
      console.error("Save failed", e);
      const msg = e.response?.data?.message || 'Có lỗi xảy ra khi lưu.';
      showToast('error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  // For nice UI grouping by Class or Teacher. Let's make it a simple list for now, but beautifully styled.
  return (
    <div className="animate-fade-in pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
         <div>
            <h2 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight drop-shadow-sm">
               Phân công giảng dạy
            </h2>
            <p className="text-slate-500 mt-2 font-medium max-w-xl">
               Sắp xếp và quản lý phân công giáo viên vào các lớp học tương ứng với từng môn học. 
               Hệ thống sẽ tự động tổng hợp thời khóa biểu.
            </p>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
             <button 
                onClick={fetchData} 
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors bg-white shadow-sm flex items-center justify-center shrink-0"
                title="Tải lại dữ liệu"
             >
                <RefreshCcw className="h-4 w-4" />
             </button>
             <button
                onClick={handleSaveAll}
                disabled={saving || loading}
                className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
             >
                {saving ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <Save className="h-4 w-4" />
                )}
                Lưu toàn bộ Phân công
             </button>
         </div>
      </div>

      {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center border border-gray-100 shadow-sm min-h-[400px]">
             <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Đang tải dữ liệu phân công...</p>
          </div>
      ) : (
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-visible min-h-[50vh]">
             
             {/* List Header */}
             <div className="bg-slate-50 border-b border-gray-100 py-3 px-6 hidden md:grid grid-cols-12 gap-4">
                 <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                     <Users className="h-4 w-4 text-slate-400" /> Giáo viên
                 </div>
                 <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                     <School className="h-4 w-4 text-slate-400" /> Lớp học
                 </div>
                 <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                     <BookOpen className="h-4 w-4 text-slate-400" /> Môn học
                 </div>
                 <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-slate-400" /> Số tiết / Tuần
                 </div>
                 <div className="col-span-1"></div>
             </div>

             {/* List Body */}
             <div className="divide-y divide-gray-100">
                {allocations.map((alloc, idx) => (
                    <div key={alloc.id || idx} className="p-4 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-indigo-50/30 transition-colors group">
                        
                        {/* Mobile label for Teacher */}
                        <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1">Giáo viên</div>
                        <div className="col-span-1 md:col-span-3">
                            <select 
                               className={`w-full bg-white border ${alloc.teacherId ? 'border-gray-200' : 'border-amber-300 ring-4 ring-amber-50'} rounded-xl py-2 px-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all`}
                               value={alloc.teacherId}
                               onChange={(e) => updateAllocation(idx, 'teacherId', e.target.value)}
                            >
                                <option value="">-- Chọn Giáo Viên --</option>
                                {(() => {
                                    const selectedSubject = subjects.find(s => s.id === alloc.subjectId);
                                    const filteredTeachers = selectedSubject
                                        ? teachers.filter(t => t.subjects && t.subjects.some(
                                            ts => ts === selectedSubject.name || ts === selectedSubject.code
                                          ))
                                        : teachers;
                                    return filteredTeachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.user?.name || t.name}</option>
                                    ));
                                })()}
                            </select>
                        </div>

                        {/* Mobile label for Class */}
                        <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1 mt-2">Lớp học</div>
                        <div className="col-span-1 md:col-span-3 relative">
                            <div 
                               className={`w-full bg-white border ${alloc.classIds?.length ? 'border-gray-200' : 'border-amber-300 ring-4 ring-amber-50'} rounded-xl py-2 px-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all cursor-pointer flex justify-between items-center h-10`}
                               onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                            >
                                <span className={alloc.classIds?.length ? 'text-slate-900' : 'text-gray-500'}>
                                   {alloc.classIds?.length ? `Đã chọn ${alloc.classIds.length} lớp` : '-- Chọn Lớp --'}
                                </span>
                                <span className="text-gray-400 text-xs">▼</span>
                            </div>
                            
                            {openDropdownIdx === idx && (
                               <div className="absolute z-50 top-full left-0 mt-2 w-[calc(100vw-32px)] sm:w-[320px] md:w-[380px] bg-white rounded-xl shadow-2xl shadow-indigo-500/10 border border-gray-100 max-h-[400px] flex flex-col p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                   <div className="flex gap-2 mb-3 flex-wrap">
                                       {['10', '11', '12'].map(grade => (
                                           <button 
                                              key={grade}
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  const gradeClassIds = classes.filter(c => c.name.startsWith(grade)).map(c => c.id);
                                                  updateAllocation(idx, 'classIds', Array.from(new Set([...alloc.classIds || [], ...gradeClassIds])));
                                              }}
                                              className="text-[11px] px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold transition-colors"
                                           >
                                              Khối {grade}
                                           </button>
                                       ))}
                                       <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              updateAllocation(idx, 'classIds', classes.map(c => c.id));
                                          }}
                                          className="text-[11px] px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold transition-colors"
                                       >
                                          Tất cả
                                       </button>
                                       <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              updateAllocation(idx, 'classIds', []);
                                          }}
                                          className="text-[11px] px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-bold transition-colors"
                                       >
                                          Bỏ chọn
                                       </button>
                                   </div>
                                   <div className="grid grid-cols-2 gap-x-3 gap-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                       {classes.map(c => {
                                           const isSelected = alloc.classIds?.includes(c.id);
                                           return (
                                               <label key={c.id} className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-lg border transition-all ${isSelected ? 'border-indigo-100 bg-indigo-50/50' : 'border-transparent hover:bg-slate-50'}`}>
                                                   <input 
                                                      type="checkbox" 
                                                      checked={isSelected}
                                                      onChange={(e) => {
                                                          const newClassIds = e.target.checked 
                                                              ? [...(alloc.classIds || []), c.id]
                                                              : (alloc.classIds || []).filter(id => id !== c.id);
                                                          updateAllocation(idx, 'classIds', newClassIds);
                                                      }}
                                                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer border-gray-300"
                                                   />
                                                   <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{c.name} {c.room ? `(${c.room})` : ''}</span>
                                               </label>
                                           );
                                       })}
                                   </div>
                                   
                                   <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                                       <button onClick={() => setOpenDropdownIdx(null)} className="text-sm px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm shadow-indigo-500/30 transition-all">Xong</button>
                                   </div>
                               </div>
                            )}
                        </div>

                        {/* Mobile label for Subject */}
                        <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1 mt-2">Môn học</div>
                        <div className="col-span-1 md:col-span-3">
                            <select 
                               className={`w-full bg-white border ${alloc.subjectId ? 'border-gray-200' : 'border-amber-300 ring-4 ring-amber-50'} rounded-xl py-2 px-3 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all`}
                               value={alloc.subjectId}
                               onChange={(e) => updateAllocation(idx, 'subjectId', e.target.value)}
                            >
                                <option value="">-- Chọn Môn Học --</option>
                                {(() => {
                                    const teacher = teachers.find(t => t.id === alloc.teacherId);
                                    if (teacher && teacher.subjects && teacher.subjects.length > 0) {
                                        const teacherSubjects = subjects.filter(s => 
                                            teacher.subjects!.includes(s.name) || teacher.subjects!.includes(s.code)
                                        );
                                        return teacherSubjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ));
                                    }
                                    return subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>);
                                })()}
                            </select>
                        </div>

                        {/* Mobile label for Sessions */}
                        <div className="md:hidden text-xs font-bold text-gray-500 uppercase mb-1 mt-2">Số tiết / Tuần</div>
                        <div className="col-span-1 md:col-span-2">
                             <input 
                                type="number" 
                                min={1} 
                                max={10}
                                className="w-full bg-white border border-gray-200 rounded-xl text-center py-2 px-3 text-sm font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={alloc.sessionsPerWeek}
                                onChange={(e) => updateAllocation(idx, 'sessionsPerWeek', parseInt(e.target.value) || 1)}
                             />
                        </div>

                        <div className="col-span-1 flex justify-end mt-4 md:mt-0">
                            <button 
                               onClick={() => removeAllocation(idx)}
                               className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                               title="Xóa phân công này"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {allocations.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-slate-700 font-bold mb-1">Chưa có phân công nào</h3>
                        <p className="text-slate-400 text-sm">Bấm nút Thêm bên dưới để bắt đầu phân công giáo viên.</p>
                    </div>
                )}
             </div>

             {/* Add Button */}
             <div className="p-4 md:p-6 bg-slate-50/50 border-t border-gray-100">
                 <button 
                    onClick={addAllocation}
                    className="w-full border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 py-3 rounded-2xl font-bold flex items-center justify-center transition-all group"
                 >
                     <Plus className="h-5 w-5 mr-2 text-indigo-400 group-hover:scale-110 transition-transform" />
                     Thêm dòng Phân công mới
                 </button>
             </div>
          </div>
      )}

    </div>
  );
};
