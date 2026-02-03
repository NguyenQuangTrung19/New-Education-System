
import React, { useState, useMemo, useEffect } from 'react';
import { User, ClassGroup, ScheduleItem, Student, StudentGrade, LessonFeedback, UserRole, AttendanceRecord, AttendanceStatus } from '../types';
import { MOCK_CLASSES, MOCK_SCHEDULE, MOCK_STUDENTS, MOCK_GRADES, MOCK_FEEDBACK, MOCK_SUBJECTS, MOCK_ATTENDANCE } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  BookOpen, Users, MapPin, ChevronLeft, ChevronRight, CheckCircle, 
  Calendar, Star, FileSignature, AlertCircle, Plus, History, Clock, AlertTriangle, UserCheck, X, Lock,
  LayoutGrid, Table as TableIcon, GraduationCap, ClipboardList, MessageSquareText, Home, Save, Ban, ShieldCheck, ArrowRight,
  ListTodo
} from 'lucide-react';

interface MyClassesProps {
  currentUser: User;
  initialClassId?: string;
}

// Helper to calculate average
const calculateAverage = (grade: StudentGrade): number | null => {
    let totalScore = 0;
    let totalWeight = 0;

    const isValid = (n: number | null) => n !== null && !isNaN(n);

    // Oral (Weight 1)
    if (isValid(grade.oralScore)) {
        totalScore += grade.oralScore! * 1;
        totalWeight += 1;
    }

    // 15 Min (Weight 1 each)
    if (grade.fifteenMinScores && Array.isArray(grade.fifteenMinScores)) {
        grade.fifteenMinScores.forEach(score => {
            if (isValid(score)) {
                totalScore += score! * 1;
                totalWeight += 1;
            }
        });
    }

    // Mid Term (Weight 2)
    if (isValid(grade.midTermScore)) {
        totalScore += grade.midTermScore! * 2;
        totalWeight += 2;
    }

    // Final (Weight 3)
    if (isValid(grade.finalScore)) {
        totalScore += grade.finalScore! * 3;
        totalWeight += 3;
    }

    if (totalWeight === 0) return null;
    return parseFloat((totalScore / totalWeight).toFixed(2));
};

