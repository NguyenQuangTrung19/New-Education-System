
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_ASSIGNMENTS_STUDENT, MOCK_MATERIALS, MOCK_SUBJECTS, MOCK_STUDENTS } from '../constants';
import { 
  FileText, PlayCircle, Link, Download, CheckCircle, Clock, 
  AlertTriangle, Search, Lock, ChevronRight, BookOpen, AlertCircle, 
  Flag, ArrowLeft, Send, Check, Menu, X, Timer, ArrowRight, ChevronLeft
} from 'lucide-react';
import { Assignment, User, LearningMaterial } from '../types';

// --- MOCK QUIZ DATA (Fallback) ---
// Used only for the hardcoded assignments in constants.ts
const MOCK_QUIZ_DATA_FALLBACK: any[] = [
  { id: 'mq1', type: 'multiple_choice', text: 'Giá trị của biểu thức lim(x→∞) (2x + 1)/(x - 3) là bao nhiêu?', options: [{id: 'o1', text: '2'}, {id: 'o2', text: '1'}, {id: 'o3', text: '0'}, {id: 'o4', text: '∞'}] },
  { id: 'mq2', type: 'multiple_choice', text: 'Đạo hàm của hàm số y = sin(2x) là?', options: [{id: 'o1', text: '2cos(2x)'}, {id: 'o2', text: 'cos(2x)'}, {id: 'o3', text: '-2cos(2x)'}, {id: 'o4', text: '-cos(2x)'}] },
  { id: 'mq3', type: 'essay', text: 'Hãy nêu ý nghĩa hình học của đạo hàm cấp 1.' },
];

type ViewState = 'dashboard' | 'subject-detail' | 'quiz-intro' | 'quiz-active';

interface StudentClassProps {
  currentUser: User;
}

