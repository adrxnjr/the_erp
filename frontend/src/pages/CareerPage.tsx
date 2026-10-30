import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  GraduationCap,
  Sparkles,
  FileDown,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  UserCheck,
  Brain,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  interest_type: string;
  order_num: number;
}

interface CareerFieldCourse {
  course_name: string;
  entrance_exam: string;
  duration_years: number;
}

interface CareerField {
  id: string;
  name: string;
  code: string;
  description: string;
  required_subjects: string;
  interest_profile: string;
  typical_level: string;
  courses: CareerFieldCourse[];
}

interface Recommendation {
  rank: number;
  field_name: string;
  match_percentage: number;
  academic_score: number;
  interest_score: number;
  explanation: string;
  suggested_timeline: string;
  recommended_courses: CareerFieldCourse[];
}

interface AssessmentReport {
  attempt_id: string;
  student_name: string;
  admission_number: string;
  status: string;
  submitted_at: string;
  riasec_scores: Record<string, number>;
  counsellor_notes: string;
  recommendations: Recommendation[];
}

interface ReviewQueueItem {
  attempt_id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  status: string;
  submitted_at: string;
  riasec_scores: Record<string, number>;
  top_recommendations: Array<{
    rank: number;
    field_name: string;
    match_percentage: number;
  }>;
}

