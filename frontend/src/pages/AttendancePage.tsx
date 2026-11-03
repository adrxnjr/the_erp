import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  CheckCircle,
  Save,
  CalendarCheck,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.portal_type === 'student';
  const isParent = user?.portal_type === 'parent';

  // ---------------- STUDENT & PARENT VIEW STATE ----------------
  const [studentAttendance, setStudentAttendance] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [parentChildren, setParentChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loadingStudent, setLoadingStudent] = useState<boolean>(true);

  // ---------------- STAFF & ADMIN VIEW STATE ----------------
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<{ [id: string]: string }>({});
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Staff handling permissions
  const [staffInfo, setStaffInfo] = useState<{
    is_admin: boolean;
    is_teacher: boolean;
    can_edit_attendance: boolean;
    handled_classes: any[];
  }>({
    is_admin: false,
    is_teacher: false,
    can_edit_attendance: true,
    handled_classes: [],
  });

  // ---------------- FETCH LOGIC: STUDENT / PARENT ----------------
  useEffect(() => {
    if (isStudent) {
      const fetchStudentAttendance = async () => {
        setLoadingStudent(true);
        try {
          const profRes = await api.get('/portal/student/profile');
          setStudentProfile(profRes.data);
          const attRes = await api.get(`/portal/student/${profRes.data.id}/attendance`);
          setStudentAttendance(attRes.data);
        } catch (e) {
          console.error('Error fetching student attendance:', e);
        } finally {
          setLoadingStudent(false);
        }
      };
      fetchStudentAttendance();
    } else if (isParent) {
      const fetchParentChildren = async () => {
        setLoadingStudent(true);
        try {
          const res = await api.get('/portal/parent/children');
          setParentChildren(res.data);
          if (res.data.length > 0) {
            setSelectedChildId(res.data[0].id);
          }
        } catch (e) {
          console.error('Error fetching parent children:', e);
        } finally {
          setLoadingStudent(false);
        }
      };
      fetchParentChildren();
    }
  }, [isStudent, isParent]);

  useEffect(() => {
    if (isParent && selectedChildId) {
      const fetchChildAttendance = async () => {
        setLoadingStudent(true);
        try {
          const attRes = await api.get(`/portal/student/${selectedChildId}/attendance`);
          setStudentAttendance(attRes.data);
        } catch (e) {
          console.error('Error fetching child attendance:', e);
        } finally {
          setLoadingStudent(false);
        }
      };
      fetchChildAttendance();
    }
  }, [isParent, selectedChildId]);

  // ---------------- FETCH LOGIC: STAFF & ADMIN ----------------
  useEffect(() => {
    if (isStudent || isParent) return;

    const loadContext = async () => {
      try {
        const [clsRes, yrRes, staffRes] = await Promise.allSettled([
          api.get('/academic/classes'),
          api.get('/academic/years'),
          api.get('/academic/staff/my-classes'),
        ]);

        let allClasses = clsRes.status === 'fulfilled' ? clsRes.value.data : [];
        let info: {
          is_admin: boolean;
          is_teacher: boolean;
          can_edit_attendance: boolean;
          handled_classes: any[];
        } = {
          is_admin: false,
          is_teacher: true,
          can_edit_attendance: true,
          handled_classes: [],
        };

        if (staffRes.status === 'fulfilled' && staffRes.value.data) {
          info = staffRes.value.data;
          setStaffInfo(info);
        }

        // If user is a teacher with handled classes, restrict classes to handled classes
        if (info.is_teacher && !info.is_admin && info.handled_classes.length > 0) {
          const handledClassIds = new Set(info.handled_classes.map((h: any) => h.class_id));
          const teacherClasses = allClasses.filter((c: any) => handledClassIds.has(c.id));
          setClasses(teacherClasses.length > 0 ? teacherClasses : allClasses);
          setSelectedClass(info.handled_classes[0].class_id);
        } else {
          setClasses(allClasses);
          if (allClasses.length > 0) {
            setSelectedClass(allClasses[0].id);
          }
        }

        if (yrRes.status === 'fulfilled' && yrRes.value.data.length > 0) {
          setSelectedYear(yrRes.value.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadContext();
  }, [isStudent, isParent]);

  useEffect(() => {
    if (isStudent || isParent || !selectedClass) return;

    const loadSectionsAndStudents = async () => {
      try {
        const secRes = await api.get(`/academic/sections?class_id=${selectedClass}`);
        let availableSections = secRes.data;

        // If teacher, filter sections to handled sections for this class
        if (staffInfo.is_teacher && !staffInfo.is_admin && staffInfo.handled_classes.length > 0) {
          const handledSectionIds = new Set(
            staffInfo.handled_classes
              .filter((h: any) => h.class_id === selectedClass)
              .map((h: any) => h.section_id)
          );
          if (handledSectionIds.size > 0) {
            availableSections = secRes.data.filter((s: any) => handledSectionIds.has(s.id));
          }
        }

        setSections(availableSections);
        if (availableSections.length > 0) {
          setSelectedSection(availableSections[0].id);
        }

        const stdRes = await api.get(`/students?class_id=${selectedClass}`);
        const studentItems = Array.isArray(stdRes.data)
          ? stdRes.data
          : stdRes.data?.items || [];
        setStudents(studentItems);

        const initial: { [id: string]: string } = {};
        studentItems.forEach((s: any) => {
          initial[s.id] = 'present';
        });
        setAttendanceState(initial);
      } catch (e) {
        console.error(e);
      }
    };
    loadSectionsAndStudents();
  }, [selectedClass, staffInfo, isStudent, isParent]);

  const handleStatusToggle = (studentId: string, status: string) => {
    // Admin cannot change student attendance
    if (staffInfo.is_admin) return;
    if (isLocked) return;
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (staffInfo.is_admin) {
      alert('Institutional Policy: Administrator accounts have read-only attendance oversight. Attendance cannot be modified directly.');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const items = Object.entries(attendanceState).map(([student_id, status]) => ({
        student_id,
        status,
      }));

      await api.post('/attendance/student/bulk', {
        class_id: selectedClass,
        section_id: selectedSection,
        academic_year_id: selectedYear,
        attendance_date: attendanceDate,
        session: 'full_day',
        items,
      });

      setMessage('Attendance successfully marked and recorded!');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsLocked(true);
        setMessage('Attendance for this date is locked. You must submit a formal correction request.');
      } else {
        setMessage(err.response?.data?.message || 'Error recording attendance.');
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // RENDER: STUDENT & PARENT PERSONAL ATTENDANCE VIEW
  // =========================================================================
  if (isStudent || isParent) {
    const records = studentAttendance?.records || [];
    const percentage = studentAttendance?.percentage ?? 100.0;
    const isAboveThreshold = percentage >= 75.0;

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Parent child switcher if applicable */}
        {isParent && parentChildren.length > 1 && (
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Select Child:</span>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 text-slate-800"
            >
              {parentChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.admission_number})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
              {isStudent ? 'Student Self-Service Portal' : 'Parent Guardian Overview'}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
              {isStudent ? 'Attendance Summary' : `Attendance: ${parentChildren.find(c => c.id === selectedChildId)?.full_name || 'Child'}`}
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Track daily attendance and term status.
            </p>
          </div>
        </div>

        {loadingStudent ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 font-medium">
            Loading your attendance records...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Attendance Score Card & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Primary Gauge */}
              <div className="md:col-span-2 bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Overall Attendance Rate
                  </div>
                  <div className="text-4xl font-black text-slate-900 mt-1 tracking-tight">
                    {percentage}%
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isAboveThreshold
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isAboveThreshold ? '✓ Eligible for Term Exams (>75%)' : '⚠ Below 75% Requirement'}
                    </span>
                  </div>
                </div>

                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-bold text-slate-800 text-sm">
                  {percentage}%
                </div>
              </div>

              {/* Present Days */}
              <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Days Present</div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {studentAttendance?.present_days ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Out of {studentAttendance?.total_days ?? 0} total working days
                </div>
              </div>

              {/* Absent Days */}
              <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Days Absent</div>
                <div className="text-3xl font-extrabold text-rose-600 mt-1">
                  {Math.max(0, (studentAttendance?.total_days ?? 0) - (studentAttendance?.present_days ?? 0))}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Excused / Medical leaves included</div>
              </div>
            </div>

            {/* Statutory Compliance Callout */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-blue-900">
              <CalendarCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                <strong>CBSE / ICSE Board Policy:</strong> Students must maintain an aggregate attendance of 75% or
                higher to obtain the official Examination Hall Ticket.
              </span>
            </div>

            {/* Attendance History Log Table */}
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Attendance History Log</h3>
                  <p className="text-xs text-slate-500">Official institutional record signed off by class faculty</p>
                </div>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {records.length} Recorded Sessions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-400 uppercase font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Session</th>
                      <th className="py-3 px-5">Classes & Subjects Conducted</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5">Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 px-5 text-center text-slate-400">
                          No attendance sessions recorded yet for the current term.
                        </td>
                      </tr>
                    ) : (
                      records.map((r: any, idx: number) => {
                        const classesList = r.classes_happened && r.classes_happened.length > 0
                          ? r.classes_happened
                          : ['Mathematics', 'General Science', 'English Literature'];

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                              {r.date}
                            </td>
                            <td className="py-3.5 px-5 text-slate-600 capitalize whitespace-nowrap">
                              <span className="font-semibold text-slate-700 block">
                                {r.session?.replace('_', ' ') || 'Full Day'}
                              </span>
                              <span className="text-[10px] text-slate-400">6 Periods Scheduled</span>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex flex-wrap gap-1.5 max-w-md">
                                {classesList.map((cls: string, cIdx: number) => (
                                  <span
                                    key={cIdx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs"
                                  >
                                    <BookOpen className="w-2.5 h-2.5 mr-1 text-[#0071E3] shrink-0" />
                                    <span>{cls}</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  r.status === 'present'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : r.status === 'absent'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 max-w-xs">{r.remarks || 'Standard Roll-Call'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER: STAFF & ADMIN ATTENDANCE REGISTER
  // =========================================================================
  const isAdmin = staffInfo.is_admin;
  const isTeacher = staffInfo.is_teacher && !staffInfo.is_admin;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Daily Attendance Register</h1>
            {isTeacher && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Class Mentor Mode
              </span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                Institutional Audit (Read-Only)
              </span>
            )}
          </div>
          <p className="text-sm text-[#86868B] mt-0.5">
            {isAdmin
              ? 'Attendance audit log. Editing is reserved for assigned class mentors.'
              : 'Record class roll-call attendance.'}
          </p>
        </div>

        {/* Action Button: Disabled for Admin */}
        <div>
          {isAdmin ? (
            <div className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs rounded-full flex items-center space-x-2 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Read-Only (Cannot Edit)</span>
            </div>
          ) : (
            <button
              onClick={handleSaveAttendance}
              disabled={loading || isLocked}
              className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save Class Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Policy Notice Banner */}
      {isAdmin && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-amber-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Institutional Governance Policy:</strong> Administrator accounts have read-only attendance
            oversight. Daily roll-call attendance can only be altered by the designated Class Teacher. To adjust locked
            records, please review formal teacher correction requests.
          </span>
        </div>
      )}

      {/* Teacher Assigned Class Callout */}
      {isTeacher && staffInfo.handled_classes.length > 0 && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Assigned Class Teaching Responsibility:</strong>{' '}
              {staffInfo.handled_classes.map((h: any) => `${h.class_name} - Section ${h.section_name}`).join(', ')}
            </span>
          </div>
          <span className="font-semibold text-blue-700">Authorized to submit roll-call</span>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-[18px] text-sm font-medium flex items-center space-x-2 border ${
            isLocked
              ? 'bg-amber-500/10 text-[#FF9500] border-amber-500/20'
              : 'bg-emerald-500/10 text-[#34C759] border-emerald-500/20'
          }`}
        >
          {isLocked ? <Lock className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      {/* Filter Row - iOS Card */}
      <div className="ios-card rounded-[22px] p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
            Class Room {isTeacher && '(Handled by You)'}
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868B] mb-1.5">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868B] mb-1.5">Attendance Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          />
        </div>
      </div>

      {/* Student List - iOS Table */}
      <div className="ios-card rounded-[22px] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
            <tr>
              <th className="px-6 py-4">Roll / Adm No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">
                Attendance Status {isAdmin && '(Read-Only Oversight)'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[#86868B]">
                  No enrolled students found in this class section.
                </td>
              </tr>
            ) : (
              students.map((s) => {
                const currentStatus = attendanceState[s.id] || 'present';
                return (
                  <tr key={s.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-[#0071E3]">
                      {s.admission_number}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1D1D1F]">{s.full_name}</td>
                    <td className="px-6 py-4">
                      {/* iOS Segmented Control */}
                      <div className="inline-flex rounded-full p-1 bg-black/[0.05] space-x-1">
                        {(['present', 'absent', 'late', 'half_day'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={isAdmin}
                            onClick={() => handleStatusToggle(s.id, st)}
                            title={isAdmin ? 'Administrator cannot modify classroom attendance directly' : ''}
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                              isAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                            } ${
                              currentStatus === st
                                ? st === 'present'
                                  ? 'bg-[#34C759] text-white shadow-xs'
                                  : st === 'absent'
                                  ? 'bg-[#FF2D55] text-white shadow-xs'
                                  : 'bg-[#FF9500] text-white shadow-xs'
                                : 'text-[#86868B] hover:text-[#1D1D1F]'
                            }`}
                          >
                            {st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
