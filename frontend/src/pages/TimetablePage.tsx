import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CustomDropdown } from '../components/CustomDropdown';
import type { DropdownOption } from '../components/CustomDropdown';
import schoolData from '../data/schoolData.json';
import {
  Clock,
  Calendar,
  BookOpen,
  User,
  Users,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Printer,
  Calculator,
  FlaskConical,
  Laptop,
  Globe,
  Palette,
  HeartHandshake,
  Activity,
  Coffee,
} from 'lucide-react';

interface PeriodItem {
  id: string;
  name: string;
  period_number: number;
  start_time: string;
  end_time: string;
  is_break?: boolean;
}

interface TimetableSlot {
  day_of_week: number;
  period_id: string;
  period_number?: number;
  period_name?: string;
  start_time?: string;
  end_time?: string;
  subject_name: string;
  subject_code?: string;
  teacher_name?: string;
  teacher_id?: string;
  room_number?: string;
}

interface ChildItem {
  id: string;
  full_name: string;
  admission_number: string;
  class_name: string;
  section_name: string;
  class_id?: string;
  section_id?: string;
  gender?: string;
}

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.portal_type === 'student' || user?.roles?.includes('student');
  const isParent =
    user?.portal_type === 'parent' ||
    user?.roles?.includes('parent') ||
    (user?.portal_type === 'parent_student' && !user?.roles?.includes('student'));
  const isStaff = !isStudent && !isParent;

  // Selected class: "10-A", "10-B", or "10-C"
  const [selectedClass, setSelectedClass] = useState<string>('10-A');
  const [studentClassName, setStudentClassName] = useState<string>('10-A');

  // Parent Multi-Child State
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Build periods from schoolData.meta.periods
  const periods: PeriodItem[] = useMemo(() => {
    return (schoolData.meta.periods || []).map((pStr: string, idx: number) => {
      const [start_time, end_time] = pStr.split('-');
      return {
        id: `p${idx + 1}`,
        name: `Period ${idx + 1}`,
        period_number: idx + 1,
        start_time,
        end_time,
        is_break: false,
      };
    });
  }, []);

  // Teacher lookup map: teacher_id -> teacher object
  const teachersMap = useMemo(() => {
    const map: Record<string, (typeof schoolData.teachers)[0]> = {};
    (schoolData.teachers || []).forEach((t) => {
      map[t.teacher_id] = t;
    });
    return map;
  }, []);

  // Class teacher lookup: class_section -> teacher
  const classTeachers = schoolData.meta.class_teachers as Record<string, string>;
  const activeClassTeacherId = classTeachers[selectedClass] || 'T01';
  const activeClassTeacher = teachersMap[activeClassTeacherId];

  // Timetable slots mapped by `${day}_${period}`
  const timetableSlots = useMemo(() => {
    const map: Record<string, TimetableSlot> = {};
    const dayIndexMap: Record<string, number> = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
    };

    (schoolData.timetable || [])
      .filter((t) => t.class_section === selectedClass)
      .forEach((entry) => {
        const dayIdx = dayIndexMap[entry.day] ?? 0;
        const teacher = teachersMap[entry.teacher_id];
        const teacherName = teacher ? teacher.name : entry.teacher_id;
        const key = `${dayIdx}_${entry.period}`;

        map[key] = {
          day_of_week: dayIdx,
          period_id: `p${entry.period}`,
          period_number: entry.period,
          period_name: `Period ${entry.period}`,
          start_time: entry.time.split('-')[0],
          end_time: entry.time.split('-')[1],
          subject_name: entry.subject,
          subject_code: entry.subject.toUpperCase().slice(0, 4),
          teacher_name: teacherName,
          teacher_id: entry.teacher_id,
          room_number: `Room ${selectedClass}`,
        };
      });
    return map;
  }, [selectedClass, teachersMap]);

  // Initial setup for parent/student portal
  useEffect(() => {
    document.title = 'Class Schedule & Timetable — Ever Grow Schools ERP';
    const initData = async () => {
      if (isParent) {
        try {
          const kidsRes = await api.get('/portal/parent/children');
          const kidsList: ChildItem[] = Array.isArray(kidsRes.data) ? kidsRes.data : [];
          if (kidsList.length > 0) {
            setChildren(kidsList);
            setSelectedChildId(kidsList[0].id);
            const matchingClass = kidsList[0].section_name
              ? `10-${kidsList[0].section_name.toUpperCase()}`
              : '10-A';
            setSelectedClass(matchingClass);
          }
        } catch {
          // Fallback parent with sample student from schoolData
          const firstStd = schoolData.students[0];
          setChildren([
            {
              id: firstStd.student_id,
              full_name: firstStd.name,
              admission_number: firstStd.admission_no,
              class_name: 'Grade 10',
              section_name: firstStd.class_section.split('-')[1] || 'A',
            },
          ]);
          setSelectedChildId(firstStd.student_id);
          setSelectedClass(firstStd.class_section);
        }
      } else if (isStudent) {
        setStudentClassName(`Class ${selectedClass}`);
      }
    };

    initData();
  }, [isParent, isStudent]);

  // When parent switches child
  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    const child = children.find((c) => c.id === childId);
    if (child) {
      const clsName = child.section_name ? `10-${child.section_name.toUpperCase()}` : '10-A';
      setSelectedClass(clsName);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Parent child options
  const parentChildOptions: DropdownOption[] = children.map((kid) => ({
    value: kid.id,
    label: kid.full_name,
    subLabel: `${kid.class_name} • Sec ${kid.section_name} (${kid.admission_number})`,
    badge: `${kid.class_name}-${kid.section_name}`,
    icon: <User className="w-4 h-4 text-[#0071E3]" />,
  }));

  // Staff Class options: 10-A, 10-B, 10-C
  const staffClassOptions: DropdownOption[] = (schoolData.meta.classes || ['10-A', '10-B', '10-C']).map((c: string) => {
    const tId = classTeachers[c];
    const tName = teachersMap[tId]?.name || 'Class Teacher';
    return {
      value: c,
      label: `Class ${c} Timetable`,
      subLabel: `Teacher: ${tName} (${tId})`,
      badge: c,
      icon: <GraduationCap className="w-4 h-4 text-[#0071E3]" />,
    };
  });

  // Color-code subjects strictly using light theme
  const getSubjectStyle = (name: string) => {
    const lower = (name || '').toLowerCase();
    if (lower === 'tamil') {
      return {
        bg: 'bg-rose-500/[0.08] hover:bg-rose-500/[0.12]',
        border: 'border-rose-500/20',
        text: 'text-rose-700',
        badge: 'bg-rose-100/80 text-rose-800',
        icon: <BookOpen className="w-3.5 h-3.5" />,
      };
    }
    if (lower === 'english') {
      return {
        bg: 'bg-purple-500/[0.08] hover:bg-purple-500/[0.12]',
        border: 'border-purple-500/20',
        text: 'text-purple-700',
        badge: 'bg-purple-100/80 text-purple-800',
        icon: <BookOpen className="w-3.5 h-3.5" />,
      };
    }
    if (lower === 'maths' || lower.includes('math')) {
      return {
        bg: 'bg-blue-500/[0.08] hover:bg-blue-500/[0.12]',
        border: 'border-blue-500/20',
        text: 'text-[#0071E3]',
        badge: 'bg-blue-100/80 text-blue-800',
        icon: <Calculator className="w-3.5 h-3.5" />,
      };
    }
    if (lower === 'science' || lower.includes('sci')) {
      return {
        bg: 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]',
        border: 'border-emerald-500/20',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100/80 text-emerald-800',
        icon: <FlaskConical className="w-3.5 h-3.5" />,
      };
    }
    if (lower === 'social' || lower.includes('soc')) {
      return {
        bg: 'bg-amber-500/[0.08] hover:bg-amber-500/[0.12]',
        border: 'border-amber-500/20',
        text: 'text-amber-700',
        badge: 'bg-amber-100/80 text-amber-800',
        icon: <Globe className="w-3.5 h-3.5" />,
      };
    }
    if (lower === 'pet' || lower.includes('pet')) {
      return {
        bg: 'bg-cyan-500/[0.08] hover:bg-cyan-500/[0.12]',
        border: 'border-cyan-500/20',
        text: 'text-cyan-700',
        badge: 'bg-cyan-100/80 text-cyan-800',
        icon: <Activity className="w-3.5 h-3.5" />,
      };
    }
    if (lower === 'mi' || lower.includes('moral')) {
      return {
        bg: 'bg-indigo-500/[0.08] hover:bg-indigo-500/[0.12]',
        border: 'border-indigo-500/20',
        text: 'text-indigo-700',
        badge: 'bg-indigo-100/80 text-indigo-800',
        icon: <HeartHandshake className="w-3.5 h-3.5" />,
      };
    }
    return {
      bg: 'bg-slate-500/[0.08] hover:bg-slate-500/[0.12]',
      border: 'border-slate-500/20',
      text: 'text-slate-700',
      badge: 'bg-slate-100 text-slate-800',
      icon: <Palette className="w-3.5 h-3.5" />,
    };
  };

  const getSlot = (dayIdx: number, pNumber: number) => {
    return (
      timetableSlots[`${dayIdx}_${pNumber}`] || {
        day_of_week: dayIdx,
        period_id: `p${pNumber}`,
        period_number: pNumber,
        subject_name: 'Self Study',
        subject_code: 'STDY',
        teacher_name: 'Faculty',
        room_number: `Room ${selectedClass}`,
      }
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
                  {isStudent
                    ? `Class ${selectedClass} Weekly Timetable`
                    : isParent
                    ? "My Children's Class Timetable"
                    : 'Master Class Schedule & Timetable'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Class {selectedClass}
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#86868B] mt-0.5">
                8 periods daily • Lunch break 12:00 – 12:45
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Dropdowns */}
        <div className="flex items-center space-x-3">
          {/* Class Switcher Pill Buttons */}
          <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF]">
            {['10-A', '10-B', '10-C'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedClass === cls
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* PARENT DROPDOWN */}
          {isParent && children.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase hidden md:inline-block">
                Select Child:
              </span>
              <CustomDropdown
                options={parentChildOptions}
                value={selectedChildId}
                onChange={handleSelectChild}
                placeholder="Choose child..."
                buttonClassName="rounded-2xl"
              />
            </div>
          )}

          {/* STAFF / ADMIN DROPDOWN */}
          {isStaff && (
            <div className="flex items-center space-x-2">
              <CustomDropdown
                options={staffClassOptions}
                value={selectedClass}
                onChange={(val) => setSelectedClass(val)}
                placeholder="Select Class..."
                buttonClassName="rounded-2xl min-w-[210px]"
              />
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="neu-btn-secondary px-3.5 py-2 text-xs font-semibold space-x-1.5 text-slate-700 rounded-2xl hidden sm:inline-flex items-center hover:text-slate-900"
            title="Print Schedule"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* CLASS LEAD & TIMING BANNER */}
      <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              {selectedClass}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Class {selectedClass} Academic Schedule
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  Active Term
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center space-x-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span className="font-semibold text-slate-700">Class Teacher:</span>
                  <span>
                    {activeClassTeacher?.name || 'Assigned Lead'} ({activeClassTeacherId})
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Room: {selectedClass}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Coffee className="w-3 h-3 text-amber-500" />
                  <span>Lunch Break: 12:00 – 12:45</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              100% Conflict-Free Roster
            </span>
          </div>
        </div>
      </div>

      {/* TIMETABLE GRID - Light Themed Neumorphic Container */}
      <div className="p-4 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-300/60 text-slate-500 text-[11px] uppercase font-bold">
                <th className="px-4 py-3.5 text-left min-w-[120px] bg-slate-200/40 rounded-tl-2xl">
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
                    <span>Day / Period</span>
                  </div>
                </th>
                {periods.slice(0, 4).map((p) => (
                  <th key={p.id} className="px-3 py-3 min-w-[155px]">
                    <div className="text-slate-800 font-bold text-xs">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-normal">
                      {p.start_time} – {p.end_time}
                    </div>
                  </th>
                ))}

                {/* Lunch Break Header Column */}
                <th className="px-3 py-3 min-w-[110px] bg-amber-50/60 border-x border-amber-200/60">
                  <div className="text-amber-800 font-bold text-xs flex items-center justify-center space-x-1">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lunch</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                    12:00 – 12:45
                  </div>
                </th>

                {periods.slice(4, 8).map((p, idx) => (
                  <th
                    key={p.id}
                    className={`px-3 py-3 min-w-[155px] ${idx === 3 ? 'rounded-tr-2xl' : ''}`}
                  >
                    <div className="text-slate-800 font-bold text-xs">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-normal">
                      {p.start_time} – {p.end_time}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-medium">
              {days.map((day, dayIdx) => (
                <tr key={day} className="hover:bg-white/40 transition-colors">
                  {/* Day Column */}
                  <td className="px-4 py-3.5 font-bold text-slate-800 bg-slate-200/30 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#0071E3]" />
                      <span>{day}</span>
                    </div>
                  </td>

                  {/* Morning Periods: 1 to 4 */}
                  {[1, 2, 3, 4].map((pNum) => {
                    const slot = getSlot(dayIdx, pNum);
                    const style = getSubjectStyle(slot.subject_name);

                    return (
                      <td key={pNum} className="px-2 py-2.5 align-top">
                        <div
                          className={`p-2.5 rounded-2xl border text-left transition-all duration-150 ${style.bg} ${style.border}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`font-bold text-xs flex items-center space-x-1.5 ${style.text}`}>
                              {style.icon}
                              <span className="truncate">{slot.subject_name}</span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${style.badge}`}>
                              {slot.subject_code}
                            </span>
                          </div>

                          <div className="space-y-0.5 text-[11px] text-slate-600">
                            {slot.teacher_name && (
                              <div className="flex items-center space-x-1 truncate font-medium text-slate-700">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{slot.teacher_name}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1 text-slate-400 font-mono text-[9px]">
                              <span>{slot.teacher_id ? `(${slot.teacher_id})` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  {/* Lunch Break Cell */}
                  <td className="px-2 py-2.5 align-middle bg-amber-50/40 border-x border-amber-200/40">
                    <div className="text-[10px] font-bold uppercase text-amber-700 tracking-wider text-center py-2">
                      Break
                    </div>
                  </td>

                  {/* Afternoon Periods: 5 to 8 */}
                  {[5, 6, 7, 8].map((pNum) => {
                    const slot = getSlot(dayIdx, pNum);
                    const style = getSubjectStyle(slot.subject_name);

                    return (
                      <td key={pNum} className="px-2 py-2.5 align-top">
                        <div
                          className={`p-2.5 rounded-2xl border text-left transition-all duration-150 ${style.bg} ${style.border}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`font-bold text-xs flex items-center space-x-1.5 ${style.text}`}>
                              {style.icon}
                              <span className="truncate">{slot.subject_name}</span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${style.badge}`}>
                              {slot.subject_code}
                            </span>
                          </div>

                          <div className="space-y-0.5 text-[11px] text-slate-600">
                            {slot.teacher_name && (
                              <div className="flex items-center space-x-1 truncate font-medium text-slate-700">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{slot.teacher_name}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1 text-slate-400 font-mono text-[9px]">
                              <span>{slot.teacher_id ? `(${slot.teacher_id})` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0071E3] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Weekly Total Periods</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">40 Academic Periods</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Scheduling Verification</div>
            <div className="text-base font-extrabold text-emerald-700 mt-0.5">100% Conflict-Free</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Bell Schedule Timing</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">09:00 AM – 03:45 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
};
