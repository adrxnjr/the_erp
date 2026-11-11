import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  MessageSquare,
  Bus,
  CheckCircle2,
  Clock,
  Info,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'absence' | 'fee' | 'exam' | 'general' | 'transport' | 'meeting' | 'achievement';
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const demoNotifications: Notification[] = [
  {
    id: 'N-001',
    type: 'absence',
    title: 'Absence Alert — Liam Smith',
    message: 'Your child Liam Smith (Grade 10-A, Roll #02) was marked ABSENT today (11/11/2026). Class Teacher Mrs. Anitha Raman has dispatched this automated notification. Please contact the class coordinator if this absence is excused.',
    time: '09:45 AM',
    date: '11/11/2026',
    read: false,
    priority: 'high',
  },
  {
    id: 'N-002',
    type: 'meeting',
    title: 'Parent-Teacher Meeting Scheduled',
    message: 'A Parent-Teacher Meeting has been scheduled for Nov 15, 2026 at 03:30 PM in the School Auditorium. Agenda: Term 1 Progress Review, Career Counselling, and Sports Day Planning.',
    time: '10:00 AM',
    date: '10/11/2026',
    read: true,
    priority: 'medium',
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  absence: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  fee: { icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  exam: { icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  general: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  transport: { icon: Bus, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  meeting: { icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  achievement: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

export const ParentNotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('evergrow_parent_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          return [...parsed, ...demoNotifications.filter(d => !existingIds.has(d.id))].slice(0, 2);
        }
      }
    } catch (e) {}
    return demoNotifications.slice(0, 2);
  });

  React.useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('evergrow_parent_notifications');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const existingIds = new Set(parsed.map((p: any) => p.id));
            setNotifications([...parsed, ...demoNotifications.filter(d => !existingIds.has(d.id))].slice(0, 2));
          }
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('evergrow:notification-sent', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('evergrow:notification-sent', handleSync);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || (filter === 'unread' ? !n.read : n.type === filter);
    const matchesSearch = searchQuery.trim() === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    const remainingUnread = updated.filter(n => !n.read).length;
    localStorage.setItem('evergrow_parent_notifications', JSON.stringify(updated));
    localStorage.setItem('evergrow_parent_unread_count', String(remainingUnread));
    window.dispatchEvent(new CustomEvent('evergrow:parent-unread-count', { detail: remainingUnread }));
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('evergrow_parent_notifications', JSON.stringify(updated));
    localStorage.setItem('evergrow_parent_unread_count', '0');
    window.dispatchEvent(new CustomEvent('evergrow:parent-unread-count', { detail: 0 }));
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'absence', label: 'Absence' },
    { key: 'exam', label: 'Exams' },
    { key: 'fee', label: 'Fees' },
    { key: 'meeting', label: 'Meetings' },
    { key: 'transport', label: 'Transport' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="ios-card rounded-[28px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#0077ED] flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Notifications & Alerts</h1>
            <p className="text-xs text-slate-500">
              Stay updated with your child's attendance, grades, fees, and school announcements.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              {unreadCount} Unread
            </span>
          )}
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-[#E9EEF5] hover:bg-[#DCE3EF] text-slate-700 text-xs font-semibold rounded-full transition-colors shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C8D0DC] cursor-pointer border-none"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="ios-card rounded-[22px] p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border-none ${
                  filter === tab.key
                    ? 'bg-[#0071E3] text-white shadow-md'
                    : 'bg-[#E9EEF5] text-slate-600 hover:bg-[#DCE3EF] shadow-[2px_2px_4px_#C8D0DC,-2px_-2px_4px_#FFFFFF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-2 bg-[#E9EEF5] rounded-xl text-xs text-slate-700 shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/40 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
            />
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="ios-card rounded-[22px] p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">No notifications found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const config = typeConfig[notification.type] || typeConfig.general;
            const Icon = config.icon;
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`ios-card rounded-[22px] p-5 cursor-pointer transition-all hover:shadow-[6px_6px_14px_#C8D0DC,-6px_-6px_14px_#FFFFFF] ${
                  !notification.read ? 'border-l-4 border-l-[#0071E3] bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 border ${config.border}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-[#0071E3]" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-medium">{notification.time} · {notification.date}</span>
                          {notification.priority === 'high' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200">
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{notification.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Summary */}
      <div className="ios-card rounded-[22px] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          Powered by Ever Grow SMS Gateway & Parent Portal
        </span>
      </div>
    </div>
  );
};

