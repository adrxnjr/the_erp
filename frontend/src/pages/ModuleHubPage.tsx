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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Roles & User Account Management</h1>
                <p className="text-xs text-slate-500">Super Admin, Principal, Coordinator, Teacher, Parent, and Student authentication</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300/60 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Portal Scope</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">adrin</td>
                    <td className="py-3 px-3 font-bold text-slate-800">Adrin Jr.</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Super Admin</span></td>
                    <td className="py-3 px-3">Full Enterprise Access</td>
                    <td className="py-3 px-3"><span className="text-emerald-600 font-bold">Active</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">principal</td>
                    <td className="py-3 px-3 font-bold text-slate-800">Dr. Arthur Vance</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Principal</span></td>
                    <td className="py-3 px-3">Institutional Governance</td>
                    <td className="py-3 px-3"><span className="text-emerald-600 font-bold">Active</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">coordinator1</td>
                    <td className="py-3 px-3 font-bold text-slate-800">Dr. Elena Rostova</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Coordinator</span></td>
                    <td className="py-3 px-3">Grades 10–12 Senior Secondary</td>
                    <td className="py-3 px-3"><span className="text-emerald-600 font-bold">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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

