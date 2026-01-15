
import React, { useState } from 'react';
import { Notification } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CheckCircle, AlertTriangle, Info, BellRing, 
  Trash2, Check, Filter, Calendar, ChevronDown 
} from 'lucide-react';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkAsRead: (id?: string) => void;
  onDelete: (id: string) => void;
}

type TimeFilter = 'all_time' | 'today' | 'week' | 'month' | 'year';

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
  notifications, 
  onMarkAsRead,
  onDelete
}) => {
  const { t } = useLanguage();
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all_time');

  const filteredNotifications = notifications.filter(n => {
    // Read Status Filter
    if (readFilter === 'unread' && n.read) return false;

    // Time Filter
    if (timeFilter !== 'all_time') {
        const date = new Date(n.timestamp);
        const now = new Date();
        
        // Reset times for date comparison
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (timeFilter === 'today') {
            if (date < startOfToday) return false;
        } else if (timeFilter === 'week') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (date < oneWeekAgo) return false;
        } else if (timeFilter === 'month') {
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            if (date < oneMonthAgo) return false;
        } else if (timeFilter === 'year') {
             const startOfYear = new Date(now.getFullYear(), 0, 1);
             if (date < startOfYear) return false;
        }
    }

    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-6 w-6 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'alert': return <BellRing className="h-6 w-6 text-rose-500" />;
      default: return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'alert': return 'bg-rose-50 border-rose-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('notifications.title')}</h2>
          <p className="text-gray-500 mt-1">{t('notifications.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => onMarkAsRead()} 
             className="px-4 py-2 bg-white border border-gray-200 text-indigo-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm flex items-center"
           >
             <Check className="h-4 w-4 mr-2" /> {t('notifications.markAllRead')}
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
         <div className="flex items-center gap-2">
             <button 
                onClick={() => setReadFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${readFilter === 'all' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             >
                {t('notifications.all')}
             </button>
             <button 
                onClick={() => setReadFilter('unread')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${readFilter === 'unread' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             >
                {t('notifications.unread')}
             </button>
         </div>

         <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
               className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer text-gray-700 font-medium min-w-[160px]"
               value={timeFilter}
               onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            >
               <option value="all_time">All Time</option>
               <option value="today">Today</option>
               <option value="week">This Week</option>
               <option value="month">This Month</option>
               <option value="year">This Year</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
         </div>
      </div>

      {/* List */}
      <div className="space-y-3">
         {filteredNotifications.length > 0 ? (
            filteredNotifications.map(note => (
               <div 
                  key={note.id} 
                  className={`relative p-5 rounded-2xl border transition-all duration-200 flex gap-4 group ${
                     !note.read ? 'bg-white shadow-md border-indigo-100 ring-1 ring-indigo-50' : 'bg-gray-50 border-gray-100 opacity-80 hover:opacity-100 hover:bg-white'
                  }`}
               >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(note.type).split(' ')[0]}`}>
                     {getNotificationIcon(note.type)}
                  </div>
                  
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h4 className={`text-base font-bold ${!note.read ? 'text-gray-900' : 'text-gray-700'}`}>{note.title}</h4>
                        <span className="flex items-center text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100">
                           <Calendar className="h-3 w-3 mr-1" /> {note.time}
                        </span>
                     </div>
                     <p className={`mt-1 text-sm ${!note.read ? 'text-gray-600' : 'text-gray-500'}`}>{note.message}</p>
                     
                     <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!note.read && (
                           <button 
                              onClick={() => onMarkAsRead(note.id)} 
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
                           >
                              Mark as read
                           </button>
                        )}
                        <button 
                           onClick={() => onDelete(note.id)} 
                           className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center"
                        >
                           <Trash2 className="h-3 w-3 mr-1" /> {t('notifications.delete')}
                        </button>
                     </div>
                  </div>

                  {!note.read && (
                     <div className="absolute top-5 right-5 h-2.5 w-2.5 bg-indigo-600 rounded-full shadow-sm"></div>
                  )}
               </div>
            ))
         ) : (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
               <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellRing className="h-8 w-8 text-gray-300" />
               </div>
               <p className="text-gray-500 font-medium">{t('notifications.noData')}</p>
               <p className="text-gray-400 text-sm mt-1">Try adjusting filters to see more results.</p>
            </div>
         )}
      </div>
    </div>
  );
};
