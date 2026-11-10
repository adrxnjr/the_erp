import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Award,
  X,
  CheckSquare,
  Bell,
  UserPlus,
  FileText,
  Library,
  Package,
  Calendar,
  ShieldAlert,
  LifeBuoy,
  BarChart3,
  SlidersHorizontal,
  UserCog,
  Workflow,
  Settings,
  FileCheck,
} from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pendingSocialCount, setPendingSocialCount] = useState<number>(0);

  const isStudent = user?.portal_type === 'student';
  const isParent = user?.portal_type === 'parent';
  const isSuperAdmin =
    user?.roles?.includes('super_admin') || user?.username === 'adrin';
  
  // Dedicated Office Staff check: only staff/accountant/office_staff, keeping teachers separate
  const isOfficeStaff =
    !isSuperAdmin &&
    (user?.username === 'staff' ||
      user?.roles?.includes('office_staff') ||
      user?.roles?.includes('accountant') ||
      (user?.portal_type === 'staff' &&
        !user?.roles?.includes('teacher') &&
        user?.username !== 'adrin' &&
        !user?.roles?.includes('principal') &&
        !user?.username?.startsWith('staff3')));

  const isAdmin =
    !isSuperAdmin &&
    !isOfficeStaff &&
    (user?.roles?.includes('principal') || user?.roles?.includes('admin'));

  const isCoordinator =
    !isSuperAdmin &&
    !isOfficeStaff &&
    (user?.roles?.includes('coordinator') ||
      user?.username === 'coordinator1' ||
      user?.username === 'coord1');

  // Teacher remains untouched
  const isTeacher =
    !isSuperAdmin && !isOfficeStaff && !isAdmin && !isCoordinator && !isStudent && !isParent;

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

  // 1. Super Admin (Correspondent) Navigation (Students & Parents removed)
  const superAdminSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
        { to: '/social-wall', label: 'School Wall', icon: Megaphone, badge: pendingSocialCount },
        { to: '/approvals', label: 'Approvals & Sanctions', icon: CheckSquare },
        { to: '/notifications', label: 'Notifications & Alerts', icon: Bell },
      ],
    },
    {
      title: 'GOVERNANCE & FACULTY',
      items: [
        { to: '/staff-attendance', label: 'Staff & Faculty Roster', icon: UserCheck },
        { to: '/coordinators', label: 'Coordinators Council', icon: Layers },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { to: '/academic', label: 'Academic Structure', icon: BookOpen },
        { to: '/attendance', label: 'Attendance Insights', icon: CalendarCheck },
        { to: '/examinations', label: 'Examinations & Results', icon: GraduationCap },
        { to: '/tuitions', label: 'Partner Tuitions', icon: School },
        { to: '/admin/rewards', label: 'Rewards & Honors', icon: Trophy },
        { to: '/homework', label: 'Homework & Circulars', icon: FileText },
        { to: '/library', label: 'Library & Digital Catalog', icon: Library },
      ],
    },
    {
      title: 'FINANCE & ASSETS',
      items: [
        { to: '/treasury', label: 'Treasury & Reserves', icon: Landmark },
        { to: '/payroll', label: 'Faculty Payroll', icon: Receipt },
        { to: '/inventory', label: 'Inventory & Purchases', icon: Package },
      ],
    },
    {
      title: 'CAMPUS OPERATIONS',
      items: [
        { to: '/transport', label: 'Transport Fleet & GPS', icon: Bus },
        { to: '/events', label: 'Events & Calendar', icon: Calendar },
        { to: '/visitors', label: 'Visitors & Campus Gate', icon: ShieldAlert },
        { to: '/helpdesk', label: 'Helpdesk & Grievances', icon: LifeBuoy },
      ],
    },
    {
      title: 'INSIGHTS & REPORTS',
      items: [
        { to: '/reports', label: 'Institutional Reports', icon: FileSpreadsheet },
        { to: '/analytics', label: 'Institutional Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { to: '/admin/customize', label: 'Customize ERP', icon: SlidersHorizontal },
        { to: '/admin/roles-users', label: 'Roles & User Access', icon: UserCog },
        { to: '/admin/integrations', label: 'API Integrations', icon: Workflow },
        { to: '/admin/settings', label: 'Institutional Settings', icon: Settings },
      ],
    },
  ];

  // 2. Staff Navigation (11 Dedicated School Office Desk Works)
  const staffSections: NavSection[] = [
    {
      title: 'OFFICE COUNTER',
      items: [
        { to: '/', label: 'Office Desk Home', icon: LayoutDashboard },
        { to: '/fees', label: 'Fees & Counter Payments', icon: CreditCard },
        { to: '/billing', label: 'Billings & Invoices', icon: Receipt },
        { to: '/scholarships', label: 'Scholarships & Waivers', icon: Award },
        { to: '/reports', label: 'Bonafide & Certificates', icon: FileCheck },
      ],
    },
    {
      title: 'STUDENTS & ADMISSIONS',
      items: [
        { to: '/students', label: 'Student Directory (150)', icon: Users },
        { to: '/enquiry', label: 'Admission Forms & Enquiries', icon: HelpCircle },
        { to: '/parents', label: 'Parents & Guardians', icon: UserPlus },
        { to: '/attendance', label: 'Attendance Management', icon: CalendarCheck },
      ],
    },
    {
      title: 'ADMINISTRATION & SUPPLIES',
      items: [
        { to: '/staff-attendance', label: 'Staff Workforce & Leaves', icon: UserCheck },
        { to: '/inventory', label: 'Inventory & Supplies', icon: Package },
        { to: '/treasury', label: 'Treasury & Accounts', icon: Landmark },
        { to: '/visitors', label: 'Gate Passes & Visitors', icon: ShieldAlert },
        { to: '/transport', label: 'Transport & Bus Passes', icon: Bus },
      ],
    },
  ];

  // 3. School Admin / Principal Navigation (Unchanged)
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

  // 4. Coordinator Navigation (Unchanged)
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
  ];

  // 5. Teacher Navigation (Kept as it is)
  const teacherNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone, badge: pendingSocialCount },
    { to: '/academic', label: 'Classes', icon: BookOpen },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/examinations', label: 'Examinations', icon: GraduationCap },
    { to: '/rewards', label: 'Rewards', icon: Trophy },
    { to: '/transport', label: 'Transport', icon: Bus },
  ];

  // 6. Student Navigation (Unchanged)
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

  // 7. Parent Navigation (Unchanged)
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

  let standardItems: NavItem[] = teacherNavItems;
  let menuHeading = 'Menu';

  if (isAdmin) {
    standardItems = adminNavItems;
  } else if (isCoordinator) {
    standardItems = coordinatorNavItems;
  } else if (isStudent) {
    standardItems = studentNavItems;
  } else if (isParent) {
    standardItems = parentNavItems;
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 w-64 md:w-60 bg-[#E9EEF5] text-slate-700 flex flex-col shrink-0 h-screen border-r border-white/80 shadow-[6px_0_18px_#C5D0E0] select-none transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header with mobile close button */}
      <div className="w-full px-2 py-2 border-b border-white/60 flex items-center justify-between overflow-hidden relative shrink-0">
        <AnimatedLogo className="w-full" idPrefix="sidebar-logo" />
        <button
          onClick={onCloseMobile}
          aria-label="Close navigation drawer"
          className="md:hidden absolute right-3 p-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80 shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Container with smooth custom scrollbar */}
      <nav className="flex-1 px-2.5 space-y-3 overflow-y-auto py-2.5 scrollbar-thin scrollbar-thumb-slate-300">
        {isSuperAdmin ? (
          // ─── SUPER ADMIN GROUPED SECTIONS ───
          superAdminSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="pt-2 pb-1 px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isCurrentActive =
                    item.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                          isActive || isCurrentActive
                            ? 'bg-[#E9EEF5] text-[#0066FF] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] font-bold border border-white/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-[#E9EEF5] hover:shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] border border-transparent font-medium active:scale-[0.98]'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate tracking-tight">{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white shadow-xs shrink-0">
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))
        ) : isOfficeStaff ? (
          // ─── STAFF OFFICE DESK GROUPED SECTIONS (11 Core Office Works) ───
          staffSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="pt-2 pb-1 px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isCurrentActive =
                    item.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 ${
                          isActive || isCurrentActive
                            ? 'bg-[#E9EEF5] text-[#0066FF] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] font-bold border border-white/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-[#E9EEF5] hover:shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] border border-transparent font-medium active:scale-[0.98]'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate tracking-tight">{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white shadow-xs shrink-0">
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          // ─── TEACHER, PRINCIPAL, COORDINATOR, STUDENT, PARENT (UNCHANGED) ───
          <>
            <div className="px-3.5 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {menuHeading}
            </div>
            <div className="space-y-1">
              {standardItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onCloseMobile}
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
            </div>
          </>
        )}
      </nav>

      {/* FOOTER: Logged-in user card (name, role, logout) */}
      {user && (
        <div className="p-2 border-t border-white/70 bg-[#E9EEF5] shrink-0">
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#E9EEF5] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/40">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#E9EEF5] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] flex items-center justify-center text-[#0066FF] font-bold text-xs border border-white/80 shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate leading-tight">
                  {user.username === 'adrin'
                    ? 'Adrin (Correspondent)'
                    : user.username === 'staff'
                    ? 'Staff (Office Desk)'
                    : user.full_name}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate font-semibold capitalize">
                    {isSuperAdmin
                      ? 'Correspondent'
                      : isOfficeStaff
                      ? 'Staff Office Desk'
                      : user.portal_type || user.roles[0] || 'Active'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-600 bg-[#E9EEF5] shadow-[2px_2px_4px_#C5D0E0,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#C5D0E0] rounded-lg transition-all border border-white/50 active:scale-95 shrink-0 ml-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
