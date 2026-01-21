
import React, { useMemo, useState } from 'react';
import { MOCK_GRADES, MOCK_SUBJECTS, MOCK_STUDENTS } from '../constants';
import { User } from '../types';
import { Award, Star, Calendar, Filter, ChevronDown, MessageSquareQuote } from 'lucide-react';

interface StudentResultsProps {
  currentUser: User;
}

export const StudentResults: React.FC<StudentResultsProps> = ({ currentUser }) => {
  // --- Data Preparation ---
  const allStudentGrades = useMemo(() => MOCK_GRADES.filter(g => g.studentId === currentUser.id), [currentUser.id]);
  const studentInfo = useMemo(() => MOCK_STUDENTS.find(s => s.id === currentUser.id), [currentUser.id]);

  // Extract unique Academic Years and Semesters from data
  const availableYears = useMemo(() => {
      const years = new Set(allStudentGrades.map(g => g.academicYear));
      // Ensure current year is always available even if no grades yet
      years.add('2025-2026'); 
      return Array.from(years).sort().reverse();
  }, [allStudentGrades]);

  const availableSemesters = ['HK1', 'HK2'];

  // --- State ---
  const [selectedYear, setSelectedYear] = useState<string>('2025-2026');
  const [selectedSemester, setSelectedSemester] = useState<string>('HK1');

  // --- Filtering ---
  const displayedGrades = useMemo(() => {
      return allStudentGrades.filter(g => 
          g.academicYear === selectedYear && g.semester === selectedSemester
      );
  }, [allStudentGrades, selectedYear, selectedSemester]);

  // --- Calculations ---
  const calculatedGPA = useMemo(() => {
      const validGrades = displayedGrades.filter(g => g.average !== null);
      if (validGrades.length === 0) return null;
      const total = validGrades.reduce((sum, g) => sum + (g.average || 0), 0);
      return (total / validGrades.length).toFixed(1);
  }, [displayedGrades]);

  const getSubjectName = (id: string) => MOCK_SUBJECTS.find(s => s.id === id)?.name || id;

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Kết quả học tập</h2>
        <p className="text-gray-500 mt-1">Tra cứu bảng điểm, lịch sử học tập và nhận xét của giáo viên.</p>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-indigo-600 font-bold px-2">
              <Filter className="h-5 w-5" />
              <span>Bộ lọc:</span>
          </div>
          
          <div className="relative w-full sm:w-48">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select 
                  className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer font-medium text-gray-700 hover:bg-white transition-colors"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
              >
                  {availableYears.map(y => <option key={y} value={y}>Năm học {y}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-40">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 flex items-center justify-center font-bold text-[10px] border border-gray-400 rounded w-5 h-5">HK</div>
              <select 
                  className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer font-medium text-gray-700 hover:bg-white transition-colors"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
              >
                  {availableSemesters.map(s => <option key={s} value={s}>{s === 'HK1' ? 'Học kỳ 1' : 'Học kỳ 2'}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Grades Table */}
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
               <h3 className="font-bold text-gray-800 text-lg">Bảng Điểm Chi Tiết</h3>
               <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                   {selectedYear} • {selectedSemester}
               </span>
            </div>
            
            <div className="overflow-x-auto flex-1 custom-scrollbar">
               <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="bg-white border-b border-gray-100 text-xs uppercase font-bold text-gray-500">
                     <tr>
                        <th className="px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-48">Môn Học</th>
                        <th className="px-4 py-4 text-center">Miệng</th>
                        <th className="px-4 py-4 text-center">15'</th>
                        <th className="px-4 py-4 text-center">Giữa Kỳ</th>
                        <th className="px-4 py-4 text-center">Cuối Kỳ</th>
                        <th className="px-4 py-4 text-center">TB Môn</th>
                        <th className="px-6 py-4 w-64">Nhận xét GVBM</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                     {displayedGrades.map(grade => (
                        <tr key={grade.subjectId} className="hover:bg-gray-50/50 group">
                           <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-gray-50">
                               {getSubjectName(grade.subjectId)}
                           </td>
                           <td className="px-4 py-4 text-center text-gray-600">{grade.oralScore || '-'}</td>
                           <td className="px-4 py-4 text-center text-gray-600">
                              {grade.fifteenMinScores.filter(s => s !== null).join(', ') || '-'}
                           </td>
                           <td className="px-4 py-4 text-center text-gray-600">{grade.midTermScore || '-'}</td>
                           <td className="px-4 py-4 text-center font-bold text-gray-800">{grade.finalScore || '-'}</td>
                           <td className="px-4 py-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg font-bold text-xs ${
                                 (grade.average || 0) >= 8 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                 (grade.average || 0) >= 6.5 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                 (grade.average || 0) >= 5 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                 {grade.average || '-'}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-gray-600 text-xs italic leading-relaxed relative">
                                {grade.feedback ? (
                                    <>
                                        <MessageSquareQuote className="h-3 w-3 text-indigo-400 absolute top-4 left-2" />
                                        "{grade.feedback}"
                                    </>
                                ) : (
                                    <span className="text-gray-300">Chưa có nhận xét</span>
                                )}
                           </td>
                        </tr>
                     ))}
                     {displayedGrades.length === 0 && (
                        <tr>
                           <td colSpan={7} className="p-12 text-center text-gray-400">
                               <div className="flex flex-col items-center">
                                   <Filter className="h-10 w-10 mb-2 text-gray-200" />
                                   <p>Chưa có dữ liệu điểm cho học kỳ này.</p>
                               </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Summary & Evaluation Card */}
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
               {/* Decorative Circles */}
               <div className="absolute top-0 right-0 -mr-10 -mt-10 bg-white/10 h-40 w-40 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 left-0 -ml-10 -mb-10 bg-black/10 h-32 w-32 rounded-full blur-2xl"></div>
               
               <div className="relative z-10 text-center">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20 shadow-inner">
                     {calculatedGPA ? (
                         <span className="text-4xl font-bold tracking-tight text-white">{calculatedGPA}</span>
                     ) : (
                         <span className="text-xl font-bold text-white/50">N/A</span>
                     )}
                  </div>
                  <h3 className="text-lg font-bold">Điểm Trung Bình (GPA)</h3>
                  <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mt-1">{selectedSemester} - {selectedYear}</p>
                  
                  {calculatedGPA && (
                      <div className="mt-6 inline-flex items-center bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md border border-white/10">
                          <Award className="h-4 w-4 mr-2 text-yellow-300" />
                          {parseFloat(calculatedGPA) >= 8 ? 'Học lực Giỏi' : 
                           parseFloat(calculatedGPA) >= 6.5 ? 'Học lực Khá' : 'Học lực Trung Bình'}
                      </div>
                  )}
               </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-fit">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg"><Star className="h-5 w-5 text-amber-500 mr-2" /> Đánh giá của GVCN</h3>
               
               {/* Logic note: In a real app, homeroom evaluation would also be historical. For now, we show the current one or a placeholder if filtering past years */}
               {selectedYear === '2025-2026' ? (
                   <>
                       <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 text-sm text-gray-700 leading-relaxed italic relative">
                          <span className="text-4xl text-amber-200/50 absolute -top-2 -left-1 font-serif">“</span>
                          {studentInfo?.semesterEvaluation || "Chưa có đánh giá tổng kết từ giáo viên chủ nhiệm."}
                          <span className="text-4xl text-amber-200/50 absolute -bottom-4 right-2 font-serif">”</span>
                       </div>
                       <div className="mt-4 flex items-center justify-end gap-3">
                          <div className="text-right">
                              <p className="text-xs font-bold text-gray-400 uppercase">Giáo viên chủ nhiệm</p>
                              <div className="flex items-center justify-end gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1 w-fit ml-auto">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                  Đã ký số
                              </div>
                          </div>
                       </div>
                   </>
               ) : (
                   <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <p className="text-gray-400 text-sm">Dữ liệu đánh giá GVCN cho năm học này chưa được lưu trữ hoặc đã được lưu vào hồ sơ giấy.</p>
                   </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
