
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Menu, Search, UserCircle, 
  CheckCircle, AlertTriangle, Info, Check, BellRing 
} from 'lucide-react';
import { User, Notification } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  user: User | null;
  toggleSidebar: () => void;
  title: string;
  onProfileClick?: () => void;
  notifications: Notification[];
  onMarkAsRead: (id?: string) => void;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  toggleSidebar, 
  title, 
  onProfileClick,
  notifications,
  onMarkAsRead,
  onNavigate
}) => {
  const { t } = useLanguage();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewAll = () => {
    setIsNotificationsOpen(false);
    onNavigate('notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'alert': return <BellRing className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50';
      case 'warning': return 'bg-amber-50';
      case 'alert': return 'bg-rose-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden mr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 capitalize hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder={t('header.search')} 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48 lg:w-64 transition-all"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in origin-top-right">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                <h3 className="font-bold text-gray-900">{t('notifications.title')}</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => onMarkAsRead()} 
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" /> {t('notifications.markAllRead')}
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((note) => (
                      <div 
                        key={note.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!note.read ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => onMarkAsRead(note.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(note.type)}`}>
                            {getNotificationIcon(note.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm font-semibold truncate ${!note.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {note.title}
                              </p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{note.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {note.message}
                            </p>
                          </div>
                          {!note.read && (
                            <div className="self-center">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">{t('notifications.noData')}</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                <button 
                  onClick={handleViewAll}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors w-full py-1"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pl-4 border-l border-gray-200">
          <button 
            onClick={onProfileClick}
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-100"
            title="View Profile"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || t('header.admin')}</p>
              <p className="text-xs text-gray-500">{user?.role || t('header.role')}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 ring-2 ring-white shadow-sm overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-8 w-8" />
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
