
import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';
import { Teachers } from './pages/Teachers';
import { Students } from './pages/Students';
import { Classes } from './pages/Classes';
import { Subjects } from './pages/Subjects';
import { Timetable } from './pages/Timetable';
import { Profile } from './pages/Profile';
import { NotificationsPage } from './pages/Notifications';
import { MyClasses } from './pages/MyClasses';
import { StudentClass } from './pages/StudentClass';
import { Rules } from './pages/Rules';
import { StudentResults } from './pages/StudentResults';
import { TeacherAssignments } from './pages/TeacherAssignments';
import { TeacherResources } from './pages/TeacherResources';
import { Leaderboard } from './pages/Leaderboard';
import { Tuition } from './pages/Tuition'; 
import { AdminTuition } from './pages/AdminTuition'; 
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UserRole, User, Notification } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { MOCK_NOTIFICATIONS } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [navParams, setNavParams] = useState<any>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse

  const { t } = useLanguage();

  // Auth flow
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowWelcome(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowWelcome(false);
    setCurrentPage('dashboard');
    setNavParams(null);
  };

  const handleWelcomeComplete = (targetPage?: string) => {
    setShowWelcome(false);
    if (targetPage && typeof targetPage === 'string') {
      setCurrentPage(targetPage);
    }
  };

  // Close sidebar on mobile when navigating
  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    if (params) {
      setNavParams(params);
    } else {
      setNavParams(null); // Clear params if not provided
    }
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Handle User Update from Profile Page
  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Notification Handlers
  const handleMarkAsRead = (id?: string) => {
    if (id) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (showWelcome) {
    return <Welcome onComplete={handleWelcomeComplete} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} notifications={notifications} currentUser={currentUser} />;
      case 'teachers': return <Teachers currentUser={currentUser} />;
      case 'students': return <Students currentUser={currentUser} />;
      case 'classes': return <Classes currentUser={currentUser} />;
      case 'subjects': return <Subjects currentUser={currentUser} />;
      case 'timetable': return <Timetable currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'profile': return <Profile user={currentUser!} onUpdateUser={handleUpdateUser} />;
      case 'notifications': return (
        <NotificationsPage 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteNotification}
        />
      );
      case 'my-classes': return <MyClasses currentUser={currentUser!} initialClassId={navParams?.classId} />;
      case 'teacher-assignments': return <TeacherAssignments currentUser={currentUser!} />;
      case 'teacher-resources': return <TeacherResources currentUser={currentUser!} />;
      case 'student-class': return <StudentClass currentUser={currentUser!} />;
      case 'rules': return <Rules />;
      case 'student-results': return <StudentResults currentUser={currentUser!} />;
      case 'leaderboard': return <Leaderboard currentUser={currentUser!} />;
      case 'tuition': return <Tuition currentUser={currentUser!} />;
      case 'admin-tuition': return <AdminTuition currentUser={currentUser!} />;
      default: return <Dashboard onNavigate={handleNavigate} notifications={notifications} currentUser={currentUser} />;
    }
  };

  const getPageTitle = () => {
    switch(currentPage) {
      case 'dashboard': return t('menu.dashboard');
      case 'teachers': return t('menu.teachers');
      case 'students': return t('menu.students');
      case 'classes': return t('menu.classes');
      case 'subjects': return t('menu.subjects');
      case 'timetable': return t('menu.timetable');
      case 'profile': return t('menu.profile') || 'My Profile'; 
      case 'notifications': return t('menu.notifications');
      case 'my-classes': return t('menu.myClasses');
      case 'teacher-assignments': return 'Tạo & Quản lý Bài tập';
      case 'teacher-resources': return 'Kho Tài Liệu';
      case 'student-class': return 'Lớp của tôi';
      case 'rules': return 'Nội Quy';
      case 'student-results': return 'Kết Quả Học Tập';
      case 'leaderboard': return t('menu.leaderboard') || 'Bảng Xếp Hạng';
      case 'tuition': return t('menu.tuition') || 'Học phí & Dịch vụ';
      case 'admin-tuition': return t('menu.adminTuition') || 'Quản lý Học phí';
      default: return 'EduSphere';
    }
  };

  return (
    <div className="flex h-screen bg-cloud-dancer overflow-hidden">
      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-teal-900/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activePage={currentPage} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <div 
        className={`flex-1 flex flex-col h-full w-full transition-[padding-left] duration-500 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-[88px]' : 'md:pl-[280px]'
        }`}
      >
        <Header 
          user={currentUser} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={getPageTitle()}
          onProfileClick={() => handleNavigate('profile')}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
