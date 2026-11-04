import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import {
  GraduationCap,
  Search,
  Filter,
  IndianRupee,
  Clock,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Calendar,
  X,
  Loader2,
  ChevronRight,
  BookOpen,
  ArrowUpDown,
  Send,
} from 'lucide-react';

export const TuitionRecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'my-enquiries'>('recommendations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Recommended Academic Tuitions & Coaches — Ever Grow Schools ERP';
  }, []);

  // If Parent, hold list of children
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Recommendation Data
  const [weakSubjects, setWeakSubjects] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [totalFound, setTotalFound] = useState<number>(0);
  const [studentName, setStudentName] = useState<string>('');

  // Filter Bar state
  const [area, setArea] = useState('');
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [timing, setTiming] = useState<string>('any');
  const [sortBy, setSortBy] = useState<'best' | 'fee_asc' | 'rating_desc'>('best');

  // Enquiries
  const [myEnquiries, setMyEnquiries] = useState<any[]>([]);

  // Enquiry Modal state
  const [isEnquireModalOpen, setIsEnquireModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);

  // Fetch Parent Children if applicable
  useEffect(() => {
    if (user?.portal_type === 'parent') {
      api
        .get('/portal/parent/children')
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setChildren(res.data);
            setSelectedStudentId(res.data[0].id);
          }
        })
        .catch((err) => console.error('Failed to load children:', err));
    }
  }, [user]);

  // Fetch Recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedStudentId) params.student_id = selectedStudentId;
      if (area.trim()) params.area = area.trim();
      if (budgetMin) params.budget_min = Number(budgetMin);
      if (budgetMax) params.budget_max = Number(budgetMax);
      if (timing && timing !== 'any') params.timing = timing;

      const res = await api.get('/tuitions/recommendations', { params });
      setWeakSubjects(res.data?.weak_subjects || []);
      setRecommendations(res.data?.recommendations || []);
      setTotalFound(res.data?.total_found || 0);
      setStudentName(res.data?.student_name || '');
    } catch (err) {
      console.error('Failed to fetch tuition recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch My Enquiries
  const fetchMyEnquiries = async () => {
    try {
      const params: any = {};
      if (selectedStudentId) params.student_id = selectedStudentId;
      const res = await api.get('/tuitions/my-enquiries', { params });
      setMyEnquiries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch student enquiries:', err);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchMyEnquiries();
  }, [selectedStudentId]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations();
  };

  const handleResetFilters = () => {
    setArea('');
    setBudgetMin('');
    setBudgetMax('');
    setTiming('any');
    // Call API with empty filters
    api
      .get('/tuitions/recommendations', {
        params: selectedStudentId ? { student_id: selectedStudentId } : {},
      })
      .then((res) => {
        setWeakSubjects(res.data?.weak_subjects || []);
        setRecommendations(res.data?.recommendations || []);
        setTotalFound(res.data?.total_found || 0);
        setStudentName(res.data?.student_name || '');
      });
  };

  const handleOpenEnquireModal = (batchCard: any) => {
    setSelectedBatch(batchCard);
    setEnquiryNotes('');
    setEnquirySuccess(null);
    setIsEnquireModalOpen(true);
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setSubmittingEnquiry(true);
    try {
      await api.post('/tuitions/enquire', {
        student_id: selectedStudentId || undefined,
        tuition_center_id: selectedBatch.center_id,
        batch_id: selectedBatch.batch_id,
        notes: enquiryNotes.trim() || 'Parent/Student interested in enrolling for upcoming term.',
      });

      const msg = 'Enquiry successfully submitted! Academy counselor will contact you.';
      setEnquirySuccess(msg);
      toast.success(msg);
      fetchMyEnquiries();
      setTimeout(() => {
        setIsEnquireModalOpen(false);
        setActiveTab('my-enquiries');
      }, 1200);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit enquiry.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // Sorted recommendations
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (sortBy === 'fee_asc') {
      return a.fee_per_month - b.fee_per_month;
    }
    if (sortBy === 'rating_desc') {
      return b.teacher_rating - a.teacher_rating;
    }
    // Best match: approved first, then rating, then fee
    return (b.is_approved ? 1 : 0) - (a.is_approved ? 1 : 0) || b.teacher_rating - a.teacher_rating;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 rounded-[28px] p-6 md:p-8 text-slate-900 border border-blue-200/80 shadow-[0_8px_32px_rgba(0,113,227,0.08)] relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
              Smart Tuition & Coaching Recommendation
            </span>

            {/* Child Selector for Parents */}
            {user?.portal_type === 'parent' && children.length > 0 && (
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-2xl border border-blue-200 shadow-sm">
                <span className="text-xs font-bold text-slate-700">Selecting Child:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="text-xs font-semibold bg-transparent text-blue-700 focus:outline-none cursor-pointer"
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.class_name})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
            Targeted Academic Support for {studentName || 'Student'}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-3xl">
            Our recommendation algorithm cross-references recent assessment marks with verified neighborhood coaching institutes, qualified subject tutors, and transparent monthly fee structures.
          </p>

          {/* Section: Based on your marks, you need support in */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Based on your marks, you need support in:
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {weakSubjects.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  No exam marks recorded yet. Showing general foundation tuition recommendations.
                </span>
              ) : (
                weakSubjects.map((s, idx) => {
                  let pillStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                  let tagBadge = 'Needs Tuition (<60%)';
                  if (s.status === 'borderline') {
                    pillStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                    tagBadge = 'Borderline (60-75%)';
                  } else if (s.status === 'strong') {
                    pillStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    tagBadge = 'Strong (>75%)';
                  }

                  return (
                    <div
                      key={idx}
                      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${pillStyle}`}
                    >
                      <span className="font-bold">{s.subject_name}</span>
                      <span className="text-[10px] opacity-75">
                        {s.percentage ? `${s.percentage}%` : s.grade}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/70 text-[9px] font-bold uppercase tracking-wider">
                        {s.tag || tagBadge}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Recommendations vs My Enquiries */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Recommended Tuitions ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('my-enquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-enquiries'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Inquiries ({myEnquiries.length})
          </button>
        </div>

        {activeTab === 'recommendations' && (
          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            >
              <option value="best">Best Match</option>
              <option value="fee_asc">Lowest Fee (₹)</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <form
            onSubmit={handleFilterSubmit}
            className="ios-card rounded-[24px] p-5 border border-slate-200/80 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Area / Locality / Pincode
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Indiranagar, 560038"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Min Budget (₹ / mo)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="Min ₹"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max Budget (₹ / mo)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="Max ₹"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Timing Preference
                </label>
                <select
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[12px] text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                >
                  <option value="any">Any Timing</option>
                  <option value="morning">Morning (Before 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (After 5 PM)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="w-full ios-gloss-btn py-2 text-xs font-bold space-x-1.5 flex items-center justify-center shadow-md"
                >
                  <Search className="w-3.5 h-3.5 text-white" />
                  <span>Find Tuitions</span>
                </button>
                {(area || budgetMin || budgetMax || timing !== 'any') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                    title="Reset filters"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Results Count Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F]">
              Found {sortedRecommendations.length} tuition {sortedRecommendations.length === 1 ? 'centre' : 'centres'} matching your requirements
            </h2>
          </div>

          {/* Results Cards Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600" />
              <p className="mt-3 text-xs font-medium">Scanning verified tuition providers...</p>
            </div>
          ) : sortedRecommendations.length === 0 ? (
            <div className="ios-card rounded-[28px] p-10 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1D1D1F]">
                No tuitions found in your area
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Try expanding your budget range, selecting "Any Timing", or searching a nearby neighborhood (e.g. Indiranagar, Koramangala, Jayanagar).
              </p>
              <button
                onClick={handleResetFilters}
                className="ios-gloss-btn px-4 py-2 text-xs font-bold"
              >
                Clear Filters & Show All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedRecommendations.map((card) => (
                <div
                  key={card.batch_id}
                  className="ios-card-interactive rounded-[24px] p-5 flex flex-col justify-between border border-slate-200/90 hover:shadow-lg transition-all space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Center Name & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-extrabold text-sm text-[#1D1D1F] leading-snug">
                            {card.center_name}
                          </h3>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {card.center_area}, {card.center_city}
                          </span>
                        </div>
                      </div>

                      {card.is_approved && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Teacher Details */}
                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{card.teacher_name}</span>
                        <div className="flex items-center space-x-1 text-amber-600 text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{card.teacher_rating}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {card.teacher_qualification} • {card.teacher_experience_years} yrs exp.
                      </div>
                    </div>

                    {/* Subject & Timing */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Subject</span>
                        <span className="font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-lg">
                          {card.subject_name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{card.days_of_week?.join(', ')}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {card.start_time} - {card.end_time}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Fee & Seats Left */}
                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Tuition</div>
                        <div className="text-base font-extrabold text-[#1D1D1F] tracking-tight">
                          ₹{card.fee_per_month?.toLocaleString('en-IN')}{' '}
                          <span className="text-[11px] font-normal text-slate-500">/ mo</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            card.seats_left <= 3
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {card.seats_left > 0 ? `${card.seats_left} seats left` : 'Batch Full'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenEnquireModal(card)}
                      className="w-full ios-gloss-btn py-2 text-xs font-bold space-x-1.5 flex items-center justify-center shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-white" />
                      <span>Enquire Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ENQUIRIES */}
      {activeTab === 'my-enquiries' && (
        <div className="ios-card rounded-[22px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] text-[#86868B] text-[11px] uppercase font-semibold border-b border-black/[0.05]">
                <tr>
                  <th className="px-6 py-4">Tuition Academy</th>
                  <th className="px-6 py-4">Subject Batch</th>
                  <th className="px-6 py-4">Enquiry Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Administrative Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {myEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#86868B] text-sm">
                      No inquiries sent yet. Click "Enquire Now" on any recommended tuition to register interest.
                    </td>
                  </tr>
                ) : (
                  myEnquiries.map((enq) => {
                    const statusColors: Record<string, string> = {
                      pending: 'bg-amber-50 text-amber-700 border-amber-200',
                      contacted: 'bg-blue-50 text-blue-700 border-blue-200',
                      enrolled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                    };

                    return (
                      <tr key={enq.id} className="hover:bg-black/[0.01] transition-colors">
                        <td className="px-6 py-4 font-bold text-[#1D1D1F]">
                          {enq.tuition_center_name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                            {enq.batch_subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${
                              statusColors[enq.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-sm">
                          {enq.notes || 'Awaiting academy representative response.'}
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

      {/* ENQUIRY MODAL */}
      {isEnquireModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="ios-modal rounded-[28px] max-w-md w-full p-6 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F]">Tuition Enrollment Enquiry</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedBatch.center_name}</p>
              </div>
              <button
                onClick={() => setIsEnquireModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/60 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Target Subject:</span>
                <span className="font-bold text-blue-900">{selectedBatch.subject_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Faculty:</span>
                <span className="font-semibold text-slate-800">{selectedBatch.teacher_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Monthly Tuition:</span>
                <span className="font-bold text-emerald-700">₹{selectedBatch.fee_per_month}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Timings:</span>
                <span className="font-semibold text-slate-700">
                  {selectedBatch.start_time} - {selectedBatch.end_time} ({selectedBatch.days_of_week?.join(', ')})
                </span>
              </div>
            </div>

            {enquirySuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold text-center flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{enquirySuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student / Parent Inquiries & Special Notes
                  </label>
                  <textarea
                    rows={3}
                    value={enquiryNotes}
                    onChange={(e) => setEnquiryNotes(e.target.value)}
                    placeholder="e.g. Inquiring regarding demo class schedule and transport assistance..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[14px] text-xs focus:ring-2 focus:ring-[#0071E3] focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEnquireModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="ios-gloss-btn px-5 py-2.5 font-bold space-x-1.5 flex items-center shadow-md disabled:opacity-50"
                  >
                    {submittingEnquiry ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Send Official Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