export const CareerPage: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.portal_type === 'student';

  if (!isStudent) {
    return <Navigate to="/" replace />;
  }

  const isCounsellorOrAdmin = false;

  const [activeTab, setActiveTab] = useState<'assessment' | 'review' | 'catalogue'>('assessment');

  // Assessment Questionnaire State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean>(false);

  // Active Report State
  const [myReport, setMyReport] = useState<AssessmentReport | null>(null);
  const [myAttempts, setMyAttempts] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // Review Queue State
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ReviewQueueItem | null>(null);
  const [counsellorNotes, setCounsellorNotes] = useState<string>('');
  const [processingReview, setProcessingReview] = useState<boolean>(false);

  // Career Catalogue
  const [careerFields, setCareerFields] = useState<CareerField[]>([]);

  // Student selection for staff view
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/career/questions');
      const qList: Question[] = res.data || [];
      setQuestions(qList);
      // Default initial answers to 3 (neutral)
      const initialAns: Record<string, number> = {};
      qList.forEach((q) => {
        initialAns[q.id] = 3;
      });
      setAnswers(initialAns);
    } catch (err) {
      console.warn('Failed to fetch questions:', err);
    }
  };

  const fetchCatalogue = async () => {
    try {
      const res = await api.get('/career/fields');
      setCareerFields(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch career catalogue:', err);
    }
  };

  const fetchReviewQueue = async () => {
    try {
      const res = await api.get('/career/review-queue');
      setReviewQueue(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch review queue:', err);
    }
  };

  const fetchMyAttempts = async (studentId?: string) => {
    setLoadingReport(true);
    try {
      const url = studentId ? `/career/my-attempts?student_id=${studentId}` : '/career/my-attempts';
      const res = await api.get(url);
      const attempts = res.data || [];
      setMyAttempts(attempts);

      if (attempts.length > 0) {
        // Load report for the latest attempt
        try {
          const reportRes = await api.get(`/career/attempts/${attempts[0].attempt_id}/report`);
          setMyReport(reportRes.data);
        } catch (repErr: any) {
          // If 403 unapproved, set partial report with unapproved state
          setMyReport({
            attempt_id: attempts[0].attempt_id,
            student_name: attempts[0].student_name,
            admission_number: '',
            status: attempts[0].status,
            submitted_at: attempts[0].submitted_at,
            riasec_scores: attempts[0].riasec_scores || {},
            counsellor_notes: 'Under Counsellor Review. Official guidance will be unlocked upon Counsellor sign-off.',
            recommendations: [],
          });
        }
      } else {
        setMyReport(null);
      }
    } catch (err) {
      console.warn('Failed to fetch attempts:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setStudentsList(items);
      if (items.length > 0 && !selectedStudentId) {
        setSelectedStudentId(items[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch students:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCatalogue();
    if (isCounsellorOrAdmin) {
      fetchReviewQueue();
      fetchStudents();
    }
    fetchMyAttempts();
  }, []);

  useEffect(() => {
    if (selectedStudentId && isCounsellorOrAdmin) {
      fetchMyAttempts(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Handle Assessment Submission
  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    try {
      // Determine student id
      let targetStudentId = selectedStudentId;
      if (!targetStudentId && studentsList.length > 0) {
        targetStudentId = studentsList[0].id;
      }
      if (!targetStudentId && user?.portal_type === 'student') {
        // Find own student id
        const stdRes = await api.get('/students');
        const items = Array.isArray(stdRes.data) ? stdRes.data : stdRes.data?.items || [];
        targetStudentId = items[0]?.id;
      }

      if (!targetStudentId) {
        alert('Could not identify student profile for assessment submission.');
        return;
      }

      const formattedAnswers = Object.entries(answers).map(([qid, val]) => ({
        question_id: qid,
        score: val,
      }));

      await api.post('/career/attempts', {
        student_id: targetStudentId,
        answers: formattedAnswers,
        student_notes: studentNotes,
      });

      alert('Career assessment submitted successfully! It has been forwarded to the school counsellor for review.');
      setShowQuestionnaire(false);
      fetchMyAttempts(targetStudentId);
      if (isCounsellorOrAdmin) {
        fetchReviewQueue();
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Assessment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Counsellor Review
  const handleReviewDecision = async (attemptId: string, decision: 'approved' | 'returned') => {
    setProcessingReview(true);
    try {
      await api.post(`/career/attempts/${attemptId}/review`, {
        decision,
        counsellor_notes: counsellorNotes || 'Approved by Academic Guidance Counsellor.',
      });
      alert(`Assessment marked as ${decision}.`);
      setSelectedReviewItem(null);
      setCounsellorNotes('');
      fetchReviewQueue();
      fetchMyAttempts(selectedStudentId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Review action failed.');
    } finally {
      setProcessingReview(false);
    }
  };

  // Download PDF Report
  const handleDownloadPDF = async (attemptId: string) => {
    try {
      const res = await api.get(`/career/reports/${attemptId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Career_Report_${attemptId.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to download career PDF report. Ensure assessment is approved.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Career Recommendation Engine
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Class 12 RIASEC Psychometric Profiling, Multi-factor Scoring, and Counsellor Approval
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-black/[0.04] self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'assessment'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assessment & Report</span>
            </span>
          </button>

          {isCounsellorOrAdmin && (
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'review'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Counsellor Queue ({reviewQueue.filter((r) => r.status === 'submitted').length})</span>
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'catalogue'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Career Field Catalogue</span>
            </span>
          </button>
        </div>
      </div>

      {/* ---------------- ASSESSMENT & REPORT TAB ---------------- */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {/* Staff switch student bar */}
          {isCounsellorOrAdmin && (
            <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-900">
                  Staff Preview: Select student to inspect career recommendation profile:
                </span>
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white text-xs font-semibold border border-indigo-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.admission_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Hero Banner - Apple iOS Light Glass Banner */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-blue-50/90 text-slate-900 rounded-[28px] p-6 md:p-8 border border-indigo-200/80 shadow-[0_8px_32px_rgba(88,86,214,0.08)] relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                RIASEC 6-Factor Model + Academic Weighted Fit
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F]">
                Discover Your Optimal Post-Grade 12 Career Pathway
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Our AI-guided career recommendation synthesizes your academic scores (40%), psychological interest
                affinities (35%), subject stream suitability (15%), and aptitude skills (10%) to curate personalized
                entrance exams, university degree options, and preparation roadmaps.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowQuestionnaire(true)}
                  className="ios-gloss-btn px-5 py-2.5 text-xs font-bold space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{myReport ? 'Retake Career Assessment' : 'Take Psychometric Assessment'}</span>
                </button>

                {myReport && myReport.status === 'approved' && (
                  <button
                    onClick={() => handleDownloadPDF(myReport.attempt_id)}
                    className="ios-gloss-btn-emerald px-5 py-2.5 text-xs font-bold space-x-2"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Official PDF Report Card</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Questionnaire Modal / Inline Expand */}
          {showQuestionnaire && (
            <div className="bg-white/95 backdrop-blur-xl border border-indigo-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">RIASEC Psychometric Career Questionnaire</h3>
                  <p className="text-xs text-slate-500">
                    Rate each statement honestly on a 1 (Strongly Disagree) to 5 (Strongly Agree) scale.
                  </p>
                </div>
                <button
                  onClick={() => setShowQuestionnaire(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-3 py-1 rounded-lg"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-indigo-200 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-xs font-bold text-slate-800">
                        <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                        {q.question_text}
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 shrink-0">
                        {q.interest_type}
                      </span>
                    </div>

                    {/* 1 to 5 radio buttons */}
                    <div className="flex items-center justify-between pt-1 max-w-md">
                      <span className="text-[10px] text-slate-400">Strongly Disagree</span>
                      <div className="flex items-center space-x-3">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <label key={val} className="flex flex-col items-center space-y-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value={val}
                              checked={answers[q.id] === val}
                              onChange={() => setAnswers({ ...answers, [q.id]: val })}
                              className="accent-indigo-600 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-slate-600">{val}</span>
                          </label>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">Strongly Agree</span>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Student Aspirations & Personal Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    placeholder="e.g. Interested in computational astrophysics, open to studying abroad, strong passion for robotics club."
                    className="w-full text-xs border border-slate-200 rounded-2xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setShowQuestionnaire(false)}
                    className="ios-gloss-btn-secondary px-5 py-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAssessment}
                    disabled={submitting}
                    className="ios-gloss-btn px-6 py-2.5 text-xs font-bold space-x-1.5"
                  >
                    {submitting ? (
                      <span>Analyzing Responses...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Submit for AI Assessment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Current Report Display */}
          {loadingReport ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 font-medium">
              Loading career guidance recommendations...
            </div>
          ) : myReport ? (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          myReport.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {myReport.status === 'approved' ? (
                          <span className="flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Counsellor Approved & Published</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Counsellor Verification</span>
                          </span>
                        )}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      Career Orientation Profile for {myReport.student_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Assessment submitted on {new Date(myReport.submitted_at).toLocaleDateString()}
                    </p>
                  </div>

                  {myReport.status === 'approved' && (
                    <button
                      onClick={() => handleDownloadPDF(myReport.attempt_id)}
                      className="ios-gloss-btn-emerald px-4 py-2 text-xs font-bold space-x-2 self-start md:self-auto"
                    >
                      <FileDown className="w-4 h-4 text-white" />
                      <span>Download PDF Report</span>
                    </button>
                  )}
                </div>

                {/* Counsellor Remarks Callout */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                  <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Academic Counsellor Endorsement
                  </div>
                  <p className="text-xs text-slate-700 font-medium italic">"{myReport.counsellor_notes}"</p>
                </div>

                {/* RIASEC Profile Visualizer */}
                {Object.keys(myReport.riasec_scores || {}).length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">RIASEC Interest Dimension Fit:</div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {Object.entries(myReport.riasec_scores).map(([dim, score]) => (
                        <div key={dim} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                          <div className="text-[10px] font-bold uppercase text-slate-400">{dim}</div>
                          <div className="text-base font-extrabold text-indigo-600 mt-0.5">{score}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations Cards */}
              {myReport.status === 'approved' ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Top Recommended Career Pathways ({myReport.recommendations?.length || 0})
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {myReport.recommendations?.map((rec) => (
                      <div
                        key={rec.rank}
                        className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex items-start space-x-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-extrabold text-indigo-700 text-sm shrink-0">
                              #{rec.rank}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">{rec.field_name}</h4>
                              <p className="text-xs text-slate-600 mt-1">{rec.explanation}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
                              {rec.match_percentage}% Composite Fit
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1 font-mono">
                              Academic: {rec.academic_score}% | Interest: {rec.interest_score}%
                            </div>
                          </div>
                        </div>

                        {/* Courses & Entrance Exams */}
                        {rec.recommended_courses && rec.recommended_courses.length > 0 && (
                          <div className="pt-3 border-t border-slate-100">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                              Target Degree Programmes & Entrance Exams
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {rec.recommended_courses.map((c, i) => (
                                <div
                                  key={i}
                                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="font-semibold text-slate-800">{c.course_name}</div>
                                    <div className="text-[11px] text-slate-500">Duration: {c.duration_years} Years</div>
                                  </div>
                                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 shrink-0">
                                    {c.entrance_exam}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested Roadmap */}
                        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 flex items-start space-x-2">
                          <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Preparation Roadmap: </span>
                            {rec.suggested_timeline}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-3">
                  <Clock className="w-10 h-10 text-amber-600 mx-auto" />
                  <h4 className="text-base font-bold text-amber-900">Career Guidance Under Counsellor Review</h4>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    Your assessment has been recorded and submitted to Ever Grow Schools' career guidance department.
                    Our certified academic counsellor is currently reviewing your psychometric profile and validating
                    target entrance milestones. Once approved, your full personalized roadmap will unlock here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-12 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Assessment Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Take the 5-minute RIASEC Career Assessment questionnaire above to generate your customized Class 12 career
                pathway recommendations.
              </p>
              <button
                onClick={() => setShowQuestionnaire(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Start Career Assessment
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- COUNSELLOR REVIEW QUEUE TAB ---------------- */}
      {activeTab === 'review' && isCounsellorOrAdmin && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Career Assessment Review Queue</h3>
                <p className="text-xs text-slate-500">
                  Assessments awaiting counsellor evaluation, stream validation, and report publication
                </p>
              </div>
              <button
                onClick={fetchReviewQueue}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                Refresh Queue
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Top Career Match</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviewQueue.map((item) => (
                    <tr key={item.attempt_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.student_name}</div>
                        <div className="text-[11px] text-slate-500">{item.admission_number}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(item.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {item.top_recommendations?.[0] ? (
                          <span className="font-semibold text-indigo-700">
                            {item.top_recommendations[0].field_name} (
                            {item.top_recommendations[0].match_percentage}%)
                          </span>
                        ) : (
                          <span className="text-slate-400">Processing</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReviewItem(item);
                            setCounsellorNotes('Profile verified. Student aligns well with target competitive stream.');
                          }}
                          className="ios-gloss-btn px-4 py-1.5 text-xs font-semibold"
                        >
                          Review & Endorse
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Counsellor Review Modal */}
          {selectedReviewItem && (
            <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4">
              <div className="ios-modal rounded-[30px] p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-white/80">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Counsellor Review: {selectedReviewItem.student_name}
                    </h3>
                    <p className="text-xs text-slate-500">Admission No: {selectedReviewItem.admission_number}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReviewItem(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Close
                  </button>
                </div>

                {/* Top ranked preview */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">Top Algorithmic Recommendations:</div>
                  {selectedReviewItem.top_recommendations?.map((r) => (
                    <div
                      key={r.rank}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">
                        #{r.rank} {r.field_name}
                      </span>
                      <span className="font-bold text-indigo-600">{r.match_percentage}% Match</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Counsellor Guidance Notes & Action Plan
                  </label>
                  <textarea
                    rows={3}
                    value={counsellorNotes}
                    onChange={(e) => setCounsellorNotes(e.target.value)}
                    placeholder="Enter counsellor recommendations, exam target milestones, or follow-up schedule..."
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleReviewDecision(selectedReviewItem.attempt_id, 'returned')}
                    disabled={processingReview}
                    className="ios-gloss-btn-secondary px-4 py-2 text-xs font-semibold text-rose-700"
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewDecision(selectedReviewItem.attempt_id, 'approved')}
                    disabled={processingReview}
                    className="ios-gloss-btn-emerald px-5 py-2 text-xs font-bold space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- CAREER FIELD CATALOGUE TAB ---------------- */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Career Stream Catalogue & Entrance Exams</h3>
              <p className="text-xs text-slate-500">
                Ever Grow Schools curated higher education disciplines, degree levels, and competitive tests
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerFields.map((cf) => (
                <div key={cf.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cf.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cf.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      {cf.interest_profile}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700">Required Subjects:</span>{' '}
                      <span className="text-slate-600">{cf.required_subjects}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Typical Degrees:</span>{' '}
                      <span className="text-slate-600">{cf.typical_level}</span>
                    </div>
                  </div>

                  {cf.courses && cf.courses.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                        Key Undergraduate Courses
                      </div>
                      <div className="space-y-1.5">
                        {cf.courses.map((c, idx) => (
                          <div
                            key={idx}
                            className="text-xs flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100"
                          >
                            <span className="font-medium text-slate-800">{c.course_name}</span>
                            <span className="font-mono text-[10px] text-blue-600 font-semibold">{c.entrance_exam}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
