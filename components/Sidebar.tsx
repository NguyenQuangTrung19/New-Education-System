
import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  LogOut,
  School,
  Presentation,
  ChevronLeft,
  ChevronRight,
  Bell,
  Briefcase,
  FileText,
  Award,
  ScrollText,
  FileQuestion,
  FolderOpen,
  Trophy,
  CreditCard,
  Settings
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User, UserRole } from '../types';
import { SCHOOL_INFO } from '../constants';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onLogout: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  currentUser?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate, 
  isOpen, 
  onLogout,
  isCollapsed,
  toggleCollapse,
  currentUser
}) => {
  const { t } = useLanguage();
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    let items = [];

    const dashboardItem = { id: 'dashboard', label: t('menu.dashboard'), icon: LayoutDashboard };
    const leaderboardItem = { id: 'leaderboard', label: t('menu.leaderboard'), icon: Trophy };
    const timetableItem = { id: 'timetable', label: t('menu.timetable'), icon: CalendarDays };
    const notificationsItem = { id: 'notifications', label: t('menu.notifications'), icon: Bell };

    if (currentUser?.role === UserRole.STUDENT) {
      items = [
        dashboardItem,
        { id: 'student-class', label: 'Lớp của tôi', icon: School },
        timetableItem,
        { id: 'student-results', label: 'Kết quả học tập', icon: Award },
        { id: 'tuition', label: t('menu.tuition'), icon: CreditCard },
        leaderboardItem,
        { id: 'rules', label: 'Nội quy', icon: ScrollText },
        notificationsItem,
      ];
    } else {
      items = [
        dashboardItem,
        { id: 'teachers', label: t('menu.teachers'), icon: Presentation },
        { id: 'students', label: t('menu.students'), icon: Users },
        { id: 'classes', label: t('menu.classes'), icon: School },
        { id: 'subjects', label: t('menu.subjects'), icon: BookOpen },
        timetableItem,
        leaderboardItem,
        notificationsItem,
      ];

      if (currentUser?.role === UserRole.TEACHER) {
        const myClassesItem = { id: 'my-classes', label: t('menu.myClasses'), icon: Briefcase };
        const assignmentsItem = { id: 'teacher-assignments', label: 'Quản lý Bài tập', icon: FileQuestion };
        const resourcesItem = { id: 'teacher-resources', label: 'Kho Tài Liệu', icon: FolderOpen };
        items.splice(1, 0, myClassesItem, assignmentsItem, resourcesItem);
      }

      if (currentUser?.role === UserRole.ADMIN) {
          const adminTuitionItem = { id: 'admin-tuition', label: t('menu.adminTuition'), icon: CreditCard };
          items.splice(3, 0, adminTuitionItem);
      }
    }

    setMenuItems(items);
  }, [currentUser, t]);

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-500 ease-in-out flex flex-col border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.1)] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 ${isCollapsed ? 'w-[88px]' : 'w-[280px]'}`}
      style={{
        // Use the CSS variable that changes based on theme data attribute
        background: 'var(--bg-sidebar)' 
      }}
    >
      {/* Header Logo Area */}
      <div className={`h-24 flex items-center relative ${isCollapsed ? 'justify-center px-0' : 'px-8'}`}>
        <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-white blur-xl opacity-30 rounded-full group-hover:opacity-50 transition-opacity"></div>
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg ring-2 ring-white/40 relative z-10">
              <img 
                src={SCHOOL_INFO.logo} 
                onError={(e) => {e.currentTarget.src = SCHOOL_INFO.logoFallback}}
                alt="Logo" 
                className="h-8 w-8 object-contain" 
              />
            </div>
        </div>
        
        {!isCollapsed && (
          <div className="ml-4 flex flex-col justify-center animate-fade-in-up">
            <span className="font-extrabold text-xl tracking-tight text-white leading-none font-sans drop-shadow-sm truncate max-w-[150px]">{SCHOOL_INFO.name}</span>
            <span className="text-[11px] text-white/90 font-bold uppercase tracking-widest mt-1">Management</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center py-3.5 rounded-2xl transition-all duration-300 group relative ${
                isCollapsed ? 'justify-center px-0' : 'px-4'
              } ${
                isActive 
                  ? 'bg-white text-indigo-600 shadow-[0_4px_15px_rgba(0,0,0,0.1)] font-bold' 
                  : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
              }`}
            >
              {isActive && !isCollapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-muted-coral"></div>
              )}

              <Icon 
                className={`h-[22px] w-[22px] shrink-0 transition-all duration-300 ${
                    isActive ? 'text-indigo-600 scale-110' : 'group-hover:scale-110'
                } ${!isCollapsed ? 'mr-3.5' : ''}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              {!isCollapsed && (
                  <span className={`text-[14px] tracking-wide truncate ${isActive ? '' : ''}`}>
                      {item.label}
                  </span>
              )}
              
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-xl translate-x-2 group-hover:translate-x-0 hidden md:block">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Settings / Toggle */}
      <div className="p-4 border-t border-white/20 bg-black/5 backdrop-blur-sm space-y-2">
         {/* Settings Button */}
         <button 
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 group ${
             isCollapsed ? 'justify-center px-0' : 'px-4'
          } ${activePage === 'settings' ? 'bg-white/20 text-white font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
        >
          <Settings className={`h-5 w-5 shrink-0 transition-transform group-hover:rotate-90 ${!isCollapsed ? 'mr-3' : ''}`} />
          {!isCollapsed && <span className="text-sm">{t('menu.settings')}</span>}
        </button>

         {/* Logout */}
        <button 
          onClick={onLogout}
          className={`w-full flex items-center py-3 rounded-xl text-white/80 hover:bg-white/15 hover:text-white transition-all duration-300 group ${
             isCollapsed ? 'justify-center px-0' : 'px-4'
          }`}
        >
          <LogOut className={`h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1 ${!isCollapsed ? 'mr-3' : ''}`} />
          {!isCollapsed && <span className="text-sm font-bold">{t('menu.signout')}</span>}
        </button>

        {/* Collapse Toggle - Desktop Only */}
        <button 
           onClick={toggleCollapse}
           className="hidden md:flex w-full mt-2 items-center justify-center py-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
           {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
