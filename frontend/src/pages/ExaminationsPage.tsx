import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { FileDown, Send } from 'lucide-react';

export const ExaminationsPage: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const [exRes, stdRes] = await Promise.all([
          api.get('/exams'),
          api.get('/students'),
        ]);
        setExams(Array.isArray(exRes.data) ? exRes.data : []);
        const studentItems = Array.isArray(stdRes.data)
          ? stdRes.data
          : stdRes.data?.items || [];
        setStudents(studentItems);
        if (exRes.data && exRes.data.length > 0) {
          setSelectedExam(exRes.data[0]);
        }
      } catch (e) {
        console.error(e);
        setStudents([]);
        setExams([]);
      }
    };
    fetchExams();
  }, []);

  const handleDownloadReportCard = async (studentId: string) => {
    if (!selectedExam) return;
    try {
      const response = await api.get(
        `/exams/${selectedExam.id}/report-cards/${studentId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_card_${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Report card cannot be downloaded. Ensure examination marks are finalized.');
    }
  };

  const handlePublishResults = async () => {
    if (!selectedExam) return;
    try {
      await api.post(`/exams/${selectedExam.id}/publish-results`);
      alert('Examination results compiled, ranked, and published successfully!');
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error publishing results');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Examinations & Report Cards</h1>
          <p className="text-sm text-[#86868B]">
            Publish assessment marks and generate official ReportLab PDF report cards.
          </p>
        </div>
        {selectedExam && (
          <button
            onClick={handlePublishResults}
            className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold space-x-2"
          >
            <Send className="w-4 h-4 text-white" />
            <span>Publish Results & Rankings</span>
          </button>
        )}
      </div>

      {/* Exam Sessions List - iOS Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map((exam) => {
          const isSelected = selectedExam?.id === exam.id;
          return (
            <div
              key={exam.id}
              onClick={() => setSelectedExam(exam)}
              className={`cursor-pointer p-5 rounded-[20px] transition-all duration-200 ${
                isSelected
                  ? 'bg-white/95 border-2 border-[#0071E3] shadow-[0_8px_24px_rgba(0,113,227,0.15)]'
                  : 'ios-card-interactive border border-white/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[15px] text-[#1D1D1F]">{exam.name}</span>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full capitalize ${
                    exam.is_published
                      ? 'bg-emerald-500/10 text-[#34C759] border border-emerald-500/20'
                      : 'bg-amber-500/10 text-[#FF9500] border border-amber-500/20'
                  }`}
                >
                  {exam.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-[#86868B]">
                Schedule: {exam.start_date} to {exam.end_date}
              </p>
            </div>
          );
        })}
      </div>

      {/* Student Roster for Report Cards - iOS Table */}
      <div className="ios-card rounded-[22px] overflow-hidden">
        <div className="p-5 border-b border-black/[0.05] flex items-center justify-between">
          <h2 className="font-bold text-[#1D1D1F]">Student Report Cards</h2>
          <span className="text-xs text-[#86868B] font-mono">
            {selectedExam ? `Exam: ${selectedExam.name}` : 'Select an exam session'}
          </span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
            <tr>
              <th className="px-6 py-4">Admission No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4 text-right">Official Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {(Array.isArray(students) ? students : []).map((s) => (
              <tr key={s.id} className="hover:bg-black/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-[#0071E3]">
                  {s.admission_number}
                </td>
                <td className="px-6 py-4 font-semibold text-[#1D1D1F]">{s.full_name}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDownloadReportCard(s.id)}
                    className="ios-gloss-btn-secondary px-3.5 py-1.5 text-xs font-semibold space-x-1.5 text-[#0071E3]"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
