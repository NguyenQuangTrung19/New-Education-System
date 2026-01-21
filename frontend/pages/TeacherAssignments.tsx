
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';
import { MOCK_CLASSES, MOCK_SUBJECTS, MOCK_TEACHERS } from '../constants';
import { 
  Plus, Trash2, Save, FileText, CheckCircle, Circle, 
  HelpCircle, ChevronRight, Check, AlertCircle, LayoutList, 
  Calendar, Lock, Users, ArrowLeft, Send, X, Clock, MoreVertical, Search, Filter,
  FileSpreadsheet, File as FileIcon, Download, Pencil, AlertTriangle, BookOpen, Timer
} from 'lucide-react';
import { isDateInFutureOrToday } from '../utils';

interface TeacherAssignmentsProps {
  currentUser: User;
}

type QuestionType = 'multiple_choice' | 'essay';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: Option[]; 
}

interface NewAssignment {
  title: string;
  subjectId: string;
  dueDate: string;
  duration: number; // Added duration field
  classIds: string[];
  passwordAccess: string;
  questions: Question[];
}

interface StoredAssignment extends NewAssignment {
  id: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export const TeacherAssignments: React.FC<TeacherAssignmentsProps> = ({ currentUser }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  
  // -- State Persistence --
  const [assignments, setAssignments] = useState<StoredAssignment[]>(() => {
      try {
          const saved = localStorage.getItem('teacher_assignments');
          const parsed = saved ? JSON.parse(saved) : [];
          return Array.isArray(parsed) ? parsed.filter(i => i && i.id) : [];
      } catch (e) {
          console.error("Data corruption in assignments, resetting.", e);
          return [];
      }
  });

  useEffect(() => {
      localStorage.setItem('teacher_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const [searchTerm, setSearchTerm] = useState('');

  // Security Modal State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityPassword, setSecurityPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  
  // Validation State
  const [formError, setFormError] = useState<string | null>(null);
  
  // Action State: Added 'delete'
  const [pendingAction, setPendingAction] = useState<'publish' | 'edit_access' | 'delete'>('publish');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initial Empty State
  const initialAssignmentState: NewAssignment = {
    title: '',
    subjectId: '',
    dueDate: '',
    duration: 45, // Default 45 minutes
    classIds: [],
    passwordAccess: '',
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'Câu hỏi mới 1', options: [
        { id: 'opt1', text: 'Phương án A', isCorrect: false },
        { id: 'opt2', text: 'Phương án B', isCorrect: false }
      ]}
    ]
  };

  const [newAssignment, setNewAssignment] = useState<NewAssignment>(initialAssignmentState);

  // Get Classes taught by this teacher
  const myClasses = useMemo(() => {
    return MOCK_CLASSES.filter(c => c.teacherId === currentUser.id);
  }, [currentUser.id]);

  // Get Subjects (Demo: Return all subjects so user can see options)
  const mySubjects = useMemo(() => {
      return MOCK_SUBJECTS;
  }, []);

  // --- Handlers ---

  const handleCreateNew = () => {
    setNewAssignment(JSON.parse(JSON.stringify(initialAssignmentState)));
    setEditingId(null);
    setPendingAction('publish');
    setShowSecurityModal(false); 
    setSecurityPassword('');
    setSecurityError('');
    setFormError(null);
    setActiveQuestionIndex(0);
    setView('create');
  };

  const handleCancel = () => {
      setNewAssignment(JSON.parse(JSON.stringify(initialAssignmentState)));
      setEditingId(null);
      setPendingAction('publish');
      setShowSecurityModal(false);
      setFormError(null);
      setView('list');
  };

  const handleClassToggle = (classId: string) => {
    setNewAssignment(prev => {
      const exists = prev.classIds.includes(classId);
      return {
        ...prev,
        classIds: exists 
          ? prev.classIds.filter(id => id !== classId)
          : [...prev.classIds, classId]
      };
    });
  };

  const handleSelectAllClasses = () => {
    if (newAssignment.classIds.length === myClasses.length) {
      setNewAssignment(prev => ({ ...prev, classIds: [] }));
    } else {
      setNewAssignment(prev => ({ ...prev, classIds: myClasses.map(c => c.id) }));
    }
  };

  // --- Questions Handling ---
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addQuestion = () => {
    const newId = `q-${generateId()}`;
    setNewAssignment(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: newId,
        type: 'multiple_choice',
        text: `Câu hỏi mới ${prev.questions.length + 1}`,
        options: [
          { id: `opt-${generateId()}`, text: '', isCorrect: false },
          { id: `opt-${generateId()}`, text: '', isCorrect: false }
        ]
      }]
    }));
    setActiveQuestionIndex(newAssignment.questions.length);
  };

  const deleteQuestion = (index: number) => {
    if (newAssignment.questions.length <= 1) return; 
    setNewAssignment(prev => ({ 
      ...prev, 
      questions: prev.questions.filter((_, idx) => idx !== index) 
    }));
    if (activeQuestionIndex >= index && activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setNewAssignment(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }));
  };

  const addOption = (qIndex: number) => {
    setNewAssignment(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => {
            if (i !== qIndex) return q;
            return {
                ...q,
                options: [...(q.options || []), { id: `opt-${generateId()}`, text: '', isCorrect: false }]
            };
        })
    }));
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setNewAssignment(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => {
            if (i !== qIndex || !q.options || q.options.length <= 2) return q;
            return {
                ...q,
                options: q.options.filter((_, oi) => oi !== optIndex)
            };
        })
    }));
  };

  const toggleOptionCorrect = (qIndex: number, optIndex: number) => {
    setNewAssignment(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => {
            if (i !== qIndex || !q.options) return q;
            const newOptions = [...q.options];
            newOptions[optIndex] = { ...newOptions[optIndex], isCorrect: !newOptions[optIndex].isCorrect };
            return { ...q, options: newOptions };
        })
    }));
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setNewAssignment(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => {
            if (i !== qIndex || !q.options) return q;
            const newOptions = [...q.options];
            newOptions[optIndex] = { ...newOptions[optIndex], text };
            return { ...q, options: newOptions };
        })
    }));
  };

  // --- Main Actions ---

  const validateForm = (): string | null => {
      if (!newAssignment.title.trim()) return "Vui lòng nhập tiêu đề bài tập.";
      if (!newAssignment.subjectId) return "Vui lòng chọn môn học cho bài tập này.";
      
      if (!newAssignment.dueDate) return "Vui lòng chọn hạn nộp bài.";
      if (!isDateInFutureOrToday(newAssignment.dueDate)) return "Hạn nộp bài phải là ngày trong tương lai (hoặc hôm nay).";

      if (!newAssignment.duration || newAssignment.duration <= 0) return "Thời gian làm bài phải lớn hơn 0 phút.";
      if (!newAssignment.passwordAccess.trim()) return "Vui lòng đặt mật khẩu truy cập.";
      if (newAssignment.classIds.length === 0) return "Vui lòng chọn ít nhất một lớp để giao bài.";
      
      if (newAssignment.questions.length === 0) return "Bài tập phải có ít nhất một câu hỏi.";

      for (let i = 0; i < newAssignment.questions.length; i++) {
          const q = newAssignment.questions[i];
          if (!q.text.trim()) return `Câu hỏi số ${i + 1} chưa có nội dung.`;
          if (q.type === 'multiple_choice') {
              if (!q.options || q.options.length < 2) return `Câu hỏi số ${i + 1} (Trắc nghiệm) cần ít nhất 2 phương án lựa chọn.`;
              if (q.options.some(opt => !opt.text.trim())) return `Câu hỏi số ${i + 1} có phương án lựa chọn bị trống.`;
              if (!q.options.some(opt => opt.isCorrect)) return `Câu hỏi số ${i + 1} chưa có đáp án đúng được chọn.`;
          }
      }
      return null;
  };

  const handlePublishClick = () => {
    const error = validateForm();
    if (error) {
        setFormError(error);
        return;
    }
    setFormError(null);
    confirmPublishAction(); 
  };

  const handleEditRequest = (e: React.MouseEvent, assignment: StoredAssignment) => {
      e.preventDefault();
      e.stopPropagation();
      
      setEditingId(assignment.id);
      setNewAssignment(JSON.parse(JSON.stringify(assignment))); // Deep copy
      
      setPendingAction('edit_access');
      setSecurityPassword('');
      setSecurityError('');
      setFormError(null);
      
      setShowSecurityModal(true);
  };

  const handleDeleteAssignment = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Use Security Modal for Deletion instead of window.confirm
      setEditingId(id);
      setPendingAction('delete');
      setSecurityPassword('');
      setSecurityError('');
      setShowSecurityModal(true);
  };

  const confirmSecurityCheck = () => {
      if (securityPassword === 'password') {
          if (pendingAction === 'edit_access') {
              setShowSecurityModal(false);
              setView('create');
              setActiveQuestionIndex(0);
          } else if (pendingAction === 'delete') {
              // Execute Delete
              if (editingId) {
                  setAssignments(prev => prev.filter(a => a.id !== editingId));
                  setEditingId(null);
              }
              setShowSecurityModal(false);
          } else {
              // Publish
              confirmPublishAction();
          }
      } else {
          setSecurityError("Mật khẩu giáo viên không đúng.");
      }
  };

  const confirmPublishAction = () => {
      if (editingId) {
          setAssignments(prev => prev.map(a => a.id === editingId ? {
              ...newAssignment,
              id: editingId, 
              status: a.status,
              createdAt: a.createdAt
          } : a));
          alert("Đã cập nhật bài tập thành công!");
      } else {
          const finalAssignment: StoredAssignment = {
            ...newAssignment,
            id: `ASG-${Date.now()}-${generateId()}`,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          setAssignments(prev => [finalAssignment, ...prev]);
          alert("Đã tạo bài tập thành công!");
      }
      
      setShowSecurityModal(false);
      handleCancel();
  };

  const handleExport = (e: React.MouseEvent, type: 'excel' | 'pdf', assignmentTitle: string) => {
      e.preventDefault();
      e.stopPropagation();
      alert(`Đang xuất kết quả bài tập "${assignmentTitle}" dưới dạng ${type.toUpperCase()}...\nFile sẽ tự động tải xuống sau giây lát.`);
  };

  // ... (Keep existing UI render helpers and main return)
  // Re-using existing renderQuestionEditor, view conditions, etc. 
  // Just ensuring imports and validateForm logic are updated.

  const renderQuestionEditor = () => {
    const q = newAssignment.questions[activeQuestionIndex];
    if (!q) return null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded text-sm">Câu {activeQuestionIndex + 1}</span>
            <select 
              value={q.type}
              onChange={(e) => updateQuestion(activeQuestionIndex, 'type', e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-medium"
            >
              <option value="multiple_choice">Trắc nghiệm</option>
              <option value="essay">Tự luận</option>
            </select>
          </div>
          <button 
            onClick={() => deleteQuestion(activeQuestionIndex)}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Xóa câu hỏi này"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold text-gray-700">Nội dung câu hỏi <span className="text-red-500">*</span></label>
          <textarea 
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base min-h-[100px]"
            placeholder="Nhập câu hỏi tại đây..."
            value={q.text}
            onChange={(e) => updateQuestion(activeQuestionIndex, 'text', e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {q.type === 'essay' ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Học sinh sẽ nhìn thấy một ô trống để nhập câu trả lời tự luận.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">Các phương án lựa chọn <span className="text-red-500">*</span></label>
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Chọn (các) đáp án đúng</span>
              </div>
              {q.options?.map((opt, oIdx) => (
                <div key={opt.id} className="flex items-center gap-3 group">
                  <button 
                    onClick={() => toggleOptionCorrect(activeQuestionIndex, oIdx)}
                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      opt.isCorrect 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-gray-300 text-transparent hover:border-emerald-300'
                    }`}
                    title="Đánh dấu đáp án đúng"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">{String.fromCharCode(65 + oIdx)}.</span>
                    <input 
                      type="text" 
                      className={`w-full pl-8 pr-10 py-3 border rounded-xl outline-none transition-all ${
                        opt.isCorrect ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder={`Nhập phương án ${String.fromCharCode(65 + oIdx)}...`}
                      value={opt.text}
                      onChange={(e) => updateOptionText(activeQuestionIndex, oIdx, e.target.value)}
                    />
                    {q.options!.length > 2 && (
                      <button 
                        onClick={() => removeOption(activeQuestionIndex, oIdx)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => addOption(activeQuestionIndex)}
                className="mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center px-2 py-1 rounded hover:bg-indigo-50 w-fit transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm phương án
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredAssignments = assignments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      {/* 1. VIEW: LIST */}
      {view === 'list' && (
        <div className="animate-fade-in pb-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Bài tập</h2>
              <p className="text-gray-500 mt-1">Tạo và quản lý các bài kiểm tra cho các lớp.</p>
            </div>
            <button 
              onClick={handleCreateNew}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center transition-all"
            >
              <Plus className="h-5 w-5 mr-2" /> Tạo bài tập mới
            </button>
          </div>

          {assignments.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                          type="text" 
                          placeholder="Tìm kiếm bài tập..." 
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white appearance-none cursor-pointer">
                          <option>Tất cả trạng thái</option>
                          <option>Đang mở</option>
                          <option>Đã đóng</option>
                      </select>
                  </div>
              </div>
          )}

          {filteredAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssignments.map(asg => (
                      <div key={asg.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
                          <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                      {asg.status === 'active' ? 'Đang mở' : 'Đã đóng'}
                                  </span>
                              </div>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2" title={asg.title}>{asg.title}</h3>
                          
                          <div className="space-y-2 mb-6">
                              <div className="flex items-center text-sm text-gray-500">
                                  <BookOpen className="h-4 w-4 mr-2" /> {MOCK_SUBJECTS.find(s => s.id === asg.subjectId)?.name || 'Chưa chọn môn'}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                  <Timer className="h-4 w-4 mr-2" /> Thời gian: {asg.duration || 45} phút
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 mr-2" /> Hạn nộp: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                  <HelpCircle className="h-4 w-4 mr-2" /> {asg.questions.length} câu hỏi
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                  <Users className="h-4 w-4 mr-2" /> {asg.classIds.length} lớp được giao
                              </div>
                          </div>

                          <div className="mb-4 pt-4 border-t border-dashed border-gray-200 relative z-10">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Xuất kết quả</p>
                              <div className="flex gap-2">
                                  <button 
                                      type="button"
                                      onClick={(e) => handleExport(e, 'excel', asg.title)}
                                      className="flex-1 flex items-center justify-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-100"
                                  >
                                      <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> Excel
                                  </button>
                                  <button 
                                      type="button"
                                      onClick={(e) => handleExport(e, 'pdf', asg.title)}
                                      className="flex-1 flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-100"
                                  >
                                      <FileIcon className="h-3.5 w-3.5 mr-1.5" /> PDF
                                  </button>
                              </div>
                          </div>

                          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center relative z-10 bg-white">
                              <div className="flex -space-x-2 overflow-hidden">
                                  {asg.classIds.slice(0, 3).map(cid => (
                                      <div key={cid} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600" title={MOCK_CLASSES.find(c => c.id === cid)?.name}>
                                          {MOCK_CLASSES.find(c => c.id === cid)?.name.substring(0, 2)}
                                      </div>
                                  ))}
                                  {asg.classIds.length > 3 && (
                                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
                                          +{asg.classIds.length - 3}
                                      </div>
                                  )}
                              </div>
                              
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                      type="button"
                                      onClick={(e) => handleEditRequest(e, asg)}
                                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors z-50 relative cursor-pointer"
                                      title="Chỉnh sửa bài tập"
                                  >
                                      <Pencil className="h-4 w-4" />
                                  </button>
                                  <button 
                                      type="button"
                                      onClick={(e) => handleDeleteAssignment(e, asg.id)}
                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-50 relative cursor-pointer"
                                      title="Xóa bài tập"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutList className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Chưa có bài tập nào</h3>
                  <p className="text-gray-500 text-sm mt-1">
                      {assignments.length > 0 ? "Không tìm thấy kết quả phù hợp." : "Hãy bắt đầu bằng cách tạo bài tập mới cho học sinh."}
                  </p>
              </div>
          )}
        </div>
      )}

      {/* 2. VIEW: CREATE / EDIT FORM */}
      {view === 'create' && (
        <div className="animate-fade-in pb-10 h-[calc(100vh-120px)] flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={handleCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                Hủy bỏ
              </button>
              <button 
                onClick={handlePublishClick}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center transition-all"
              >
                <Send className="h-4 w-4 mr-2" /> {editingId ? 'Lưu thay đổi' : 'Xuất bản'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left: Configuration & Navigation */}
            <div className="w-80 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
              
              {/* ERROR NOTIFICATION */}
              {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm animate-pulse flex items-start gap-2 shadow-sm">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                          <p className="font-bold mb-1">Lỗi kiểm tra dữ liệu</p>
                          <p>{formError}</p>
                      </div>
                  </div>
              )}

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                  <h3 className="font-bold text-gray-800 flex items-center text-sm uppercase tracking-wide"><LayoutList className="h-4 w-4 mr-2"/> Cấu hình chung</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiêu đề bài tập <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      placeholder="VD: Kiểm tra 15 phút Toán"
                      value={newAssignment.title}
                      onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Môn học <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select 
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                        value={newAssignment.subjectId}
                        onChange={e => setNewAssignment({...newAssignment, subjectId: e.target.value})}
                      >
                        <option value="">-- Chọn môn --</option>
                        {mySubjects.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thời gian làm bài (phút) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="number" 
                        min="1"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: 45"
                        value={newAssignment.duration}
                        onChange={e => setNewAssignment({...newAssignment, duration: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hạn nộp bài <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="date" 
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newAssignment.dueDate}
                        onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu truy cập (HS) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        placeholder="VD: 123456"
                        value={newAssignment.passwordAccess}
                        onChange={e => setNewAssignment({...newAssignment, passwordAccess: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Giao cho lớp <span className="text-red-500">*</span></label>
                        {myClasses.length > 0 && (
                            <button 
                                onClick={handleSelectAllClasses}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                                {newAssignment.classIds.length === myClasses.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                        )}
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar border border-gray-100 rounded-lg p-2 bg-gray-50">
                      {myClasses.map(cls => (
                        <label key={cls.id} className="flex items-center p-2 rounded hover:bg-white hover:shadow-sm cursor-pointer transition-all">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${newAssignment.classIds.includes(cls.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                              {newAssignment.classIds.includes(cls.id) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={newAssignment.classIds.includes(cls.id)} onChange={() => handleClassToggle(cls.id)} />
                            <div>
                              <div className="text-sm font-bold text-gray-800">{cls.name}</div>
                              <div className="text-[10px] text-gray-500">Sĩ số: {cls.studentCount}</div>
                            </div>
                        </label>
                      ))}
                      {myClasses.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Không có lớp được phân công.</p>}
                    </div>
                  </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 flex items-center text-sm uppercase tracking-wide mb-4"><HelpCircle className="h-4 w-4 mr-2"/> Danh sách câu hỏi</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {newAssignment.questions.map((q, idx) => (
                      <button 
                        key={q.id}
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all relative ${
                            activeQuestionIndex === idx 
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                            : 'bg-white border-gray-100 hover:border-gray-300'
                        }`}
                      >
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-bold uppercase ${activeQuestionIndex === idx ? 'text-indigo-600' : 'text-gray-500'}`}>Câu {idx + 1}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                {q.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-1 truncate pr-4">{q.text || 'Chưa nhập nội dung...'}</p>
                          {activeQuestionIndex === idx && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-l-full"></div>
                          )}
                      </button>
                    ))}
                    
                    <button 
                      onClick={addQuestion}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold text-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Thêm câu hỏi
                    </button>
                  </div>
              </div>
            </div>

            <div className="flex-1 pb-10">
              {renderQuestionEditor()}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL (Always reachable) */}
      {showSecurityModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in w-screen h-screen">
           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${pendingAction === 'delete' ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    {pendingAction === 'delete' ? <AlertTriangle className="h-8 w-8 text-red-600" /> : <Lock className="h-8 w-8 text-indigo-600" />}
                 </div>
                 <h3 className={`text-xl font-bold ${pendingAction === 'delete' ? 'text-red-600' : 'text-gray-900'}`}>
                    {pendingAction === 'publish' ? 'Xác nhận xuất bản' : 
                     pendingAction === 'edit_access' ? 'Xác thực chỉnh sửa' : 
                     'Xác nhận xóa bài tập'}
                 </h3>
                 <p className="text-gray-500 text-sm mt-2">
                    {pendingAction === 'publish' 
                        ? <>Vui lòng nhập mật khẩu giáo viên để xác nhận tạo bài tập này cho <strong>{newAssignment.classIds.length} lớp</strong>.</>
                        : pendingAction === 'delete' 
                            ? <>Hành động này không thể hoàn tác. Vui lòng nhập mật khẩu để xác nhận xóa vĩnh viễn.</>
                            : <>Vui lòng nhập mật khẩu để truy cập và chỉnh sửa nội dung bài tập.</>
                    }
                 </p>
              </div>

              <div className="space-y-4">
                 <div>
                    <input 
                       type="password" 
                       className={`w-full px-4 py-3 border rounded-xl outline-none text-center tracking-widest text-lg font-bold ${pendingAction === 'delete' ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'}`}
                       placeholder="••••••"
                       value={securityPassword}
                       onChange={(e) => setSecurityPassword(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && confirmSecurityCheck()}
                       autoFocus
                    />
                    {securityError && <p className="text-red-500 text-xs mt-2 text-center flex items-center justify-center"><AlertTriangle className="h-3 w-3 mr-1"/> {securityError}</p>}
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setShowSecurityModal(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">Hủy</button>
                    <button 
                        onClick={confirmSecurityCheck} 
                        className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${
                            pendingAction === 'delete' 
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                        }`}
                    >
                        {pendingAction === 'delete' ? 'Xóa ngay' : 'Xác nhận'}
                    </button>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}
    </>
  );
};
