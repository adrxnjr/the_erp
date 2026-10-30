import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, BookOpen, CheckCircle2 } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.portal_type === 'student';
  const isParent = user?.portal_type === 'parent';

  const [periods, setPeriods] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [studentClassName, setStudentClassName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perRes, clsRes] = await Promise.all([
          api.get('/timetable/periods'),
          api.get('/academic/classes'),
        ]);
        const periodList = Array.isArray(perRes.data) ? perRes.data : [];
        const classList = Array.isArray(clsRes.data) ? clsRes.data : [];
        setPeriods(periodList);
        setClasses(classList);

        if (isStudent) {
          // If student, find their specific class_id
          const profRes = await api.get('/portal/student/profile');
          if (profRes.data?.class_id) {
            setSelectedClass(profRes.data.class_id);
            const matched = classList.find((c) => c.id === profRes.data.class_id);
            if (matched) setStudentClassName(matched.name);
          } else if (classList.length > 0) {
            setSelectedClass(classList[0].id);
          }
        } else {
          // If teacher, check handled classes
          try {
            const staffRes = await api.get('/academic/staff/my-classes');
            if (staffRes.data?.handled_classes?.length > 0) {
              setSelectedClass(staffRes.data.handled_classes[0].class_id);
            } else if (classList.length > 0) {
              setSelectedClass(classList[0].id);
            }
          } catch {
            if (classList.length > 0) setSelectedClass(classList[0].id);
          }
        }
      } catch (e) {
        console.error(e);
        setPeriods([]);
        setClasses([]);
      }
    };
    fetchData();
  }, [isStudent]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
              {isStudent ? 'My Class Weekly Timetable' : 'Master Class Schedule & Timetable'}
            </h1>
            {isStudent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {studentClassName || 'Your Section'}
              </span>
            )}
          </div>
          <p className="text-sm text-[#86868B] mt-0.5">
            {isStudent
              ? 'View daily periods, subjects, and classroom allocations for your enrolled grade.'
              : 'Automated conflict-free scheduling for faculty and classrooms.'}
          </p>
        </div>

        {!isStudent && (
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-full text-xs font-semibold text-[#1D1D1F] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} Schedule
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Timetable Grid - iOS Card Style */}
      <div className="ios-card rounded-[22px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm border-collapse">
            <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
              <tr>
                <th className="px-4 py-3 border-r border-black/[0.04] bg-black/[0.01] text-left">Day / Period</th>
                {periods.map((p) => (
                  <th key={p.id} className="px-4 py-3 border-r border-black/[0.04] min-w-[140px]">
                    <div className="text-[#1D1D1F] font-semibold">{p.name}</div>
                    <div className="text-[10px] text-[#86868B] font-normal mt-0.5">
                      {p.start_time} - {p.end_time}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {days.map((day, idx) => (
                <tr key={day} className="hover:bg-black/[0.01]">
                  <td className="px-4 py-4 font-bold text-[#1D1D1F] bg-black/[0.01] border-r border-black/[0.04] text-left">
                    {day}
                  </td>
                  {periods.map((p) => (
                    <td key={p.id} className="px-3 py-4 border-r border-black/[0.04]">
                      <div className="p-2.5 bg-blue-500/[0.06] border border-blue-500/15 rounded-[14px] text-left">
                        <div className="font-semibold text-[#0071E3] text-xs">
                          {idx % 2 === 0 ? 'Mathematics' : 'English Literature'}
                        </div>
                        <div className="text-[11px] text-[#86868B] mt-0.5">Room 10{idx + 1}</div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