export const StudentClass: React.FC<StudentClassProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'materials'>('assignments');
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // Get student's classId
  const studentProfile = useMemo(() => MOCK_STUDENTS.find(s => s.id === currentUser.id), [currentUser.id]);
  const userClassId = studentProfile?.classId;

  // --- DATA LOADING & MERGING ---
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [allMaterials, setAllMaterials] = useState<LearningMaterial[]>([]);

  useEffect(() => {
      // 1. Get Teacher created assignments from LocalStorage
      let teacherAssignments: any[] = [];
      try {
          const stored = localStorage.getItem('teacher_assignments');
          if (stored) {
              const parsed = JSON.parse(stored);
              // Filter assignments assigned to this student's class
              teacherAssignments = parsed.filter((a: any) => 
                  a.classIds && a.classIds.includes(userClassId) && a.status === 'active'
              ).map((a: any) => ({
                  id: a.id,
                  subjectId: a.subjectId,
                  title: a.title,
                  dueDate: a.dueDate,
                  status: 'pending', // Default status for new items (in a real app, check submissions table)
                  duration: a.duration,
                  passwordAccess: a.passwordAccess,
                  questions: a.questions
              }));
          }
      } catch (e) {
          console.error("Error loading teacher assignments", e);
      }

      // 2. Combine with Mock Data (Legacy)
      // We attach the fallback quiz data to mock assignments so they work too
      const normalizedMock = MOCK_ASSIGNMENTS_STUDENT.map(m => ({
          ...m,
          duration: 45,
          passwordAccess: '123456',
          questions: MOCK_QUIZ_DATA_FALLBACK
      }));

      setAllAssignments([...teacherAssignments, ...normalizedMock]);

      // 3. Load Materials from LocalStorage + Mock
      try {
          const storedMaterials = localStorage.getItem('learning_materials');
          const localMaterials = storedMaterials ? JSON.parse(storedMaterials) : [];
          // Combine Mock and Local (De-duplicate by ID if necessary, though simplistic concat usually works for this demo)
          // Ideally we should use a Map, but simplistic concat is okay if IDs are unique or we prioritize local
          const combinedMaterials = [...MOCK_MATERIALS];
          
          localMaterials.forEach((m: LearningMaterial) => {
              if (!combinedMaterials.find(existing => existing.id === m.id)) {
                  combinedMaterials.push(m);
              }
          });
          setAllMaterials(combinedMaterials);
      } catch (e) {
          console.error("Error loading materials", e);
          setAllMaterials(MOCK_MATERIALS);
      }

  }, [userClassId]);

  // Filter Materials for this student's class
  const classMaterials = useMemo(() => {
      if(!userClassId) return [];
      return allMaterials.filter(m => m.classId === userClassId);
  }, [userClassId, allMaterials]);
  
  // --- Quiz State ---
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(0); 
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // Mobile drawer

  // --- Helpers ---
  const getSubjectName = (id: string) => MOCK_SUBJECTS.find(s => s.id === id)?.name || id;
  const getSubjectCode = (id: string) => MOCK_SUBJECTS.find(s => s.id === id)?.code || id;

  // Grouping Logic
  const groupedAssignments = useMemo(() => {
    return allAssignments.reduce((acc, curr) => {
      if (!acc[curr.subjectId]) acc[curr.subjectId] = [];
      acc[curr.subjectId].push(curr);
      return acc;
    }, {} as Record<string, Assignment[]>);
  }, [allAssignments]);

  const subjectsWithAssignments = Object.keys(groupedAssignments);

  // --- Effects ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (viewState === 'quiz-active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && viewState === 'quiz-active') {
      handleSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [viewState, timeLeft]);

  // --- Handlers ---

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setViewState('subject-detail');
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    if (assignment.status === 'graded' || assignment.status === 'submitted') {
        alert("Bạn đã hoàn thành bài tập này.");
        return;
    }
    setSelectedAssignment(assignment);
    setPasswordInput('');
    setPasswordError('');
    setViewState('quiz-intro');
  };

  const validatePassword = () => {
    if (!selectedAssignment) return;
    
    // Check against the specific assignment's password
    if (passwordInput === selectedAssignment.passwordAccess) { 
       setShowStartConfirm(true);
    } else {
       setPasswordError(`Mật khẩu không đúng. (Gợi ý Demo: ${selectedAssignment.passwordAccess})`);
    }
  };

  const confirmStartQuiz = () => {
      if (!selectedAssignment) return;
      setShowStartConfirm(false);
      setViewState('quiz-active');
      // Set time based on assignment duration (minutes -> seconds)
      setTimeLeft((selectedAssignment.duration || 45) * 60); 
      setQuizAnswers({});
      setFlaggedQuestions([]);
      setCurrentQuestionIndex(0);
  };

  const handleSubmitQuiz = () => {
    setShowSubmitConfirm(false);
    setViewState('dashboard');
    // Calculate simple stats
    const totalQ = selectedAssignment?.questions?.length || 0;
    const answered = Object.keys(quizAnswers).length;
    
    alert(`Nộp bài thành công!\nBạn đã trả lời ${answered}/${totalQ} câu hỏi.\nKết quả sẽ được giáo viên chấm và cập nhật sau.`);
    // Here you would typically perform an API call to save results
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Sub-components ---

  const renderSubjectCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjectsWithAssignments.map(subjectId => {
        const tasks = groupedAssignments[subjectId];
        const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'late').length;
        const subjectCode = getSubjectCode(subjectId);
        
        return (
          <div 
            key={subjectId}
            onClick={() => handleSubjectClick(subjectId)}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
               {pendingCount > 0 ? (
                 <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                   <AlertCircle className="h-3 w-3" /> {pendingCount} Chưa làm
                 </span>
               ) : (
                 <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                   <CheckCircle className="h-3 w-3" /> Hoàn thành
                 </span>
               )}
            </div>
            
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform shadow-md">
               {subjectCode.substring(0, 2)}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">{getSubjectName(subjectId)}</h3>
            <p className="text-sm text-gray-500">{tasks.length} Bài tập trong mục này</p>
            
            <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
               Xem danh sách <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        );
      })}
      {subjectsWithAssignments.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
              Chưa có bài tập nào được giao cho lớp của bạn.
          </div>
      )}
    </div>
  );

  const renderAssignmentList = () => {
    const tasks = selectedSubjectId ? groupedAssignments[selectedSubjectId] : [];
    
    return (
      <div className="space-y-6">
        <button onClick={() => setViewState('dashboard')} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm">
           <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách môn
        </button>
        
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" /> 
            {getSubjectName(selectedSubjectId!)}
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{tasks.length} tasks</span>
        </div>

        <div className="grid gap-4">
           {tasks.map(task => (
             <div key={task.id} className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                        {task.status === 'pending' && <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Pending</span>}
                        {task.status === 'late' && <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Late</span>}
                        {(task.status === 'submitted' || task.status === 'graded') && <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Completed</span>}
                   </div>
                   <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                   <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> Hạn nộp: {new Date(task.dueDate).toLocaleDateString()}</span>
                      <span className="flex items-center"><Timer className="h-3.5 w-3.5 mr-1.5" /> {task.duration || 45} phút</span>
                      {task.status === 'graded' && <span className="font-bold text-emerald-600 flex items-center"><CheckCircle className="h-3.5 w-3.5 mr-1.5"/> Điểm: {task.grade}</span>}
                   </div>
                </div>
                
                <div>
                   <button 
                      onClick={() => handleAssignmentClick(task)}
                      disabled={task.status === 'graded' || task.status === 'submitted'}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center shadow-sm ${
                         task.status === 'pending' || task.status === 'late'
                         ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'
                         : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                   >
                      {task.status === 'pending' || task.status === 'late' ? 'Làm bài ngay' : 'Đã hoàn thành'}
                      {(task.status === 'pending' || task.status === 'late') && <ArrowRight className="h-4 w-4 ml-2" />}
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderQuizIntro = () => {
    const questionCount = selectedAssignment?.questions?.length || 0;
    
    return (
    <div className="max-w-lg mx-auto mt-10 animate-fade-in">
       <button onClick={() => setViewState('subject-detail')} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm mb-6">
           <ArrowLeft className="h-4 w-4 mr-2" /> Hủy bỏ
        </button>

       <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="p-8">
             <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <Lock className="h-8 w-8" />
             </div>
             
             <div className="text-center mb-8">
                <h3 className="font-bold text-gray-900 text-2xl mb-2">{selectedAssignment?.title}</h3>
                <div className="flex justify-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full"><Clock className="h-3.5 w-3.5 mr-1.5"/> {selectedAssignment?.duration || 45} Phút</span>
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full"><FileText className="h-3.5 w-3.5 mr-1.5"/> {questionCount} Câu hỏi</span>
                </div>
             </div>

             <div className="space-y-5">
                <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Mật khẩu bài thi</label>
                   <input 
                      type="password" 
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl tracking-[0.5em] font-bold text-gray-800 transition-all placeholder:tracking-normal placeholder:font-normal"
                      placeholder="Nhập mật khẩu..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && validatePassword()}
                   />
                   {passwordError && (
                       <div className="flex items-center justify-center text-rose-500 text-xs mt-3 font-medium bg-rose-50 py-2 rounded-lg">
                           <AlertCircle className="h-3.5 w-3.5 mr-1.5"/> {passwordError}
                       </div>
                   )}
                </div>
                <button 
                   onClick={validatePassword}
                   className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center text-base"
                >
                   Vào làm bài
                </button>
             </div>
          </div>
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
             Lưu ý: Không thoát trình duyệt trong quá trình làm bài.
          </div>
       </div>

       {/* Confirm Start Modal */}
       {showStartConfirm && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
               <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                   <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <PlayCircle className="h-8 w-8 ml-1" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900">Xác nhận bắt đầu?</h3>
                   <p className="text-gray-500 text-sm mt-2 mb-6">
                       Thời gian làm bài {selectedAssignment?.duration || 45} phút sẽ bắt đầu tính ngay khi bạn nhấn "Bắt đầu".
                   </p>
                   <div className="flex gap-3">
                       <button onClick={() => setShowStartConfirm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Hủy</button>
                       <button onClick={confirmStartQuiz} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">Bắt đầu</button>
                   </div>
               </div>
           </div>
       )}
    </div>
    );
  };

  const renderQuizActive = () => {
    // USE REAL QUESTIONS FROM ASSIGNMENT
    const questions = selectedAssignment?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) return <div className="p-10 text-center">Lỗi tải câu hỏi.</div>;

    const isFlagged = flaggedQuestions.includes(currentQuestion.id);
    const answeredCount = Object.keys(quizAnswers).length;

    return (
      <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col h-screen w-screen">
         {/* Quiz Header */}
         <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm shrink-0 z-20">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                   {getSubjectCode(selectedSubjectId!).substring(0,2)}
               </div>
               <div className="hidden md:block">
                   <div className="text-gray-900 font-bold text-sm md:text-base">{selectedAssignment?.title}</div>
                   <div className="text-xs text-gray-500 flex items-center gap-2">
                       <span>Mã đề: {selectedAssignment?.id.substring(0, 6).toUpperCase()}</span> • <span>{questions.length} Câu hỏi</span>
                   </div>
               </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                {/* Timer - Right Side */}
                <div className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full font-mono font-bold text-base md:text-lg shadow-inner transition-colors ${
                    timeLeft < 300 ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                   <Timer className="h-4 w-4 md:h-5 md:w-5" />
                   {formatTime(timeLeft)}
                </div>

               <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

               <button 
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                  className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
               >
                   <Menu className="h-6 w-6" />
               </button>
               <button 
                  onClick={() => setShowSubmitConfirm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-5 py-2 rounded-lg font-bold shadow-md transition-all text-sm flex items-center whitespace-nowrap"
               >
                  <Send className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Nộp bài</span><span className="sm:hidden">Nộp</span>
               </button>
            </div>
         </div>

         {/* Quiz Body */}
         <div className="flex-1 flex overflow-hidden relative">
            {/* Left: Question Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
               <div className="max-w-3xl mx-auto pb-20">
                  <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200 min-h-[500px] flex flex-col relative transition-all">
                     
                     {/* Question Header */}
                     <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                                {currentQuestionIndex + 1}
                            </span>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Câu hỏi</span>
                        </div>
                        <button 
                           onClick={() => toggleFlag(currentQuestion.id)}
                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                               isFlagged 
                               ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                               : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                           }`}
                        >
                           <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
                           {isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}
                        </button>
                     </div>
                     
                     {/* Question Text */}
                     <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                        {currentQuestion.text}
                     </h3>

                     {/* Options / Input */}
                     <div className="space-y-3 flex-1">
                        {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((opt: any, idx: number) => {
                           const isSelected = quizAnswers[currentQuestion.id] === opt.text;
                           return (
                           <label 
                              key={opt.id || idx} 
                              className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                                 isSelected
                                 ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                                 : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                              }`}
                           >
                              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${
                                 isSelected ? 'border-indigo-600' : 'border-gray-300 group-hover:border-indigo-300'
                              }`}>
                                 {isSelected && <div className="h-3 w-3 bg-indigo-600 rounded-full" />}
                              </div>
                              <input 
                                 type="radio" 
                                 name={`q-${currentQuestion.id}`} 
                                 className="hidden" 
                                 onChange={() => handleAnswerChange(currentQuestion.id, opt.text)}
                                 checked={isSelected}
                              />
                              <span className={`text-base ${isSelected ? 'font-medium text-indigo-900' : 'text-gray-700'}`}>{opt.text}</span>
                           </label>
                        )})}

                        {currentQuestion.type === 'essay' && (
                           <textarea 
                              className="w-full h-64 p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none text-base resize-none bg-gray-50 focus:bg-white transition-all leading-relaxed"
                              placeholder="Nhập câu trả lời của bạn tại đây..."
                              value={quizAnswers[currentQuestion.id] || ''}
                              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                           />
                        )}
                     </div>

                     {/* Navigation Footer */}
                     <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <button 
                           onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                           disabled={currentQuestionIndex === 0}
                           className="flex items-center px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                           <ChevronLeft className="h-5 w-5 mr-2" /> Câu trước
                        </button>
                        
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button 
                                onClick={() => setShowSubmitConfirm(true)}
                                className="flex items-center px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all"
                            >
                                Hoàn thành <Check className="h-5 w-5 ml-2" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
                            >
                                Câu tiếp theo <ChevronRight className="h-5 w-5 ml-2" />
                            </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Question Palette (Responsive Drawer) */}
            <div className={`fixed inset-y-0 right-0 z-30 w-80 bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:w-80 flex flex-col ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'}`}>
               <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                   <div>
                       <h4 className="font-bold text-gray-900">Danh sách câu hỏi</h4>
                       <p className="text-xs text-gray-500 mt-1">Đã trả lời: <span className="font-bold text-indigo-600">{answeredCount}/{questions.length}</span></p>
                   </div>
                   <button onClick={() => setIsPaletteOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                   <div className="grid grid-cols-5 gap-3">
                      {questions.map((q: any, idx: number) => {
                         const isAnswered = !!quizAnswers[q.id];
                         const isCurrent = idx === currentQuestionIndex;
                         const isFlaggedQ = flaggedQuestions.includes(q.id);

                         let btnClass = "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"; // Default
                         if (isCurrent) btnClass = "ring-2 ring-indigo-600 ring-offset-2 bg-white text-indigo-700 border-indigo-200 font-extrabold";
                         else if (isAnswered) btnClass = "bg-indigo-100 text-indigo-700 border-indigo-200";
                         
                         return (
                            <button 
                               key={q.id}
                               onClick={() => { setCurrentQuestionIndex(idx); setIsPaletteOpen(false); }}
                               className={`relative h-10 w-10 rounded-lg text-sm font-bold border transition-all flex items-center justify-center ${btnClass}`}
                            >
                               {idx + 1}
                               {isFlaggedQ && (
                                  <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm">
                                     <Flag className="h-3 w-3 text-amber-500 fill-current" />
                                  </div>
                               )}
                            </button>
                         );
                      })}
                   </div>
               </div>
               
               <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3 text-xs font-medium text-gray-600">
                  <div className="flex items-center"><div className="h-3 w-3 bg-indigo-100 border border-indigo-200 rounded mr-2"></div> Đã trả lời</div>
                  <div className="flex items-center"><div className="h-3 w-3 bg-gray-100 border border-transparent rounded mr-2"></div> Chưa trả lời</div>
                  <div className="flex items-center"><Flag className="h-3 w-3 text-amber-500 fill-current mr-2" /> Đánh dấu xem lại</div>
                  <div className="flex items-center"><div className="h-3 w-3 border-2 border-indigo-600 rounded mr-2"></div> Đang chọn</div>
               </div>
            </div>
            
            {/* Backdrop for mobile drawer */}
            {isPaletteOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setIsPaletteOpen(false)}></div>}
         </div>

         {/* Submit Confirmation Modal */}
         {showSubmitConfirm && (
            <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Send className="h-8 w-8 text-indigo-600 ml-1" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận nộp bài?</h3>
                  
                  {questions.length - answeredCount > 0 ? (
                      <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl text-sm mb-6 border border-amber-100">
                          <p className="font-bold flex items-center justify-center gap-2 mb-1"><AlertTriangle className="h-4 w-4"/> Chú ý</p>
                          Bạn còn <strong>{questions.length - answeredCount}</strong> câu hỏi chưa trả lời.
                      </div>
                  ) : (
                      <p className="text-gray-500 text-sm mb-8">
                          Bạn đã trả lời tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài không?
                      </p>
                  )}

                  <div className="flex gap-3">
                     <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors">Xem lại</button>
                     <button onClick={handleSubmitQuiz} className="flex-1 py-3 text-white bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-colors">Nộp ngay</button>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  };

  // --- Main Render Switch ---
  if (viewState === 'quiz-active') return renderQuizActive();

  return (
    <div className="animate-fade-in pb-10">
      {viewState !== 'quiz-intro' && (
      <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Lớp của tôi</h2>
        <p className="text-gray-500 mt-1">Quản lý bài tập và tài liệu học tập của lớp.</p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-8 border border-gray-200">
         <button onClick={() => setActiveTab('assignments')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'assignments' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Bài tập</button>
         <button onClick={() => setActiveTab('materials')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'materials' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tài liệu</button>
      </div>
      </>
      )}

      {activeTab === 'assignments' && (
         <>
            {viewState === 'dashboard' && renderSubjectCards()}
            {viewState === 'subject-detail' && renderAssignmentList()}
            {viewState === 'quiz-intro' && renderQuizIntro()}
         </>
      )}

      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {classMaterials.map(material => (
              <div key={material.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`p-3.5 rounded-xl ${
                       material.type === 'pdf' ? 'bg-red-50 text-red-500' : 
                       material.type === 'video' ? 'bg-blue-50 text-blue-500' :
                       'bg-gray-100 text-gray-500'
                    }`}>
                       {material.type === 'pdf' ? <FileText className="h-6 w-6" /> : 
                        material.type === 'video' ? <PlayCircle className="h-6 w-6" /> : <Link className="h-6 w-6" />}
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{material.uploadDate}</span>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{material.title}</h3>
                 <p className="text-xs text-gray-500 font-bold uppercase mb-2 tracking-wide">{getSubjectName(material.subjectId)}</p>
                 {material.description && <p className="text-xs text-gray-500 line-clamp-2 mb-4">{material.description}</p>}
                 
                 <button className="mt-auto w-full py-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl text-sm font-bold flex items-center justify-center transition-colors border border-gray-100 hover:border-indigo-100">
                    <Download className="h-4 w-4 mr-2" /> Tải về tài liệu
                 </button>
              </div>
           ))}
           {classMaterials.length === 0 && (
               <div className="col-span-3 text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                   Chưa có tài liệu nào cho lớp này.
               </div>
           )}
        </div>
      )}
    </div>
  );
};
