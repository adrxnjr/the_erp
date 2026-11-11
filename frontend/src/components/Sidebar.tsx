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
  Mail,
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
import { defaultMessages } from '../data/inboxData';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [pendingSocialCount, setPendingSocialCount] = useState<number>(0);
  const [parentUnreadCount, setParentUnreadCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('evergrow_parent_unread_count');
      if (saved !== null) return parseInt(saved, 10);
      const notifs = JSON.parse(localStorage.getItem('evergrow_parent_notifications') || '[]');
      if (Array.isArray(notifs) && notifs.length > 0) {
        return notifs.filter((n: any) => !n.read).length;
      }
    } catch (e) {}
    return 1;
  });

  useEffect(() => {
    const handleUnread = (e: any) => {
      if (e?.detail !== undefined) {
        const count = typeof e.detail === 'number' ? e.detail : (e.detail?.unread ?? 1);
        setParentUnreadCount(count);
      } else {
        try {
          const saved = localStorage.getItem('evergrow_parent_unread_count');
          setParentUnreadCount(saved !== null ? parseInt(saved, 10) : 0);
        } catch (e) {}
      }
    };
    window.addEventListener('evergrow:notification-sent', handleUnread);
    window.addEventListener('evergrow:parent-unread-count', handleUnread);
    window.addEventListener('storage', handleUnread);
    return () => {
      window.removeEventListener('evergrow:notification-sent', handleUnread);
      window.removeEventListener('evergrow:parent-unread-count', handleUnread);
      window.removeEventListener('storage', handleUnread);
    };
  }, []);

  const isStudent = user?.portal_type === 'student';
  const isParent = user?.portal_type === 'parent';
  const isSuperAdmin =
    user?.roles?.includes('super_admin') || user?.username === 'adrin';

  // Dedicated Academic Coordinator check (must precede isOfficeStaff to prevent overlap)
  const isCoordinator =
    !isSuperAdmin &&
    (user?.roles?.includes('coordinator') ||
      user?.username === 'coordinator1' ||
      user?.username === 'coord1' ||
      user?.username?.startsWith('coord'));

  const isAdmin =
    !isSuperAdmin &&
    !isCoordinator &&
    (user?.roles?.includes('principal') || user?.roles?.includes('admin'));

  // Dedicated Office Staff check: only staff/accountant/office_staff, strictly excluding coordinators, teachers, principals
  const isOfficeStaff =
    !isSuperAdmin &&
    !isCoordinator &&
    !isAdmin &&
    (user?.username === 'staff' ||
      user?.roles?.includes('office_staff') ||
      user?.roles?.includes('accountant') ||
      (user?.portal_type === 'staff' &&
        !user?.roles?.includes('teacher') &&
        user?.username !== 'adrin' &&
        !user?.roles?.includes('principal') &&
        !user?.roles?.includes('coordinator') &&
        !user?.username?.startsWith('staff3') &&
        !user?.username?.startsWith('teacher') &&
        !user?.username?.startsWith('coord')));

  // Teacher remains untouched
  const isTeacher =
    !isSuperAdmin && !isOfficeStaff && !isAdmin && !isCoordinator && !isStudent && !isParent;

  // Real-time unread messages count for Direct Campus Inbox (Coordinator, Teacher, Parent)
  const [inboxUnreadCount, setInboxUnreadCount] = useState<number>(() => {
    try {
      let msgs: any[] = [];
      const stored = localStorage.getItem('evergrow_inbox_messages');
      if (stored) {
        msgs = JSON.parse(stored);
      } else {
        msgs = defaultMessages;
        localStorage.setItem('evergrow_inbox_messages', JSON.stringify(defaultMessages));
      }
      if (Array.isArray(msgs)) {
        return msgs.filter((m: any) => m.toRole === 'coordinator' && !m.read).length;
      }
    } catch (e) {}
    return 1;
  });

  useEffect(() => {
    const updateInboxCount = () => {
      const role = isCoordinator
        ? 'coordinator'
        : isTeacher
        ? 'teacher'
        : isParent
        ? 'parent'
        : null;

      if (!role) {
        setInboxUnreadCount(0);
        return;
      }

      try {
        let msgs: any[] = [];
        const stored = localStorage.getItem('evergrow_inbox_messages');
        if (stored) {
          msgs = JSON.parse(stored);
        } else {
          msgs = defaultMessages;
          localStorage.setItem('evergrow_inbox_messages', JSON.stringify(defaultMessages));
        }
        if (Array.isArray(msgs)) {
          const count = msgs.filter((m: any) => m.toRole === role && !m.read).length;
          setInboxUnreadCount(count);
          return;
        }
      } catch (e) {}
      setInboxUnreadCount(role === 'coordinator' ? 1 : 0);
    };

    updateInboxCount();

    window.addEventListener('evergrow:new-message', updateInboxCount);
    window.addEventListener('evergrow:inbox-unread-count', updateInboxCount);
    window.addEventListener('storage', updateInboxCount);

    return () => {
      window.removeEventListener('evergrow:new-message', updateInboxCount);
      window.removeEventListener('evergrow:inbox-unread-count', updateInboxCount);
      window.removeEventListener('storage', updateInboxCount);
    };
  }, [isCoordinator, isTeacher, isParent]);

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
        { to: '/reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
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

  // 4. Coordinator Navigation (Academic Wing Governance — Strictly No Office Counter, No Treasury, No Enquiries, No Visitors)
  const coordinatorNavItems: NavItem[] = [
    { to: '/', label: 'Coordinator Hub', icon: LayoutDashboard },
    { to: '/coordinators', label: 'Coordinators Council', icon: Layers },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone, badge: pendingSocialCount },
    { to: '/academic', label: 'Academic Syllabi', icon: BookOpen },
    { to: '/staff-attendance', label: 'Faculty Roster', icon: UserCheck },
    { to: '/students', label: 'Student Directory', icon: Users },
    { to: '/attendance', label: 'Attendance Insights', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable & Classes', icon: Clock },
    { to: '/examinations', label: 'Examinations & Grading', icon: GraduationCap },
    { to: '/homework', label: 'Homework & Circulars', icon: FileText },
    {
      to: '/inbox',
      label: 'Inbox',
      icon: Mail,
      badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
    },
  ];

  // 5. Teacher Navigation (Rewards removed - Gamified Rewards & Honors reserved for students)
  const teacherNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone, badge: pendingSocialCount },
    { to: '/academic', label: 'Classes', icon: BookOpen },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Clock },
    { to: '/examinations', label: 'Examinations', icon: GraduationCap },
    { to: '/transport', label: 'Transport', icon: Bus },
    {
      to: '/inbox',
      label: 'Inbox',
      icon: Mail,
      badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
    },
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

  // 7. Parent Navigation
  const parentNavItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/social-wall', label: 'School Wall', icon: Megaphone },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: parentUnreadCount > 0 ? parentUnreadCount : undefined,
    },
    {
      to: '/inbox',
      label: 'Inbox',
      icon: Mail,
      badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
    },
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
    menuHeading = 'Administration';
  } else if (isCoordinator) {
    standardItems = coordinatorNavItems;
    menuHeading = 'Academic Wing Council';
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
      <div className="w-full px-2 pt-2.5 pb-2 bg-[#E9EEF5] flex items-center justify-between relative shrink-0 z-20">
        <AnimatedLogo className="w-full" idPrefix="sidebar-logo" />
        <button
          onClick={onCloseMobile}
          aria-label="Close navigation drawer"
          className="md:hidden absolute right-3 p-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80 shadow-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Seamless blend fade beneath logo: only visible when scrolled */}
        <div
          className={`pointer-events-none absolute left-0 right-0 -bottom-6 h-6 bg-gradient-to-b from-[#E9EEF5] to-transparent z-20 transition-opacity duration-200 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Navigation Container with smooth custom scrollbar & dynamic blend fade */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        <nav
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 4)}
          className="flex-1 px-2.5 space-y-3 overflow-y-auto pt-2 pb-4 scrollbar-thin scrollbar-thumb-slate-300"
          style={
            isScrolled
              ? {
                  maskImage:
                    'linear-gradient(to bottom, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)',
                }
              : undefined
          }
        >
        {isSuperAdmin ? (
          // ─── SUPER ADMIN GROUPED SECTIONS ───
          superAdminSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="pt-2 pb-1 px-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
              <div className="pt-2 pb-1 px-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                        <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs shrink-0">
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
            <div className="px-3.5 pt-1 pb-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
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
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs shrink-0">
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
        {/* Seamless blend fade gradient above footer */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-6 bg-gradient-to-t from-[#E9EEF5] via-[#E9EEF5]/85 to-transparent z-20" />
      </div>

      {/* FOOTER: Logged-in user card (name, role, logout) */}
      {user && (
        <div className="p-2 bg-[#E9EEF5] shrink-0 relative z-20">
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#E9EEF5] shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/40">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#E9EEF5] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] flex items-center justify-center text-[#0066FF] font-bold text-xs border border-white/80 shrink-0">
                {user.username === 'staff' ? 'E' : (user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U')}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate leading-tight">
                  {user.username === 'adrin'
                    ? 'Adrin (Correspondent)'
                    : user.username === 'staff'
                    ? 'Elena Rostova'
                    : user.full_name}
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate font-semibold capitalize">
                    {isSuperAdmin
                      ? 'Correspondent'
                      : isCoordinator
                      ? 'Academic Coordinator'
                      : isTeacher || user?.roles?.includes('teacher') || user?.username?.startsWith('teacher') || user?.full_name?.includes('Michael Chang')
                      ? 'Teacher'
                      : isOfficeStaff
                      ? 'Staff'
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
