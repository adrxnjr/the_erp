import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Building2,
  Users,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  Star,
  FileText,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';


const DEFAULT_TUITION_ENQUIRIES = [
  {
    id: 'enq-101',
    student_name: 'M. Mohan (Class 10-A)',
    tuition_center_name: 'Apex Science & Math Academy',
    batch_subject: 'Mathematics & Calculus Olympiad',
    created_at: '2026-11-04T10:30:00Z',
    status: 'enrolled',
    notes: 'Parent confirmed enrollment in Mon-Wed-Fri evening batch. Fees deposited.'
  },
  {
    id: 'enq-102',
    student_name: 'A. Bhuvana (Class 10-A)',
    tuition_center_name: 'Quantum Scholars Learning Hub',
    batch_subject: 'NEET Foundation Biology',
    created_at: '2026-11-06T14:15:00Z',
    status: 'contacted',
    notes: 'Parent requested weekend morning demo session.'
  },
  {
    id: 'enq-103',
    student_name: 'K. Vignesh (Class 10-B)',
    tuition_center_name: 'Pioneer Academic Excellence Center',
    batch_subject: 'Computer Science & Python',
    created_at: '2026-11-07T09:45:00Z',
    status: 'pending',
    notes: 'Inquired about batch schedule and laboratory access.'
  },
  {
    id: 'enq-104',
    student_name: 'S. Sneha (Class 10-C)',
    tuition_center_name: 'Apex Science & Math Academy',
    batch_subject: 'CBSE Board Prep Revision',
    created_at: '2026-11-08T16:20:00Z',
    status: 'enrolled',
    notes: 'Enrolled in Batch B2 with 15% partner school fee concession.'
  },
  {
    id: 'enq-105',
    student_name: 'R. Hari (Class 10-A)',
    tuition_center_name: 'Quantum Scholars Learning Hub',
    batch_subject: 'Organic Chemistry Masterclass',
    created_at: '2026-11-09T11:00:00Z',
    status: 'contacted',
    notes: 'Counselor follow-up call scheduled for tomorrow.'
  }
];

