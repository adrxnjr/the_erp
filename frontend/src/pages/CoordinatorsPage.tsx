import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  Users,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  GraduationCap,
  Edit2,
  Trash2,
  Filter,
  Check,
} from 'lucide-react';

interface Coordinator {
  id: string;
  staff_id: string | null;
  user_id: string | null;
  full_name: string;
  employee_id: string;
  email: string;
  phone_number: string;
  designation: string;
  coordinator_type: string;
  wing: string;
  allocated_grades: string[];
  supervised_subjects: string[];
  office_room: string | null;
  duty_responsibilities: string | null;
  is_lead: boolean;
  is_active: boolean;
  created_at: string | null;
}

export const CoordinatorsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    document.title = 'Academic Wing Coordinators — Ever Grow Schools ERP';
  }, []);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [wingFilter, setWingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    leads: 0,
    wings: 0,
  });

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCoordinator, setEditingCoordinator] = useState<Coordinator | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    employee_id: '',
    email: '',
    phone_number: '',
    designation: 'Academic Coordinator',
    coordinator_type: 'ACADEMIC',
    wing: 'Senior Secondary Wing (Grades 9-12)',
    allocated_grades: 'Grade 9, Grade 10, Grade 11, Grade 12',
    supervised_subjects: 'Mathematics, Science',
    office_room: 'Academic Wing Rm 102',
    duty_responsibilities: '',
    is_lead: false,
    is_active: true,
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCoordinators = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coordinators');
      if (Array.isArray(res.data)) {
        setCoordinators(res.data);
        const activeCount = res.data.filter((c: Coordinator) => c.is_active).length;
        const leadCount = res.data.filter((c: Coordinator) => c.is_lead).length;
        const uniqueWings = new Set(res.data.map((c: Coordinator) => c.wing)).size;

        setStats({
          total: res.data.length,
          active: activeCount,
          leads: leadCount,
          wings: uniqueWings,
        });
      }
    } catch (err) {
      console.error('Error fetching coordinators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoordinator(null);
    setFormData({
      full_name: '',
      employee_id: `EMP-C0${coordinators.length + 1}`,
      email: '',
      phone_number: '',
      designation: 'Academic Wing Coordinator',
      coordinator_type: 'ACADEMIC',
      wing: 'Senior Secondary Wing (Grades 9-12)',
      allocated_grades: 'Grade 9, Grade 10',
      supervised_subjects: 'Mathematics, Physics',
      office_room: 'Academic Block Rm 104',
      duty_responsibilities: 'Oversees lesson planning, teacher substitution, and curriculum milestones.',
      is_lead: false,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (coord: Coordinator) => {
    setEditingCoordinator(coord);
    setFormData({
      full_name: coord.full_name,
      employee_id: coord.employee_id,
      email: coord.email,
      phone_number: coord.phone_number,
      designation: coord.designation,
      coordinator_type: coord.coordinator_type,
      wing: coord.wing,
      allocated_grades: Array.isArray(coord.allocated_grades) ? coord.allocated_grades.join(', ') : '',
      supervised_subjects: Array.isArray(coord.supervised_subjects) ? coord.supervised_subjects.join(', ') : '',
      office_room: coord.office_room || '',
      duty_responsibilities: coord.duty_responsibilities || '',
      is_lead: coord.is_lead,
      is_active: coord.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      full_name: formData.full_name.trim(),
      employee_id: formData.employee_id.trim(),
      email: formData.email.trim(),
      phone_number: formData.phone_number.trim(),
      designation: formData.designation.trim(),
      coordinator_type: formData.coordinator_type,
      wing: formData.wing.trim(),
      allocated_grades: formData.allocated_grades
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
      supervised_subjects: formData.supervised_subjects
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      office_room: formData.office_room.trim(),
      duty_responsibilities: formData.duty_responsibilities.trim(),
      is_lead: formData.is_lead,
      is_active: formData.is_active,
    };

    try {
      if (editingCoordinator) {
        await api.put(`/coordinators/${editingCoordinator.id}`, payload);
        const msg = 'Coordinator profile updated successfully!';
        setFeedback(msg);
        toast.success(msg);
      } else {
        await api.post('/coordinators', payload);
        const msg = 'New coordinator profile created successfully!';
        setFeedback(msg);
        toast.success(msg);
      }
      setShowModal(false);
      fetchCoordinators();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving coordinator profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coord: Coordinator) => {
    try {
      await api.put(`/coordinators/${coord.id}`, { is_active: !coord.is_active });
      fetchCoordinators();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (coord: Coordinator) => {
    if (!window.confirm(`Are you sure you want to remove coordinator '${coord.full_name}'?`)) {
      return;
    }
    try {
      await api.delete(`/coordinators/${coord.id}?hard_delete=true`);
      fetchCoordinators();
    } catch (err) {
      console.error('Error deleting coordinator:', err);
    }
  };

  // Filtered List
  const filtered = coordinators.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.wing.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(c.supervised_subjects) &&
        c.supervised_subjects.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesWing =
      wingFilter === 'all' || c.wing.toLowerCase().includes(wingFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.is_active) ||
      (statusFilter === 'inactive' && !c.is_active);

    return matchesSearch && matchesWing && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Coordinators
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="neu-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coordinator</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#E9EEF5] border border-white/80 shadow-[6px_6px_14px_#C5D0E0,-6px_-6px_14px_#FFFFFF]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Coordinators</span>
            <Users className="w-4 h-4 text-[#0066FF]" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{stats.total}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">{stats.active} Active</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#E9EEF5] border border-white/80 shadow-[6px_6px_14px_#C5D0E0,-6px_-6px_14px_#FFFFFF]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Wings</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{stats.wings}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Assigned Wings</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#E9EEF5] border border-white/80 shadow-[6px_6px_14px_#C5D0E0,-6px_-6px_14px_#FFFFFF]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Lead Coordinators</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{stats.leads}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Wing Leads</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#E9EEF5] border border-white/80 shadow-[6px_6px_14px_#C5D0E0,-6px_-6px_14px_#FFFFFF]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Curriculum</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">100%</div>
          <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Grades 1–12</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#E9EEF5] border border-white/80 shadow-[6px_6px_14px_#C5D0E0,-6px_-6px_14px_#FFFFFF] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coordinator, wing, grade..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 text-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-1 bg-[#E9EEF5] p-1 rounded-xl shadow-[inset_2px_2px_5px_#C5D0E0,inset_-2px_-2px_5px_#FFFFFF] border border-white/40">
            {['all', 'Primary', 'Middle', 'Senior', 'Exam', 'Activity'].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWingFilter(w)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${wingFilter === w
                  ? 'bg-[#E9EEF5] text-[#0066FF] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] border border-white/60'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {w}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2px_2px_4px_#C5D0E0,inset_-2px_-2px_4px_#FFFFFF] text-slate-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Coordinators Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-semibold animate-pulse">
          Loading coordinators data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#E9EEF5] rounded-2xl border border-white/80 shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] p-8">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-bold text-slate-700">No Coordinators Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new coordinator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((coord) => (
            <div
              key={coord.id}
              className={`p-5 rounded-2xl bg-[#E9EEF5] border border-white/80 shadow-[7px_7px_16px_#C5D0E0,-7px_-7px_16px_#FFFFFF] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 relative ${!coord.is_active ? 'opacity-65 grayscale-20' : ''
                }`}
            >
              {coord.is_lead && (
                <div className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                  <span>★ Lead Coordinator</span>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E9EEF5] shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] border border-white/70 flex items-center justify-center text-[#0066FF] font-black text-base shrink-0">
                    {coord.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 pr-16">
                    <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                      {coord.full_name}
                    </h3>
                    <p className="text-xs text-[#0066FF] font-semibold truncate mt-0.5">
                      {coord.designation}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block">{coord.employee_id}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-slate-300/60 text-xs">
                  <div className="flex items-center text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-purple-600 mr-2 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{coord.wing}</span>
                  </div>

                  {coord.office_room && (
                    <div className="flex items-center text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 mr-2 shrink-0" />
                      <span>{coord.office_room}</span>
                    </div>
                  )}

                  <div className="flex items-center text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <span className="truncate">{coord.email}</span>
                  </div>

                  <div className="flex items-center text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <span>{coord.phone_number}</span>
                  </div>
                </div>

                {/* Grades Allocated */}
                {Array.isArray(coord.allocated_grades) && coord.allocated_grades.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Allocated Grades
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {coord.allocated_grades.map((grade, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#E9EEF5] shadow-[inset_1.5px_1.5px_3px_#C5D0E0,inset_-1.5px_-1.5px_3px_#FFFFFF] text-slate-700 border border-white/50"
                        >
                          {grade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supervised Subjects */}
                {Array.isArray(coord.supervised_subjects) && coord.supervised_subjects.length > 0 && (
                  <div className="mt-2.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Supervised Subjects
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {coord.supervised_subjects.map((subj, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#E9EEF5] shadow-[2px_2px_4px_#C5D0E0,-2px_-2px_4px_#FFFFFF] text-[#0066FF] border border-white/60"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {coord.duty_responsibilities && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-3 bg-white/40 p-2 rounded-xl border border-white/60 shadow-2xs">
                    {coord.duty_responsibilities}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-300/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(coord)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-xs ${coord.is_active
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}
                >
                  {coord.is_active ? 'Active' : 'Inactive'}
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(coord)}
                    className="p-1.5 text-slate-500 hover:text-[#0066FF] bg-[#E9EEF5] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] rounded-lg transition-all border border-white/60 active:scale-95"
                    title="Edit Coordinator"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(coord)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 bg-[#E9EEF5] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] rounded-lg transition-all border border-white/60 active:scale-95"
                    title="Delete Coordinator"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit Coordinator */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E9EEF5] rounded-3xl shadow-[16px_16px_40px_#BAC6D8,-16px_-16px_40px_#FFFFFF] max-w-lg w-full p-6 border border-white/80 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-[#E9EEF5] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] border border-white/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E9EEF5] shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] text-[#0066FF] flex items-center justify-center border border-white/70">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingCoordinator ? 'Edit Coordinator Profile' : 'Add New Coordinator'}
                </h3>
                <p className="text-xs text-slate-500">Configure academic wing & grade coordination</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="e.g. EMP-C01"
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="coordinator@evergrowschools.edu"
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Primary Wing Coordinator"
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Coordination Type
                  </label>
                  <select
                    value={formData.coordinator_type}
                    onChange={(e) => setFormData({ ...formData, coordinator_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  >
                    <option value="ACADEMIC">Academic Coordinator</option>
                    <option value="WING">Wing Coordinator</option>
                    <option value="EXAMINATION">Examination Coordinator</option>
                    <option value="ACTIVITY">Activity Coordinator</option>
                    <option value="DISCIPLINE">Discipline Coordinator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Assigned Wing *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.wing}
                    onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                    placeholder="e.g. Primary Wing (Grades 1-5)"
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Office / Room
                  </label>
                  <input
                    type="text"
                    value={formData.office_room}
                    onChange={(e) => setFormData({ ...formData, office_room: e.target.value })}
                    placeholder="e.g. Academic Block Rm 204"
                    className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Allocated Grades (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.allocated_grades}
                  onChange={(e) => setFormData({ ...formData, allocated_grades: e.target.value })}
                  placeholder="Grade 1, Grade 2, Grade 3"
                  className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Supervised Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.supervised_subjects}
                  onChange={(e) => setFormData({ ...formData, supervised_subjects: e.target.value })}
                  placeholder="Mathematics, Science, English"
                  className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Duties & Key Responsibilities
                </label>
                <textarea
                  rows={2}
                  value={formData.duty_responsibilities}
                  onChange={(e) => setFormData({ ...formData, duty_responsibilities: e.target.value })}
                  placeholder="Key oversight responsibilities for this coordinator..."
                  className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_2.5px_2.5px_5px_#C5D0E0,inset_-2.5px_-2.5px_5px_#FFFFFF] focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_lead}
                    onChange={(e) => setFormData({ ...formData, is_lead: e.target.checked })}
                    className="rounded text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span>Designate as Lead Coordinator</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span>Active Status</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="neu-btn-secondary flex-1 py-2.5 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="neu-btn-primary flex-1 py-2.5 text-xs font-bold rounded-xl"
                >
                  {saving ? 'Saving...' : editingCoordinator ? 'Save Changes' : 'Create Coordinator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

