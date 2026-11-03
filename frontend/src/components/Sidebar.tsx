import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  GraduationCap,
  CreditCard,
  FileSpreadsheet,
  HelpCircle,
  BookOpen,
  School,
  LogOut,
  Bus,
  Compass,
  Landmark,
  UserCheck,
  Receipt,
  Megaphone,
  Layers,
  Brain,
  Trophy,
} from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';
import logoImg from '../assets/logo.png';

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [pendingSocialCount, setPendingSocialCount] = useState<number>(0);
  
  const isStudent = user?.portal_type === 'student';
  const isParent = user?.portal_type === 'parent';
  const isSuperAdmin =
    user?.roles?.includes('super_admin') || user?.username === 'adrin';
  const isAdmin =
    !isSuperAdmin &&
    (user?.roles?.includes('school_admin') ||
      user?.roles?.includes('principal') ||
      user?.roles?.includes('admin'));
  const isCoordinator =
    !isSuperAdmin &&
    (user?.roles?.includes('coordinator') ||
      user?.username === 'coordinator1' ||
      user?.username === 'coord1');
  const isTeacher =
    !isSuperAdmin && !isAdmin && !isCoordinator && !isStudent && !isParent;

  useEffect(() => {
    if (isSuperAdmin || isAdmin || isCoordinator) {
      api.get('/social/pending')
        .then((res) => {
          if (Array.isArray(res.data)) {
            setPendingSocialCount(res.data.length);
          }
        })
        .catch(() => {});
    }
  }, [isSuperAdmin, isAdmin, isCoordinator]);

  // 1. Super Admin Navigation
  const superAdminNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone, badge: pendingSocialCount },
    { to: '/coordinators', label: 'Coordinators', icon: Layers },
    { to: '/treasury', label: 'Treasury', icon: Landmark },
    { to: '/staff-attendance', label: 'Staff', icon: UserCheck },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/academic', label: 'Academics', icon: BookOpen },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/fees', label: 'Fees', icon: CreditCard },
    { to: '/transport', label: 'Transport', icon: Bus },
    { to: '/tuitions', label: 'Tuitions', icon: School },
    { to: '/admin/rewards', label: 'Rewards', icon: Trophy },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/enquiry', label: 'Enquiries', icon: HelpCircle },
  ];

  // 2. School Admin / Principal Navigation
  const adminNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone, badge: pendingSocialCount },
    { to: '/coordinators', label: 'Coordinators', icon: Layers },
    { to: '/staff-attendance', label: 'Staff', icon: UserCheck },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/academic', label: 'Academics', icon: BookOpen },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/examinations', label: 'Examinations', icon: GraduationCap },
    { to: '/fees', label: 'Fees', icon: CreditCard },
    { to: '/transport', label: 'Transport', icon: Bus },
    { to: '/tuitions', label: 'Tuitions', icon: School },
    { to: '/admin/rewards', label: 'Rewards', icon: Trophy },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/enquiry', label: 'Enquiries', icon: HelpCircle },
  ];

  // 3. Coordinator Navigation
  const coordinatorNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/coordinators', label: 'Coordinators', icon: Layers },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone, badge: pendingSocialCount },
    { to: '/staff-attendance', label: 'Staff', icon: UserCheck },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/academic', label: 'Academics', icon: BookOpen },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/examinations', label: 'Examinations', icon: GraduationCap },
    { to: '/tuitions', label: 'Tuitions', icon: School },
    { to: '/admin/rewards', label: 'Rewards', icon: Trophy },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  // 4. Faculty / Teacher Navigation
  const teacherNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone },
    { to: '/academic', label: 'Classes', icon: BookOpen },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/examinations', label: 'Examinations', icon: GraduationCap },
    { to: '/admin/rewards', label: 'Rewards', icon: Trophy },
    { to: '/transport', label: 'Transport', icon: Bus },
  ];

  // 5. Student Navigation
  const studentNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/examinations', label: 'Report Cards', icon: GraduationCap },
    { to: '/fees', label: 'Fees', icon: CreditCard },
    { to: '/transport', label: 'Transport', icon: Bus },
    { to: '/rewards', label: 'My Rewards', icon: Trophy },
    { to: '/career', label: 'Artificial Intelligence', icon: Brain },
  ];

  // 6. Parent Navigation
  const parentNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/examinations', label: 'Report Cards', icon: GraduationCap },
    { to: '/fees', label: 'Fees', icon: CreditCard },
    { to: '/transport', label: 'Transport', icon: Bus },
    { to: '/rewards', label: 'Rewards', icon: Trophy },
  ];

  let items: NavItem[] = teacherNavItems;
  let menuHeading = 'Menu';

  if (isSuperAdmin) {
    items = superAdminNavItems;
  } else if (isAdmin) {
    items = adminNavItems;
  } else if (isCoordinator) {
    items = coordinatorNavItems;
  } else if (isStudent) {
    items = studentNavItems;
  } else if (isParent) {
    items = parentNavItems;
  }

  return (
    <aside className="w-56 bg-[#E9EEF5] text-slate-700 flex flex-col shrink-0 h-screen sticky top-0 border-r border-white/80 shadow-[6px_0_18px_#C5D0E0] z-30 select-none">
      {/* Brand Header */}
      <div className="w-full px-1.5 py-2 border-b border-white/60 flex items-center justify-center overflow-hidden">
        <AnimatedLogo className="w-full" idPrefix="sidebar-logo" />
      </div>

      {/* Navigation Header */}
      <div className="px-3.5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {menuHeading}
      </div>
      <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto py-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E9EEF5] text-[#0066FF] shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] font-bold border border-white/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#E9EEF5] hover:shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] border border-transparent font-semibold active:scale-[0.98]'
                }`
              }
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate tracking-tight">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs shrink-0">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Sign Out - Neumorphic Style */}
      {user && (
        <div className="p-2 border-t border-white/70 bg-[#E9EEF5]">
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#E9EEF5] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/40">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#E9EEF5] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] flex items-center justify-center text-[#0066FF] font-bold text-xs border border-white/80 shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate leading-tight">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate capitalize">{user.portal_type || user.roles[0] || 'Active'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-600 bg-[#E9EEF5] shadow-[2px_2px_4px_#C5D0E0,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#C5D0E0] rounded-lg transition-all border border-white/50 active:scale-95 shrink-0 ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