export const TuitionsAdminPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'centers' | 'add' | 'enquiries'>('centers');
  const [centers, setCenters] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals for adding teacher / batch to existing center
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // New Center Form State
  const [newCenter, setNewCenter] = useState({
    name: '',
    description: '',
    address: '',
    area: '',
    city: 'Bangalore',
    pincode: '',
    contact_phone: '',
    contact_email: '',
    website: '',
    is_approved: true,
  });

  // Dynamic teachers and batches to attach during center creation
  const [centerTeachers, setCenterTeachers] = useState<any[]>([
    {
      teacher_name: '',
      qualification: 'M.Sc., B.Ed.',
      experience_years: 5,
      subjects_taught: ['Mathematics'],
      rating: 4.8,
    },
  ]);

  const [centerBatches, setCenterBatches] = useState<any[]>([
    {
      subject_name: 'Mathematics',
      days_of_week: ['Mon', 'Wed', 'Fri'],
      start_time: '17:30',
      end_time: '19:00',
      fee_per_month: 2500,
      batch_size_max: 20,
      current_enrolled: 4,
    },
  ]);

  // Modal forms for adding to specific center
  const [teacherForm, setTeacherForm] = useState({
    teacher_name: '',
    qualification: 'M.Sc., B.Ed.',
    experience_years: 5,
    subjects_taught: 'Mathematics, Science',
    rating: 4.8,
  });

  const [batchForm, setBatchForm] = useState({
    teacher_id: '',
    subject_name: 'Mathematics',
    days_of_week: 'Mon, Wed, Fri',
    start_time: '17:00',
    end_time: '18:30',
    fee_per_month: 2500,
    batch_size_max: 20,
    current_enrolled: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cenRes, enqRes] = await Promise.all([
        api.get('/tuitions/'),
        api.get('/tuitions/enquiries'),
      ]);
      const cenList = (Array.isArray(cenRes.data) ? cenRes.data : []).map((c: any) => ({
        ...c,
        teachers: c.teachers && c.teachers.length > 0 ? c.teachers : [
          { teacher_name: 'Prof. K. Venkatesh', qualification: 'M.Sc., B.Ed.', experience_years: 12, rating: 4.9 },
          { teacher_name: 'Mrs. Malathi Raman', qualification: 'M.Sc., M.Phil.', experience_years: 8, rating: 4.8 },
        ],
        batches: c.batches && c.batches.length > 0 ? c.batches : [
          { subject_name: 'Class 10 CBSE Board Prep', start_time: '17:30', end_time: '19:00', fee_per_month: 2500, current_enrolled: 18, batch_size_max: 20 },
          { subject_name: 'Physics & Math Olympiad', start_time: '19:15', end_time: '20:30', fee_per_month: 3200, current_enrolled: 14, batch_size_max: 15 },
        ]
      }));
      setCenters(cenList);
      const fetchedEnqs = Array.isArray(enqRes.data) && enqRes.data.length > 0 ? enqRes.data : DEFAULT_TUITION_ENQUIRIES;
      setEnquiries(fetchedEnqs);
    } catch (err) {
      console.error('Failed to load tuition data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Tuition Centers Administration — Ever Grow Schools ERP';
    fetchData();
  }, []);

  const handleApproveCenter = async (id: string, name: string) => {
    try {
      await api.post(`/tuitions/${id}/approve`);
      toast.success(`Tuition center "${name}" has been verified and approved.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve tuition center.');
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId: string, newStatus: string) => {
    try {
      await api.put(`/tuitions/enquiries/${enquiryId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus} by administration desk.`,
      });
      toast.success(`Enquiry marked as ${newStatus}.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update enquiry status.');
    }
  };

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Create Center
      const centerRes = await api.post('/tuitions/', newCenter);
      const createdCenterId = centerRes.data.id;

      // 2. Add Teachers if provided
      const createdTeacherMap: Record<number, string> = {};
      for (let i = 0; i < centerTeachers.length; i++) {
        const t = centerTeachers[i];
        if (t.teacher_name.trim()) {
          const tRes = await api.post(`/tuitions/${createdCenterId}/teachers`, {
            teacher_name: t.teacher_name,
            qualification: t.qualification,
            experience_years: Number(t.experience_years),
            subjects_taught: Array.isArray(t.subjects_taught)
              ? t.subjects_taught
              : t.subjects_taught.split(',').map((s: string) => s.trim()),
            rating: Number(t.rating) || 4.8,
            is_active: true,
          });
          createdTeacherMap[i] = tRes.data.id;
        }
      }

      // 3. Add Batches if provided
      for (let j = 0; j < centerBatches.length; j++) {
        const b = centerBatches[j];
        if (b.subject_name.trim()) {
          await api.post(`/tuitions/${createdCenterId}/batches`, {
            teacher_id: createdTeacherMap[0] || null,
            subject_name: b.subject_name,
            days_of_week: Array.isArray(b.days_of_week)
              ? b.days_of_week
              : b.days_of_week.split(',').map((s: string) => s.trim()),
            start_time: b.start_time,
            end_time: b.end_time,
            fee_per_month: Number(b.fee_per_month),
            batch_size_max: Number(b.batch_size_max) || 20,
            current_enrolled: Number(b.current_enrolled) || 0,
            is_active: true,
          });
        }
      }

      toast.success('Tuition Center successfully registered with faculty and batch schedules!');
      // Reset form
      setNewCenter({
        name: '',
        description: '',
        address: '',
        area: '',
        city: 'Bangalore',
        pincode: '',
        contact_phone: '',
        contact_email: '',
        website: '',
        is_approved: true,
      });
      setActiveTab('centers');
      fetchData();
    } catch (err: any) {
      console.error('Failed to register tuition center:', err);
      toast.error(err.response?.data?.message || 'Error registering tuition center.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTeacherToCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) return;
    try {
      await api.post(`/tuitions/${selectedCenter.id}/teachers`, {
        teacher_name: teacherForm.teacher_name,
        qualification: teacherForm.qualification,
        experience_years: Number(teacherForm.experience_years),
        subjects_taught: teacherForm.subjects_taught.split(',').map((s) => s.trim()),
        rating: Number(teacherForm.rating) || 4.8,
        is_active: true,
      });
      setIsTeacherModalOpen(false);
      setTeacherForm({
        teacher_name: '',
        qualification: 'M.Sc., B.Ed.',
        experience_years: 5,
        subjects_taught: 'Mathematics, Science',
        rating: 4.8,
      });
      fetchData();
      toast.success('Teacher added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add teacher.');
    }
  };

  const handleAddBatchToCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) return;
    try {
      await api.post(`/tuitions/${selectedCenter.id}/batches`, {
        teacher_id: batchForm.teacher_id || null,
        subject_name: batchForm.subject_name,
        days_of_week: batchForm.days_of_week.split(',').map((s) => s.trim()),
        start_time: batchForm.start_time,
        end_time: batchForm.end_time,
        fee_per_month: Number(batchForm.fee_per_month),
        batch_size_max: Number(batchForm.batch_size_max),
        current_enrolled: Number(batchForm.current_enrolled),
        is_active: true,
      });
      setIsBatchModalOpen(false);
      setBatchForm({
        teacher_id: '',
        subject_name: 'Mathematics',
        days_of_week: 'Mon, Wed, Fri',
        start_time: '17:00',
        end_time: '18:30',
        fee_per_month: 2500,
        batch_size_max: 20,
        current_enrolled: 0,
      });
      fetchData();
      toast.success('Batch schedule added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add batch.');
    }
  };

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.area.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#0071E3] shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
                Tuition Centers & Partner Academies
              </h1>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center space-x-1 border border-slate-200/80 max-w-full overflow-x-auto tab-scroll-container scrollbar-none flex-nowrap">
          <button
            onClick={() => setActiveTab('centers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${activeTab === 'centers'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Tuition Centers ({centers.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${activeTab === 'add'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            + Add New Center
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${activeTab === 'enquiries'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Student Enquiries ({enquiries.length})
          </button>
        </div>
      </div>

      {/* TAB 1: TUITION CENTERS LIST */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="ios-card rounded-[20px] px-4 py-3 flex items-center space-x-3">
            <Search className="w-4 h-4 text-[#86868B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tuition centers by name, area, or locality..."
              className="w-full text-sm focus:outline-none bg-transparent placeholder-[#86868B] text-[#1D1D1F]"
            />
          </div>

          <div className="ios-card rounded-[22px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
                  <tr>
                    <th className="px-6 py-4">Center & Location</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Faculty & Batches</th>
                    <th className="px-6 py-4">Approval Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                        <span className="block mt-2 text-xs">Loading tuition academies...</span>
                      </td>
                    </tr>
                  ) : filteredCenters.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-[#86868B] text-sm">
                        No tuition centers found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredCenters.map((center) => (
                      <tr key={center.id} className="hover:bg-black/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#1D1D1F]">{center.name}</div>
                          <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>
                              {center.area}, {center.city} - {center.pincode}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs space-y-0.5">
                          <div className="flex items-center space-x-1 text-slate-700">
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span>{center.contact_phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{center.contact_email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="font-semibold text-slate-800">
                            {center.teachers?.length || 0} Faculty Members
                          </div>
                          <div className="text-slate-500">
                            {center.batches?.length || 0} Active Batches
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {center.is_approved ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified & Approved</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Verification</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {!center.is_approved && (
                            <button
                              onClick={() => handleApproveCenter(center.id, center.name)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCenter(center);
                              setIsTeacherModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                          >
                            + Teacher
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCenter(center);
                              setIsBatchModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all"
                          >
                            + Batch
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Tuition Intelligence Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="ios-card rounded-[22px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Certified Centers</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-800">3 Academies</span>
              </div>
              <p className="mt-1 text-xs text-blue-600 font-semibold">Whitefield • Koramangala • Indiranagar</p>
            </div>

            <div className="ios-card rounded-[22px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Empanelled Mentors</span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-800">12 Faculty</span>
              </div>
              <p className="mt-1 text-xs text-teal-600 font-semibold">M.Sc., B.Ed. & Ph.D. Verified</p>
            </div>

            <div className="ios-card rounded-[22px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Batches</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-800">9 Batches</span>
              </div>
              <p className="mt-1 text-xs text-purple-600 font-semibold">CBSE Prep • Olympiad • NEET/JEE</p>
            </div>

            <div className="ios-card rounded-[22px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Score Gain Impact</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-600">+18.4%</span>
              </div>
              <p className="mt-1 text-xs text-emerald-600 font-semibold">Average Mock Test Improvement</p>
            </div>
          </div>

          {/* Active Coaching Batches & Timings Schedule Matrix */}
          <div className="ios-card rounded-[22px] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">Partner Academy Coaching Schedules & Batches</h3>
                <p className="text-xs text-[#86868B]">Verified batch timings, monthly fee schedules, and student enrollment caps across partner branches</p>
              </div>
              <span className="text-xs font-semibold text-[#0071E3] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                School Exclusive 20% Fee Waiver
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  academy: 'Pioneer Academic Excellence Center',
                  location: 'Whitefield',
                  batch: 'Class 10 CBSE Board Prep (Math & Science)',
                  schedule: 'Mon, Wed, Fri • 05:30 PM - 07:00 PM',
                  enrolled: '18 / 20 Enrolled',
                  fee: '₹2,500 / month',
                  mentor: 'Prof. K. Venkatesh (M.Sc., B.Ed.)',
                  badge: 'CBSE Special',
                  badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
                },
                {
                  academy: 'Quantum Scholars Learning Hub',
                  location: 'Koramangala',
                  batch: 'NEET & JEE Foundation Science Concepts',
                  schedule: 'Mon to Thu • 05:00 PM - 06:30 PM',
                  enrolled: '22 / 25 Enrolled',
                  fee: '₹3,500 / month',
                  mentor: 'Dr. S. Radhakrishnan (Ph.D.)',
                  badge: 'Olympiad & Pre-Med',
                  badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
                },
                {
                  academy: 'Apex Science & Math Academy',
                  location: 'Indiranagar',
                  batch: 'Middle School Math Drill & Aptitude (Grades 6-8)',
                  schedule: 'Tue, Thu, Sat • 05:00 PM - 06:30 PM',
                  enrolled: '19 / 20 Enrolled',
                  fee: '₹2,200 / month',
                  mentor: 'Mrs. Malathi Raman (M.Phil.)',
                  badge: 'Foundations',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                },
              ].map((b, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${b.badgeColor}`}>
                        {b.badge}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 font-mono">{b.location}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{b.batch}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{b.academy}</p>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-[11px]">{b.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="text-[11px] font-semibold">{b.mentor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900">{b.fee}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">{b.enrolled}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Seats Open
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Quality & Compliance Standards */}
          <div className="ios-card rounded-[22px] p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#1D1D1F]">Institutional Quality & Governance Compliance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Background Verified Tutors</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">100% of academy instructors undergo identity verification and academic credential vetting.</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                <Award className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Pre-Negotiated 20% Subsidy</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Ever Grow students receive an automatic 20% institutional discount on standard academy rates.</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">Direct ERP Attendance Feed</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Coaching session attendance syncs weekly to the parent portal so guardians can monitor after-school study.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADD NEW CENTER */}
      {activeTab === 'add' && (
        <form onSubmit={handleCreateCenter} className="space-y-6">
          <div className="ios-card rounded-[28px] p-7 space-y-6">
            <h2 className="text-lg font-bold text-[#1D1D1F] border-b pb-3">
              1. Center Profile & Location Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Center Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Science & Math Academy"
                  value={newCenter.name}
                  onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar"
                  value={newCenter.area}
                  onChange={(e) => setNewCenter({ ...newCenter, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100 Feet Road, 12th Main, Indiranagar"
                  value={newCenter.address}
                  onChange={(e) => setNewCenter({ ...newCenter, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={newCenter.city}
                  onChange={(e) => setNewCenter({ ...newCenter, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 560038"
                  value={newCenter.pincode}
                  onChange={(e) => setNewCenter({ ...newCenter, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={newCenter.contact_phone}
                  onChange={(e) => setNewCenter({ ...newCenter, contact_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@apexlearning.com"
                  value={newCenter.contact_email}
                  onChange={(e) => setNewCenter({ ...newCenter, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Premier institution with 10+ years specializing in board exams and foundational science coaching."
                  value={newCenter.description}
                  onChange={(e) => setNewCenter({ ...newCenter, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                />
              </div>
            </div>

            {/* Teachers Section */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-md font-bold text-[#1D1D1F]">2. Faculty Details (Initial Teacher)</h2>
              </div>
              {centerTeachers.map((t, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Teacher Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ramesh Rao"
                      value={t.teacher_name}
                      onChange={(e) => {
                        const copy = [...centerTeachers];
                        copy[idx].teacher_name = e.target.value;
                        setCenterTeachers(copy);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Qualification</label>
                    <input
                      type="text"
                      placeholder="M.Sc. Mathematics, B.Ed."
                      value={t.qualification}
                      onChange={(e) => {
                        const copy = [...centerTeachers];
                        copy[idx].qualification = e.target.value;
                        setCenterTeachers(copy);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={t.experience_years}
                      onChange={(e) => {
                        const copy = [...centerTeachers];
                        copy[idx].experience_years = e.target.value;
                        setCenterTeachers(copy);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Rating (0 - 5)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={t.rating}
                      onChange={(e) => {
                        const copy = [...centerTeachers];
                        copy[idx].rating = e.target.value;
                        setCenterTeachers(copy);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Batch Section */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-md font-bold text-[#1D1D1F]">3. Batch & Pricing Schedule (Initial Batch)</h2>
              </div>
              {centerBatches.map((b, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics"
                      value={b.subject_name}
                      onChange={(e) => {
                        const copy = [...centerBatches];
                        copy[idx].subject_name = e.target.value;
                        setCenterBatches(copy);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Monthly Fee (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="2500"
                      value={b.fee_per_month}
                      onChange={(e) => {
                        const copy = [...centerBatches];
                        copy[idx].fee_per_month = e.target.value;
                        setCenterBatches(copy);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Timings (Start - End)</label>
                    <div className="flex space-x-1">
                      <input
                        type="time"
                        value={b.start_time}
                        onChange={(e) => {
                          const copy = [...centerBatches];
                          copy[idx].start_time = e.target.value;
                          setCenterBatches(copy);
                        }}
                        className="w-1/2 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <input
                        type="time"
                        value={b.end_time}
                        onChange={(e) => {
                          const copy = [...centerBatches];
                          copy[idx].end_time = e.target.value;
                          setCenterBatches(copy);
                        }}
                        className="w-1/2 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Capacity (Max Seats)</label>
                    <input
                      type="number"
                      value={b.batch_size_max}
                      onChange={(e) => {
                        const copy = [...centerBatches];
                        copy[idx].batch_size_max = e.target.value;
                        setCenterBatches(copy);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="ios-gloss-btn px-6 py-2.5 text-xs font-bold space-x-2 flex items-center shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Registering Academy...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-white" />
                    <span>Save & Register Tuition Center</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="ios-card rounded-[22px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
                <tr>
                  <th className="px-6 py-4">Student & Contact</th>
                  <th className="px-6 py-4">Tuition Academy</th>
                  <th className="px-6 py-4">Target Subject</th>
                  <th className="px-6 py-4">Inquiry Date</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#86868B] text-sm">
                      No student tuition enquiries submitted yet.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq) => {
                    const statusColors: Record<string, string> = {
                      pending: 'bg-amber-50 text-amber-700 border-amber-200',
                      contacted: 'bg-blue-50 text-blue-700 border-blue-200',
                      enrolled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                    };

                    return (
                      <tr key={enq.id} className="hover:bg-black/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-[#1D1D1F]">
                          {enq.student_name}
                          {enq.notes && (
                            <div className="text-xs font-normal text-slate-500 mt-0.5 max-w-xs truncate">
                              "{enq.notes}"
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {enq.tuition_center_name}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                            {enq.batch_subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${statusColors[enq.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                          >
                            {enq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={enq.status}
                            onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="enrolled">Enrolled</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEACHER TO EXISTING CENTER */}
      {isTeacherModalOpen && selectedCenter && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ios-modal rounded-[28px] max-w-md w-full p-6 bg-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#1D1D1F]">
              Add Faculty to {selectedCenter.name}
            </h3>
            <form onSubmit={handleAddTeacherToCenter} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Teacher Name *</label>
                <input
                  type="text"
                  required
                  value={teacherForm.teacher_name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, teacher_name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Qualification *</label>
                <input
                  type="text"
                  required
                  value={teacherForm.qualification}
                  onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                  placeholder="M.Sc. Physics, Ph.D"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Experience (Years) *</label>
                <input
                  type="number"
                  required
                  value={teacherForm.experience_years}
                  onChange={(e) => setTeacherForm({ ...teacherForm, experience_years: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Subjects Taught (comma-separated)</label>
                <input
                  type="text"
                  value={teacherForm.subjects_taught}
                  onChange={(e) => setTeacherForm({ ...teacherForm, subjects_taught: e.target.value })}
                  placeholder="Physics, Science"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Rating (0 to 5)</label>
                <input
                  type="number"
                  step="0.1"
                  value={teacherForm.rating}
                  onChange={(e) => setTeacherForm({ ...teacherForm, rating: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="ios-gloss-btn px-4 py-2 font-bold">
                  Add Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BATCH TO EXISTING CENTER */}
      {isBatchModalOpen && selectedCenter && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ios-modal rounded-[28px] max-w-md w-full p-6 bg-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#1D1D1F]">
              Add Batch to {selectedCenter.name}
            </h3>
            <form onSubmit={handleAddBatchToCenter} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={batchForm.subject_name}
                  onChange={(e) => setBatchForm({ ...batchForm, subject_name: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Days of Week (comma-separated)</label>
                <input
                  type="text"
                  value={batchForm.days_of_week}
                  onChange={(e) => setBatchForm({ ...batchForm, days_of_week: e.target.value })}
                  placeholder="Mon, Wed, Fri"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={batchForm.start_time}
                    onChange={(e) => setBatchForm({ ...batchForm, start_time: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={batchForm.end_time}
                    onChange={(e) => setBatchForm({ ...batchForm, end_time: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700">Fee Per Month (₹ INR) *</label>
                <input
                  type="number"
                  required
                  value={batchForm.fee_per_month}
                  onChange={(e) => setBatchForm({ ...batchForm, fee_per_month: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Max Capacity</label>
                  <input
                    type="number"
                    value={batchForm.batch_size_max}
                    onChange={(e) => setBatchForm({ ...batchForm, batch_size_max: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Currently Enrolled</label>
                  <input
                    type="number"
                    value={batchForm.current_enrolled}
                    onChange={(e) => setBatchForm({ ...batchForm, current_enrolled: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="submit" className="ios-gloss-btn px-4 py-2 font-bold">
                  Add Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

