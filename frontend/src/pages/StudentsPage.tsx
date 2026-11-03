import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { UserPlus, Search, CheckCircle, Download, Loader2, FileDown, CreditCard, X } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [downloadingStudentId, setDownloadingStudentId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkSectionId, setBulkSectionId] = useState('');
  const [availableSections, setAvailableSections] = useState<any[]>([]);

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

  useEffect(() => {
    if (bulkClassId) {
      api.get('/academic/sections', { params: { class_id: bulkClassId } })
        .then((res) => setAvailableSections(Array.isArray(res.data) ? res.data : []))
        .catch(() => setAvailableSections([]));
    } else {
      setAvailableSections([]);
      setBulkSectionId('');
    }
  }, [bulkClassId]);

  const handleDownloadSingleIdCard = async (studentId: string, admissionNumber: string) => {
    try {
      setDownloadingStudentId(studentId);
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
    } catch (err: any) {
      console.error('Failed to download student ID card:', err);
      alert('Failed to generate student ID card. Please try again.');
    } finally {
      setDownloadingStudentId(null);
    }
  };

  const handleBulkExport = async () => {
    try {
      setBulkLoading(true);
      const params: any = {};
      if (bulkClassId) params.class_id = bulkClassId;
      if (bulkSectionId) params.section_id = bulkSectionId;

      const res = await api.get('/id-cards/bulk/students', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Bulk_Student_ID_Cards.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsBulkModalOpen(false);
    } catch (err: any) {
      console.error('Failed to export bulk ID cards:', err);
      alert(err.response?.data?.message || 'Failed to generate bulk ID cards. Ensure matching students exist.');
    } finally {
      setBulkLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Student Directory</h1>
          <p className="text-sm text-[#86868B]">
            Manage student enrollments and records.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setBulkClassId('');
              setBulkSectionId('');
              setIsBulkModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-[14px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold space-x-2 flex items-center shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4 text-[#0071E3]" />
            <span>Bulk Export IDs</span>
          </button>
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
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Search Bar - iOS Style */}
      <div className="ios-card rounded-[18px] px-4 py-3 flex items-center space-x-3">
        <Search className="w-4 h-4 text-[#86868B]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
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
                <th className="px-6 py-4 text-right">ID Card Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#86868B] text-sm">
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadSingleIdCard(s.id, s.admission_number)}
                        disabled={downloadingStudentId === s.id}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-all disabled:opacity-50"
                        title="Download Digital Student ID Card"
                      >
                        {downloadingStudentId === s.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>Download ID Card</span>
                          </>
                        )}
                      </button>
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

      {/* Bulk Export ID Cards Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="ios-modal rounded-[30px] max-w-md w-full p-7 shadow-2xl border border-white/80 space-y-5 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-[#0071E3]" />
                  <span>Bulk Export ID Cards</span>
                </h2>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Export a multi-page PDF with student cards (85x54mm) formatted for batch printing.
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Filter by Class (Optional)
                </label>
                <select
                  value={bulkClassId}
                  onChange={(e) => setBulkClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                >
                  <option value="">All Classes (Full Campus Roster)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {bulkClassId && (
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1">
                    Filter by Section (Optional)
                  </label>
                  <select
                    value={bulkSectionId}
                    onChange={(e) => setBulkSectionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                  >
                    <option value="">All Sections</option>
                    {availableSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Section {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-blue-50/60 border border-blue-200/60 rounded-[16px] p-3.5 text-xs text-blue-900 leading-relaxed">
                <strong>Standard ISO Spec:</strong> 85mm × 54mm landscape credit card format with Ever Grow Schools navy branding, student registration QR code, and academic validation seal.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2.5 rounded-[14px] text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkExport}
                disabled={bulkLoading}
                className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold space-x-2 flex items-center shadow-md disabled:opacity-50"
              >
                {bulkLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating Cards PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-white" />
                    <span>Download Bulk PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
