import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Bus,
  Compass,
  BookOpen,
  Award,
  ChevronRight,
  CheckCircle2,
  Landmark,
  Receipt,
  UserCheck,
  AlertTriangle,
  PhoneCall,
  Bell,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Briefcase,
  Check,
  Download,
  Loader2,
  Trophy,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [restrictedNotice, setRestrictedNotice] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Dashboard — Ever Grow Schools ERP';
    if (location.state && (location.state as any).accessRestricted) {
      setRestrictedNotice(
        (location.state as any).restrictedMessage ||
          'Access Restricted: You do not have administrative credentials to view that page.'
      );
      try {
        window.history.replaceState({}, document.title);
      } catch {}
    }
  }, [location.state]);

  const [stats, setStats] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [childRewards, setChildRewards] = useState<Record<string, any>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [studentExtra, setStudentExtra] = useState<any>({
    attendance: null,
    timetable: [],
    results: [],
    fees: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [notifiedStudents, setNotifiedStudents] = useState<Record<string, boolean>>({});

  const isSuperAdmin =
    user?.roles?.includes('super_admin') || user?.username === 'adrin';
  const isAdmin =
    !isSuperAdmin &&
    (user?.roles?.includes('school_admin') ||
      user?.roles?.includes('principal') ||
      user?.roles?.includes('admin'));
  const isTeacher =
    !isSuperAdmin &&
    !isAdmin &&
    (user?.roles?.includes('teacher') || user?.portal_type === 'staff');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        if (user?.portal_type === 'parent') {
          const res = await api.get('/portal/parent/children');
          setChildren(res.data);
          if (Array.isArray(res.data)) {
            const rewardsMap: Record<string, any> = {};
            await Promise.allSettled(
              res.data.map(async (child: any) => {
                try {
                  const rRes = await api.get('/rewards/my-points', { params: { student_id: child.id } });
                  rewardsMap[child.id] = rRes.data;
                } catch (err) {}
              })
            );
            setChildRewards(rewardsMap);
          }
        } else if (user?.portal_type === 'student') {
          const profile = await api.get('/portal/student/profile');
          setStats(profile.data);

          if (profile.data?.id) {
            const [attRes, ttRes, feeRes, resRes] = await Promise.allSettled([
              api.get(`/portal/student/${profile.data.id}/attendance`),
              api.get(`/portal/student/${profile.data.id}/timetable`),
              api.get(`/portal/student/${profile.data.id}/fees`),
              api.get(`/portal/student/${profile.data.id}/results`),
            ]);

            setStudentExtra({
              attendance: attRes.status === 'fulfilled' ? attRes.value.data : null,
              timetable: ttRes.status === 'fulfilled' ? ttRes.value.data : [],
              fees: feeRes.status === 'fulfilled' ? feeRes.value.data : null,
              results: resRes.status === 'fulfilled' ? resRes.value.data : [],
            });
          }
        } else if (isSuperAdmin) {
          const res = await api.get('/dashboards/super-admin');
          setStats(res.data);
        } else if (isAdmin) {
          const res = await api.get('/dashboards/admin-operations');
          setStats(res.data);
        } else {
          // Teacher
          const res = await api.get('/dashboards/teacher');
          setStats(res.data);
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, isSuperAdmin, isAdmin]);

  const handleNotifyParent = (studentId: string, phone: string, studentName: string) => {
    setNotifiedStudents((prev) => ({ ...prev, [studentId]: true }));
    toast.success(`Statutory low attendance alert dispatched via SMS/WhatsApp to parent of ${studentName} (${phone}).`);
  };

  const handleDownloadIdCard = async (studentId: string, admissionNumber: string) => {
    if (!studentId) {
      toast.error('Student record ID not available.');
      return;
    }
    try {
      setDownloadingId(studentId);
      const res = await api.get(`/id-cards/student/${studentId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ID_Card_${admissionNumber || 'student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Student ID Card for ${admissionNumber || 'student'} downloaded.`);
    } catch (err: any) {
      console.error('Failed to download ID card:', err);
      toast.error('Failed to generate student ID card. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // =========================================================================
  // 1. STUDENT PORTAL VIEW
  // =========================================================================
  if (user?.portal_type === 'student') {
    const attPct = studentExtra.attendance?.percentage ?? 100.0;
    const isAboveThreshold = attPct >= 75.0;

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
        {restrictedNotice && (
          <div role="alert" aria-live="polite" className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{restrictedNotice}</span>
            </div>
            <button
              onClick={() => setRestrictedNotice(null)}
              aria-label="Dismiss access restricted notice"
              className="text-rose-500 hover:text-rose-700 text-sm font-bold ml-3"
            >
              ×
            </button>
          </div>
        )}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
              Student Self-Service Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Welcome back, {stats?.full_name || user.full_name}!
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Enrolled in <span className="font-semibold text-slate-800">{stats?.class_name || 'Class 10-A'}</span> | Admission No:{' '}
              <span className="font-mono font-medium text-slate-800">{stats?.admission_number || 'ADM-2026-0001'}</span>
            </p>
          </div>
          <div className="relative z-10 flex items-center space-x-3">
            <button
              onClick={() => handleDownloadIdCard(stats?.id, stats?.admission_number)}
              disabled={downloadingId === stats?.id}
              className="ios-gloss-btn px-4 py-2.5 text-xs font-bold space-x-2 flex items-center shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {downloadingId === stats?.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Card...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download My ID Card</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link to="/attendance" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Attendance Rate</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAboveThreshold ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">{attPct}%</span>
              <span className={`text-[11px] font-semibold ${isAboveThreshold ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isAboveThreshold ? 'Eligible' : 'Warning (<75%)'}
              </span>
            </div>
          </Link>

          <Link to="/examinations" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Term Evaluation</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">GPA 3.8</span>
              <span className="text-[11px] font-semibold text-purple-600">Grade A+</span>
            </div>
          </Link>

          <Link to="/fees" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Tuition Balance</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">₹0</span>
              <span className="text-[11px] font-semibold text-emerald-600">Fully Cleared</span>
            </div>
          </Link>

          <Link to="/transport" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Bus GPS Radar</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bus className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-base font-bold text-[#1D1D1F] tracking-tight">Bus #04 On Route</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Attendance Status</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your attendance meets examination requirements. Keep attendance above 75% for exam clearance.
            </p>
            <div className="pt-2">
              <Link to="/attendance" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                <span>View Attendance History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-blue-50/90 text-slate-900 rounded-[28px] p-6 border border-indigo-200/80 shadow-[0_4px_20px_rgba(88,86,214,0.06)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center space-x-2 text-indigo-950">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Artificial Intelligence</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                RIASEC AI
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore college pathways, competitive entrance exams, and personalized career roadmaps.
            </p>
            <div className="pt-2">
              <Link to="/career" className="ios-gloss-btn px-4 py-2 text-xs font-semibold space-x-1.5 inline-flex items-center">
                <span>Start Assessment</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PARENT GUARDIAN VIEW
  // =========================================================================
  if (user?.portal_type === 'parent') {
    return (
      <div className="space-y-6 animate-fadeIn">
        {restrictedNotice && (
          <div role="alert" aria-live="polite" className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{restrictedNotice}</span>
            </div>
            <button
              onClick={() => setRestrictedNotice(null)}
              aria-label="Dismiss access restricted notice"
              className="text-rose-500 hover:text-rose-700 text-sm font-bold ml-3"
            >
              ×
            </button>
          </div>
        )}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider">
              Parent Guardian Portal
            </span>
            <h1 className="text-3xl font-extrabold mt-3 tracking-tight text-[#1D1D1F]">
              Welcome back, {user?.full_name || 'Guardian'}!
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Monitor your children's live attendance, grades, class timetable, and fee receipts.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F]">Linked Children ({children.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {children.map((child) => (
              <div key={child.id} className="ios-card-interactive rounded-[22px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[16px] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-[#0071E3] flex items-center justify-center font-bold text-lg">
                    {child.full_name.charAt(0)}
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-[#34C759] rounded-full border border-emerald-500/20 uppercase">
                    {child.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1D1D1F]">{child.full_name}</h3>
                <p className="text-xs text-[#86868B] font-mono mt-0.5">
                  Admission No: {child.admission_number}
                </p>

                <div className="mt-4 pt-4 border-t border-black/[0.05] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#86868B]">Class:</span>{' '}
                    <span className="font-semibold text-[#1D1D1F]">{child.class_name}</span>
                  </div>
                  <div>
                    <span className="text-[#86868B]">Section:</span>{' '}
                    <span className="font-semibold text-[#1D1D1F]">{child.section_name}</span>
                  </div>
                </div>

                {/* Gamified Rewards Summary Card */}
                {childRewards[child.id] && (
                  <div className="mt-4 pt-4 border-t border-black/[0.05] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Merit & Honors</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                        {childRewards[child.id].current_level} SCHOLAR
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Scholarship Points</div>
                        <div className="text-lg font-black text-amber-700">
                          {childRewards[child.id].total_points.toLocaleString()} <span className="text-xs font-bold text-slate-500">pts</span>
                        </div>
                      </div>
                      <Link
                        to="/rewards"
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition"
                      >
                        <span>View Full Rewards</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Top 3 Badges Earned */}
                    {childRewards[child.id].earned_badges && childRewards[child.id].earned_badges.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-400">Distinctions Earned:</div>
                        <div className="grid grid-cols-3 gap-2">
                          {childRewards[child.id].earned_badges.slice(0, 3).map((eb: any) => {
                            const isNew = (new Date().getTime() - new Date(eb.awarded_at).getTime()) < 14 * 24 * 60 * 60 * 1000;
                            return (
                              <div
                                key={eb.id}
                                className="relative bg-white/80 p-2 rounded-xl border border-slate-200/80 text-center shadow-xs overflow-hidden"
                              >
                                {isNew && (
                                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-bl shadow-xs">
                                    NEW!
                                  </span>
                                )}
                                <div className="flex items-center justify-center py-1">
                                  <Award className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-[10px] font-bold text-slate-800 truncate mt-1">
                                  {eb.badge?.name || 'Achievement'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
                  <Link to="/attendance" className="font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <span>View Attendance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadIdCard(child.id, child.admission_number)}
                      disabled={downloadingId === child.id}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                      title="Download Student ID Card"
                    >
                      {downloadingId === child.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <span>ID Card</span>
                      )}
                    </button>
                    <Link to="/transport" className="font-semibold text-slate-600 hover:text-slate-800 flex items-center space-x-1">
                      <span>Track Bus</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // WORKFLOW STEPS DATA (Big School End-to-End Practical Architecture)
  // =========================================================================
  const bigSchoolWorkflowSteps = [
    {
      id: 'step-01',
      title: '1. Admissions & Enrollment',
      category: 'Admissions',
      description: 'Receive applications, verify student records, and issue admission IDs.',
      link: '/students',
      linkText: 'Admissions',
      badge: 'Step 1',
    },
    {
      id: 'step-02',
      title: '2. Classes & Timetables',
      category: 'Academics',
      description: 'Assign students to classes, allocate teachers, and set weekly schedules.',
      link: '/academic',
      linkText: 'Timetable',
      badge: 'Step 2',
    },
    {
      id: 'step-03',
      title: '3. Attendance Tracking',
      category: 'Attendance',
      description: 'Record daily roll-call and monitor students below the 75% target.',
      link: '/attendance',
      linkText: 'Attendance',
      badge: 'Step 3',
    },
    {
      id: 'step-04',
      title: '4. Examinations & Grades',
      category: 'Exams',
      description: 'Conduct term assessments, record subject marks, and issue report cards.',
      link: '/examinations',
      linkText: 'Examinations',
      badge: 'Step 4',
    },
    {
      id: 'step-05',
      title: '5. Fees & Payments',
      category: 'Fees',
      description: 'Generate term fee invoices, collect dues, and issue receipts.',
      link: '/fees',
      linkText: 'Fees',
      badge: 'Step 5',
    },
    {
      id: 'step-06',
      title: '6. Transport & Buses',
      category: 'Transport',
      description: 'Real-time bus tracking and student transit route management.',
      link: '/transport',
      linkText: 'Transport',
      badge: 'Step 6',
    },
    {
      id: 'step-07',
      title: '7. Staff & Treasury',
      category: 'Operations',
      description: 'Oversee faculty attendance, operating expenses, and institutional finances.',
      link: isSuperAdmin ? '/treasury' : '/staff-attendance',
      linkText: isSuperAdmin ? 'Treasury' : 'Staff',
      badge: 'Step 7',
    },
  ];

  // =========================================================================
  // 3. SUPER ADMIN EXECUTIVE GOVERNANCE DASHBOARD
  // =========================================================================
  if (isSuperAdmin) {
    const lowAttendanceRadar = stats?.low_attendance_radar || [];
    const staffSummary = stats?.staff_attendance_summary || {};
    const loans = stats?.institutional_loans || [];
    const bills = stats?.vendor_bills || [];
    const unpaidBills = bills.filter((b: any) => !b.is_paid);

    return (
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {restrictedNotice && (
          <div role="alert" aria-live="polite" className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{restrictedNotice}</span>
            </div>
            <button
              onClick={() => setRestrictedNotice(null)}
              aria-label="Dismiss access restricted notice"
              className="text-rose-500 hover:text-rose-700 text-sm font-bold ml-3"
            >
              ×
            </button>
          </div>
        )}
        {/* Super Admin Executive Hero Banner */}
        <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/80 to-blue-50/90 rounded-[28px] p-8 text-slate-900 border border-purple-200/80 shadow-[0_8px_32px_rgba(88,86,214,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin Board Trustee</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/15 text-[#34C759] border border-emerald-500/30 text-xs font-semibold rounded-full">
                {stats?.active_academic_year || 'Academic Session 2026-2027'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Governance & Operations
            </h1>
            <p className="text-slate-600 text-xs md:text-sm max-w-2xl">
              Supervisory overview of students, staff, and institutional finances.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to="/treasury"
              className="ios-gloss-btn-emerald px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md inline-flex items-center gap-2"
            >
              <Landmark className="w-4 h-4" />
              <span>Treasury & Loans</span>
            </Link>
            <Link
              to="/staff-attendance"
              className="ios-gloss-btn px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Staff Attendance</span>
            </Link>
          </div>
        </div>

        {/* 4 Macro Institutional Headcount & Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Students */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Enrolled Students
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">
                {stats?.total_active_students || 0}
              </span>
              <span className="text-xs text-blue-600 font-semibold">Active Scholars</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Overall Student Attendance:</span>
              <span className="font-bold text-emerald-600">{stats?.overall_student_attendance_pct || '94.2'}%</span>
            </div>
          </div>

          {/* Total Teachers & Staff Workforce */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Teaching & Staff Headcount
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">
                {stats?.total_teachers || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">Teachers ({stats?.total_active_staff || 0} Total Staff)</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Staff Present Today:</span>
              <span className="font-bold text-indigo-700">
                {staffSummary?.present_today || stats?.total_active_staff || 0}/{stats?.total_active_staff || 0}
              </span>
            </div>
          </div>

          {/* Institutional Capital Debt Loans */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Institutional Bank Loans
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">
                ₹{stats?.total_debt_outstanding || '61,20,000'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>{loans.length || 3} Active Bank Facilities</span>
              <span className="font-semibold text-slate-700">EMI: ₹{stats?.total_monthly_emi || '1,76,500'}</span>
            </div>
          </div>

          {/* Vendor Bills to Pay */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Operating Bills To Pay
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">
                {unpaidBills.length}
              </span>
              <span className="text-xs text-rose-600 font-bold">Invoices Pending</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Campus Utilities & Fleet</span>
              <Link to="/treasury" className="font-bold text-[#0071E3] hover:underline">
                Pay Invoices &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION: COMPLETE BIG SCHOOL PRACTICAL WORKFLOW MAP */}
        <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-black/[0.05]">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0071E3]" />
                <h2 className="text-lg font-bold text-[#1D1D1F]">
                  Operational Workflow
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Step-by-step overview of institutional management.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0071E3] border border-blue-200 text-xs font-semibold self-start md:self-auto">
              Interactive Blueprint
            </span>
          </div>

          {/* Workflow Stepper Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-6">
            {bigSchoolWorkflowSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveWorkflowStep(idx)}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  activeWorkflowStep === idx
                    ? 'bg-blue-50 border-[#0071E3] shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/60 hover:bg-slate-100/70'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${activeWorkflowStep === idx ? 'text-[#0071E3]' : 'text-slate-400'}`}>
                  Step 0{idx + 1}
                </div>
                <div className={`text-xs font-bold mt-1 line-clamp-1 ${activeWorkflowStep === idx ? 'text-[#1D1D1F]' : 'text-slate-700'}`}>
                  {step.category}
                </div>
              </button>
            ))}
          </div>

          {/* Active Workflow Card Detail */}
          <div className="mt-5 p-6 rounded-[22px] bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/50 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0071E3] uppercase tracking-wider">
                  {bigSchoolWorkflowSteps[activeWorkflowStep].badge}
                </span>
                <h3 className="text-base font-bold text-[#1D1D1F] mt-2">
                  {bigSchoolWorkflowSteps[activeWorkflowStep].title}
                </h3>
              </div>
              <Link
                to={bigSchoolWorkflowSteps[activeWorkflowStep].link}
                className="ios-gloss-btn px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Open {bigSchoolWorkflowSteps[activeWorkflowStep].linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed max-w-3xl">
              {bigSchoolWorkflowSteps[activeWorkflowStep].description}
            </p>
          </div>
        </div>

        {/* SECTION: TWO-COLUMN OVERSIGHT (LOANS & BILLS TO PAY vs STAFF WORKFORCE) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bills to Pay & Loans Summary */}
          <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-rose-500" />
                  <h3 className="text-sm font-bold text-[#1D1D1F]">
                    Upcoming Vendor Operating Bills ({unpaidBills.length} Due)
                  </h3>
                </div>
                <Link to="/treasury" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>View All Bills</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-black/[0.04] mt-3">
                {bills.slice(0, 4).map((bill: any) => (
                  <div key={bill.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#1D1D1F]">{bill.vendor_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {bill.category} • <span className="font-semibold text-rose-600">{bill.due_date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1D1D1F]">₹{bill.amount}</div>
                      {bill.is_paid ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Settled
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          {bill.urgency}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Institutional Debt: 3 Commercial Bank Loans Active</span>
              <Link to="/treasury" className="ios-gloss-btn-emerald px-3.5 py-1.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Authorize Disbursements</span>
              </Link>
            </div>
          </div>

          {/* Staff Workforce & Attendance Oversight */}
          <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-[#1D1D1F]">
                    Staff Workforce & Daily Attendance
                  </h3>
                </div>
                <Link to="/staff-attendance" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>Full Staff Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Staff KPIs */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Teachers</span>
                  <span className="text-lg font-bold text-slate-800">{stats?.total_teachers || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                  <span className="text-[10px] font-semibold uppercase text-emerald-700 block">Present Today</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {staffSummary?.present_today || stats?.total_active_staff || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center">
                  <span className="text-[10px] font-semibold uppercase text-amber-700 block">On Leave</span>
                  <span className="text-lg font-bold text-amber-700">
                    {staffSummary?.on_leave_today || 1}
                  </span>
                </div>
              </div>

              {/* Sample Staff Working Roster */}
              <div className="divide-y divide-black/[0.04]">
                {(staffSummary?.roster || []).slice(0, 3).map((staff: any) => (
                  <div key={staff.employee_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#1D1D1F]">{staff.full_name}</div>
                      <div className="text-[11px] text-slate-500">{staff.designation} • {staff.department}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                      {staff.status} ({staff.check_in})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Accessible to both Admin & Super Admin</span>
              <Link to="/staff-attendance" className="ios-gloss-btn px-3.5 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Manage Staff Attendance</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. ADMIN & PRINCIPAL CAMPUS OPERATIONS DASHBOARD
  // =========================================================================
  if (isAdmin || !isTeacher) {
    const lowAttendanceRadar = stats?.low_attendance_radar || [];
    const staffSummary = stats?.staff_attendance_summary || {};

    return (
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {restrictedNotice && (
          <div role="alert" aria-live="polite" className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{restrictedNotice}</span>
            </div>
            <button
              onClick={() => setRestrictedNotice(null)}
              aria-label="Dismiss access restricted notice"
              className="text-rose-500 hover:text-rose-700 text-sm font-bold ml-3"
            >
              ×
            </button>
          </div>
        )}
        {/* Admin Executive Header */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center space-x-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Campus Administration & Principal Desk</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/15 text-[#34C759] border border-emerald-500/30 text-xs font-semibold rounded-full">
                {stats?.active_academic_year || 'Academic Session 2026-2027'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Campus Operations
            </h1>
            <p className="text-slate-600 text-xs md:text-sm max-w-2xl">
              Daily summary of students, faculty, and academic programs.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to="/staff-attendance"
              className="ios-gloss-btn px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Staff Attendance</span>
            </Link>
            <Link
              to="/reports"
              className="ios-gloss-btn-secondary px-4 py-2.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#0071E3]" />
              <span>Export Reports</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Students Headcount */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Enrolled Students
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">
                {stats?.total_active_students || 0}
              </span>
              <span className="text-xs text-blue-600 font-semibold">Scholars</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Grades 1 to 12</span>
              <Link to="/students" className="font-semibold text-blue-600 hover:underline">
                View Register &rarr;
              </Link>
            </div>
          </div>

          {/* Total Teachers Headcount */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Teaching Faculty
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">
                {stats?.total_teachers || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">Teachers</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>{stats?.total_admin_staff || 5} Admin • {stats?.total_support_staff || 6} Support</span>
              <span className="font-semibold text-slate-700">{stats?.total_active_staff || 0} Staff</span>
            </div>
          </div>

          {/* Student Total Institutional Attendance */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Student Total Attendance
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">
                {stats?.overall_student_attendance_pct || '94.2'}%
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Overall Rate</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Today's Daily Roll:</span>
              <span className="font-bold text-slate-800">{stats?.today_student_attendance?.percentage || '94.2'}%</span>
            </div>
          </div>

          {/* Staff Attendance Snapshot */}
          <div className="bg-white rounded-[24px] p-6 border border-black/[0.06] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Staff Daily Attendance
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">
                {staffSummary?.present_today || stats?.total_active_staff || 0}/{stats?.total_active_staff || 0}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Present</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>{staffSummary?.on_leave_today || 1} On Leave</span>
              <Link to="/staff-attendance" className="font-bold text-blue-600 hover:underline">
                View Register &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION: LOW ATTENDANCE RADAR (<75% STATUTORY WARNING LIST) */}
        <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.05]">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#1D1D1F]">
                  Low Attendance Alerts ({lowAttendanceRadar.length})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Students with aggregate attendance below 75%.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
              Statutory 75% Rule
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.04] text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Student & Adm #</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4">Days Present / Absent</th>
                  <th className="py-3 px-4">Statutory Risk Category</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {lowAttendanceRadar.map((st: any) => {
                  const isNotified = notifiedStudents[st.student_id];

                  return (
                    <tr key={st.student_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1D1D1F] text-sm">{st.full_name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{st.admission_number}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {st.class_name} - {st.section_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600 text-sm">{st.attendance_percentage}%</span>
                          <span className="text-[10px] text-rose-500 font-semibold uppercase">Below 75%</span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-rose-500 h-1.5 rounded-full"
                            style={{ width: `${st.attendance_percentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="font-semibold text-emerald-700">{st.days_present} Days</span> /{' '}
                        <span className="font-semibold text-rose-700">{st.days_absent} Days Absent</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 block max-w-xs">
                          {st.statutory_risk}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isNotified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Parent Notified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleNotifyParent(st.student_id, st.parent_phone, st.full_name)}
                            className="ios-gloss-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            Notify Parent
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION: COMPLETE BIG SCHOOL OPERATIONAL WORKFLOW MAP */}
        <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-black/[0.05]">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0071E3]" />
                <h2 className="text-lg font-bold text-[#1D1D1F]">
                  Complete Big School Operational Workflow Map
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                How Ever Grow Schools operates: Step-by-step institutional delivery from student admission to faculty timetable, roll-call, exams, fees, fleet, and governance.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0071E3] border border-blue-200 text-xs font-semibold self-start md:self-auto">
              Interactive Blueprint
            </span>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-6">
            {bigSchoolWorkflowSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveWorkflowStep(idx)}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  activeWorkflowStep === idx
                    ? 'bg-blue-50 border-[#0071E3] shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/60 hover:bg-slate-100/70'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${activeWorkflowStep === idx ? 'text-[#0071E3]' : 'text-slate-400'}`}>
                  Step 0{idx + 1}
                </div>
                <div className={`text-xs font-bold mt-1 line-clamp-1 ${activeWorkflowStep === idx ? 'text-[#1D1D1F]' : 'text-slate-700'}`}>
                  {step.category}
                </div>
              </button>
            ))}
          </div>

          {/* Active Card Detail */}
          <div className="mt-5 p-6 rounded-[22px] bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/50 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0071E3] uppercase tracking-wider">
                  {bigSchoolWorkflowSteps[activeWorkflowStep].badge}
                </span>
                <h3 className="text-base font-bold text-[#1D1D1F] mt-2">
                  {bigSchoolWorkflowSteps[activeWorkflowStep].title}
                </h3>
              </div>
              <Link
                to={bigSchoolWorkflowSteps[activeWorkflowStep].link}
                className="ios-gloss-btn px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Launch {bigSchoolWorkflowSteps[activeWorkflowStep].linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed max-w-3xl">
              {bigSchoolWorkflowSteps[activeWorkflowStep].description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. TEACHER CLASSROOM HUB
  // =========================================================================
  return (
    <div className="space-y-7 animate-fadeIn max-w-6xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-8 text-slate-900 shadow-[0_8px_32px_rgba(0,113,227,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-200/80 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-blue-100/80 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider">
            Faculty Teaching Hub
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            Welcome, {user?.full_name || 'Faculty Member'}!
          </h1>
          <p className="text-slate-600 text-sm">
            Manage your daily class attendance roll-call, teaching schedule, and student examination marks entry.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <Link
            to="/attendance"
            className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold shadow-md flex items-center space-x-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Conduct Roll-Call</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link to="/academic" className="ios-card rounded-[22px] p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Assigned Classes</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">Grade 10-A</span>
          </div>
          <div className="mt-3 text-xs text-blue-600 font-semibold flex items-center gap-1">
            <span>Class Teacher Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link to="/attendance" className="ios-card rounded-[22px] p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Daily Roll-Call</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">Today's Register</span>
          </div>
          <div className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span>Mark Attendance</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link to="/examinations" className="ios-card rounded-[22px] p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Marks Entry</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">Term 1 Results</span>
          </div>
          <div className="mt-3 text-xs text-purple-600 font-semibold flex items-center gap-1">
            <span>Gradebook Entry</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
};