export const MyClasses: React.FC<MyClassesProps> = ({ currentUser, initialClassId }) => {
  const { t } = useLanguage();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId || null);
  const [activeView, setActiveView] = useState<'grading' | 'journal' | 'evaluations'>('grading');
  
  // Date state for Journal
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));

  // --- GRADING STATE ---
  const [grades, setGrades] = useState<StudentGrade[]>(() => {
      return MOCK_GRADES.map(g => ({
          ...g,
          average: calculateAverage(g)
      }));
  });

  const [tempGrades, setTempGrades] = useState<StudentGrade[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // --- SECURITY STATE (Unified) ---
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityPassword, setSecurityPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [pendingAction, setPendingAction] = useState<'grades' | 'feedback' | null>(null);

  // Password Session State
  const [lastVerifiedTime, setLastVerifiedTime] = useState<number | null>(null);
  const PASSWORD_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

  useEffect(() => {
      setTempGrades(JSON.parse(JSON.stringify(grades))); // Deep copy
      setHasUnsavedChanges(false);
  }, [grades, selectedClassId]);

  const [feedbacks, setFeedbacks] = useState<LessonFeedback[]>(
      MOCK_FEEDBACK.map(f => ({ ...f, date: f.date || new Date().toISOString().split('T')[0] }))
  );

  // Attendance State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [currentAttendanceSession, setCurrentAttendanceSession] = useState<{scheduleId: string, date: string} | null>(null);
  const [tempAttendance, setTempAttendance] = useState<AttendanceRecord[]>([]);

  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<{id: string, date: string, day: string, period: number} | null>(null);
  const [rating, setRating] = useState<'A'|'B'|'C'|'D'|'E'|'F'>('B');
  const [comment, setComment] = useState('');

  // Evaluation State
  const [studentEvaluations, setStudentEvaluations] = useState<Record<string, string>>({});
  
  useEffect(() => {
      if(initialClassId) {
          setSelectedClassId(initialClassId);
      }
  }, [initialClassId]);

  if (currentUser.role !== UserRole.TEACHER) {
      return <div className="p-8 text-center text-red-500">Access Denied. Teachers only.</div>;
  }

  // --- Helper Functions ---
  function getStartOfWeek(date: Date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getISODate(date: Date) {
      return date.toISOString().split('T')[0];
  }

  function getLessonEndTime(date: Date, session: 'Morning' | 'Afternoon', period: number): Date {
      const d = new Date(date);
      if (session === 'Morning') {
          switch(period) {
              case 1: d.setHours(8, 0, 0, 0); break;
              case 2: d.setHours(8, 50, 0, 0); break;
              case 3: d.setHours(9, 50, 0, 0); break;
              case 4: d.setHours(10, 40, 0, 0); break;
              case 5: d.setHours(11, 30, 0, 0); break;
              default: d.setHours(12, 0, 0, 0); 
          }
      } else {
          switch(period) {
              case 1: d.setHours(14, 15, 0, 0); break;
              case 2: d.setHours(15, 5, 0, 0); break;
              case 3: d.setHours(16, 5, 0, 0); break;
              case 4: d.setHours(16, 55, 0, 0); break;
              case 5: d.setHours(17, 30, 0, 0); break;
              default: d.setHours(17, 30, 0, 0);
          }
      }
      return d;
  }

  const handleWeekChange = (direction: 'prev' | 'next') => {
      setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const jumpToToday = () => {
      setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  // --- Data Logic ---

  const myClasses = useMemo(() => {
     const teacherClasses = new Set<string>();
     MOCK_CLASSES.forEach(c => { if (c.teacherId === currentUser.id) teacherClasses.add(c.id); });
     MOCK_SCHEDULE.forEach(s => { if (s.teacherId === currentUser.id) teacherClasses.add(s.classId); });
     return MOCK_CLASSES.filter(c => teacherClasses.has(c.id));
  }, [currentUser.id]);

  const selectedClass = myClasses.find(c => c.id === selectedClassId);
  const isHomeroom = selectedClass?.teacherId === currentUser.id;

  const classStudents = useMemo(() => {
      if (!selectedClassId) return [];
      return MOCK_STUDENTS.filter(s => s.classId === selectedClassId);
  }, [selectedClassId]);

  useEffect(() => {
      const evals: Record<string, string> = {};
      classStudents.forEach(s => {
          if (s.semesterEvaluation) evals[s.id] = s.semesterEvaluation;
      });
      setStudentEvaluations(evals);
  }, [classStudents]);

  const currentSubjectId = useMemo(() => {
      if (!selectedClassId) return null;
      const schedule = MOCK_SCHEDULE.find(s => s.classId === selectedClassId && s.teacherId === currentUser.id);
      return schedule ? schedule.subjectId : null;
  }, [selectedClassId, currentUser.id]);

  // --- PENDING SIGNATURES LOGIC ---
  const pendingSignatures = useMemo(() => {
      const tasks: { classId: string; className: string; count: number }[] = [];
      const now = new Date();
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

      myClasses.forEach(cls => {
          const classSchedule = MOCK_SCHEDULE.filter(s => s.classId === cls.id && s.teacherId === currentUser.id);
          let pendingCount = 0;

          // Check for current week (using dashboard state)
          classSchedule.forEach(lesson => {
              const dayIndex = days.indexOf(lesson.day);
              if(dayIndex === -1) return;
              
              const lessonDate = addDays(currentWeekStart, dayIndex);
              const endTime = getLessonEndTime(lessonDate, lesson.session, lesson.period);
              
              // Only count if lesson is in the past
              if (now > endTime) {
                  const isoDate = getISODate(lessonDate);
                  const hasFeedback = feedbacks.some(f => f.scheduleId === lesson.id && f.date === isoDate);
                  if (!hasFeedback) pendingCount++;
              }
          });

          if (pendingCount > 0) {
              tasks.push({ classId: cls.id, className: cls.name, count: pendingCount });
          }
      });
      return tasks;
  }, [myClasses, currentWeekStart, feedbacks, currentUser.id]);

  const totalPending = pendingSignatures.reduce((sum, item) => sum + item.count, 0);

  // --- Grading Logic ---
  const getTempStudentGrade = (studentId: string) => {
      // if (!currentSubjectId) return null; // Removed to prevent null return
      const existing = currentSubjectId ? tempGrades.find(g => g.studentId === studentId && g.subjectId === currentSubjectId) : undefined;
      if (existing) return existing;

      return {
          studentId,
          subjectId: currentSubjectId || '',
          oralScore: null,
          fifteenMinScores: [null, null, null],
          midTermScore: null,
          finalScore: null,
          average: null,
          semester: 'HK1',
          academicYear: '2025-2026'
      };
  };

  const isGradeComplete = (studentId: string) => {
      if (!currentSubjectId) return false;
      const savedGrade = grades.find(g => g.studentId === studentId && g.subjectId === currentSubjectId);
      if (!savedGrade) return false;
      const hasOral = savedGrade.oralScore !== null && savedGrade.oralScore !== undefined;
      const hasMid = savedGrade.midTermScore !== null && savedGrade.midTermScore !== undefined;
      const hasFinal = savedGrade.finalScore !== null && savedGrade.finalScore !== undefined;
      return hasOral && hasMid && hasFinal;
  };

  const handleGradeChange = (studentId: string, field: keyof StudentGrade, value: string, index?: number) => {
      if (!currentSubjectId) return;
      if (value !== '' && (!/^\d*\.?\d*$/.test(value) || parseFloat(value) > 10)) return;

      const numValue = value === '' ? null : parseFloat(value);
      setHasUnsavedChanges(true);
      
      setTempGrades(prev => {
          const existingIndex = prev.findIndex(g => g.studentId === studentId && g.subjectId === currentSubjectId);
          let newGradeObj: StudentGrade;

          if (existingIndex > -1) {
              newGradeObj = { ...prev[existingIndex] };
          } else {
              newGradeObj = {
                  studentId,
                  subjectId: currentSubjectId!, // Assert non-null inside closure
                  oralScore: null,
                  fifteenMinScores: [null, null, null],
                  midTermScore: null,
                  finalScore: null,
                  average: null,
                  semester: 'HK1' as const, // Explicit literal type
                  academicYear: '2025-2026'
              };
          }

          if (field === 'fifteenMinScores' && typeof index === 'number') {
              const newScores = [...newGradeObj.fifteenMinScores];
              newScores[index] = numValue;
              newGradeObj.fifteenMinScores = newScores;
          } else {
              (newGradeObj as any)[field] = numValue;
          }

          newGradeObj.average = calculateAverage(newGradeObj);

          if (existingIndex > -1) {
              const newGrades = [...prev];
              newGrades[existingIndex] = newGradeObj;
              return newGrades;
          } else {
              return [...prev, newGradeObj];
          }
      });
  };

  const addFifteenMinColumn = (studentId: string) => {
       if (!currentSubjectId) return;
       setHasUnsavedChanges(true);
       setTempGrades(prev => {
           const idx = prev.findIndex(g => g.studentId === studentId && g.subjectId === currentSubjectId);
           let grade: StudentGrade = idx > -1 ? {...prev[idx]} : {
                studentId,
                subjectId: currentSubjectId!, // Assert non-null inside closure
                oralScore: null,
                fifteenMinScores: [null, null, null],
                midTermScore: null,
                finalScore: null,
                average: null,
                semester: 'HK1' as const, // Explicit literal type
                academicYear: '2025-2026'
           };

           if (grade.fifteenMinScores.length < 5) {
               grade.fifteenMinScores = [...grade.fifteenMinScores, null];
               if (idx > -1) {
                   const newGrades = [...prev];
                   newGrades[idx] = grade;
                   return newGrades;
               } else {
                   return [...prev, grade];
               }
           }
           return prev;
       });
  };

  // --- SHARED ACTION LOGIC (Grades & Feedback) ---

  const commitGrades = () => {
      setGrades(JSON.parse(JSON.stringify(tempGrades))); 
      setHasUnsavedChanges(false);
      setPendingAction(null);
      setIsSecurityModalOpen(false);
      alert("Grades successfully updated!");
  };

  const executeFeedbackSubmission = () => {
      if (!selectedScheduleItem) return;
      const signature = `Signed by ${currentUser.name} at ${new Date().toLocaleTimeString()}`;
      const newFeedback: LessonFeedback = {
          scheduleId: selectedScheduleItem.id,
          date: selectedScheduleItem.date,
          rating,
          comment,
          signature,
          timestamp: new Date().toISOString()
      };
      setFeedbacks(prev => {
          const filtered = prev.filter(f => !(f.scheduleId === selectedScheduleItem.id && f.date === selectedScheduleItem.date));
          return [...filtered, newFeedback];
      });
      setFeedbackModalOpen(false);
      setPendingAction(null);
      setIsSecurityModalOpen(false);
      alert(t('myClasses.evaluations.saved') || "Feedback signed and submitted successfully.");
  };

  // The Action Trigger (Checks session)
  const handleActionRequest = (action: 'grades' | 'feedback') => {
      const now = Date.now();

      // FOR FEEDBACK (Journal): Always force password entry (Digital Signature style)
      // This fixes the issue where subsequent edits wouldn't trigger action because of cached session.
      if (action === 'feedback') {
          setSecurityError('');
          setSecurityPassword('');
          setPendingAction('feedback');
          setIsSecurityModalOpen(true);
          return;
      }

      // FOR GRADES: Use 10-minute session caching
      if (lastVerifiedTime && (now - lastVerifiedTime < PASSWORD_TIMEOUT)) {
          // Session valid for grading
          commitGrades();
      } else {
          // Session invalid - Prompt Password
          setSecurityError('');
          setSecurityPassword('');
          setPendingAction('grades');
          setIsSecurityModalOpen(true);
      }
  };

  const handleConfirmSecurity = () => {
      if (securityPassword === 'password') {
          // Only update verification time if it's grading, 
          // or if we want feedback to also extend grading session (optional, but let's keep them somewhat linked)
          setLastVerifiedTime(Date.now());
          
          // Execute pending action
          if (pendingAction === 'grades') commitGrades();
          if (pendingAction === 'feedback') executeFeedbackSubmission();
      } else {
          setSecurityError("Incorrect password.");
      }
  };

  // --- Attendance Logic ---
  const openAttendanceModal = (lesson: any) => {
      if (!lesson.isPast) return;
      setCurrentAttendanceSession({ scheduleId: lesson.id, date: lesson.isoDate });
      
      const sessionRecords = attendanceRecords.filter(r => r.scheduleId === lesson.id && r.date === lesson.isoDate);
      
      if (sessionRecords.length > 0) {
          const fullRecords = classStudents.map(student => {
              const existing = sessionRecords.find(r => r.studentId === student.id);
              return existing || {
                  id: `att-${Date.now()}-${student.id}`,
                  scheduleId: lesson.id,
                  date: lesson.isoDate,
                  studentId: student.id,
                  status: 'present' as AttendanceStatus
              };
          });
          setTempAttendance(fullRecords);
      } else {
          const defaults = classStudents.map(student => ({
              id: `att-${Date.now()}-${student.id}`,
              scheduleId: lesson.id,
              date: lesson.isoDate,
              studentId: student.id,
              status: 'present' as AttendanceStatus
          }));
          setTempAttendance(defaults);
      }
      setAttendanceModalOpen(true);
  };

  const updateTempAttendance = (studentId: string, status: AttendanceStatus) => {
      setTempAttendance(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  const markAllPresent = () => {
      setTempAttendance(prev => prev.map(r => ({ ...r, status: 'present' })));
  };

  const saveAttendance = () => {
      setAttendanceRecords(prev => {
          const filtered = prev.filter(r => 
              !(r.scheduleId === currentAttendanceSession?.scheduleId && r.date === currentAttendanceSession?.date)
          );
          return [...filtered, ...tempAttendance];
      });
      setAttendanceModalOpen(false);
  };

  // --- Journal Logic ---
  const isCurrentWeek = useMemo(() => {
      const today = new Date();
      const startOfTodayWeek = getStartOfWeek(today);
      return startOfTodayWeek.getTime() === currentWeekStart.getTime();
  }, [currentWeekStart]);

  const weekLessons = useMemo(() => {
      if (!selectedClassId) return [];
      const dayMap: Record<string, number> = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4 };
      const currentTime = new Date();
      const templateLessons = MOCK_SCHEDULE.filter(s => s.classId === selectedClassId && s.teacherId === currentUser.id);
      
      return templateLessons.map(lesson => {
          const dayOffset = dayMap[lesson.day];
          if (dayOffset === undefined) return null;
          
          const lessonDate = addDays(currentWeekStart, dayOffset);
          const isoDate = getISODate(lessonDate);
          const feedback = feedbacks.find(f => f.scheduleId === lesson.id && f.date === isoDate);
          const records = attendanceRecords.filter(r => r.scheduleId === lesson.id && r.date === isoDate);
          const attendanceTaken = records.length > 0;
          const absentCount = records.filter(r => r.status === 'absent').length;
          const lessonEndTime = getLessonEndTime(lessonDate, lesson.session, lesson.period);
          const isPast = currentTime > lessonEndTime;
          const isPending = isPast && !feedback;

          return {
              ...lesson,
              specificDate: lessonDate,
              isoDate: isoDate,
              feedback,
              attendanceTaken,
              absentCount,
              isPast,
              isPending
          };
      }).filter(Boolean).sort((a, b) => (a!.specificDate.getTime() - b!.specificDate.getTime()) || (a!.period - b!.period));
  }, [selectedClassId, currentUser.id, currentWeekStart, feedbacks, attendanceRecords]);

  const weekStats = useMemo(() => {
      const total = weekLessons.length;
      const evaluated = weekLessons.filter((l: any) => l.feedback).length;
      const pending = weekLessons.filter((l: any) => l.isPending).length;
      return { total, evaluated, pending };
  }, [weekLessons]);

  const handleOpenFeedback = (lesson: any) => {
      if (!lesson.isPast) return;
      setSelectedScheduleItem({
          id: lesson.id,
          date: lesson.isoDate,
          day: lesson.day,
          period: lesson.period
      });
      if (lesson.feedback) {
          setRating(lesson.feedback.rating);
          setComment(lesson.feedback.comment);
      } else {
          setRating('B');
          setComment('');
      }
      setFeedbackModalOpen(true);
  };

  // --- Evaluation Logic ---
  const handleEvaluationChange = (studentId: string, value: string) => {
      setStudentEvaluations(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveEvaluation = (studentId: string) => {
      alert(t('myClasses.evaluations.saved'));
  };

  // --- UI Render ---

  if (!selectedClassId) {
      // DASHBOARD VIEW (When no class is selected)
      return (
        <div className="animate-fade-in pb-10">
           {/* Pending Signatures Hero */}
           <div className={`rounded-3xl p-8 mb-10 text-white relative overflow-hidden shadow-lg ${
               totalPending > 0 ? 'bg-gradient-to-br from-orange-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
           }`}>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                      <h2 className="text-3xl font-bold mb-2 flex items-center">
                          {totalPending > 0 ? <AlertTriangle className="h-8 w-8 mr-3" /> : <CheckCircle className="h-8 w-8 mr-3" />}
                          {totalPending > 0 ? 'Action Required' : 'All Caught Up!'}
                      </h2>
                      <p className="text-white/90 text-lg">
                          {totalPending > 0 
                            ? `You have ${totalPending} finished lessons waiting for your signature in the teaching journal this week.` 
                            : 'You have signed all teaching journals for completed lessons this week. Great job!'}
                      </p>
                  </div>
                  
                  {/* Stats Circle */}
                  <div className="bg-white/20 backdrop-blur-md rounded-full h-32 w-32 flex flex-col items-center justify-center border-4 border-white/30 shrink-0 shadow-inner">
                      <span className="text-4xl font-bold">{totalPending}</span>
                      <span className="text-xs uppercase font-bold tracking-wider">Pending</span>
                  </div>
              </div>

              {/* List of classes with pending items */}
              {totalPending > 0 && (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {pendingSignatures.map(item => (
                          <button 
                              key={item.classId}
                              onClick={() => {
                                  setSelectedClassId(item.classId);
                                  setActiveView('journal');
                              }}
                              className="bg-white/90 text-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-white transition-colors shadow-md group"
                          >
                              <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3">
                                      {item.count}
                                  </div>
                                  <div className="text-left">
                                      <p className="font-bold text-sm">{item.className}</p>
                                      <p className="text-xs text-gray-500">Unsigned Lessons</p>
                                  </div>
                              </div>
                              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          </button>
                      ))}
                  </div>
              )}
           </div>

           <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
               <BookOpen className="h-5 w-5 text-indigo-600" /> {t('myClasses.title')}
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClasses.map(cls => {
                  const isHomeroomClass = cls.teacherId === currentUser.id;
                  const subjectName = MOCK_SCHEDULE.find(s => s.classId === cls.id && s.teacherId === currentUser.id)?.subjectId 
                                      ? MOCK_SUBJECTS.find(sub => sub.id === MOCK_SCHEDULE.find(s => s.classId === cls.id && s.teacherId === currentUser.id)?.subjectId)?.name 
                                      : 'Subject';
                  
                  // Check if this specific class has pending signatures from our computed list
                  const classPending = pendingSignatures.find(p => p.classId === cls.id)?.count || 0;

                  return (
                  <div 
                    key={cls.id} 
                    onClick={() => setSelectedClassId(cls.id)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group flex flex-col overflow-hidden h-full relative"
                  >
                      {classPending > 0 && (
                          <div className="absolute top-0 right-0 z-10 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm animate-pulse">
                              {classPending} Pending Signatures
                          </div>
                      )}

                      {/* Course Cover */}
                      <div className={`h-24 p-4 flex justify-between items-start ${
                          isHomeroomClass ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}>
                          <h4 className="text-white font-bold text-2xl tracking-tight">{cls.name}</h4>
                          {isHomeroomClass && (
                              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                                  <Home className="h-3 w-3 mr-1" /> Homeroom
                              </span>
                          )}
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-4">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Subject</p>
                              <p className="text-gray-900 font-medium truncate">{subjectName}</p>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                              <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1.5" /> {cls.room}
                              </div>
                              <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1.5" /> {cls.studentCount}
                              </div>
                          </div>

                          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-indigo-600 text-sm font-bold group-hover:text-indigo-800 transition-colors">
                              <span>Go to Workspace</span>
                              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                      </div>
                  </div>
              )})}
              {myClasses.length === 0 && (
                  <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                      No assigned classes found.
                  </div>
              )}
           </div>
        </div>
      );
  }

  return (
    <div className="animate-fade-in pb-10 h-[calc(100vh-100px)] flex flex-col">
        {/* Header / Nav Back */}
        <div className="flex items-center gap-4 mb-4 shrink-0">
            <button onClick={() => setSelectedClassId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedClass?.name} 
                    {isHomeroom && (
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center">
                            <Home className="h-3 w-3 mr-1" /> {t('myClasses.homeroom')}
                        </span>
                    )}
                    <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{selectedClass?.room}</span>
                </h2>
                <p className="text-sm text-indigo-600 font-medium">Subject: {MOCK_SUBJECTS.find(s=>s.id === currentSubjectId)?.name || 'N/A'}</p>
            </div>
            
            {/* View Switcher / Navigation */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <button 
                    onClick={() => setActiveView('grading')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activeView === 'grading' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {t('myClasses.tab.grading')}
                </button>
                <button 
                    onClick={() => setActiveView('journal')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activeView === 'journal' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    {t('myClasses.tab.journal')}
                </button>
                <button 
                    onClick={() => setActiveView('evaluations')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activeView === 'evaluations' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <MessageSquareText className="h-4 w-4 mr-2" />
                    {t('myClasses.tab.evaluations')}
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
            
            {/* Grading View */}
            {activeView === 'grading' && (
                <>
                    <div className="flex-1 overflow-auto custom-scrollbar pb-16">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-gray-50 sticky top-0 z-20 border-b border-gray-200 shadow-sm">
                                <tr className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                                    <th className="px-6 py-4 sticky left-0 bg-gray-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-64 border-r border-gray-200">
                                        Student
                                    </th>
                                    <th className="px-4 py-4 text-center w-32 bg-blue-50/50 border-r border-blue-100">{t('myClasses.oral')} (x1)</th>
                                    <th className="px-4 py-4 text-center min-w-[240px] bg-indigo-50/50 border-r border-indigo-100">{t('myClasses.15min')} (x1)</th>
                                    <th className="px-4 py-4 text-center w-32 bg-purple-50/50 border-r border-purple-100">{t('myClasses.midTerm')} (x2)</th>
                                    <th className="px-4 py-4 text-center w-32 bg-pink-50/50 border-r border-pink-100">{t('myClasses.final')} (x3)</th>
                                    <th className="px-4 py-4 text-center w-32 bg-gray-100 text-gray-800">{t('myClasses.average')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {classStudents.map(student => {
                                    const grade = getTempStudentGrade(student.id);
                                    // if (!grade) return null; // Removed

                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-gray-100">
                                                <div className="font-bold text-gray-900 text-sm">{student.name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{student.id}</div>
                                            </td>
                                            
                                            {/* Oral */}
                                            <td className="px-4 py-3 text-center bg-blue-50/10 border-r border-gray-100">
                                                <input 
                                                    type="text"
                                                    className="w-16 h-10 text-center bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold shadow-sm"
                                                    placeholder="-"
                                                    value={grade.oralScore ?? ''}
                                                    onChange={(e) => handleGradeChange(student.id, 'oralScore', e.target.value)}
                                                />
                                            </td>

                                            {/* 15 Min */}
                                            <td className="px-4 py-3 bg-indigo-50/10 border-r border-gray-100">
                                                <div className="flex gap-2 justify-center flex-wrap">
                                                    {grade.fifteenMinScores.map((score, idx) => (
                                                        <input 
                                                            key={idx}
                                                            type="text" 
                                                            className="w-12 h-10 text-center bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold shadow-sm"
                                                            placeholder="-"
                                                            value={score ?? ''}
                                                            onChange={(e) => handleGradeChange(student.id, 'fifteenMinScores', e.target.value, idx)}
                                                        />
                                                    ))}
                                                    {grade.fifteenMinScores.length < 5 && (
                                                        <button onClick={() => addFifteenMinColumn(student.id)} className="w-10 h-10 flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-dashed border-indigo-200 hover:border-indigo-400 transition-all">
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Mid Term */}
                                            <td className="px-4 py-3 text-center bg-purple-50/10 border-r border-gray-100">
                                                <input 
                                                    type="text" 
                                                    className="w-16 h-10 text-center bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold shadow-sm"
                                                    placeholder="-"
                                                    value={grade.midTermScore ?? ''}
                                                    onChange={(e) => handleGradeChange(student.id, 'midTermScore', e.target.value)}
                                                />
                                            </td>

                                            {/* Final */}
                                            <td className="px-4 py-3 text-center bg-pink-50/10 border-r border-gray-100">
                                                <input 
                                                    type="text"
                                                    className="w-16 h-10 text-center bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold shadow-sm"
                                                    placeholder="-"
                                                    value={grade.finalScore ?? ''}
                                                    onChange={(e) => handleGradeChange(student.id, 'finalScore', e.target.value)}
                                                />
                                            </td>

                                            {/* Average */}
                                            <td className="px-4 py-3 text-center bg-gray-50/50">
                                                <div className="flex justify-center">
                                                    <span className={`flex items-center justify-center w-14 h-10 rounded-lg font-bold text-sm border shadow-sm ${
                                                        grade.average === null ? 'text-gray-400 border-gray-200 bg-white' :
                                                        grade.average >= 8 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                                        grade.average >= 6.5 ? 'text-indigo-700 bg-indigo-50 border-indigo-200' :
                                                        grade.average >= 5 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                                        'text-red-700 bg-red-50 border-red-200'
                                                    }`}>
                                                        {grade.average !== null ? grade.average : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Floating Save Bar */}
                    <div className={`absolute bottom-6 right-6 transition-all duration-300 transform ${hasUnsavedChanges ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                        <button 
                            onClick={() => handleActionRequest('grades')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/40 flex items-center animate-bounce-slight"
                        >
                            <Save className="h-5 w-5 mr-2" /> Save Grades
                        </button>
                    </div>
                </>
            )}

            {/* Journal View */}
            {activeView === 'journal' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
                    <div className="p-4 border-b border-gray-200 bg-white shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-20">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button onClick={() => handleWeekChange('prev')} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition"><ChevronLeft className="h-5 w-5" /></button>
                            <div className="px-4 text-center min-w-[200px]">
                                <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Teaching Week</div>
                                <div className="text-sm font-bold text-gray-900 flex items-center justify-center gap-2">
                                    {formatDate(currentWeekStart)} - {formatDate(addDays(currentWeekStart, 4))}
                                    {isCurrentWeek && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded uppercase">Current</span>}
                                </div>
                            </div>
                            <button onClick={() => handleWeekChange('next')} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition"><ChevronRight className="h-5 w-5" /></button>
                        </div>

                        {!isCurrentWeek && (
                            <button onClick={jumpToToday} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                Jump to Today
                            </button>
                        )}

                        <div className="flex gap-4 text-sm bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm md:ml-auto">
                            <div className="flex flex-col items-center px-2">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Done</span>
                                <span className="font-bold text-emerald-600">{weekStats.evaluated}</span>
                            </div>
                            <div className="w-px bg-gray-100"></div>
                            <div className="flex flex-col items-center px-2">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Pending</span>
                                <span className="font-bold text-rose-600">{weekStats.pending}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {weekLessons.map((lesson: any) => (
                                <div 
                                    key={`${lesson.id}-${lesson.isoDate}`} 
                                    className={`relative flex flex-col rounded-2xl border transition-all duration-200 group ${
                                        lesson.feedback 
                                            ? 'bg-white border-gray-200 shadow-sm hover:shadow-md' 
                                            : lesson.isPending 
                                                ? 'bg-white border-rose-200 shadow-md ring-1 ring-rose-100' 
                                                : 'bg-gray-50 border-gray-200 opacity-80'
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center border font-bold ${
                                                lesson.feedback ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                                lesson.isPending ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                                'bg-gray-100 border-gray-200 text-gray-400'
                                            }`}>
                                                <span className="text-[10px] uppercase">{formatDate(lesson.specificDate).split(' ')[0]}</span>
                                                <span className="text-lg">{formatDate(lesson.specificDate).split(' ')[1]}</span>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase">Period {lesson.period}</div>
                                                <div className="font-bold text-gray-900">{lesson.session}</div>
                                            </div>
                                        </div>
                                        {lesson.feedback ? (
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                        ) : lesson.isPending ? (
                                            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 animate-pulse">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex-1 space-y-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2 text-gray-400" /> Room: <span className="font-medium ml-1 text-gray-900">{lesson.room}</span>
                                        </div>
                                        
                                        {/* Attendance Status Bar */}
                                        <div>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Attendance</span>
                                                {lesson.attendanceTaken ? (
                                                    <span className="text-xs font-bold text-indigo-600">{lesson.absentCount} Absent</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Not taken</span>
                                                )}
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                {lesson.attendanceTaken ? (
                                                    <div className={`h-full rounded-full ${lesson.absentCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{width: '100%'}}></div>
                                                ) : (
                                                    <div className="h-full w-full bg-gray-200"></div>
                                                )}
                                            </div>
                                        </div>

                                        {lesson.feedback && (
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Rating</span>
                                                    <span className={`text-lg font-bold ${
                                                        lesson.feedback.rating === 'A' ? 'text-emerald-600' :
                                                        lesson.feedback.rating === 'B' ? 'text-blue-600' : 'text-gray-600'
                                                    }`}>{lesson.feedback.rating}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 italic">"{lesson.feedback.comment}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-2">
                                        <button 
                                            onClick={() => openAttendanceModal(lesson)}
                                            disabled={!lesson.isPast}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                                !lesson.isPast 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'
                                            }`}
                                        >
                                            <UserCheck className="h-3 w-3 mr-1.5" /> Attendance
                                        </button>
                                        <button 
                                            onClick={() => handleOpenFeedback(lesson)}
                                            disabled={!lesson.isPast}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                                !lesson.isPast 
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : lesson.isPending
                                                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/20'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'
                                            }`}
                                        >
                                            <FileSignature className="h-3 w-3 mr-1.5" /> {lesson.feedback ? 'Edit Eval' : 'Evaluate'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {weekLessons.length === 0 && (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                                    <Calendar className="h-12 w-12 mb-3 text-gray-200" />
                                    <p>No lessons found for this week.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Evaluations View (All Subject Teachers) */}
            {activeView === 'evaluations' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900">{t('myClasses.evaluations.title')}</h3>
                            <p className="text-sm text-gray-500">{t('myClasses.evaluations.subtitle')}</p>
                        </div>
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-gray-50 sticky top-[73px] z-10 border-b border-gray-200">
                                <tr className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                                    <th className="px-6 py-4 sticky left-0 bg-gray-50 z-20 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-72">
                                        Student
                                    </th>
                                    <th className="px-6 py-4 text-center w-40 border-r border-gray-200">
                                        {t('myClasses.average')} (Score)
                                    </th>
                                    <th className="px-6 py-4">
                                        Semester Evaluation
                                    </th>
                                    <th className="px-6 py-4 text-center w-32">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {classStudents.map(student => {
                                    // This uses REAL grades (saved grades), not temp ones
                                    const grade = grades.find(g => g.studentId === student.id && g.subjectId === currentSubjectId);
                                    const isComplete = isGradeComplete(student.id);
                                    
                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-700 shrink-0">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{student.name}</div>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{student.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 text-center border-r border-gray-100 align-top pt-6">
                                                {grade?.average !== null && grade?.average !== undefined ? (
                                                    <span className={`inline-block px-3 py-1 rounded-lg font-bold border ${
                                                        grade.average >= 8 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        grade.average >= 6.5 ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        grade.average >= 5 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                        {grade.average}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                        <Ban className="h-3 w-3 mr-1" /> N/A
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-3 align-top">
                                                <div className="relative">
                                                    <textarea 
                                                        disabled={!isComplete}
                                                        className={`w-full min-h-[80px] p-3 rounded-xl border text-sm transition-all resize-y focus:outline-none focus:ring-2 ${
                                                            isComplete 
                                                            ? 'bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800' 
                                                            : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                        placeholder={isComplete ? t('myClasses.evaluations.placeholder') : "Complete all grade columns (Oral, Mid, Final) to unlock."}
                                                        value={studentEvaluations[student.id] || ''}
                                                        onChange={(e) => handleEvaluationChange(student.id, e.target.value)}
                                                    />
                                                    {!isComplete && (
                                                        <div className="absolute top-3 right-3 text-gray-400" title="Locked: Needs complete grades">
                                                            <Lock className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center align-top pt-5">
                                                <button 
                                                    onClick={() => handleSaveEvaluation(student.id)}
                                                    disabled={!isComplete}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        isComplete 
                                                        ? 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800' 
                                                        : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                    title="Save Evaluation"
                                                >
                                                    <Save className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* Security Modal for Grading Save */}
        {isSecurityModalOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Secure Submission</h3>
                        <p className="text-gray-500 text-sm mt-2">Enter your password to commit these changes.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <input 
                                type="password" 
                                placeholder="Enter password" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={securityPassword}
                                onChange={(e) => setSecurityPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmSecurity()}
                            />
                            {securityError && (
                                <div className="flex items-center text-red-500 text-xs mt-2 font-medium">
                                    <AlertCircle className="w-3 h-3 mr-1" /> {securityError}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                            <button onClick={() => setIsSecurityModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm">Cancel</button>
                            <button onClick={handleConfirmSecurity} className="flex-1 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all font-bold text-sm">Submit</button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4">Demo Password: "password"</p>
                </div>
            </div>
        )}

        {/* Attendance Modal */}
        {attendanceModalOpen && currentAttendanceSession && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[85vh] flex flex-col animate-scale-in">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{t('myClasses.attendance')}</h3>
                            <p className="text-sm text-gray-500">{currentAttendanceSession.date}</p>
                        </div>
                        <button onClick={() => setAttendanceModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="h-5 w-5 text-gray-500"/></button>
                    </div>

                    <div className="flex-1 overflow-auto p-0">
                        <div className="px-6 py-3 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                            <span className="text-sm font-bold text-gray-500">{classStudents.length} Students</span>
                            <button onClick={markAllPresent} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                                {t('myClasses.markAllPresent')}
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {classStudents.map(student => {
                                const record = tempAttendance.find(r => r.studentId === student.id);
                                const status = record?.status || 'present';

                                return (
                                    <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                                status === 'absent' ? 'bg-red-100 text-red-600' :
                                                status === 'late' ? 'bg-amber-100 text-amber-600' :
                                                status === 'excused' ? 'bg-blue-100 text-blue-600' :
                                                'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                                                <p className="text-xs text-gray-500">{student.id}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                            <button 
                                                onClick={() => updateTempAttendance(student.id, 'present')}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'present' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                P
                                            </button>
                                            <button 
                                                onClick={() => updateTempAttendance(student.id, 'absent')}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                A
                                            </button>
                                            <button 
                                                onClick={() => updateTempAttendance(student.id, 'late')}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'late' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                L
                                            </button>
                                            <button 
                                                onClick={() => updateTempAttendance(student.id, 'excused')}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'excused' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                E
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
                        <button onClick={() => setAttendanceModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
                            {t('common.cancel')}
                        </button>
                        <button onClick={saveAttendance} className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all text-sm">
                            {t('common.save')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Feedback Modal */}
        {feedbackModalOpen && selectedScheduleItem && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{t('myClasses.evaluate')}</h3>
                        <button onClick={() => setFeedbackModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><Plus className="h-5 w-5 rotate-45 text-gray-500"/></button>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6 flex justify-between items-center">
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">{selectedScheduleItem.day}</p>
                            <p className="text-gray-500">{selectedScheduleItem.date}</p>
                        </div>
                        <div className="text-right">
                             <span className="text-xs font-bold text-gray-400 uppercase">Period</span>
                             <p className="font-mono font-bold text-gray-800">{selectedScheduleItem.period}</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-3">{t('myClasses.rating')}</label>
                            <div className="flex justify-between gap-2">
                                {['A', 'B', 'C', 'D', 'E', 'F'].map((r) => (
                                    <button 
                                        key={r}
                                        onClick={() => setRating(r as any)}
                                        className={`h-12 w-full rounded-xl font-bold transition-all text-lg shadow-sm ${
                                            rating === r 
                                            ? 'bg-indigo-600 text-white scale-105 shadow-indigo-500/30 ring-2 ring-offset-2 ring-indigo-600' 
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">{t('myClasses.comment')}</label>
                            <textarea 
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] resize-none"
                                placeholder="Enter session details, student behavior, or lesson progress..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10">
                                <FileSignature className="h-20 w-20 text-indigo-600" />
                            </div>
                            <p className="text-xs text-indigo-800 font-bold uppercase flex items-center justify-center gap-2">
                                <FileSignature className="h-4 w-4" /> {t('myClasses.sign')}
                            </p>
                            <p className="text-[10px] text-indigo-500 mt-1 max-w-[200px] mx-auto">
                                Digitally signing as <span className="font-bold">{currentUser.name}</span>.<br/>Timestamp: {new Date().toLocaleTimeString()}
                            </p>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button onClick={() => setFeedbackModalOpen(false)} className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">{t('common.cancel')}</button>
                            <button onClick={() => handleActionRequest('feedback')} className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98]">{t('myClasses.signBtn')}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
