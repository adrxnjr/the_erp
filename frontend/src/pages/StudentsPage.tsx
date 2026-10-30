import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { UserPlus, Search, CheckCircle } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    admission_number: '',
    full_name: '',
    date_of_birth: '2012-01-01',
    gender: 'female',
    class_id: '',
    academic_year_id: '',
    admission_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      const [stdRes, clsRes, yrRes] = await Promise.all([
        api.get('/students'),
        api.get('/academic/classes'),
        api.get('/academic/years'),
      ]);
      const studentItems = Array.isArray(stdRes.data)
        ? stdRes.data
        : stdRes.data?.items || [];
      setStudents(studentItems);
      setClasses(Array.isArray(clsRes.data) ? clsRes.data : []);
      setAcademicYears(Array.isArray(yrRes.data) ? yrRes.data : []);
      if (clsRes.data && clsRes.data.length > 0 && !newStudent.class_id) {
        setNewStudent((prev) => ({
          ...prev,
          class_id: clsRes.data[0].id,
          academic_year_id: yrRes.data[0]?.id || '',
        }));
      }
    } catch (e) {
      console.error('Failed to load students:', e);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', newStudent);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error enrolling student');
    }
  };

  const studentList = Array.isArray(students) ? students : [];
  const filteredStudents = studentList.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Student Admissions & Directory</h1>
          <p className="text-sm text-[#86868B]">
            Manage single campus student roster, enrolment records, and guardians.
          </p>
        </div>
        <button
          onClick={() => {
            setNewStudent((prev) => ({
              ...prev,
              admission_number: `ADM-${Date.now().toString().slice(-4)}`,
            }));
            setIsModalOpen(true);
          }}
          className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold space-x-2"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Search Bar - iOS Style */}
      <div className="ios-card rounded-[18px] px-4 py-3 flex items-center space-x-3">
        <Search className="w-4 h-4 text-[#86868B]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students by full name or admission number..."
          className="w-full text-sm focus:outline-none bg-transparent placeholder-[#86868B] text-[#1D1D1F]"
        />
      </div>

      {/* Table - iOS Card Style */}
      <div className="ios-card rounded-[22px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
              <tr>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Admission Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#86868B] text-sm">
                    No student records matching your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-[#0071E3]">
                      {s.admission_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1D1D1F]">{s.full_name}</td>
                    <td className="px-6 py-4 capitalize text-[#424245]">{s.gender}</td>
                    <td className="px-6 py-4 text-[#86868B]">{s.admission_date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-[#34C759] rounded-full border border-emerald-500/20 capitalize">
                        <CheckCircle className="w-3 h-3" />
                        <span>{s.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrolment Modal - Apple iOS Modal Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ios-modal rounded-[30px] max-w-md w-full p-7 shadow-2xl border border-white/80 space-y-4">
            <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Enroll Student</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Admission Number
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.admission_number}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, admission_number: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1">
                    Gender
                  </label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={newStudent.date_of_birth}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, date_of_birth: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Class Room
                </label>
                <select
                  required
                  value={newStudent.class_id}
                  onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ios-gloss-btn-secondary px-5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ios-gloss-btn px-6 py-2 text-xs font-semibold"
                >
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
