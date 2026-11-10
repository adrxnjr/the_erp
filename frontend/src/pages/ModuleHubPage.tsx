import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CheckSquare,
  Bell,
  UserPlus,
  FileText,
  Library,
  Building2,
  Receipt,
  Package,
  Calendar,
  ShieldAlert,
  LifeBuoy,
  BarChart3,
  UserCog,
  Workflow,
  Settings,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Users,
  Eye,
  KeyRound,
  Shield,
  CreditCard,
  Clock,
  BookOpen,
  Trash2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const ModuleHubPage: React.FC = () => {
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const pathname = location.pathname;

  // Determine current module from route pathname
  let moduleKey = 'approvals';
  if (pathname.includes('/notifications')) moduleKey = 'notifications';
  else if (pathname.includes('/parents')) moduleKey = 'parents';
  else if (pathname.includes('/homework')) moduleKey = 'homework';
  else if (pathname.includes('/library')) moduleKey = 'library';
  else if (pathname.includes('/hostel')) moduleKey = 'hostel';
  else if (pathname.includes('/payroll')) moduleKey = 'payroll';
  else if (pathname.includes('/inventory')) moduleKey = 'inventory';
  else if (pathname.includes('/events')) moduleKey = 'events';
  else if (pathname.includes('/visitors')) moduleKey = 'visitors';
  else if (pathname.includes('/helpdesk')) moduleKey = 'helpdesk';
  else if (pathname.includes('/analytics')) moduleKey = 'analytics';
  else if (pathname.includes('/roles-users')) moduleKey = 'roles-users';
  else if (pathname.includes('/integrations')) moduleKey = 'integrations';
  else if (pathname.includes('/settings')) moduleKey = 'settings';

  useEffect(() => {
    const titles: Record<string, string> = {
      approvals: 'Approvals Desk (Leave, Concessions, TC) — Ever Grow Schools ERP',
      notifications: 'Notifications & Broadcast Alerts — Ever Grow Schools ERP',
      parents: 'Parent Accounts & Children Roster — Ever Grow Schools ERP',
      homework: 'Homework & Circulars Desk — Ever Grow Schools ERP',
      library: 'Campus Library & Digital Catalog — Ever Grow Schools ERP',
      hostel: 'Hostel & Boarding Administration — Ever Grow Schools ERP',
      payroll: 'Faculty Payroll & Compensation — Ever Grow Schools ERP',
      inventory: 'Inventory & Purchases Ledger — Ever Grow Schools ERP',
      events: 'Events & Academic Calendar — Ever Grow Schools ERP',
      visitors: 'Visitors & Campus Gate Pass — Ever Grow Schools ERP',
      helpdesk: 'Helpdesk & Grievance Complaints — Ever Grow Schools ERP',
      analytics: 'Institutional Trends & Risk Analytics — Ever Grow Schools ERP',
      'roles-users': 'User Account Management & Roles — Ever Grow Schools ERP',
      integrations: 'Gateways & Third-Party Integrations — Ever Grow Schools ERP',
      settings: 'Institutional Preferences & Settings — Ever Grow Schools ERP',
    };
    document.title = titles[moduleKey] || 'School ERP Administration';
  }, [moduleKey]);

  // Approvals State
  const [approvalsList, setApprovalsList] = useState([
    { id: 'APP-101', type: 'Leave Request', requester: 'Suresh Kumar (Math Faculty)', date: 'Today, 09:30 AM', reason: 'Medical emergency leave for 2 days', status: 'Pending' },
    { id: 'APP-102', type: 'Fee Concession', requester: 'Aarav Sharma (Grade 10)', date: 'Yesterday', reason: 'Merit scholarship concession (20% waiver)', status: 'Pending' },
    { id: 'APP-103', type: 'Transfer Certificate', requester: 'Vikram Singh (Grade 8)', date: 'Nov 08, 2026', reason: 'Parent job relocation to Bangalore', status: 'Pending' },
    { id: 'APP-104', type: 'Lab Expense Voucher', requester: 'Science Wing Lead', date: 'Nov 07, 2026', reason: 'Chemistry laboratory glasswares renewal (₹14,500)', status: 'Pending' },
  ]);

  const handleApprovalAction = (id: string, action: 'Approve' | 'Reject') => {
    setApprovalsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action === 'Approve' ? 'Approved' : 'Rejected' } : item))
    );
    toast.success(`Request ${id} marked as ${action}d.`);
  };

  // Roles & User Account Management State
  type UserRole =
    | 'Super Admin'
    | 'Vice Admin'
    | 'Principal'
    | 'Coordinator'
    | 'Teacher'
    | 'Parent'
    | 'Student';

  interface ManagedUser {
    id: string;
    username: string;
    fullName: string;
    assignedRole: UserRole;
    portalScope: string;
    status: 'Active' | 'Suspended';
    email?: string;
  }

  const AVAILABLE_ROLES: UserRole[] = [
    'Super Admin',
    'Vice Admin',
    'Principal',
    'Coordinator',
    'Teacher',
    'Parent',
    'Student',
  ];

  const ROLE_CONFIG: Record<
    UserRole,
    { badgeClass: string; defaultScope: string; accessLevel: string; description: string }
  > = {
    'Super Admin': {
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      defaultScope: 'Full Enterprise Access',
      accessLevel: 'Tier 1 (Master)',
      description: 'Master enterprise access across financial treasury, branding, and system audit logs',
    },
    'Vice Admin': {
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      defaultScope: 'Campus Operations & Staff Governance',
      accessLevel: 'Tier 2 (Administrative)',
      description: 'Campus operations, staff administrative approvals, and institutional compliance',
    },
    'Principal': {
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      defaultScope: 'Institutional Governance',
      accessLevel: 'Tier 2 (Executive)',
      description: 'Academic council governance, examinations certification, and staff appraisals',
    },
    'Coordinator': {
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
      defaultScope: 'Grades 10–12 Senior Secondary',
      accessLevel: 'Tier 3 (Wing Lead)',
      description: 'Wing timetable scheduling, teacher curriculum coverage, and syllabus tracking',
    },
    'Teacher': {
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      defaultScope: 'Mathematics & Science Faculty',
      accessLevel: 'Tier 4 (Faculty)',
      description: 'Daily classroom attendance, homework publication, exam marks, and merit awards',
    },
    'Parent': {
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      defaultScope: 'Guardian Portal (Aarav & Diya)',
      accessLevel: 'Tier 5 (Guardian)',
      description: 'Student fee receipts, live GPS bus tracker, report cards, and leave applications',
    },
    'Student': {
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      defaultScope: 'Grade 10-A Student Portal',
      accessLevel: 'Tier 6 (Student)',
      description: 'AI homework tutor, timetable calendar, rewards redemption, and exam schedule',
    },
  };

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem('evergrow_roles_users_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'usr-1', username: 'adrin', fullName: 'Adrin Jr.', assignedRole: 'Super Admin', portalScope: 'Full Enterprise Access', status: 'Active', email: 'adrin@evergrow.edu' },
      { id: 'usr-2', username: 'viceadmin', fullName: 'Sarah Jenkins', assignedRole: 'Vice Admin', portalScope: 'Campus Operations & Staff Governance', status: 'Active', email: 'sarah.jenkins@evergrow.edu' },
      { id: 'usr-3', username: 'principal', fullName: 'Dr. Arthur Vance', assignedRole: 'Principal', portalScope: 'Institutional Governance', status: 'Active', email: 'principal@evergrow.edu' },
      { id: 'usr-4', username: 'coordinator1', fullName: 'Dr. Elena Rostova', assignedRole: 'Coordinator', portalScope: 'Grades 10–12 Senior Secondary', status: 'Active', email: 'coordinator@evergrow.edu' },
      { id: 'usr-5', username: 'staff3', fullName: 'Priya Sharma', assignedRole: 'Teacher', portalScope: 'Mathematics & Science Faculty', status: 'Active', email: 'priya.sharma@evergrow.edu' },
      { id: 'usr-6', username: 'parent1', fullName: 'Rajesh Sharma', assignedRole: 'Parent', portalScope: 'Guardian Portal (Aarav & Diya)', status: 'Active', email: 'rajesh.sharma@gmail.com' },
      { id: 'usr-7', username: 'student1', fullName: 'Liam Smith', assignedRole: 'Student', portalScope: 'Grade 10-A Student Portal', status: 'Active', email: 'liam.smith@evergrow.edu' },
    ];
  });

  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState<{
    username: string;
    fullName: string;
    assignedRole: UserRole;
    portalScope: string;
    email: string;
  }>({
    username: '',
    fullName: '',
    assignedRole: 'Teacher',
    portalScope: 'Mathematics & Science Faculty',
    email: '',
  });

  const handleAssignRole = (userId: string, newRole: UserRole) => {
    setManagedUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            assignedRole: newRole,
            portalScope: ROLE_CONFIG[newRole]?.defaultScope || u.portalScope,
          };
        }
        return u;
      });
      try {
        localStorage.setItem('evergrow_roles_users_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    const target = managedUsers.find((u) => u.id === userId);
    toast.success(`Role '${newRole}' assigned to ${target?.fullName || 'user'}.`);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username.trim() || !newUserForm.fullName.trim()) {
      toast.error('Username and Full Name are required.');
      return;
    }
    const cleanUsername = newUserForm.username.trim().toLowerCase().replace(/\s+/g, '_');
    if (managedUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      toast.error(`Username '${cleanUsername}' already exists.`);
      return;
    }
    const newUser: ManagedUser = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      fullName: newUserForm.fullName.trim(),
      assignedRole: newUserForm.assignedRole,
      portalScope: newUserForm.portalScope.trim() || ROLE_CONFIG[newUserForm.assignedRole].defaultScope,
      status: 'Active',
      email: newUserForm.email.trim() || `${cleanUsername}@evergrow.edu`,
    };
    setManagedUsers((prev) => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('evergrow_roles_users_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`User '${cleanUsername}' added and assigned role '${newUserForm.assignedRole}'.`);
    setShowAddUserModal(false);
    setNewUserForm({
      username: '',
      fullName: '',
      assignedRole: 'Teacher',
      portalScope: 'Mathematics & Science Faculty',
      email: '',
    });
  };

  const handleDeleteUser = (userId: string) => {
    const target = managedUsers.find((u) => u.id === userId);
    if (target?.username === 'adrin') {
      toast.error('The primary Super Admin account cannot be removed.');
      return;
    }
    setManagedUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('evergrow_roles_users_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`User ${target?.fullName || 'account'} removed.`);
  };

  const filteredUsers = managedUsers.filter((u) => {
    const matchesFilter = roleFilter === 'All' || u.assignedRole === roleFilter;
    const q = userSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.portalScope.toLowerCase().includes(q) ||
      u.assignedRole.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. APPROVALS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'approvals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Institutional Approvals Desk</h1>
                <p className="text-xs text-slate-500">Authorize leave requests, fee concessions, TC issues, and department expenses</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Pending Review</span>
              <div className="text-2xl font-black text-amber-600 mt-1">4</div>
              <span className="text-[10px] text-slate-500">Action required</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Leave Requests</span>
              <div className="text-2xl font-black text-blue-600 mt-1">1</div>
              <span className="text-[10px] text-slate-500">Faculty/Staff</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Concessions</span>
              <div className="text-2xl font-black text-purple-600 mt-1">1</div>
              <span className="text-[10px] text-slate-500">Fee waiver review</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">TC & Expenses</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">2</div>
              <span className="text-[10px] text-slate-500">Transfer & Vouchers</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <h2 className="text-sm font-black text-slate-800 tracking-tight">Pending Approval Queue</h2>
            <div className="divide-y divide-slate-200/80">
              {approvalsList.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-500">{item.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                        {item.type}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{item.requester}</span>
                    </div>
                    <p className="text-xs text-slate-600">{item.reason}</p>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {item.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleApprovalAction(item.id, 'Approve')}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-xs hover:shadow-sm cursor-pointer flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApprovalAction(item.id, 'Reject')}
                          className="px-3 py-1.5 rounded-xl bg-[#EBEEF2] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] hover:text-rose-600 font-bold text-xs text-slate-700 cursor-pointer flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. NOTIFICATIONS & ALERTS
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'notifications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Notifications & Broadcast Alerts</h1>
                <p className="text-xs text-slate-500">Send instant campus alerts, SMS circulars, and emergency notices</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <h2 className="text-sm font-black text-slate-800">Recent Broadcasts</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Annual Sports Meet Schedule Published</span>
                  <span className="text-[10px] text-slate-400">10 mins ago</span>
                </div>
                <p className="text-xs text-slate-600">Dispatched via WhatsApp & In-App Portal to 1,840 guardians.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Transport Fleet Route #4 Weather Advisory</span>
                  <span className="text-[10px] text-slate-400">Yesterday 04:15 PM</span>
                </div>
                <p className="text-xs text-slate-600">SMS sent to 42 parents along Tambaram transit corridor.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. PARENTS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'parents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Parent Accounts & Portal Access</h1>
                <p className="text-xs text-slate-500">Guardian roster, linked children accounts, and credentials management</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300/60 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Parent Name</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Linked Scholar</th>
                    <th className="py-2.5 px-3">Contact Email</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Rajesh Sharma</td>
                    <td className="py-3 px-3 font-mono text-slate-500">parent1</td>
                    <td className="py-3 px-3">Aarav Sharma (Grade 10)</td>
                    <td className="py-3 px-3">rajesh.sharma@example.com</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Dr. Meera Nair</td>
                    <td className="py-3 px-3 font-mono text-slate-500">parent2</td>
                    <td className="py-3 px-3">Priya Nair (Grade 12)</td>
                    <td className="py-3 px-3">meera.nair@example.com</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. HOMEWORK & CIRCULARS
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'homework' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Homework & Institutional Circulars</h1>
                <p className="text-xs text-slate-500">Curriculum assignments, syllabus tracks, and official school circulars</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-3">
              <span className="text-xs font-bold text-slate-800">Grade 10 Mathematics Assignment</span>
              <p className="text-xs text-slate-600">Quadratic Equations & Trigonometric Ratios Chapter 4 Problem Set.</p>
              <div className="text-[11px] text-slate-400">Due: Tomorrow by 08:30 AM • Assigned by Suresh Kumar</div>
            </div>

            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-3">
              <span className="text-xs font-bold text-slate-800">Grade 12 Physics Term Lab Log</span>
              <p className="text-xs text-slate-600">Optics & Wave Motion Practical records submission for board certification.</p>
              <div className="text-[11px] text-slate-400">Due: Friday • Assigned by Dr. Elena Rostova</div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. LIBRARY MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Campus Central Library & E-Books</h1>
                <p className="text-xs text-slate-500">18,500+ physical volumes, ISBN tracker, and digital reading room</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Catalog</span>
              <div className="text-2xl font-black text-blue-600 mt-1">18,540</div>
              <span className="text-[10px] text-slate-500">Books & Journals</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Currently Issued</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">642</div>
              <span className="text-[10px] text-slate-500">Active student loans</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Overdue Returns</span>
              <div className="text-2xl font-black text-amber-600 mt-1">18</div>
              <span className="text-[10px] text-slate-500">Automated SMS sent</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. HOSTEL MODULE (Can be switched off in Customize)
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'hostel' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Hostel & Boarding Administration</h1>
                <p className="text-xs text-slate-500">Residential room allotments, warden roll-call, and mess menu (switchable in Customize)</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Residential Wing Overview</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">120 / 150 Beds Allocated</span>
            </div>
            <p className="text-xs text-slate-600">
              Boys and Girls boarding houses are fully monitored with 24/7 biometric gates and resident nurse staff.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. PAYROLL MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'payroll' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Staff Payroll & Compensation</h1>
                <p className="text-xs text-slate-500">Monthly salary calculation, PF deductions, tax ledger, and digital payslips</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Monthly payroll cycle generated.')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer"
            >
              Run Current Month Payroll
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Monthly Payroll</span>
              <div className="text-2xl font-black text-slate-800 mt-1">₹34,85,000</div>
              <span className="text-[10px] text-slate-500">62 Staff Members</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Disbursed via Bank Direct</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
              <span className="text-[10px] text-slate-500">HDFC Corporate Pool</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tax & PF Remittance</span>
              <div className="text-2xl font-black text-blue-600 mt-1">₹4,20,500</div>
              <span className="text-[10px] text-slate-500">Statutory Compliance</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. INVENTORY MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Inventory & Procurement</h1>
                <p className="text-xs text-slate-500">Uniform kits, textbooks, science lab supplies, and campus stationery assets</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
                <div className="text-slate-800 font-bold">Uniform Sets in Stock</div>
                <div className="text-lg font-black text-blue-600 mt-1">840 Sets</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
                <div className="text-slate-800 font-bold">CBSE Textbook Bundles</div>
                <div className="text-lg font-black text-emerald-600 mt-1">1,200 Kits</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
                <div className="text-slate-800 font-bold">Stationery Reserves</div>
                <div className="text-lg font-black text-purple-600 mt-1">Optimal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. EVENTS & CALENDAR
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Events & Academic Calendar</h1>
                <p className="text-xs text-slate-500">School functions, exam schedules, athletic meets, and gazetted holidays</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600">Nov 18, 2026</span>
                <h3 className="text-sm font-black text-slate-800">National Science Week Expo</h3>
                <p className="text-xs text-slate-500">STEM robotics, IoT inventions, and chemistry practical exhibition</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Upcoming</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-600">Dec 05, 2026</span>
                <h3 className="text-sm font-black text-slate-800">Mid-Term Board Preparatory Examinations</h3>
                <p className="text-xs text-slate-500">Grades 9 to 12 intensive mock testing series</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Examination</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. VISITORS & GATE PASS
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'visitors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Visitors & Gate Pass Security</h1>
                <p className="text-xs text-slate-500">Campus entry logs, OTP visitor verification, and parent gate pass authorization</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('New digital visitor gate pass issued.')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer"
            >
              Issue Digital Gate Pass
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <h2 className="text-sm font-black text-slate-800">Active Campus Visitors Today</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300/60 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Pass No</th>
                    <th className="py-2.5 px-3">Visitor Name</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    <th className="py-2.5 px-3">Check-In Time</th>
                    <th className="py-2.5 px-3">Host Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">GP-8842</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">Dr. K. Ramanathan</td>
                    <td className="py-2.5 px-3">CBSE Regional Inspector</td>
                    <td className="py-2.5 px-3">09:15 AM</td>
                    <td className="py-2.5 px-3">Principal Office</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">GP-8843</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">Smt. Lakshmi Priya</td>
                    <td className="py-2.5 px-3">Admission Enquiry Parent</td>
                    <td className="py-2.5 px-3">10:00 AM</td>
                    <td className="py-2.5 px-3">Admissions Desk</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          11. HELPDESK & COMPLAINTS
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'helpdesk' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Helpdesk & Grievance Redressal</h1>
                <p className="text-xs text-slate-500">Student, parent, and faculty support tickets and resolution SLA</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">TKT-441</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">In Progress</span>
              </div>
              <h3 className="text-xs font-bold text-slate-800">Bus Route #12 Morning Pickup Time Query</h3>
              <p className="text-[11px] text-slate-500">Submitted by Parent (Priya Nair, Grade 12) • Assigned to Transport Admin</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">TKT-439</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Resolved</span>
              </div>
              <h3 className="text-xs font-bold text-slate-800">Report Card PDF Download Verification</h3>
              <p className="text-[11px] text-slate-500">Resolved within 15 minutes by Examination Cell</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. ANALYTICS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Institutional Trends & Risk Analytics</h1>
                <p className="text-xs text-slate-500">Predictive attendance patterns, fee defaulter risks, and grade trajectory</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Campus Attendance</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">96.8%</div>
              <span className="text-[10px] text-slate-500">+1.4% from last academic quarter</span>
            </div>
            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fee Defaulter Risk Index</span>
              <div className="text-3xl font-black text-blue-600 mt-1">Low (2.1%)</div>
              <span className="text-[10px] text-slate-500">Automated WhatsApp reminders active</span>
            </div>
            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Curriculum Completion</span>
              <div className="text-3xl font-black text-purple-600 mt-1">82.4%</div>
              <span className="text-[10px] text-slate-500">On schedule for board preps</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          13. ROLES & USERS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'roles-users' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Roles & User Account Management</h1>
                <p className="text-xs text-slate-500">Super Admin, Vice Admin, Principal, Coordinator, Teacher, Parent, and Student authentication</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New User</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Accounts</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{managedUsers.length}</div>
              <span className="text-[10px] text-slate-500 font-medium">Provisioned Users</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Admin Governance</span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {managedUsers.filter((u) => u.assignedRole === 'Super Admin' || u.assignedRole === 'Vice Admin').length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Super & Vice Admins</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Academic Wing</span>
              <div className="text-2xl font-black text-teal-600 mt-1">
                {managedUsers.filter((u) => u.assignedRole === 'Coordinator' || u.assignedRole === 'Teacher' || u.assignedRole === 'Principal').length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Faculty & Coordinators</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] border border-white/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Campus Community</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {managedUsers.filter((u) => u.assignedRole === 'Parent' || u.assignedRole === 'Student').length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Parents & Students</span>
            </div>
          </div>

          {/* User Table & Controls */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            {/* Search and Role Filter Chips */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user, name, or scope..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-semibold"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', ...AVAILABLE_ROLES].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleFilter(role)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      roleFilter === role
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'bg-[#EBEEF2] text-slate-600 hover:text-slate-900 shadow-[2px_2px_4px_#C8D0DC,-2px_-2px_4px_#FFFFFF]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl bg-white/40 border border-white/70">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300/60 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-100/50">
                    <th className="py-3 px-3.5">Username</th>
                    <th className="py-3 px-3.5">Full Name</th>
                    <th className="py-3 px-3.5">Assigned Role (Live Switch)</th>
                    <th className="py-3 px-3.5">Portal Scope</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No user accounts match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const cfg = ROLE_CONFIG[u.assignedRole] || ROLE_CONFIG['Teacher'];
                      return (
                        <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                            {u.username}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-800">{u.fullName}</div>
                            {u.email && <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>}
                          </td>
                          <td className="py-3 px-3.5">
                            {/* Interactive Role Switcher Dropdown */}
                            <div className="inline-flex items-center space-x-1.5">
                              <select
                                value={u.assignedRole}
                                onChange={(e) => handleAssignRole(u.id, e.target.value as UserRole)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer focus:outline-none transition-all shadow-xs ${cfg.badgeClass}`}
                                title={`Change role for ${u.fullName}`}
                              >
                                {AVAILABLE_ROLES.map((r) => (
                                  <option key={r} value={r} className="bg-white text-slate-800 font-semibold">
                                    {r}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="text-slate-600 text-xs">{u.portalScope}</span>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            {u.username !== 'adrin' ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                title="Remove User"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Primary Admin
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Access Matrix Guide */}
          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight">Institutional Role Definitions & Permissions</h2>
                <p className="text-xs text-slate-500">Core operational scope enforced across Ever Grow Schools modules</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                RBAC Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {AVAILABLE_ROLES.map((roleName) => {
                const cfg = ROLE_CONFIG[roleName];
                return (
                  <div
                    key={roleName}
                    className="p-3.5 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.badgeClass}`}>
                        {roleName}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{cfg.accessLevel}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{cfg.description}</p>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Default Scope: <span className="text-slate-700 font-semibold">{cfg.defaultScope}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal: Add & Assign New User */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md p-6 rounded-3xl bg-[#EBEEF2] shadow-[8px_8px_20px_#A6B4C8,-8px_-8px_20px_#FFFFFF] border border-white/80 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-300/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <UserCog className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-black text-slate-800">Assign New User Account</h3>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      placeholder="e.g. vice_admin2 or teacher_math"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-semibold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.fullName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                      placeholder="e.g. Sarah Jenkins or Rajesh Sharma"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Role</label>
                    <select
                      value={newUserForm.assignedRole}
                      onChange={(e) => {
                        const nextRole = e.target.value as UserRole;
                        setNewUserForm({
                          ...newUserForm,
                          assignedRole: nextRole,
                          portalScope: ROLE_CONFIG[nextRole]?.defaultScope || newUserForm.portalScope,
                        });
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-bold cursor-pointer"
                    >
                      {AVAILABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Portal Scope & Department</label>
                    <input
                      type="text"
                      value={newUserForm.portalScope}
                      onChange={(e) => setNewUserForm({ ...newUserForm, portalScope: e.target.value })}
                      placeholder="e.g. Campus Operations, Mathematics Faculty, Guardian Portal"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="e.g. user@evergrow.edu"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] border border-white/60 focus:outline-none text-slate-800 font-semibold"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 rounded-xl bg-[#EBEEF2] shadow-[2px_2px_5px_#C8D0DC,-2px_-2px_5px_#FFFFFF] text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer"
                    >
                      Save & Assign Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          14. INTEGRATIONS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'integrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Gateways & Third-Party Integrations</h1>
                <p className="text-xs text-slate-500">WhatsApp Meta Cloud, SMS gateway, Razorpay payment gateway, and GPS fleet telematics</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Razorpay Corporate Gateway</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">Live</span>
              </div>
              <p className="text-xs text-slate-500">Supports UPI, NetBanking, Credit Cards, and instant automated PDF receipts.</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">GPS Vehicle Fleet Telematics</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">Live</span>
              </div>
              <p className="text-xs text-slate-500">Tracks 24 smart buses with 15-second satellite ping intervals.</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          15. SETTINGS MODULE
          ───────────────────────────────────────────────────────────── */}
      {moduleKey === 'settings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-500/25">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Institutional Preferences & Settings</h1>
                <p className="text-xs text-slate-500">System language, timezone (IST), security credentials, and account profile</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4 max-w-xl">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Timezone</label>
                <input
                  type="text"
                  defaultValue="Asia/Kolkata (IST +05:30)"
                  disabled
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-600 font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">System Language</label>
                <input
                  type="text"
                  defaultValue="English (India / International Academic)"
                  disabled
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] border border-white/60 text-slate-600 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

