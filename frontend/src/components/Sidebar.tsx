import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Sparkles,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const isStudent = user?.portal_type === 'student';
  const isParent = user?.portal_type === 'parent';
  const isSuperAdmin =
    user?.roles?.includes('super_admin') || user?.username === 'adrin';
  const isAdmin =
    !isSuperAdmin &&
    (user?.roles?.includes('school_admin') ||
      user?.roles?.includes('principal') ||
      user?.roles?.includes('admin'));
  const isTeacher =
    !isSuperAdmin && !isAdmin && !isStudent && !isParent;

  // 1. Super Admin Navigation: Governance, Institutional Loans, Vendor Bills, Staff Oversight
  const superAdminNavItems = [
    { to: '/', label: 'Executive Governance', icon: LayoutDashboard },
    { to: '/treasury', label: 'Treasury & Loans', icon: Landmark },
    { to: '/staff-attendance', label: 'Staff Workforce', icon: UserCheck },
    { to: '/students', label: 'Students & Admissions', icon: Users },
    { to: '/academic', label: 'Academic & Classes', icon: BookOpen },
    { to: '/attendance', label: 'Institutional Attendance', icon: CalendarCheck },
    { to: '/fees', label: 'Fee Collections', icon: CreditCard },
    { to: '/transport', label: 'Fleet & GPS Buses', icon: Bus },
    { to: '/reports', label: 'Executive Reports', icon: FileSpreadsheet },
    { to: '/enquiry', label: 'Public Enquiry', icon: HelpCircle },
  ];

  // 2. School Admin / Principal Navigation: Campus Operations, Headcounts, Staff Attendance, Low Attendance Radar
  const adminNavItems = [
    { to: '/', label: 'Campus Operations', icon: LayoutDashboard },
    { to: '/staff-attendance', label: 'Staff Attendance', icon: UserCheck },
    { to: '/students', label: 'Students & Admissions', icon: Users },
    { to: '/academic', label: 'Academic Classes', icon: BookOpen },
    { to: '/attendance', label: 'Attendance Radar', icon: CalendarCheck },
    { to: '/timetable', label: 'Master Timetable', icon: Clock },
    { to: '/examinations', label: 'Examinations & Marks', icon: GraduationCap },
    { to: '/fees', label: 'Fee Receipts', icon: CreditCard },
    { to: '/transport', label: 'Transport & GPS Bus', icon: Bus },
    { to: '/reports', label: 'Campus Reports', icon: FileSpreadsheet },
    { to: '/enquiry', label: 'Public Enquiry', icon: HelpCircle },
  ];

  // 3. Faculty / Teacher Navigation: Daily Roll-Call, My Classes, Timetable, Marks Entry
  const teacherNavItems = [
    { to: '/', label: 'Faculty Hub', icon: LayoutDashboard },
    { to: '/academic', label: 'My Classes & Subjects', icon: BookOpen },
    { to: '/attendance', label: 'Daily Roll-Call', icon: CalendarCheck },
    { to: '/timetable', label: 'Teaching Timetable', icon: Clock },
    { to: '/examinations', label: 'Marks Entry & Grades', icon: GraduationCap },
    { to: '/transport', label: 'Campus Transport', icon: Bus },
  ];

  // 4. Student Navigation: Attendance Log, Timetable, Report Cards, Fee Invoices, AI Career Guidance
  const studentNavItems = [
    { to: '/', label: 'My Student Portal', icon: LayoutDashboard },
    { to: '/attendance', label: 'My Attendance Log', icon: CalendarCheck },
    { to: '/timetable', label: 'Class Timetable', icon: Clock },
    { to: '/examinations', label: 'Report Cards', icon: GraduationCap },
    { to: '/fees', label: 'Fee Dues & Receipts', icon: CreditCard },
    { to: '/transport', label: 'Bus GPS Tracking', icon: Bus },
    { to: '/career', label: 'AI Career Guidance', icon: Compass },
  ];

  // 5. Parent Navigation: Ward Attendance, Timetable, Fees, Transport Radar
  const parentNavItems = [
    { to: '/', label: 'Parent Ward Portal', icon: LayoutDashboard },
    { to: '/attendance', label: 'Ward Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Class Timetable', icon: Clock },
    { to: '/examinations', label: 'Report Cards', icon: GraduationCap },
    { to: '/fees', label: 'Fee Receipts & Dues', icon: CreditCard },
    { to: '/transport', label: 'Bus GPS Radar', icon: Bus },
  ];

  let items = teacherNavItems;
  let roleBadge = 'Faculty Campus';
  let badgeColor = 'bg-blue-500/10 text-[#0071E3] border-blue-500/20';

  if (isSuperAdmin) {
    items = superAdminNavItems;
    roleBadge = 'Super Admin Trustee';
    badgeColor = 'bg-purple-500/10 text-purple-700 border-purple-500/20';
  } else if (isAdmin) {
    items = adminNavItems;
    roleBadge = 'Admin / Principal';
    badgeColor = 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
  } else if (isStudent) {
    items = studentNavItems;
    roleBadge = 'Student Portal';
    badgeColor = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  } else if (isParent) {
    items = parentNavItems;
    roleBadge = 'Parent Guardian';
    badgeColor = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  }

  return (
    <aside className="w-68 bg-[#F9F9FB]/90 backdrop-blur-2xl text-slate-700 flex flex-col shrink-0 h-screen sticky top-0 border-r border-black/[0.06] z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-black/[0.05]">
        <div className="flex flex-col space-y-2.5">
          <div className="flex items-center justify-start">
            <img
              src={logoImg}
              alt="Ever Grow Schools Logo"
              className="w-full max-w-[232px] h-20 object-contain object-left drop-shadow-sm transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${badgeColor}`}>
              {roleBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
        Navigation Menu
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-[14px] text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0071E3] to-[#5856D6] text-white shadow-[0_4px_16px_rgba(0,113,227,0.28)] font-semibold'
                    : 'text-[#424245] hover:text-[#1D1D1F] hover:bg-black/[0.04] active:scale-[0.98]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Sign Out - Apple iOS Style */}
      {user && (
        <div className="p-3 border-t border-black/[0.05] bg-white/60 backdrop-blur-md">
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-black/[0.03] transition-colors">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs border border-black/[0.08] shadow-inner shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#1D1D1F] truncate leading-tight">
                  {user.full_name}
                </div>
                <div className="text-[11px] text-[#86868B] flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="truncate capitalize">{user.portal_type || user.roles[0] || 'Active'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-[#86868B] hover:text-[#FF2D55] hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

