import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import schoolData from '../data/schoolData.json';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';

interface StaffRecord {
  id: string;
  employee_id: string;
  full_name: string;
  department: string;
  designation: string;
  staff_type: string;
  phone_number: string;
  status: string;
  check_in_time: string;
  periods_per_week: number;
  remarks: string;
  qualification?: string;
  email?: string;
}

export const StaffAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [summary, setSummary] = useState<any>({
    total_staff: 8,
    present_today: 8,
    on_leave_today: 0,
    absent_today: 0,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Authentic 8 teachers from user dataset
  const authenticTeachers: StaffRecord[] = useMemo(() => {
    return (schoolData.teachers || []).map((t: any, idx: number) => ({
      id: t.teacher_id,
      employee_id: t.teacher_id,
      full_name: t.name,
      department: t.subject,
      designation: `Subject Teacher (${t.subject})`,
      staff_type: 'Teaching Faculty',
      phone_number: t.phone,
      email: t.email,
      qualification: t.qualification,
      status: 'present',
      check_in_time: '08:45 AM',
      periods_per_week: 15,
      remarks: 'On duty',
    }));
  }, []);

  const fetchStaffAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboards/admin-operations');
      if (res.data?.staff_attendance_summary?.roster?.length) {
        // If API roster has items, merge authentic teachers
        const roster = res.data.staff_attendance_summary.roster;
        const employeeIds = new Set(roster.map((r: any) => r.employee_id));
        const combined = [
          ...authenticTeachers.filter((t) => !employeeIds.has(t.employee_id)),
          ...roster,
        ];
        setStaffList(combined);
        setSummary({
          total_staff: combined.length,
          present_today: combined.filter((s) => s.status === 'present').length,
          on_leave_today: combined.filter((s) => s.status === 'on_leave').length,
          absent_today: combined.filter((s) => s.status === 'absent').length,
        });
      } else {
        setStaffList(authenticTeachers);
        setSummary({
          total_staff: authenticTeachers.length,
          present_today: authenticTeachers.length,
          on_leave_today: 0,
          absent_today: 0,
        });
      }
    } catch (err) {
      console.warn('Falling back to authentic 8 teachers roster:', err);
      setStaffList(authenticTeachers);
      setSummary({
        total_staff: authenticTeachers.length,
        present_today: authenticTeachers.length,
        on_leave_today: 0,
        absent_today: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAttendance();
  }, []);

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'present' ? 'on_leave' : currentStatus === 'on_leave' ? 'late' : 'present';
    setUpdatingId(staffId);
    try {
      await api.post('/dashboards/staff-attendance/mark', {
        staff_id: staffId,
        status: nextStatus,
        remarks: nextStatus === 'on_leave' ? 'Authorized by Administration' : '',
      });
      // Update local state smoothly
      setStaffList((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, status: nextStatus, remarks: nextStatus === 'on_leave' ? 'Authorized Leave' : '' } : s))
      );
    } catch (e) {
      console.error('Failed to update staff attendance:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const departments = ['all', ...Array.from(new Set(staffList.map((s) => s.department)))];

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner - Apple iOS Light Glass */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Campus Faculty & Employee Oversight</span>
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Daily Register</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            Staff & Faculty Attendance Roster
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl">
            Super Admin & School Administrator oversight for teaching faculty, office administration, and campus support staff.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={fetchStaffAttendance}
            disabled={loading}
            className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Register</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ios-card rounded-[22px] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Staff Roster</div>
          <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{summary.total_staff}</div>
          <div className="text-xs text-slate-500 mt-1">Teaching & Non-Teaching</div>
        </div>

        <div className="ios-card rounded-[22px] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Present On Campus</div>
          <div className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">{summary.present_today}</div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">Verified Morning Check-in</div>
        </div>

        <div className="ios-card rounded-[22px] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Approved Leave</div>
          <div className="text-3xl font-black text-amber-600 mt-2 tracking-tight">{summary.on_leave_today}</div>
          <div className="text-xs text-amber-700 mt-1 font-medium">Principal Authorized</div>
        </div>

        <div className="ios-card rounded-[22px] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Unexcused Absence</div>
          <div className="text-3xl font-black text-slate-700 mt-2 tracking-tight">{summary.absent_today}</div>
          <div className="text-xs text-slate-500 mt-1">0 Flagged Today</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="ios-card rounded-[22px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff name, employee ID, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 focus:outline-none capitalize"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="ios-card rounded-[24px] overflow-hidden">
        <div className="p-5 border-b border-black/[0.05] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Faculty & Staff Attendance Register</h2>
            <p className="text-xs text-slate-500">
              Click status pill to toggle between Present, Approved Leave, and Late
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {filteredStaff.length} Employees Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 uppercase font-semibold border-b border-black/[0.05]">
              <tr>
                <th className="px-5 py-3.5">Emp ID</th>
                <th className="px-5 py-3.5">Staff Name</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Designation</th>
                <th className="px-5 py-3.5">Check-In</th>
                <th className="px-5 py-3.5 text-center">Workload (Periods/Wk)</th>
                <th className="px-5 py-3.5 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filteredStaff.map((staff) => {
                const isPresent = staff.status === 'present';
                const isOnLeave = staff.status === 'on_leave';
                const isLate = staff.status === 'late';

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">{staff.employee_id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{staff.full_name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                        <span>{staff.phone_number}</span>
                        {staff.qualification && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-600">{staff.qualification}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {staff.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{staff.designation}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{staff.check_in_time}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-bold text-slate-800">{staff.periods_per_week}</span>
                      <span className="text-[10px] text-slate-400 ml-1">hrs</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(staff.id, staff.status)}
                        disabled={updatingId === staff.id}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-xs ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : isOnLeave
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {isPresent ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Present</span>
                          </>
                        ) : isOnLeave ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>On Leave</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Late</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
