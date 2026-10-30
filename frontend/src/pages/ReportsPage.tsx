import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Download, CalendarCheck, CreditCard } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
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
    if (!selectedClass) return;
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
    } catch (e) {
      alert('Failed to generate attendance Excel report');
    } finally {
      setDownloading(null);
    }
  };

  const handleExportFeesExcel = async () => {
    if (!selectedYear) return;
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
    } catch (e) {
      alert('Failed to generate fee Excel report');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Reports & Analytics Exports</h1>
        <p className="text-sm text-[#86868B]">
          Generate formal Microsoft Excel (.xlsx) workbooks for regulatory audits and records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Export Card - iOS Card */}
        <div className="ios-card rounded-[22px] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-[16px] bg-emerald-500/10 text-[#34C759] flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-[15px] text-[#1D1D1F]">Class Attendance Register (.xlsx)</h2>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Monthly aggregated roll summary, present counts, and percentages.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
                Select Class
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
          </div>

          <button
            onClick={handleExportAttendanceExcel}
            disabled={downloading === 'attendance'}
            className="ios-gloss-btn-emerald w-full py-2.5 text-xs font-semibold space-x-2"
          >
            <Download className="w-4 h-4 text-white" />
            <span>
              {downloading === 'attendance' ? 'Generating Workbook...' : 'Download Attendance Excel'}
            </span>
          </button>
        </div>

        {/* Fees Export Card - iOS Card */}
        <div className="ios-card rounded-[22px] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-[16px] bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-[15px] text-[#1D1D1F]">Fee Collection Register (.xlsx)</h2>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Full student ledger dues, discounts, payments, and balances.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
                Academic Session
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-[14px] text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
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
            className="ios-gloss-btn w-full py-2.5 text-xs font-semibold space-x-2"
          >
            <Download className="w-4 h-4 text-white" />
            <span>
              {downloading === 'fees' ? 'Generating Workbook...' : 'Download Fee Ledger Excel'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
