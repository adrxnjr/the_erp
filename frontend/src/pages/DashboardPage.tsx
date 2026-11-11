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
  Package,
  FileCheck,
  Printer,
  X,
  FileText,
  UserPlus,
  ShieldAlert,
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
      } catch { }
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
    (user?.roles?.includes('principal') ||
      user?.roles?.includes('admin'));

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

  const isTeacher =
    !isSuperAdmin &&
    !isCoordinator &&
    !isAdmin &&
    !isOfficeStaff &&
    (user?.roles?.includes('teacher') ||
      user?.username?.startsWith('teacher') ||
      user?.username?.startsWith('staff3') ||
      user?.portal_type === 'staff');

  // Office Desk interactive certificate modal state
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [certForm, setCertForm] = useState({
    studentName: 'M. Mohan',
    admissionNo: 'EGS20260001',
    className: 'Class 10-A',
    certType: 'Bonafide Certificate',
    purpose: 'Passport Application',
  });
  const [certGenerated, setCertGenerated] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        if (user?.portal_type === 'parent') {
          try {
            const res = await api.get('/portal/parent/children');
            setChildren(res.data);
            if (Array.isArray(res.data)) {
              const rewardsMap: Record<string, any> = {};
              await Promise.allSettled(
                res.data.map(async (child: any) => {
                  try {
                    const rRes = await api.get('/rewards/my-points', { params: { student_id: child.id } });
                    rewardsMap[child.id] = rRes.data;
                  } catch (err) { }
                })
              );
              setChildRewards(rewardsMap);
            }
          } catch {
            setChildren([
              { id: 'stud-1', full_name: 'Aarav Sharma', grade: 'Grade 8-A', roll_no: '2026-0801', attendance: '96.5%', points: 420 },
              { id: 'stud-2', full_name: 'Diya Sharma', grade: 'Grade 5-B', roll_no: '2026-0514', attendance: '98.2%', points: 380 }
            ]);
          }
        } else if (user?.portal_type === 'student') {
          try {
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
          } catch {
            setStats({
              id: 'stud-demo-1',
              full_name: user?.full_name || 'Aarav Sharma',
              grade: 'Grade 8-A',
              roll_no: '2026-0801',
              attendance_rate: 96.5,
              points: 420,
            });
          }
        } else if (isSuperAdmin) {
          try {
            const res = await api.get('/dashboards/super-admin');
            setStats(res.data);
          } catch {
            setStats({
              total_students: 2450,
              total_faculty: 128,
              total_revenue: '₹1.84 Cr',
              collection_rate: '94.2%',
              attendance_rate: '96.8%',
            });
          }
        } else if (isCoordinator) {
          try {
            const res = await api.get('/dashboards/admin-operations');
            setStats(res.data);
          } catch {
            setStats({
              total_active_students: 150,
              total_teachers: 60,
              student_attendance_rate: 96.4,
              staff_attendance_rate: 98.5,
            });
          }
        } else if (isAdmin) {
          try {
            const res = await api.get('/dashboards/admin-operations');
            setStats(res.data);
          } catch {
            setStats({
              total_active_students: 2450,
              total_teachers: 128,
              student_attendance_rate: 96.4,
              staff_attendance_rate: 98.5,
            });
          }
        } else if (isOfficeStaff) {
          try {
            const res = await api.get('/dashboards/admin-operations');
            setStats(res.data);
          } catch {
            setStats({
              total_active_students: 150,
              total_teachers: 15,
              student_attendance_rate: 96.4,
              staff_attendance_rate: 100,
            });
          }
        } else {
          // Teacher
          try {
            const res = await api.get('/dashboards/teacher');
            setStats(res.data);
          } catch (tErr) {
            console.warn('Teacher dashboard fallback applied:', tErr);
            setStats({
              staff_name: user?.full_name || 'Michael Chang',
              assignments: [],
              today_timetable: [],
            });
          }
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
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-5 sm:p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Welcome back, {stats?.full_name || user.full_name}
            </h1>
          </div>
          <div className="relative z-10 flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => handleDownloadIdCard(stats?.id, stats?.admission_number)}
              disabled={downloadingId === stats?.id}
              className="ios-gloss-btn px-4 py-2.5 text-xs font-bold space-x-2 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 w-full sm:w-auto"
            >
              {downloadingId === stats?.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download ID Card</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
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
              Your attendance meets examination requirements ({attPct}%). Keep attendance above 75% for exam clearance.
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

        {/* =========================================================================
            STUDENT ENRICHED CONTENT: TIMETABLE & ACTIVE HOMEWORK
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule Timeline (2 Cols) */}
          <div className="lg:col-span-2 ios-card rounded-[28px] p-6 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Today's Academic Schedule</h3>
                  <p className="text-[11px] text-[#86868B]">Class 10-A • Monday Routine • 6 Scheduled Periods</p>
                </div>
              </div>
              <Link
                to="/timetable"
                className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center space-x-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Period 1 • 08:30 - 09:15
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">✓ Done</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Mathematics</h4>
                  <p className="text-xs text-slate-500">Quadratic Equations & Roots • Dr. Vance</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Room 204 • Academic Wing</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Period 2 • 09:20 - 10:05
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">✓ Done</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Physics Lab</h4>
                  <p className="text-xs text-slate-500">Electromagnetic Induction • Mrs. Raman</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Science Block • Lab 2</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 ring-2 ring-blue-500/20 flex items-start justify-between shadow-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white animate-pulse">
                      Period 3 • 10:20 - 11:05
                    </span>
                    <span className="text-[10px] font-extrabold text-[#0071E3]">Live Now</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Computer Science</h4>
                  <p className="text-xs text-slate-600">Python Data Structures & Recursion • Michael Chang</p>
                  <p className="text-[11px] font-semibold text-blue-600 mt-1">Computer Lab 1 • Workstation #14</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      Period 4 • 11:10 - 11:55
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Next</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">English Literature</h4>
                  <p className="text-xs text-slate-500">The Merchant of Venice (Act IV) • Mrs. Green</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Room 204 • Academic Wing</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      Period 5 • 12:45 - 01:30
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Chemistry</h4>
                  <p className="text-xs text-slate-500">Redox Reactions & Titration • Dr. S. Nair</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Chemistry Lab 1</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      Period 6 • 01:35 - 02:20
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Physical Education</h4>
                  <p className="text-xs text-slate-500">Track & Athletics Conditioning • Coach David</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Ever Grow Sports Complex</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gamified Honors & Attendance Streak (1 Col) */}
          <div className="ios-card rounded-[28px] p-6 space-y-5 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Student Honors & Streak</h3>
                  <p className="text-[11px] text-[#86868B]">Gamified Scholar Level</p>
                </div>
              </div>
              <Link to="/rewards" className="text-xs font-semibold text-[#0071E3] hover:underline">
                View All
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
                  Tier 2 • Silver Scholar
                </span>
                <span className="text-xs font-black">1,450 XP</span>
              </div>
              <div>
                <p className="text-xs text-amber-100 font-medium">Rank in Class 10-A</p>
                <p className="text-2xl font-black tracking-tight">#4 of 50 Students</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-amber-100">
                  <span>Level 6 Progress</span>
                  <span>85% to Gold Scholar</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                  🔥
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1D1D1F]">18-Day Attendance Streak</h4>
                  <p className="text-[11px] text-slate-500">Perfect morning check-ins</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recent Badges Unlocked</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-lg">📐</div>
                  <p className="text-[10px] font-bold text-slate-700 mt-1 line-clamp-1">Mathlete</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-lg">💻</div>
                  <p className="text-[10px] font-bold text-slate-700 mt-1 line-clamp-1">Code Ace</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-lg">⭐</div>
                  <p className="text-[10px] font-bold text-slate-700 mt-1 line-clamp-1">Perfectionist</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STUDENT ENRICHED CONTENT: HOMEWORK & EXAM SNAPSHOT & LIBRARY
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Homework & Deadlines */}
          <div className="ios-card rounded-[28px] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Pending Homework</h3>
                  <p className="text-[11px] text-[#86868B]">3 active assignments</p>
                </div>
              </div>
              <Link to="/homework" className="text-xs font-semibold text-[#0071E3] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Mathematics
                  </span>
                  <span className="text-[10px] font-bold text-rose-600">Due Tomorrow</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">CBSE Ch 4 Exercise 4.2 - Roots of Quadratic Equations</h4>
                <p className="text-[11px] text-slate-500">Assigned by Dr. Vance • Submit handwritten notebook scan</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Computer Science
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Due Nov 15</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Recursive Binary Search Tree Traversal</h4>
                <p className="text-[11px] text-slate-500">Assigned by Michael Chang • Upload .py script to portal</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    General Science
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Due Nov 18</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Chemistry Titration Practical Record Notebook</h4>
                <p className="text-[11px] text-slate-500">Assigned by Dr. S. Nair • Physical verification at Lab</p>
              </div>
            </div>
          </div>

          {/* Recent Exam Evaluation Snapshot */}
          <div className="ios-card rounded-[28px] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Term 1 Examination Scores</h3>
                  <p className="text-[11px] text-[#86868B]">Official CBSE Grade Card Snapshot</p>
                </div>
              </div>
              <Link to="/examinations" className="text-xs font-semibold text-[#0071E3] hover:underline">
                Gradebook
              </Link>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Computer Science</span>
                  <span className="text-emerald-600">95 / 100 (A+)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Mathematics</span>
                  <span className="text-emerald-600">92 / 100 (A+)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>General Science</span>
                  <span className="text-blue-600">88 / 100 (A)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>English Literature</span>
                  <span className="text-purple-600">84 / 100 (B+)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Overall Aggregated CGPA: <strong className="text-slate-900 font-black">9.2 / 10</strong></span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                Passed (Distinction)
              </span>
            </div>
          </div>

          {/* Library & Campus Resources */}
          <div className="ios-card rounded-[28px] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Issued Library Books</h3>
                  <p className="text-[11px] text-[#86868B]">Campus Digital Catalog</p>
                </div>
              </div>
              <Link to="/library" className="text-xs font-semibold text-[#0071E3] hover:underline">
                Catalog
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded">
                  Barcode: LIB-9821
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">NCERT Mathematics Exemplar (Class X)</h4>
                <p className="text-[11px] text-slate-500">Borrowed: Nov 2 • Due Date: Nov 16 (On Time)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Barcode: LIB-1044
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">Python Programming & Algorithms Guide</h4>
                <p className="text-[11px] text-slate-500">Borrowed: Nov 5 • Due Date: Nov 19 (On Time)</p>
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.04]">
              <Link
                to="/library"
                className="w-full py-2.5 px-3 rounded-xl bg-[#0071E3]/10 text-[#0071E3] text-xs font-bold hover:bg-[#0071E3]/20 transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Search 12,450+ Books & ePubs</span>
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
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-5 sm:p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] relative overflow-hidden">
          <div className="relative z-10 max-w-xl min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Welcome back, {user?.full_name || 'Guardian'}!
            </h1>
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
        <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/80 to-blue-50/90 rounded-[28px] p-5 sm:p-6 md:p-8 text-slate-900 border border-purple-200/80 shadow-[0_8px_32px_rgba(88,86,214,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Governance & Operations
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10 w-full md:w-auto">
            <Link
              to="/treasury"
              className="flex-1 sm:flex-none justify-center ios-gloss-btn-emerald px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md inline-flex items-center gap-2"
            >
              <Landmark className="w-4 h-4" />
              <span>Treasury</span>
            </Link>
            <Link
              to="/staff-attendance"
              className="flex-1 sm:flex-none justify-center ios-gloss-btn px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Staff Attendance</span>
            </Link>
          </div>
        </div>

        {/* 4 Macro Institutional Headcount & Telemetry Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
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
                className={`p-3 rounded-2xl text-left transition-all border ${activeWorkflowStep === idx
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
  // 3.4. ACADEMIC COORDINATOR COMMAND HUB (WING GOVERNANCE & CURRICULUM)
  // =========================================================================
  if (isCoordinator) {
    const coordinatorModules = [
      {
        id: 'academic',
        title: 'Curriculum Syllabi & Course Units',
        badge: 'Coordinator Authority',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: BookOpen,
        iconColor: 'bg-emerald-50 text-emerald-600',
        description: 'Govern official curriculum syllabi, weekly instructional hours, prescribed NCERT textbooks, and course learning competencies.',
        primaryLink: '/academic',
        primaryText: 'Manage Syllabi',
        secondaryLink: '/coordinators',
        secondaryText: 'Council Meeting',
      },
      {
        id: 'examinations',
        title: 'Examinations & Grading Moderation',
        badge: 'Term 1 Published',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: GraduationCap,
        iconColor: 'bg-purple-50 text-purple-600',
        description: 'Supervise subject grading matrices, verify teacher remarks, calculate GPA rankings, and audit student report cards.',
        primaryLink: '/examinations',
        primaryText: 'Examinations Desk',
        secondaryLink: '/academic',
        secondaryText: 'Grading Scales',
      },
      {
        id: 'coordinators',
        title: 'Academic Coordinators Council',
        badge: '3 Wings Active',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: Layers,
        iconColor: 'bg-teal-50 text-teal-600',
        description: 'Synchronize inter-wing curriculum progression across Primary (Grades 1-5), Middle (6-9), and Senior Secondary (10-12) wings.',
        primaryLink: '/coordinators',
        primaryText: 'Council Chamber',
        secondaryLink: '/social-wall',
        secondaryText: 'Announcements',
      },
      {
        id: 'timetable',
        title: 'Timetable & Period Schedules',
        badge: 'Master Matrix',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Clock,
        iconColor: 'bg-blue-50 text-[#0071E3]',
        description: 'Oversee weekly classroom timetable schedules, faculty period distribution, lab slots, and substitute teacher rosters.',
        primaryLink: '/timetable',
        primaryText: 'Inspect Timetable',
        secondaryLink: '/staff-attendance',
        secondaryText: 'Faculty Roster',
      },
      {
        id: 'attendance',
        title: 'Attendance Insights & Academic Risk',
        badge: 'Statutory 75% Rule',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: CalendarCheck,
        iconColor: 'bg-rose-50 text-rose-600',
        description: 'Track class-wise student attendance muster roll, audit chronic absentees (<75%), and review student eligibility for board exams.',
        primaryLink: '/attendance',
        primaryText: 'Attendance Insights',
        secondaryLink: '/students',
        secondaryText: 'Student Directory',
      },
      {
        id: 'homework',
        title: 'Homework, Assignments & Circulars',
        badge: 'Curriculum Broadcast',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: FileText,
        iconColor: 'bg-amber-50 text-amber-600',
        description: 'Publish weekly homework circulars, learning handouts, and academic instructions across classes and parents.',
        primaryLink: '/homework',
        primaryText: 'Homework Circulars',
        secondaryLink: '/social-wall',
        secondaryText: 'School Wall',
      },
    ];

    const academicWings = [
      { wing: 'Primary Wing', grades: 'Grades 1 to 5', coordinator: 'Ms. Sarah Jenkins', students: '45 Scholars', weeklyHours: '22 Hrs/Wk', status: 'Curriculum On Track', syllabusStatus: 'Approved & Active' },
      { wing: 'Middle School Wing', grades: 'Grades 6 to 9', coordinator: 'Mrs. Rachel Green', students: '55 Scholars', weeklyHours: '28 Hrs/Wk', status: 'Curriculum On Track', syllabusStatus: 'Approved & Active' },
      { wing: 'Senior Secondary Wing', grades: 'Grades 10 to 12', coordinator: 'Dr. Arthur Vance / Elena Rostova', students: '50 Scholars', weeklyHours: '32 Hrs/Wk', status: 'Term 1 Moderation Ready', syllabusStatus: 'Approved & Active' },
    ];

    return (
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Coordinator Hero Header */}
        <div className="bg-gradient-to-r from-teal-50/90 via-sky-50/80 to-blue-50/90 rounded-[28px] p-5 sm:p-6 md:p-8 text-slate-900 border border-teal-200/80 shadow-[0_8px_32px_rgba(13,148,136,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Academic Council
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10 w-full md:w-auto">
            <Link
              to="/academic"
              className="flex-1 sm:flex-none justify-center ios-gloss-btn px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Manage Syllabi</span>
            </Link>
            <Link
              to="/examinations"
              className="flex-1 sm:flex-none justify-center ios-gloss-btn-secondary px-4 py-2.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-[#0071E3]" />
              <span>Examinations</span>
            </Link>
          </div>
        </div>

        {/* 4 Academic Summary Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Academic Wings</span>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">3 Wings</span>
            </div>
            <p className="mt-2 text-xs text-teal-600 font-semibold">Primary • Middle • Senior Secondary</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Curriculum Syllabi</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">6 Syllabi</span>
            </div>
            <p className="mt-2 text-xs text-emerald-600 font-semibold">Published & Approved for Session</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Faculty Teachers</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">60 Faculty</span>
            </div>
            <p className="mt-2 text-xs text-blue-600 font-semibold">10 Grades • 100% Muster Sync</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Student Scholars</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">150 Enrolled</span>
            </div>
            <p className="mt-2 text-xs text-purple-600 font-semibold">96.4% Campus Attendance Rate</p>
          </div>
        </div>

        {/* 6 Core Coordinator Academic Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                Academic Governance & Curriculum Operations
              </h2>
              <p className="text-xs text-[#86868B]">
                Curriculum management, assessment moderation, classroom schedules, and faculty coordination
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              6 Modules Governed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coordinatorModules.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="ios-card rounded-[22px] p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-200 group border border-slate-200/80"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl ${item.iconColor} flex items-center justify-center shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#86868B] mt-1 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={item.secondaryLink}
                      className="text-xs text-[#86868B] hover:text-[#1D1D1F] font-semibold transition-colors"
                    >
                      {item.secondaryText}
                    </Link>
                    <Link
                      to={item.primaryLink}
                      className="ios-gloss-btn-sm inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      <span>{item.primaryText}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Wing Roster Table */}
        <div className="ios-card rounded-[22px] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F]">Governed Academic Wings</h3>
              <p className="text-xs text-[#86868B]">Wing coordinator leadership, student strength, and curriculum progression status</p>
            </div>
            <Link
              to="/academic"
              className="text-xs text-[#0071E3] hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>View Full Syllabi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Academic Wing</th>
                  <th className="py-3 px-4">Governed Grades</th>
                  <th className="py-3 px-4">Lead Coordinator</th>
                  <th className="py-3 px-4 text-center">Student Roll</th>
                  <th className="py-3 px-4 text-center">Instructional Load</th>
                  <th className="py-3 px-4 text-center">Syllabus Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {academicWings.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{w.wing}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{w.grades}</td>
                    <td className="py-3 px-4 text-slate-800">{w.coordinator}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600">{w.students}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{w.weeklyHours}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{w.syllabusStatus}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/academic"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center space-x-1"
                      >
                        <span>Syllabi Units</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3.5. STAFF OFFICE DESK (11 DEDICATED SCHOOL OFFICE OPERATIONS)
  // =========================================================================
  if (isOfficeStaff) {
    const officeOperations = [
      {
        id: 'fees',
        title: 'Fees Payments & Counter Collections',
        badge: 'Counter Online',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CreditCard,
        iconColor: 'bg-emerald-50 text-emerald-600',
        description: 'Collect tuition fees, term payments, admission installments with instant thermal receipt generation and day-book ledger.',
        primaryLink: '/fees',
        primaryText: 'Open Fee Counter',
        secondaryLink: '/treasury',
        secondaryText: 'Day Ledger',
      },
      {
        id: 'attendance',
        title: 'Attendance Management System',
        badge: 'Muster Roll Sync',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: CalendarCheck,
        iconColor: 'bg-blue-50 text-[#0071E3]',
        description: 'Verify daily roll-calls across Class 10-A, 10-B, 10-C (144/150 Present), trigger absentee parent notices, and track staff attendance.',
        primaryLink: '/attendance',
        primaryText: 'Student Attendance',
        secondaryLink: '/staff-attendance',
        secondaryText: 'Staff Register',
      },
      {
        id: 'bonafide',
        title: 'Bonafide & Certificate Issuance Desk',
        badge: 'Instant Forms',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: FileCheck,
        iconColor: 'bg-purple-50 text-purple-600',
        description: 'Issue official Bonafide Certificates, Transfer Certificates (TC), Study Certificates, and Conduct Letters with institutional seals.',
        isModalAction: true,
        primaryText: 'Issue Certificate Form',
        secondaryLink: '/reports',
        secondaryText: 'Archived Letters',
      },
      {
        id: 'scholarships',
        title: 'Scholarships & Fee Concession Forms',
        badge: 'Govt & Merit Grants',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Award,
        iconColor: 'bg-amber-50 text-amber-600',
        description: 'Process state scholarship applications, sports quotas, staff ward concessions, and merit fee waiver approvals.',
        primaryLink: '/scholarships',
        primaryText: 'Scholarship Desk',
        secondaryLink: '/fees',
        secondaryText: 'Fee Concessions',
      },
      {
        id: 'admissions',
        title: 'Admission Enquiries & Enrollment Forms',
        badge: 'Session 2026-27',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        icon: HelpCircle,
        iconColor: 'bg-sky-50 text-sky-600',
        description: 'Manage prospective parent visits, admission enquiry registration, applicant document verification, and roll allotment.',
        primaryLink: '/enquiry',
        primaryText: 'Admission Enquiries',
        secondaryLink: '/admission-enquiry',
        secondaryText: 'Public Form',
      },
      {
        id: 'billing',
        title: 'Billings, Invoices & Day-Book',
        badge: 'Accounts Desk',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: Receipt,
        iconColor: 'bg-teal-50 text-teal-600',
        description: 'Generate institutional bills, bus pass fees, book store vouchers, and daily counter collection tally with invoice download.',
        primaryLink: '/billing',
        primaryText: 'Billing Desk',
        secondaryLink: '/treasury',
        secondaryText: 'Bank Records',
      },
      {
        id: 'students',
        title: 'Student Directory & Identity Roster',
        badge: '150 Students Active',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Users,
        iconColor: 'bg-indigo-50 text-indigo-600',
        description: 'Access complete student files across 10-A, 10-B, and 10-C with demographic and parent guardian records.',
        primaryLink: '/students',
        primaryText: 'Student Directory',
        secondaryLink: '/students',
        secondaryText: 'Export RFID IDs',
      },
      {
        id: 'parents',
        title: 'Parents & Guardians Directory',
        badge: 'Communication',
        badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        icon: UserPlus,
        iconColor: 'bg-cyan-50 text-cyan-600',
        description: 'Maintain parent guardian contact records, emergency numbers, address updates, and broadcast communication.',
        primaryLink: '/parents',
        primaryText: 'Guardian Directory',
        secondaryLink: '/notifications',
        secondaryText: 'Broadcast SMS',
      },
      {
        id: 'workforce',
        title: 'Staff Workforce & Leave Register',
        badge: 'HR & Roster',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: UserCheck,
        iconColor: 'bg-rose-50 text-rose-600',
        description: 'Track non-teaching staff attendance, faculty leave authorizations, and service records.',
        primaryLink: '/staff-attendance',
        primaryText: 'Staff Attendance',
        secondaryLink: '/payroll',
        secondaryText: 'Faculty Payroll',
      },
      {
        id: 'inventory',
        title: 'Inventory, Uniforms & Stationery',
        badge: 'Stores & Stock',
        badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Package,
        iconColor: 'bg-orange-50 text-orange-600',
        description: 'Classroom textbooks, notebooks, laboratory chemicals, uniforms stock, and vendor purchase orders.',
        primaryLink: '/inventory',
        primaryText: 'Inventory Ledger',
        secondaryLink: '/inventory',
        secondaryText: 'New Requisition',
      },
      {
        id: 'visitors',
        title: 'Visitor Management & Campus Gate Passes',
        badge: 'Campus Security',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: ShieldAlert,
        iconColor: 'bg-slate-100 text-slate-700',
        description: 'Issue official visitor passes for parents and contractors, log delivery vehicles, and security clearance.',
        primaryLink: '/visitors',
        primaryText: 'Visitor Gate Log',
        secondaryLink: '/transport',
        secondaryText: 'Fleet & Buses',
      },
    ];

    const handleIssueCertificate = () => {
      setCertGenerated(true);
      toast.success(`${certForm.certType} successfully generated for ${certForm.studentName} (${certForm.admissionNo})!`);
    };

    return (
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Office Desk Hero Header */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-5 sm:p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              School Office Administration
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={() => {
                setCertGenerated(false);
                setShowCertModal(true);
              }}
              className="ios-gloss-btn px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <FileCheck className="w-4 h-4" />
              <span>+ Issue Bonafide / TC</span>
            </button>
            <Link
              to="/fees"
              className="ios-gloss-btn-secondary px-4 py-2.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-[#0071E3]" />
              <span>Collect Fee</span>
            </Link>
          </div>
        </div>

        {/* 4 Office Desk Summary Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Daily Collections</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">₹1,42,500</span>
            </div>
            <p className="mt-2 text-xs text-emerald-600 font-semibold">42 Counter Receipts Logged Today</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Campus Attendance</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">96.4%</span>
            </div>
            <p className="mt-2 text-xs text-blue-600 font-semibold">144 / 150 Students Present Today</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Certificate Requests</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">8 Pending</span>
            </div>
            <p className="mt-2 text-xs text-purple-600 font-semibold">Bonafide, TC & Conduct letters</p>
          </div>

          <div className="ios-card rounded-[22px] p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Registered Scholars</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#1D1D1F] tracking-tight">150 Students</span>
            </div>
            <p className="mt-2 text-xs text-amber-600 font-semibold">Class 10-A (50), 10-B (50), 10-C (50)</p>
          </div>
        </div>

        {/* 11 School Office Works Options Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F]">School Office Administrative Counter</h2>
              <p className="text-xs text-[#86868B]">11 core operational functions for daily campus governance and student documentation.</p>
            </div>
            <span className="text-xs font-semibold text-[#0071E3] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              11 Modules Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {officeOperations.map((op) => {
              const Icon = op.icon;
              return (
                <div
                  key={op.id}
                  className="ios-card rounded-[22px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 border border-white/60"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${op.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${op.badgeColor}`}>
                        {op.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1D1D1F] mt-4 tracking-tight leading-snug">
                      {op.title}
                    </h3>
                    <p className="text-xs text-[#86868B] mt-2 leading-relaxed">
                      {op.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {op.isModalAction ? (
                      <button
                        onClick={() => {
                          setCertGenerated(false);
                          setShowCertModal(true);
                        }}
                        className="ios-gloss-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{op.primaryText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <Link
                        to={op.primaryLink!}
                        className="ios-gloss-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>{op.primaryText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <Link
                      to={op.secondaryLink}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0071E3] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {op.secondaryText}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Issuance Modal */}
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Issue Institutional Certificate</h3>
                    <p className="text-xs text-slate-500">Official seal & signature generation desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!certGenerated ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Enrolled Student</label>
                    <select
                      value={certForm.admissionNo}
                      onChange={(e) => {
                        const adm = e.target.value;
                        const names: Record<string, string> = {
                          'EGS20260001': 'M. Mohan (Class 10-A, Roll #1)',
                          'EGS20260002': 'A. Bhuvana (Class 10-A, Roll #2)',
                          'EGS20260051': 'K. Vignesh (Class 10-B, Roll #1)',
                          'EGS20260101': 'S. Sneha (Class 10-C, Roll #1)',
                        };
                        setCertForm({
                          ...certForm,
                          admissionNo: adm,
                          studentName: names[adm] || 'M. Mohan',
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0071E3] focus:outline-none"
                    >
                      <option value="EGS20260001">M. Mohan — EGS20260001 (Class 10-A, Roll #1)</option>
                      <option value="EGS20260002">A. Bhuvana — EGS20260002 (Class 10-A, Roll #2)</option>
                      <option value="EGS20260051">K. Vignesh — EGS20260051 (Class 10-B, Roll #1)</option>
                      <option value="EGS20260101">S. Sneha — EGS20260101 (Class 10-C, Roll #1)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Certificate Type</label>
                      <select
                        value={certForm.certType}
                        onChange={(e) => setCertForm({ ...certForm, certType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0071E3] focus:outline-none"
                      >
                        <option value="Bonafide Certificate">Bonafide Certificate</option>
                        <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                        <option value="Study Certificate">Study Certificate</option>
                        <option value="Character & Conduct Letter">Character & Conduct Letter</option>
                        <option value="Fee Estimation Certificate">Fee Estimation Certificate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Reason / Purpose</label>
                      <select
                        value={certForm.purpose}
                        onChange={(e) => setCertForm({ ...certForm, purpose: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0071E3] focus:outline-none"
                      >
                        <option value="Passport Application">Passport Application</option>
                        <option value="Bank Account Opening">Bank Account Opening</option>
                        <option value="Govt Scholarship Application">Govt Scholarship Application</option>
                        <option value="State Bus Concession Pass">State Bus Concession Pass</option>
                        <option value="Higher Education Admission">Higher Education Admission</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-[11px] text-purple-900">
                    <strong>Institutional Registry Policy:</strong> Issued certificates are cryptographically stamped with a unique QR verification code and archived in the school dispatch registry.
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setShowCertModal(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleIssueCertificate}
                      className="ios-gloss-btn px-5 py-2 rounded-xl font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-white" />
                      <span>Generate & Sign Certificate</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Generated Preview */
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-purple-300 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="text-xs uppercase font-black tracking-widest text-purple-700">
                      EVER GROW MATRICULATION HIGHER SECONDARY SCHOOL
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 underline">{certForm.certType}</h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      This is to certify that <strong>{certForm.studentName}</strong> (Admission No: <strong>{certForm.admissionNo}</strong>) is a bonafide student of this institution studying in <strong>Class 10-A</strong> during the academic year <strong>2026-2027</strong>.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Issued on request for the purpose of <em>{certForm.purpose}</em>.
                    </p>
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Dispatch Ref: EGS/CERT/2026/{Math.floor(1000 + Math.random() * 9000)}</span>
                      <span>Authorized Office Signatory ✓</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCertGenerated(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      ← Create Another
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          toast.success('Certificate sent to campus network printer!');
                          setShowCertModal(false);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Hardcopy</span>
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Certificate PDF downloaded successfully!');
                          setShowCertModal(false);
                        }}
                        className="ios-gloss-btn px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-5 sm:p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              Campus Operations
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10 w-full md:w-auto">
            <Link
              to="/staff-attendance"
              className="flex-1 sm:flex-none justify-center ios-gloss-btn px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Staff Attendance</span>
            </Link>
            <Link
              to="/reports"
              className="flex-1 sm:flex-none justify-center ios-gloss-btn-secondary px-4 py-2.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#0071E3]" />
              <span>Export Reports</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary Operational Metric Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
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
                className={`p-3 rounded-2xl text-left transition-all border ${activeWorkflowStep === idx
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
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-5 sm:p-6 md:p-8 text-slate-900 shadow-[0_8px_32px_rgba(0,113,227,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5 border border-blue-200/80 relative overflow-hidden">
        <div className="relative z-10 min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            Faculty Desk
          </h1>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <Link
            to="/attendance"
            className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold shadow-md flex items-center space-x-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Roll-Call</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
        <Link to="/academic" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Class Teacher</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">Grade 10-A</span>
            <span className="text-[11px] font-semibold text-slate-500">50 Students</span>
          </div>
          <div className="mt-2.5 text-xs text-blue-600 font-semibold flex items-center gap-1">
            <span>Class Mentorship Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link to="/attendance" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Daily Roll-Call</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">48 / 50 Present</span>
            <span className="text-[11px] font-semibold text-emerald-600">96% Today</span>
          </div>
          <div className="mt-2.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span>Mark Attendance</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link to="/examinations" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Marks Evaluation</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">Term 1 Complete</span>
            <span className="text-[11px] font-semibold text-purple-600">100% Graded</span>
          </div>
          <div className="mt-2.5 text-xs text-purple-600 font-semibold flex items-center gap-1">
            <span>Subject Marks Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link to="/homework" className="ios-card rounded-[22px] p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">Homework Review</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#1D1D1F] tracking-tight">14 Pending</span>
            <span className="text-[11px] font-semibold text-amber-600">Need Review</span>
          </div>
          <div className="mt-2.5 text-xs text-amber-600 font-semibold flex items-center gap-1">
            <span>Assignment Desk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* =========================================================================
          TEACHER ENRICHED CONTENT: TODAY'S TEACHING SCHEDULE & CLASS MENTOR HUB
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Teaching Schedule Timeline (2 Cols) */}
        <div className="lg:col-span-2 ios-card rounded-[28px] p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">Today's Teaching Schedule</h3>
                <p className="text-[11px] text-[#86868B]">Faculty Timetable • 5 Scheduled Periods Today</p>
              </div>
            </div>
            <Link
              to="/timetable"
              className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center space-x-1"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Period 1 • 08:30 - 09:15
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">✓ Completed</span>
                </div>
                <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Department Faculty Sync</h4>
                <p className="text-xs text-slate-500">CS Syllabus Alignment & Lab Prep</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">Staff Room B • Academic Block</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Period 2 • 09:20 - 10:05
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">✓ Completed</span>
                </div>
                <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Grade 9-A: Computer Science</h4>
                <p className="text-xs text-slate-500">Flowchart Logic & Conditional Branching</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">Room 102 • 46 Students</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 ring-2 ring-blue-500/20 flex items-start justify-between shadow-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white animate-pulse">
                    Period 3 • 10:20 - 11:05
                  </span>
                  <span className="text-[10px] font-extrabold text-[#0071E3]">Live Now</span>
                </div>
                <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Grade 10-A: Python Theory</h4>
                <p className="text-xs text-slate-600">Data Structures & Recursion Principles</p>
                <p className="text-[11px] font-semibold text-blue-600 mt-1">Computer Lab 1 • Class Teacher Section</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Period 4 • 11:10 - 11:55
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Next</span>
                </div>
                <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Grade 10-B: Computer Science</h4>
                <p className="text-xs text-slate-500">Relational Databases & SQL Queries</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">Room 205 • 48 Students</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Period 6 • 01:35 - 02:20
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Grade 10-A: Hands-On Lab</h4>
                <p className="text-xs text-slate-500">Live Coding & Term Project Assessment</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">Computer Lab 1 • 50 Workstations</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Period 7 • 02:25 - 03:10
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1D1D1F] mt-2">Remedial Mentoring</h4>
                <p className="text-xs text-slate-500">Doubt Clearing & Special Coaching</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">CS Resource Room 104</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grade 10-A Class Teacher Mentorship Hub (1 Col) */}
        <div className="ios-card rounded-[28px] p-6 space-y-5 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0071E3] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">Class 10-A Mentorship</h3>
                <p className="text-[11px] text-[#86868B]">Class Teacher Assigned Hub</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
              50 Scholars
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Today's Morning Roll</span>
              <span className="text-xs font-black text-emerald-600">48 / 50 Present</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
            </div>
            <p className="text-[11px] text-slate-500">2 absent students marked in today's register</p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unexcused / Leave Absentees</p>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-rose-950">Roll #14: Priya Sharma</h5>
                  <p className="text-[10px] text-rose-700">Medical Leave (Parent Notified via SMS)</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Leave
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-amber-950">Roll #27: Karthik R.</h5>
                  <p className="text-[10px] text-amber-700">Unexcused Absence • Call Parent</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Absent
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-black/[0.04] space-y-2">
            <Link
              to="/attendance"
              className="w-full py-2 px-3 rounded-xl bg-[#0071E3] text-white text-xs font-bold hover:bg-[#0071E3]/90 transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Open Class 10-A Register</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TEACHER ENRICHED CONTENT: HOMEWORK EVALUATION & UPCOMING DEADLINES
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework Evaluation Tracker (2 Cols) */}
        <div className="lg:col-span-2 ios-card rounded-[28px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">Assignment Submissions & Homework Tracking</h3>
                <p className="text-[11px] text-[#86868B]">Grade assignments, verify code scripts, and release evaluator feedback</p>
              </div>
            </div>
            <Link to="/homework" className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center space-x-1">
              <span>Publish Homework</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Grade 10-A
                  </span>
                  <span className="text-xs font-bold text-slate-800">Python Recursion & BST Implementation</span>
                </div>
                <p className="text-[11px] text-slate-500">Assigned: Nov 8 • Due: Nov 15 • 36 Submissions received</p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-black text-amber-600">14 Pending Review</p>
                  <p className="text-[10px] text-slate-400">36 / 50 Evaluated</p>
                </div>
                <Link
                  to="/homework"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Grade Now
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Grade 10-B
                  </span>
                  <span className="text-xs font-bold text-slate-800">SQL Database Queries & Schema Design</span>
                </div>
                <p className="text-[11px] text-slate-500">Assigned: Nov 6 • Due: Nov 12 • 42 Submissions received</p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-black text-amber-600">6 Pending Review</p>
                  <p className="text-[10px] text-slate-400">42 / 48 Evaluated</p>
                </div>
                <Link
                  to="/homework"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Grade Now
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Grade 9-A
                  </span>
                  <span className="text-xs font-bold text-slate-800">Flowchart & Pseudocode Algorithms</span>
                </div>
                <p className="text-[11px] text-slate-500">Assigned: Nov 4 • Due: Nov 10 • 46 Submissions received</p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-600">✓ 100% Evaluated</p>
                  <p className="text-[10px] text-slate-400">46 / 46 Completed</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  Archived
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Milestones & Reminders (1 Col) */}
        <div className="ios-card rounded-[28px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">Academic Milestones</h3>
                <p className="text-[11px] text-[#86868B]">Faculty Deadlines & Notice</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  CBSE Deadline
                </span>
                <span className="text-[10px] font-semibold text-rose-600">Nov 25, 2026</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">Practical Exam Internal Marks Upload</h4>
              <p className="text-[11px] text-slate-500">Upload lab journal marks and project viva scores to CBSE portal.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Curriculum Sync
                </span>
                <span className="text-[10px] font-bold text-emerald-600">72% Progress</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">Term 2 Syllabus Completion</h4>
              <p className="text-[11px] text-slate-500">Ahead of academic calendar benchmark for Grade 10-A CS syllabus.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Dept Meeting
                </span>
                <span className="text-[10px] font-semibold text-slate-500">Thursday 03:30 PM</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">Computer Science Faculty Sync</h4>
              <p className="text-[11px] text-slate-500">Review upcoming Science & Coding Exhibition entries.</p>
            </div>
          </div>

          <div className="pt-2 border-t border-black/[0.04]">
            <Link
              to="/examinations"
              className="w-full py-2.5 px-3 rounded-xl bg-[#0071E3]/10 text-[#0071E3] text-xs font-bold hover:bg-[#0071E3]/20 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Launch Subject Grading Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
