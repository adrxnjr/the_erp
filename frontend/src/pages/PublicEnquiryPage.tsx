import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface PublicEnquiryPageProps {
  isPublic?: boolean;
}

export const PublicEnquiryPage: React.FC<PublicEnquiryPageProps> = ({ isPublic = false }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
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
                {[...Array(10)].map((_, i) => (
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
            className="ios-gloss-btn w-full py-3.5 text-sm"
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

  // If accessed directly from outside the authenticated app (e.g. from login screen)
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

  // Inside Authenticated Dashboard Tabs
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
