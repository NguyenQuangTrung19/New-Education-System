
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, ClassGroup, LearningMaterial } from '../types';
import { 
  FolderOpen, Package, Plus, Search, FileText, Video, Link, 
  Download, Trash2, X, UploadCloud, ChevronRight, ArrowLeft,
  Home, Users, Check, Pencil, AlertTriangle
} from 'lucide-react';

// --- External Modal Components ---

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (e: React.FormEvent) => void;
  data: { name: string; description: string };
  setData: (data: { name: string; description: string }) => void;
  officialClasses: ClassGroup[];
  selectedClassIds: string[];
  onToggleClass: (id: string) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  onClose, onCreate, data, setData, officialClasses, selectedClassIds, onToggleClass 
}) => {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Tạo Kho Tài Liệu Mới</h3>
            <p className="text-sm text-gray-500 mb-4">Tạo kho lưu trữ cho nhóm học tập, CLB hoặc tài liệu cá nhân.</p>
            
            <form onSubmit={onCreate} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên Kho / Nhóm <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: Đội tuyển Toán 10"
                        value={data.name}
                        onChange={e => setData({...data, name: e.target.value})}
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Áp dụng cho lớp <span className="text-red-500">*</span></label>
                    <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar bg-gray-50">
                        {officialClasses.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {officialClasses.map(cls => (
                                    <div 
                                        key={cls.id}
                                        onClick={() => onToggleClass(cls.id)}
                                        className={`flex items-center p-2 rounded-lg cursor-pointer border transition-all ${
                                            selectedClassIds.includes(cls.id) 
                                            ? 'bg-indigo-50 border-indigo-200' 
                                            : 'bg-white border-gray-200 hover:border-indigo-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors ${
                                            selectedClassIds.includes(cls.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white'
                                        }`}>
                                            {selectedClassIds.includes(cls.id) && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <span className={`text-sm font-medium ${selectedClassIds.includes(cls.id) ? 'text-indigo-700' : 'text-gray-700'}`}>
                                            {cls.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-2">Bạn chưa được phân công lớp nào.</p>
                        )}
                    </div>
                    {selectedClassIds.length === 0 && <p className="text-xs text-red-500 mt-1">* Vui lòng chọn ít nhất 1 lớp.</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mô tả ngắn</label>
                    <textarea 
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                        placeholder="Mô tả mục đích của kho tài liệu này..."
                        value={data.description}
                        onChange={e => setData({...data, description: e.target.value})}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Hủy</button>
                    <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">Tạo mới</button>
                </div>
            </form>
        </div>
    </div>,
    document.body
  );
};

interface ResourceModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  docData: { title: string; description: string; type: 'pdf' | 'video' | 'link' | 'doc'; url: string; };
  setDocData: (doc: any) => void;
  isEditing: boolean;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ onClose, onSubmit, docData, setDocData, isEditing }) => {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scale-in">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
           <h3 className="font-bold text-lg flex items-center">
             {isEditing ? <Pencil className="h-5 w-5 mr-2"/> : <UploadCloud className="h-5 w-5 mr-2"/>} 
             {isEditing ? 'Cập nhật tài liệu' : 'Đăng tải tài liệu'}
           </h3>
           <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition"><X className="h-5 w-5"/></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên tài liệu <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="VD: Bài giảng chương 1"
                value={docData.title}
                onChange={e => setDocData({...docData, title: e.target.value})}
              />
           </div>
           
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Loại tài liệu</label>
              <div className="grid grid-cols-4 gap-2">
                 {['pdf', 'doc', 'video', 'link'].map((t) => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setDocData({...docData, type: t as any})}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        docData.type === t 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                       <span className="uppercase text-xs font-bold">{t}</span>
                    </button>
                 ))}
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mô tả chi tiết</label>
              <textarea 
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
                placeholder="Nhập nội dung mô tả hoặc hướng dẫn..."
                value={docData.description}
                onChange={e => setDocData({...docData, description: e.target.value})}
              />
           </div>

           {!isEditing && (
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                <UploadCloud className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Kéo thả file hoặc nhấn để chọn</span>
                <span className="text-xs mt-1 text-gray-300">(Chức năng mô phỏng)</span>
             </div>
           )}

           <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all">
              {isEditing ? 'Lưu thay đổi' : 'Tải lên ngay'}
           </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

// --- Custom Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => {
    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 shadow-sm border border-red-200">
                    <Trash2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa tài liệu?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Bạn có chắc chắn muốn xóa tài liệu này không? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={onCancel} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                    >
                        Xóa ngay
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Main Component ---

interface TeacherResourcesProps {
  currentUser: User;
}

export const TeacherResources: React.FC<TeacherResourcesProps> = ({ currentUser }) => {
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  
  // -- State Persistence for Materials --
  const [materials, setMaterials] = useState<LearningMaterial[]>(() => {
      try {
          const saved = localStorage.getItem('learning_materials');
          // If no local data, use MOCK_MATERIALS as default base
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Data corruption in materials, resetting.", e);
          return [];
      }
  });

  // Persist changes to localStorage whenever materials change
  useEffect(() => {
      localStorage.setItem('learning_materials', JSON.stringify(materials));
  }, [materials]);
  
  // State for Resource Modal (Add/Edit)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  
  // State for Create Group Modal
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '' });
  const [newGroupClasses, setNewGroupClasses] = useState<string[]>([]); // Selected classes for the new group
  
  // State for Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // State for Custom Groups (Manually created by teacher)
  const [customGroups, setCustomGroups] = useState<ClassGroup[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  // Form State for Document Upload/Edit
  const initialDocState = {
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'video' | 'link' | 'doc',
    url: '#'
  };
  const [docFormData, setDocFormData] = useState(initialDocState);

  // 1. Get Official Classes (Homeroom + Teaching Classes)
  const officialClasses = useMemo(() => [], []);

  // 2. Combine Official + Custom for Display
  const allResourceBoxes = useMemo(() => {
      return [...customGroups, ...officialClasses];
  }, [officialClasses, customGroups]);

  // Filter materials for selected class
  const classMaterials = useMemo(() => {
    if (!selectedClass) return [];
    return materials.filter(m => m.classId === selectedClass.id);
  }, [selectedClass, materials]);

  // --- Handlers ---

  const handleCreateGroup = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGroupData.name) return;

      if (newGroupClasses.length === 0) {
          alert("Vui lòng chọn ít nhất một lớp áp dụng cho kho tài liệu này.");
          return;
      }

      // Store linked class names in notes for display purposes
      const linkedClassNames = officialClasses
          .filter(c => newGroupClasses.includes(c.id))
          .map(c => `Linked: ${c.name}`);

      const newGroup: ClassGroup = {
          id: `CUSTOM-${Date.now()}`,
          name: newGroupData.name,
          description: newGroupData.description,
          teacherId: currentUser.id,
          // Fill required fields with dummies since they aren't real classes
          gradeLevel: 0,
          room: 'Virtual',
          academicYear: '2025-2026',
          studentCount: 0,
          maleStudentCount: 0,
          femaleStudentCount: 0,
          averageGpa: 0,
          currentWeeklyScore: 0,
          weeklyScoreHistory: [],
          notes: ['Custom Resource Group', ...linkedClassNames]
      };

      setCustomGroups([newGroup, ...customGroups]);
      setIsCreateGroupModalOpen(false);
      setNewGroupData({ name: '', description: '' });
      setNewGroupClasses([]);
  };

  const toggleClassSelection = (classId: string) => {
      setNewGroupClasses(prev => 
          prev.includes(classId) 
              ? prev.filter(id => id !== classId) 
              : [...prev, classId]
      );
  };

  const handleDeleteGroup = (e: React.MouseEvent, groupId: string) => {
      e.stopPropagation();
      if (window.confirm("Bạn có chắc chắn muốn xóa kho tài liệu này? Tất cả tài liệu bên trong sẽ bị mất.")) {
          setCustomGroups(prev => prev.filter(g => g.id !== groupId));
          // Also cleanup materials
          setMaterials(prev => prev.filter(m => m.classId !== groupId));
      }
  };

  const openAddModal = () => {
      setEditingMaterialId(null);
      setDocFormData(initialDocState);
      setIsResourceModalOpen(true);
  };

  const openEditModal = (material: LearningMaterial) => {
      setEditingMaterialId(material.id);
      setDocFormData({
          title: material.title,
          description: material.description || '',
          type: material.type,
          url: material.url
      });
      setIsResourceModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !docFormData.title) return;

    if (editingMaterialId) {
        // Edit Mode
        setMaterials(prev => prev.map(m => m.id === editingMaterialId ? {
            ...m,
            title: docFormData.title,
            description: docFormData.description,
            type: docFormData.type
        } : m));
    } else {
        // Add Mode
        const subjectId = 'SUB1'; // Defaulting for mock
        const newMaterial: LearningMaterial = {
            id: `DOC-${Date.now()}`,
            classId: selectedClass.id,
            subjectId: subjectId,
            title: docFormData.title,
            description: docFormData.description,
            type: docFormData.type,
            url: docFormData.url,
            uploadDate: new Date().toISOString().split('T')[0]
        };
        // Use functional update to ensure we have the latest state
        setMaterials(prev => [newMaterial, ...prev]);
    }

    setIsResourceModalOpen(false);
    setDocFormData(initialDocState);
  };

  // --- DELETE LOGIC ---
  const requestDeleteMaterial = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setItemToDelete(id);
  };

  const confirmDeleteMaterial = () => {
    if (itemToDelete) {
        const idToDelete = String(itemToDelete);
        setMaterials(prev => prev.filter(m => String(m.id) !== idToDelete));
        setItemToDelete(null);
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-6 w-6 text-blue-500" />;
      case 'link': return <Link className="h-6 w-6 text-indigo-500" />;
      case 'doc': return <FileText className="h-6 w-6 text-orange-500" />;
      default: return <FileText className="h-6 w-6 text-red-500" />;
    }
  };

  // --- Main View: Class Boxes ---
  if (!selectedClass) {
    return (
      <div className="animate-fade-in pb-10">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Kho Tài Liệu</h2>
            <p className="text-gray-500 mt-1">Quản lý các kho tài liệu lớp học và nhóm chuyên môn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
           {/* CREATE NEW BOX BUTTON */}
           <div 
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="relative h-64 w-full rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
           >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="font-bold text-gray-600 group-hover:text-indigo-600">Tạo Kho Mới</h3>
              <p className="text-xs text-gray-400 mt-1">Cho nhóm học tập hoặc CLB</p>
           </div>

           {allResourceBoxes.map(cls => {
             const isHomeroom = cls.teacherId === currentUser.id && !cls.id.startsWith('CUSTOM');
             const isCustom = cls.id.startsWith('CUSTOM');
             const isTeaching = !isHomeroom && !isCustom;

             // Extract linked classes from notes for custom groups
             const linkedClasses = isCustom 
                ? cls.notes?.filter(n => n.startsWith('Linked: ')).map(n => n.replace('Linked: ', '')) 
                : [];

             let boxColor = 'bg-indigo-100'; // Default Teaching
             let flapColor = 'bg-indigo-50 border-indigo-200';
             let backColor = 'bg-indigo-200 border-indigo-300';
             let badgeColor = 'text-indigo-700 bg-indigo-200/50';

             if (isHomeroom) {
                 boxColor = 'bg-amber-100';
                 flapColor = 'bg-amber-50 border-amber-200';
                 backColor = 'bg-amber-200 border-amber-300';
                 badgeColor = 'text-amber-700 bg-amber-200/50';
             } else if (isCustom) {
                 boxColor = 'bg-emerald-100';
                 flapColor = 'bg-emerald-50 border-emerald-200';
                 backColor = 'bg-emerald-200 border-emerald-300';
                 badgeColor = 'text-emerald-700 bg-emerald-200/50';
             }

             return (
             <div 
               key={cls.id}
               onClick={() => setSelectedClass(cls)}
               className="relative group cursor-pointer perspective-1000"
             >
                {/* The Box Visual */}
                <div className="relative h-64 w-full transition-transform duration-500 transform group-hover:-translate-y-2 group-hover:rotate-1">
                   {/* Back of box */}
                   <div className={`absolute inset-0 rounded-2xl transform translate-x-2 translate-y-2 border-2 ${backColor}`}></div>
                   
                   {/* Main Box Body */}
                   <div className={`absolute inset-0 rounded-2xl border-4 border-white shadow-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden ${boxColor}`}>
                      
                      {/* Delete Custom Group Button */}
                      {isCustom && (
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteGroup(e, cls.id)}
                            className="absolute top-2 right-2 p-1.5 text-emerald-700/50 hover:text-red-500 hover:bg-white/50 rounded-full transition-colors z-20"
                            title="Xóa kho này"
                          >
                              <X className="h-4 w-4" />
                          </button>
                      )}

                      {/* Box Label/Sticker */}
                      <div className="bg-white border-2 border-gray-200 p-4 w-full transform -rotate-2 shadow-sm mb-4 relative flex flex-col justify-center min-h-[80px]">
                         {isHomeroom && (
                             <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center transform rotate-12">
                                 <Home className="h-3 w-3 mr-1" /> CN
                             </div>
                         )}
                         {isCustom && (
                             <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center transform rotate-12">
                                 <Users className="h-3 w-3 mr-1" /> Nhóm
                             </div>
                         )}
                         
                         <h3 className="text-2xl font-black text-gray-800 tracking-tighter line-clamp-2">{cls.name}</h3>
                         {!isCustom && <p className="text-xs font-bold text-gray-400 uppercase mt-1">Năm học {cls.academicYear}</p>}
                         
                         {/* Display Linked Classes for Custom Groups */}
                         {isCustom && linkedClasses && linkedClasses.length > 0 && (
                             <div className="flex flex-wrap justify-center gap-1 mt-2">
                                 {linkedClasses.slice(0, 2).map((lname, i) => (
                                     <span key={i} className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 truncate max-w-[60px]">
                                         {lname}
                                     </span>
                                 ))}
                                 {linkedClasses.length > 2 && <span className="text-[9px] font-bold text-gray-400">+{linkedClasses.length - 2}</span>}
                             </div>
                         )}
                      </div>
                      
                      <div className={`mt-auto flex items-center font-bold text-sm px-3 py-1 rounded-full ${badgeColor}`}>
                         <Package className="h-4 w-4 mr-2" />
                         {materials.filter(m => m.classId === cls.id).length} Tài liệu
                      </div>
                   </div>

                   {/* Box Flap Effect */}
                   <div className={`absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl opacity-50 pointer-events-none border-b ${flapColor}`}></div>
                </div>
                
                {/* Floor Shadow */}
                <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/10 blur-xl rounded-[50%] transition-all group-hover:scale-90 group-hover:opacity-50"></div>
             </div>
           )})}
        </div>
        
        {isCreateGroupModalOpen && (
            <CreateGroupModal 
                onClose={() => setIsCreateGroupModalOpen(false)}
                onCreate={handleCreateGroup}
                data={newGroupData}
                setData={setNewGroupData}
                officialClasses={officialClasses}
                selectedClassIds={newGroupClasses}
                onToggleClass={toggleClassSelection}
            />
        )}
      </div>
    );
  }

  // --- Class Detail View (Inside the Box) ---
  return (
    <div className="animate-fade-in pb-10 h-[calc(100vh-100px)] flex flex-col">
       {/* Breadcrumb / Header */}
       <div className="flex items-center gap-4 mb-6 shrink-0">
          <button 
            type="button"
            onClick={() => setSelectedClass(null)} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-gray-600"
          >
             <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <span className="hover:text-indigo-600 cursor-pointer" onClick={() => setSelectedClass(null)}>Kho Tài Liệu</span>
             <ChevronRight className="h-4 w-4" />
             <span className={`font-bold text-gray-900 px-2 py-0.5 rounded border ${
                 selectedClass.id.startsWith('CUSTOM') ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                 selectedClass.teacherId === currentUser.id ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                 'bg-indigo-100 text-indigo-800 border-indigo-200'
             }`}>
                 {selectedClass.name}
             </span>
          </div>
          
          <div className="ml-auto flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm tài liệu..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                type="button"
                onClick={openAddModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center transition-all text-sm"
             >
                <Plus className="h-5 w-5 mr-2" /> Thêm tài liệu
             </button>
          </div>
       </div>

       {/* Files Grid */}
       <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-6 overflow-y-auto custom-scrollbar relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none"></div>

          {classMaterials.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                {classMaterials.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase())).map(doc => (
                   <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                      
                      <div className="flex justify-between items-start mb-4 pl-2">
                         <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-indigo-50 transition-colors`}>
                            {getIconByType(doc.type)}
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openEditModal(doc); }}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                            >
                               <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => requestDeleteMaterial(e, doc.id)} 
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa"
                            >
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 pl-2">{doc.title}</h4>
                      {doc.description && <p className="text-xs text-gray-500 mb-4 line-clamp-2 pl-2 flex-1">{doc.description}</p>}
                      
                      <div className="mt-auto pl-2 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                         <span>{doc.uploadDate}</span>
                         <button type="button" className="flex items-center text-indigo-600 font-bold hover:underline">
                            <Download className="h-3 w-3 mr-1" /> Tải về
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                   <FolderOpen className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-600">Hộp tài liệu trống</h3>
                <p className="text-sm">Hãy nhấn nút "Thêm tài liệu" để bắt đầu.</p>
             </div>
          )}
       </div>

       {isResourceModalOpen && (
            <ResourceModal 
                onClose={() => setIsResourceModalOpen(false)}
                onSubmit={handleSaveMaterial}
                docData={docFormData}
                setDocData={setDocFormData}
                isEditing={!!editingMaterialId}
            />
       )}

       {/* Confirm Delete Modal */}
       {itemToDelete && (
           <DeleteConfirmationModal 
               onConfirm={confirmDeleteMaterial}
               onCancel={() => setItemToDelete(null)}
           />
       )}
    </div>
  );
};
