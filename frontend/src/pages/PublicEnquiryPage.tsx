import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Send,
  Eye,
  Copy,
  Check,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  X,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface PublicEnquiryPageProps {
  isPublic?: boolean;
}

interface EnquiryItem {
  id: string;
  enquiry_number: string;
  student_name: string;
  gender?: string | null;
  grade_applying_for: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string | null;
  address?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
}

export const PublicEnquiryPage: React.FC<PublicEnquiryPageProps> = ({ isPublic = false }) => {
  const { user } = useAuth();
  const isSuperAdminOrStaff =
    !isPublic &&
    Boolean(
      user &&
        (user.portal_type === 'staff' ||
          user.roles?.some((r) =>
            ['super_admin', 'school_admin', 'principal', 'admin', 'counselor'].includes(r)
          ) ||
          user.username === 'adrin')
    );

  // Form Submission State (for public portal)
  const [formData, setFormData] = useState({
    student_name: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    grade_applying_for: 'Grade 1',
    address: '',
    notes: '',
  });
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Super Admin / Staff Read-Only State
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const res = await api.get('/students/enquiries');
      setEnquiries(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.warn('Failed to load enquiries:', err);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    if (isSuperAdminOrStaff) {
      fetchEnquiries();
    }
  }, [isSuperAdminOrStaff]);

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handlePublicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/students/enquiries', formData);
      setSubmittedNumber(res.data.enquiry_number);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'converted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Converted
          </span>
        );
      case 'shortlisted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <GraduationCap className="w-3 h-3 mr-1 text-purple-600" />
            Shortlisted
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 mr-1 text-blue-600" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            Submitted
          </span>
        );
    }
  };

  // ---------------- VIEW A: SUPER ADMIN & STAFF READ-ONLY ENQUIRIES LEDGER ----------------
  if (isSuperAdminOrStaff) {
    const filteredEnquiries = enquiries.filter((item) => {
      const matchesSearch =
        item.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.enquiry_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.grade_applying_for?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parent_phone?.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' || item.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    const totalCount = enquiries.length;
    const submittedCount = enquiries.filter((e) => e.status?.toLowerCase() === 'submitted').length;
    const underReviewCount = enquiries.filter((e) => e.status?.toLowerCase() === 'under_review').length;
    const shortlistedCount = enquiries.filter((e) => e.status?.toLowerCase() === 'shortlisted').length;
    const convertedCount = enquiries.filter((e) => e.status?.toLowerCase() === 'converted').length;

    return (
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Public Admission Enquiries
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span>Read-Only Register</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Read-only ledger of admission queries, applicant contact requests, and student tokens posted across Ever Grow portals
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchEnquiries}
            disabled={loadingEnquiries}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs flex items-center space-x-1.5 self-start md:self-auto transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingEnquiries ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Refresh Enquiries</span>
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enquiries</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-[10px] font-medium text-slate-500">All submissions</div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">New / Submitted</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{submittedCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Awaiting review</div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Under Review</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{underReviewCount}</div>
            <div className="text-[10px] font-medium text-slate-500">In evaluation</div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Shortlisted</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{shortlistedCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Eligible applicants</div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-sm col-span-2 md:col-span-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Admitted / Converted</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{convertedCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Enrolled students</div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, parent, token, phone, or grade..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'submitted', label: `Submitted (${submittedCount})` },
              { id: 'under_review', label: `Under Review (${underReviewCount})` },
              { id: 'shortlisted', label: `Shortlisted (${shortlistedCount})` },
              { id: 'converted', label: `Converted (${convertedCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enquiries Data Table */}
        <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl shadow-sm overflow-hidden">
          {loadingEnquiries ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
              Loading public enquiries ledger...
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700">No Admission Enquiries Found</div>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery || statusFilter !== 'all'
                  ? 'No entries match your search criteria.'
                  : 'No public admission enquiries have been registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Token Reference</th>
                    <th className="py-3.5 px-5">Applicant & Grade</th>
                    <th className="py-3.5 px-5">Parent / Guardian Contact</th>
                    <th className="py-3.5 px-5">Submission Date</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 text-[11px]">
                            {enq.enquiry_number}
                          </span>
                          <button
                            onClick={() => handleCopyToken(enq.enquiry_number)}
                            title="Copy token"
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {copiedToken === enq.enquiry_number ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-[13px]">{enq.student_name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <span className="font-semibold text-blue-600">{enq.grade_applying_for}</span>
                          {enq.gender && <span>• {enq.gender}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="text-slate-900 font-semibold">{enq.parent_name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{enq.parent_phone}</span>
                          </span>
                          {enq.parent_email && (
                            <span className="hidden lg:flex items-center space-x-1 text-slate-400">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{enq.parent_email}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-slate-600 text-[11px]">
                        {new Date(enq.created_at).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-5">{renderStatusBadge(enq.status)}</td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-colors flex items-center space-x-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Read-Only Enquiry Details Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] max-w-xl w-full shadow-2xl border border-black/[0.08] overflow-hidden space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {selectedEnquiry.enquiry_number}
                    </span>
                    {renderStatusBadge(selectedEnquiry.status)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Admission Enquiry Inspection</h3>
                </div>

                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Candidate Info */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Candidate Information</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400">Student Name:</span>
                      <div className="font-bold text-slate-900 text-sm">{selectedEnquiry.student_name}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Class / Grade Applying For:</span>
                      <div className="font-bold text-blue-700 text-sm">{selectedEnquiry.grade_applying_for}</div>
                    </div>
                    {selectedEnquiry.gender && (
                      <div>
                        <span className="text-slate-400">Gender:</span>
                        <div className="font-semibold text-slate-800">{selectedEnquiry.gender}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Submission Date:</span>
                      <div className="font-semibold text-slate-800">
                        {new Date(selectedEnquiry.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent / Guardian Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Parent / Guardian Contact
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400">Parent Name:</span>
                      <div className="font-bold text-slate-900">{selectedEnquiry.parent_name}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone Number:</span>
                      <div className="font-semibold text-slate-800">{selectedEnquiry.parent_phone}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Email Address:</span>
                      <div className="font-semibold text-slate-800">{selectedEnquiry.parent_email || 'Not provided'}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Residential Address:</span>
                      <div className="font-semibold text-slate-800">{selectedEnquiry.address || 'Not provided'}</div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Candidate Background & Special Requirements
                  </div>
                  <p className="text-slate-700 italic leading-relaxed">
                    "{selectedEnquiry.notes || 'No additional notes provided by applicant.'}"
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- VIEW B: PUBLIC VISITOR ADMISSION ENQUIRY SUBMISSION FORM ----------------
  const formContent = (
    <div className="ios-card rounded-[30px] overflow-hidden max-w-3xl border border-white/80 shadow-[0_12px_40px_rgba(0,113,227,0.08)]">
      <div className="p-8 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 text-slate-900 border-b border-black/[0.05] relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2 relative z-10">
          <img src={logoImg} alt="Ever Grow Schools Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
          <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Admission Enquiry Form</h2>
        </div>
        <p className="text-slate-600 text-sm max-w-lg relative z-10">
          Complete the enquiry details below to register candidate interest and generate an official tracking token.
        </p>
      </div>

      {submittedNumber ? (
        <div className="p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Enquiry Submitted Successfully!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your official admission reference tracking number is:
          </p>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 text-[#0071E3] text-xl font-mono font-bold rounded-2xl tracking-wider shadow-inner">
            {submittedNumber}
          </div>
          <p className="text-xs text-slate-500">
            Please save this tracking code for all communication regarding application status.
          </p>
          <div className="pt-6">
            <button
              onClick={() => {
                setSubmittedNumber(null);
                setFormData({
                  student_name: '',
                  parent_name: '',
                  parent_phone: '',
                  parent_email: '',
                  grade_applying_for: 'Grade 1',
                  address: '',
                  notes: '',
                });
              }}
              className="ios-gloss-btn-secondary px-6 py-2.5 text-xs font-semibold"
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePublicSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Candidate / Student Name *
              </label>
              <input
                type="text"
                required
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="Full name of applicant"
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Grade / Class Applying For *
              </label>
              <select
                value={formData.grade_applying_for}
                onChange={(e) => setFormData({ ...formData, grade_applying_for: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-hidden transition-all"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={`Grade ${i + 1}`}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                placeholder="Father/Mother/Guardian"
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.parent_email}
              onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
              placeholder="parent@example.com"
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Previous school, special requirements, etc."
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm focus:ring-2 focus:ring-[#0071E3] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ios-gloss-btn w-full py-3.5 text-sm font-bold flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Official Enquiry</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );

  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8 ai-aurora-glow">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-[#0071E3] transition-colors font-medium bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-black/[0.06] shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal Login</span>
            </Link>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Public Admission Enquiry</h1>
        <p className="text-sm text-[#86868B]">
          Directly log prospective student admission enquiries and issue candidate tracking tokens.
        </p>
      </div>

      {formContent}
    </div>
  );
};
