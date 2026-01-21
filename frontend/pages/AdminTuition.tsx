
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_CLASSES, MOCK_STUDENTS, MOCK_TUITION } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { SemesterTuition, TuitionItem, User, UserRole } from '../types';
import { 
  CreditCard, Calendar, Filter, ChevronDown, CheckCircle, 
  Receipt, Building, Check, Search, Plus, Save, Users, Layers, AlertCircle
} from 'lucide-react';
import { getCurrentAcademicYear, isDateInFutureOrToday } from '../utils';

interface AdminTuitionProps {
  currentUser: User;
}

interface NewFeeForm {
    name: string;
    amount: number;
    dueDate: string;
    semester: 'HK1' | 'HK2' | 'Summer';
    academicYear: string;
}

export const AdminTuition: React.FC<AdminTuitionProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  
  if (currentUser.role !== UserRole.ADMIN) {
      return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
  }

  // --- STATE ---
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fee Form State - Initialize with auto academic year
  const [feeForm, setFeeForm] = useState<NewFeeForm>({
      name: '',
      amount: 0,
      dueDate: '',
      semester: 'HK1',
      academicYear: getCurrentAcademicYear()
  });

  // Local Storage State (Shared with Tuition.tsx)
  const [tuitionRecords, setTuitionRecords] = useState<SemesterTuition[]>(() => {
      try {
          const saved = localStorage.getItem('tuition_records');
          return saved ? JSON.parse(saved) : MOCK_TUITION;
      } catch (e) {
          return MOCK_TUITION;
      }
  });

  useEffect(() => {
      localStorage.setItem('tuition_records', JSON.stringify(tuitionRecords));
  }, [tuitionRecords]);

  // --- COMPUTED DATA ---
  
  const classList = useMemo(() => MOCK_CLASSES, []);
  
  const filteredStudents = useMemo(() => {
      if (!selectedClassId) return [];
      return MOCK_STUDENTS.filter(s => 
          s.classId === selectedClassId && 
          (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [selectedClassId, searchTerm]);

  // Strict Validation Logic
  const isFormValid = useMemo(() => {
      return (
          selectedStudentIds.length > 0 &&
          feeForm.name.trim().length > 0 &&
          feeForm.amount > 0 &&
          feeForm.dueDate !== '' &&
          isDateInFutureOrToday(feeForm.dueDate) && // Must be future/today
          feeForm.academicYear.trim().length > 0 &&
          feeForm.semester !== undefined
      );
  }, [selectedStudentIds, feeForm]);

  // Reset selection when class changes
  useEffect(() => {
      setSelectedStudentIds([]);
  }, [selectedClassId]);

  // --- HANDLERS ---

  const handleSelectAll = () => {
      if (selectedStudentIds.length === filteredStudents.length) {
          setSelectedStudentIds([]);
      } else {
          setSelectedStudentIds(filteredStudents.map(s => s.id));
      }
  };

  const handleToggleStudent = (id: string) => {
      setSelectedStudentIds(prev => 
          prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
  };

  const handleCreateFee = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!isFormValid) {
          if (feeForm.dueDate && !isDateInFutureOrToday(feeForm.dueDate)) {
              alert("Hạn nộp phải là ngày trong tương lai hoặc hôm nay.");
          } else {
              alert("Vui lòng điền đầy đủ thông tin bắt buộc và chọn ít nhất một học sinh.");
          }
          return;
      }

      const newRecords = [...tuitionRecords];

      selectedStudentIds.forEach(studentId => {
          // Check if a record exists for this student + semester + year
          let recordIndex = newRecords.findIndex(r => 
              r.studentId === studentId && 
              r.semester === feeForm.semester && 
              r.academicYear === feeForm.academicYear
          );

          const newItem: TuitionItem = {
              id: `fee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: feeForm.name,
              amount: feeForm.amount,
              paidAmount: 0,
              dueDate: feeForm.dueDate,
              status: 'unpaid'
          };

          if (recordIndex > -1) {
              // Append to existing record
              const record = newRecords[recordIndex];
              record.items.push(newItem);
              record.totalAmount += newItem.amount;
              record.status = 'incomplete'; // Reset status since new fee is added
          } else {
              // Create new record
              const newRecord: SemesterTuition = {
                  id: `T-${feeForm.academicYear}-${feeForm.semester}-${studentId}`,
                  studentId: studentId,
                  academicYear: feeForm.academicYear,
                  semester: feeForm.semester,
                  items: [newItem],
                  totalAmount: newItem.amount,
                  totalPaid: 0,
                  status: 'incomplete'
              };
              newRecords.push(newRecord);
          }
      });

      setTuitionRecords(newRecords);
      alert(`${t('adminTuition.success')} Đã áp dụng cho ${selectedStudentIds.length} học sinh.`);
      
      // Reset form (optional)
      setSelectedStudentIds([]);
      setFeeForm({ ...feeForm, name: '', amount: 0, dueDate: '' });
  };

  return (
    <div className="animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('adminTuition.title')}</h2>
        <p className="text-gray-500 mt-1">{t('adminTuition.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Student Selection */}
          <div className="lg:col-span-2 space-y-6">
              {/* Class Filter */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold uppercase text-xs tracking-wide">
                      <Layers className="h-4 w-4" /> {t('adminTuition.selectClass')}
                  </div>
                  <div className="flex gap-4">
                      <div className="relative flex-1">
                          <select 
                              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer font-medium text-gray-700 transition-colors"
                              value={selectedClassId}
                              onChange={(e) => setSelectedClassId(e.target.value)}
                          >
                              <option value="">-- Chọn lớp học --</option>
                              {classList.map(cls => (
                                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                              ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                  </div>
              </div>

              {/* Student List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                          <Users className="h-5 w-5 text-gray-400" /> 
                          {t('adminTuition.selectStudents')} 
                          <span className={`px-2 py-0.5 rounded-full text-xs ml-2 transition-colors ${
                              selectedStudentIds.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'
                          }`}>
                              {selectedStudentIds.length} / {filteredStudents.length}
                          </span>
                      </div>
                      
                      <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input 
                              type="text" 
                              placeholder="Tìm tên hoặc MSSV..." 
                              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                  </div>

                  {selectedClassId ? (
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                          <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b border-gray-100 mb-2" onClick={handleSelectAll}>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 transition-colors ${
                                  selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 
                                  ? 'bg-indigo-600 border-indigo-600' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                  {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 && <Check className="h-3.5 w-3.5 text-white" />}
                              </div>
                              <span className="text-sm font-bold text-gray-700">Chọn tất cả</span>
                          </div>

                          {filteredStudents.length > 0 ? filteredStudents.map(student => (
                              <div 
                                  key={student.id} 
                                  onClick={() => handleToggleStudent(student.id)}
                                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                                      selectedStudentIds.includes(student.id) 
                                      ? 'bg-indigo-50 border border-indigo-200' 
                                      : 'hover:bg-gray-50 border border-transparent'
                                  }`}
                              >
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 shrink-0 transition-colors ${
                                      selectedStudentIds.includes(student.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                                  }`}>
                                      {selectedStudentIds.includes(student.id) && <Check className="h-3.5 w-3.5 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                      <p className={`text-sm font-bold ${selectedStudentIds.includes(student.id) ? 'text-indigo-900' : 'text-gray-900'}`}>{student.name}</p>
                                      <p className="text-xs text-gray-500">{student.id}</p>
                                  </div>
                              </div>
                          )) : (
                              <div className="text-center py-10 text-gray-400">Không tìm thấy học sinh.</div>
                          )}
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                          <Layers className="h-12 w-12 mb-3 opacity-20" />
                          <p>Vui lòng chọn lớp học trước.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* RIGHT COLUMN: Fee Form */}
          <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
                  <div className="bg-indigo-600 px-6 py-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                          <Receipt className="h-5 w-5" /> {t('adminTuition.createTitle')}
                      </h3>
                  </div>
                  
                  <form onSubmit={handleCreateFee} className="p-6 space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">{t('adminTuition.feeName')} <span className="text-red-500">*</span></label>
                          <input 
                              type="text" 
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                              placeholder="VD: Học phí tháng 10"
                              value={feeForm.name}
                              onChange={e => setFeeForm({...feeForm, name: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">{t('adminTuition.amount')} (VND) <span className="text-red-500">*</span></label>
                          <input 
                              type="number" 
                              required
                              min="1000"
                              step="1000"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-gray-900"
                              placeholder="0"
                              value={feeForm.amount || ''}
                              onChange={e => setFeeForm({...feeForm, amount: parseInt(e.target.value) || 0})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">{t('adminTuition.semester')} <span className="text-red-500">*</span></label>
                              <select 
                                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                  value={feeForm.semester}
                                  required
                                  onChange={e => setFeeForm({...feeForm, semester: e.target.value as any})}
                              >
                                  <option value="HK1">Học kỳ 1</option>
                                  <option value="HK2">Học kỳ 2</option>
                                  <option value="Summer">Hè</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">{t('adminTuition.year')} <span className="text-red-500">*</span></label>
                              <input 
                                  type="text" 
                                  required
                                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                  value={feeForm.academicYear}
                                  onChange={e => setFeeForm({...feeForm, academicYear: e.target.value})}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">{t('adminTuition.dueDate')} <span className="text-red-500">*</span></label>
                          <input 
                              type="date" 
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700"
                              value={feeForm.dueDate}
                              onChange={e => setFeeForm({...feeForm, dueDate: e.target.value})}
                          />
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4 text-sm">
                              <span className="text-gray-500">{t('adminTuition.selectedCount')}:</span>
                              <span className={`font-bold px-3 py-1 rounded-full transition-colors ${
                                  selectedStudentIds.length > 0 
                                  ? 'text-indigo-600 bg-indigo-50' 
                                  : 'text-gray-400 bg-gray-100'
                              }`}>
                                  {selectedStudentIds.length}
                              </span>
                          </div>
                          
                          <button 
                              type="submit"
                              disabled={!isFormValid}
                              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${
                                  !isFormValid
                                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 active:scale-[0.98]'
                              }`}
                          >
                              <Plus className="h-5 w-5 mr-2" /> {t('adminTuition.assignBtn')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
    </div>
  );
};
