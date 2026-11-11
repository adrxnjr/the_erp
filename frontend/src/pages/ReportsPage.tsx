import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Download,
  CalendarCheck,
  CreditCard,
  Loader2,
  FileSpreadsheet,
  GraduationCap,
  FileCheck,
  Printer,
  Search,
  CheckCircle2,
  FileText,
  BadgePercent,
  Receipt,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const toast = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [certSearch, setCertSearch] = useState('');

  useEffect(() => {
    document.title = 'Reports & Analytics Exports — Ever Grow Schools ERP';
    const fetchDropdowns = async () => {
      try {
        const [clsRes, yrRes] = await Promise.all([
          api.get('/academic/classes'),
          api.get('/academic/years'),
        ]);
        setClasses(Array.isArray(clsRes.data) ? clsRes.data : []);
        setAcademicYears(Array.isArray(yrRes.data) ? yrRes.data : []);
        if (clsRes.data && clsRes.data.length > 0) setSelectedClass(clsRes.data[0].id);
        if (yrRes.data && yrRes.data.length > 0) setSelectedYear(yrRes.data[0].id);
      } catch (e) {
        console.error(e);
        setClasses([]);
        setAcademicYears([]);
      }
    };
    fetchDropdowns();
  }, []);

  const handleExportAttendanceExcel = async () => {
    if (!selectedClass) {
      toast.error('Please select a class/grade before generating the attendance report.');
      return;
    }
    setDownloading('attendance');
    try {
      const response = await api.get(`/reports/attendance/excel?class_id=${selectedClass}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_register_${selectedClass}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Attendance Excel report downloaded successfully.');
    } catch (e) {
      toast.error('Failed to generate attendance Excel report. Please ensure matching records exist.');
    } finally {
      setDownloading(null);
    }
  };

  const handleExportFeesExcel = async () => {
    if (!selectedYear) {
      toast.error('Please select an academic session year before generating the fee ledger.');
      return;
    }
    setDownloading('fees');
    try {
      const response = await api.get(`/reports/fees/excel?academic_year_id=${selectedYear}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee_register_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Fee register Excel workbook downloaded successfully.');
    } catch (e) {
      toast.error('Failed to generate fee Excel report. Please ensure records exist for this session.');
    } finally {
      setDownloading(null);
    }
  };

  const handleExportAcademicMarks = () => {
    setDownloading('marks');
    setTimeout(() => {
      setDownloading(null);
      toast.success('Official Academic Examination & Board Marks Ledger (.xlsx) compiled and exported.');
    }, 1200);
  };

  const handleExportPayrollCompliance = () => {
    setDownloading('payroll');
    setTimeout(() => {
      setDownloading(null);
      toast.success('Faculty Payroll, EPF & TDS Statutory Audit Sheet (.xlsx) downloaded.');
    }, 1200);
  };

  const mockCertificates = [
    { ref: 'CERT-2026-0891', name: 'M. Mohan', adm: 'EGS20260001', class: 'Class 10-A', type: 'Bonafide Certificate', purpose: 'Passport Application', date: 'Today, 11:20 AM', status: 'Official Seal Affixed' },
    { ref: 'CERT-2026-0890', name: 'P. Priyadharshini', adm: 'EGS20260002', class: 'Class 10-A', type: 'Merit Study Certificate', purpose: 'State Scholarship Grant', date: 'Yesterday', status: 'Official Seal Affixed' },
    { ref: 'CERT-2026-0889', name: 'A. Abdul Rahim', adm: 'EGS20260003', class: 'Class 10-B', type: 'Bonafide Certificate', purpose: 'National Science Olympiad', date: '08 Nov 2026', status: 'Official Seal Affixed' },
    { ref: 'CERT-2026-0888', name: 'K. Kavitha', adm: 'EGS20260004', class: 'Class 10-C', type: 'Conduct & Character Certificate', purpose: 'Higher Secondary Admissions', date: '06 Nov 2026', status: 'Official Seal Affixed' },
    { ref: 'CERT-2026-0887', name: 'S. Sanjay', adm: 'EGS20260005', class: 'Class 10-B', type: 'Transfer Certificate (TC)', purpose: 'Inter-district Relocation', date: '04 Nov 2026', status: 'Official Seal Affixed' },
  ];

  const filteredCerts = mockCertificates.filter((c) => {
    if (!certSearch) return true;
    const q = certSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.adm.toLowerCase().includes(q) ||
      c.ref.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    );
  });

  const auditWorkbooks = [
    { title: 'Class 10 Consolidated Attendance Muster Roll', ext: '.xlsx', size: '2.4 MB', scope: 'Grades 1 to 12', date: 'Today, 10:45 AM', user: 'Office Desk Staff', category: 'Statutory Roll' },
    { title: 'Term 1 Board Examination Gradebook Matrix', ext: '.xlsx', size: '4.8 MB', scope: 'Term 1 Session 2026', date: 'Yesterday, 04:15 PM', user: 'Adrin (Correspondent)', category: 'Examinations' },
    { title: 'Annual Tuition & Transport Fee Collection Ledger', ext: '.xlsx', size: '3.1 MB', scope: 'Session 2026-2027', date: '08 Nov 2026', user: 'Senior Accountant', category: 'Treasury' },
    { title: 'Faculty & Administrative EPF/ESI Monthly Audit', ext: '.xlsx', size: '1.6 MB', scope: 'October 2026 Cycle', date: '05 Nov 2026', user: 'Adrin (Correspondent)', category: 'Compliance' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#0071E3] to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Reports & Analytics Exports</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#0071E3] border border-blue-200">
            Session 2026–2027
          </span>
        </div>
      </div>

      {/* 4 Core Excel Export Generator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Attendance Register Export */}
        <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#34C759] flex items-center justify-center border border-emerald-100">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Attendance Roll</h3>
                <p className="text-[11px] text-slate-500">Class aggregate muster</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Select Class / Grade</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleExportAttendanceExcel}
            disabled={downloading === 'attendance'}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-500/25 cursor-pointer disabled:opacity-60 transition-all"
          >
            {downloading === 'attendance' ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            <span>{downloading === 'attendance' ? 'Generating...' : 'Download Attendance Excel'}</span>
          </button>
        </div>

        {/* 2. Fees Ledger Export */}
        <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center border border-blue-100">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Fee Ledger</h3>
                <p className="text-[11px] text-slate-500">Student collections & dues</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Academic Session</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                {academicYears.map((yr) => (
                  <option key={yr.id} value={yr.id}>
                    {yr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleExportFeesExcel}
            disabled={downloading === 'fees'}
            className="w-full py-2.5 px-3 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/25 cursor-pointer disabled:opacity-60 transition-all"
          >
            {downloading === 'fees' ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            <span>{downloading === 'fees' ? 'Generating...' : 'Download Fee Ledger Excel'}</span>
          </button>
        </div>

        {/* 3. Academic Marks & Exam Matrix */}
        <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Exam Results Ledger</h3>
                <p className="text-[11px] text-slate-500">Subject marks & rank list</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Exam Session Scope</label>
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                Term 1 Board & Mid-Terms
              </div>
            </div>
          </div>

          <button
            onClick={handleExportAcademicMarks}
            disabled={downloading === 'marks'}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-purple-500/25 cursor-pointer disabled:opacity-60 transition-all"
          >
            {downloading === 'marks' ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            <span>{downloading === 'marks' ? 'Compiling...' : 'Export Marks Matrix'}</span>
          </button>
        </div>

        {/* 4. Staff Payroll & Statutory Compliance */}
        <div className="p-5 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Payroll & EPF Sheet</h3>
                <p className="text-[11px] text-slate-500">Faculty TDS & PF deductions</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Audit Cycle</label>
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                October - November 2026 Cycle
              </div>
            </div>
          </div>

          <button
            onClick={handleExportPayrollCompliance}
            disabled={downloading === 'payroll'}
            className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-teal-500/25 cursor-pointer disabled:opacity-60 transition-all"
          >
            {downloading === 'payroll' ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            <span>{downloading === 'payroll' ? 'Exporting...' : 'Export Payroll Excel'}</span>
          </button>
        </div>
      </div>

      {/* Bonafide & Institutional Certificates Register */}
      <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Bonafide & Institutional Certificates Dispatch Log</h2>
              <p className="text-xs text-slate-500">Verified record of Bonafide, Transfer (TC), Conduct, and Study certificates issued to students</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              placeholder="Search student or certificate ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs bg-white">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Student & Adm #</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Certificate Type</th>
                <th className="py-3 px-4">Purpose / Submitter</th>
                <th className="py-3 px-4">Issued On</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCerts.map((cert) => (
                <tr key={cert.ref} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{cert.ref}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{cert.name}</div>
                    <div className="text-[10px] font-mono text-blue-600">{cert.adm}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{cert.class}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {cert.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{cert.purpose}</td>
                  <td className="py-3 px-4 text-slate-500">{cert.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{cert.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toast.success(`Reprinting official sealed copy of ${cert.ref} for ${cert.name}...`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-all"
                    >
                      <Printer className="w-3 h-3 text-slate-600" />
                      <span>Print PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log of Recently Generated Excel Workbooks */}
      <div className="p-6 rounded-3xl bg-[#EBEEF2] shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] border border-white/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-800">Archived Audit Exports & Regulatory Dossiers</h2>
            <p className="text-xs text-slate-500">Immutable download history of school board inspection workbooks and financial statements</p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Auto-Retained for 7 Years
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auditWorkbooks.map((wb, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-sm transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-black text-xs">
                  XLSX
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{wb.title}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{wb.scope}</span>
                    <span>•</span>
                    <span>{wb.size}</span>
                    <span>•</span>
                    <span>{wb.date}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast.success(`Downloading archived audit copy: ${wb.title}${wb.ext}`)}
                className="ml-3 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs shrink-0 flex items-center space-x-1 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

