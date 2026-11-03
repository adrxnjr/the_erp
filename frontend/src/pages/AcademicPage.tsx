import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  ShieldCheck,
  Lock,
  Edit3,
  CheckCircle2,
  Clock,
  BookMarked,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  AlertCircle,
  Calculator,
  FlaskConical,
  Laptop,
  Globe,
  Palette,
} from 'lucide-react';

interface SyllabusUnit {
  unit_number: number;
  title: string;
  term?: string;
  hours?: number;
  topics?: string[];
}

interface SyllabusItem {
  id: string;
  subject_id?: string;
  subject_name: string;
  subject_code: string;
  wing_name: string;
  grade_range: string;
  academic_year: string;
  total_units: number;
  total_hours: number;
  overview: string;
  units: SyllabusUnit[];
  textbooks: string[];
  learning_outcomes: string[];
  coordinator_name: string;
  status: string;
  updated_at?: string;
}

interface CoordinatorPermission {
  can_update: boolean;
  is_coordinator: boolean;
  coordinator_name: string;
  wing_name: string;
  message: string;
}

export const AcademicPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);

  // Syllabus State
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [permission, setPermission] = useState<CoordinatorPermission | null>(null);
  const [selectedWing, setSelectedWing] = useState<string>('all');
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);

  // Edit Modal State (Coordinator Only)
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusItem | null>(null);
  const [formData, setFormData] = useState<{
    overview: string;
    total_units: number;
    total_hours: number;
    textbooks: string;
    learning_outcomes: string;
    status: string;
  }>({
    overview: '',
    total_units: 6,
    total_hours: 120,
    textbooks: '',
    learning_outcomes: '',
    status: 'Approved & Published',
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, subRes, yrRes, syllRes, permRes] = await Promise.all([
          api.get('/academic/classes'),
          api.get('/academic/subjects'),
          api.get('/academic/years'),
          api.get('/academic/syllabus'),
          api.get('/academic/syllabus/permission').catch(() => ({ data: null })),
        ]);
        setClasses(Array.isArray(clsRes.data) ? clsRes.data : []);
        setSubjects(Array.isArray(subRes.data) ? subRes.data : []);
        setYears(Array.isArray(yrRes.data) ? yrRes.data : []);
        setSyllabi(Array.isArray(syllRes.data) ? syllRes.data : []);
        if (permRes?.data) {
          setPermission(permRes.data);
        }
      } catch (e) {
        console.error('Error loading academic data:', e);
      }
    };
    fetchData();
  }, []);

  const handleOpenEditModal = (syll: SyllabusItem) => {
    if (!permission?.can_update) return;
    setEditingSyllabus(syll);
    setFormData({
      overview: syll.overview || '',
      total_units: syll.total_units || 6,
      total_hours: syll.total_hours || 120,
      textbooks: (syll.textbooks || []).join('\n'),
      learning_outcomes: (syll.learning_outcomes || []).join('\n'),
      status: syll.status || 'Approved & Published',
    });
  };

  const handleSaveSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSyllabus || !permission?.can_update) return;

    setSaving(true);
    try {
      const payload = {
        overview: formData.overview,
        total_units: formData.total_units,
        total_hours: formData.total_hours,
        textbooks: formData.textbooks
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        learning_outcomes: formData.learning_outcomes
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        status: formData.status,
      };

      const res = await api.put(`/academic/syllabus/${editingSyllabus.id}`, payload);
      const updatedItem = res.data;

      setSyllabi((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );

      setStatusMessage('Curriculum syllabus updated and published successfully!');
      setTimeout(() => setStatusMessage(null), 4000);
      setEditingSyllabus(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update syllabus.');
    } finally {
      setSaving(false);
    }
  };

  const getSubjectIcon = (code: string) => {
    switch ((code || '').toUpperCase()) {
      case 'MATH':
        return <Calculator className="w-4 h-4 text-blue-600" />;
      case 'CS':
        return <Laptop className="w-4 h-4 text-cyan-600" />;
      case 'SCI':
        return <FlaskConical className="w-4 h-4 text-emerald-600" />;
      case 'ENG':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'SOC':
        return <Globe className="w-4 h-4 text-amber-600" />;
      default:
        return <Palette className="w-4 h-4 text-indigo-600" />;
    }
  };

  const filteredSyllabi = syllabi.filter((item) => {
    if (selectedWing === 'all') return true;
    return item.wing_name.toLowerCase().includes(selectedWing.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Academic Structure & Courses</h1>
        <p className="text-sm text-[#86868B] mt-0.5">
          Manage academic sessions, grade levels, sections, curriculum subjects, and coordinator-governed syllabi.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Overview Cards (Classes, Subjects, Years) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classes Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span>Classes ({classes.length})</span>
            </h2>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {classes.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] flex items-center justify-between text-sm"
              >
                <span className="font-semibold text-[#1D1D1F]">{c.name}</span>
                <span className="text-xs text-[#86868B]">Level {c.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Subjects ({subjects.length})</span>
            </h2>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] flex items-center justify-between text-sm"
              >
                <span className="font-semibold text-[#1D1D1F]">{s.name}</span>
                <span className="text-xs font-mono bg-[#5856D6]/10 text-[#5856D6] px-2.5 py-0.5 rounded-full border border-[#5856D6]/20 font-semibold">
                  {s.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Years Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
              <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 text-[#34C759] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Academic Years ({years.length})</span>
            </h2>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {years.map((y) => (
              <div
                key={y.id}
                className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] space-y-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#1D1D1F]">{y.name}</span>
                  {y.is_active && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-[#34C759] rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#86868B]">
                  {y.start_date} to {y.end_date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- SYLLABUS & CURRICULUM SECTION ---------------- */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071E3] to-blue-600 flex items-center justify-center text-white shadow-xs">
                <BookMarked className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Official Curriculum Syllabi & Course Units
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Course modules, learning competencies, and prescribed literature governed exclusively by Academic Wing Coordinators.
            </p>
          </div>

          {/* Coordinator Authority Badge */}
          <div>
            {permission?.can_update ? (
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 space-x-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Coordinator Authority Active ({permission.coordinator_name})</span>
              </div>
            ) : (
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 space-x-1.5 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Protected: Only Academic Coordinators can update syllabus</span>
              </div>
            )}
          </div>
        </div>

        {/* Wing Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-1.5 flex flex-wrap items-center gap-2 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase px-3">Filter Wing:</span>
          {[
            { id: 'all', label: `All Wings (${syllabi.length})` },
            { id: 'primary', label: 'Primary Wing (Grades 1-5)' },
            { id: 'middle', label: 'Middle School Wing (Grades 6-9)' },
            { id: 'senior', label: 'Senior Secondary Wing (Grades 10-12)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedWing(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedWing === tab.id
                  ? 'bg-gradient-to-r from-[#0071E3] to-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Syllabi Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSyllabi.map((item) => {
            const isExpanded = expandedSyllabusId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shadow-xs">
                        {getSubjectIcon(item.subject_code)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-base">{item.subject_name}</h3>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#0071E3] border border-blue-200">
                            {item.subject_code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {item.wing_name} • <span className="font-bold text-slate-700">{item.grade_range}</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      {item.status}
                    </span>
                  </div>

                  {/* Overview */}
                  <p className="text-xs text-slate-600 leading-relaxed">{item.overview}</p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Units</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">{item.total_units} Units</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Hours</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">{item.total_hours} Hours</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Academic Year</div>
                      <div className="text-sm font-extrabold text-[#0071E3] mt-0.5">{item.academic_year}</div>
                    </div>
                  </div>

                  {/* Expandable Course Units */}
                  <div>
                    <button
                      onClick={() => setExpandedSyllabusId(isExpanded ? null : item.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 p-2.5 rounded-xl bg-slate-100/70 hover:bg-slate-100 transition-colors"
                    >
                      <span className="flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span>Curriculum Units & Chapters ({item.units?.length || 0})</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-2 border-l-2 border-blue-500 pl-3">
                        {item.units?.map((u, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                              <span>
                                Unit {u.unit_number}: {u.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {u.term || 'Term 1'} • {u.hours || 20}h
                              </span>
                            </div>
                            {u.topics && u.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {u.topics.map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescribed Textbooks */}
                  {item.textbooks && item.textbooks.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">
                        Prescribed Literature:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.textbooks.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[11px] font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/80"
                          >
                            📖 {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Attribution & Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Governed by: <b className="text-slate-800">{item.coordinator_name}</b>
                    </span>
                  </div>

                  {/* Coordinator-Only Edit Action */}
                  {permission?.can_update ? (
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="ios-gloss-btn px-4 py-2 text-xs font-semibold space-x-1.5 flex items-center"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-white" />
                      <span>Update Syllabus</span>
                    </button>
                  ) : (
                    <span
                      title="Curriculum updates are strictly restricted to Academic Wing Coordinators."
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 flex items-center space-x-1 cursor-not-allowed"
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Coordinator Only</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- COORDINATOR UPDATE SYLLABUS MODAL ---------------- */}
      {editingSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-black/[0.08] space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071E3] border border-blue-200">
                    {editingSyllabus.subject_code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Update Curriculum Syllabus — {editingSyllabus.subject_name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Coordinator: <b className="text-slate-700">{permission?.coordinator_name}</b> • {editingSyllabus.wing_name}
                </p>
              </div>

              <button
                onClick={() => setEditingSyllabus(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSyllabus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Overview & Description
                </label>
                <textarea
                  rows={3}
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  placeholder="Summarize course goals and academic scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: parseInt(e.target.value) || 6 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Academic Hours
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={formData.total_hours}
                    onChange={(e) => setFormData({ ...formData, total_hours: parseInt(e.target.value) || 120 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Prescribed Textbooks (One per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.textbooks}
                  onChange={(e) => setFormData({ ...formData, textbooks: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  placeholder="Oxford Primary Mathematics 2026&#10;Cambridge Workbook"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Key Learning Outcomes (One per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.learning_outcomes}
                  onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  placeholder="Master multi-digit computation&#10;Construct block scripts"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Publication Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                >
                  <option value="Approved & Published">Approved & Published</option>
                  <option value="Under Curriculum Review">Under Curriculum Review</option>
                  <option value="Revision Pending">Revision Pending</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingSyllabus(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold text-white space-x-1.5 flex items-center shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{saving ? 'Publishing Updates...' : 'Save & Publish Syllabus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
