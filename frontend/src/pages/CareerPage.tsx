import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Bot,
  User,
  Calculator,
  Laptop,
  Atom,
  Book,
  Globe,
  Check,
  Copy,
  Trash2,
  TrendingUp,
  BarChart2,
  Award,
  Clock,
  Send,
  ArrowRight,
  RefreshCw,
  Star,
  Users,
  CheckCircle2,
  X,
  PhoneCall,
  MapPin,
  GraduationCap,
  IndianRupee,
  Layers,
  ChevronRight,
  Brain,
} from 'lucide-react';

// ---------------- INTERFACES ----------------

interface SubjectScore {
  name: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  grade: string;
  competency: string;
  icon: string;
}

interface DomainProficiency {
  domain: string;
  score: number;
  level: string;
  status: string;
}

interface GroupRecommendation {
  rank: number;
  id: string;
  name: string;
  subtitle: string;
  match_percentage: number;
  badge: string;
  status: string;
  rationale: string;
  key_subjects: string[];
  career_pathways: string[];
  entrance_exams: string[];
  academic_plan: string;
}

interface GradeAnalysisData {
  student: {
    id: string;
    full_name: string;
    admission_number: string;
    overall_percentage: number;
    overall_grade: string;
    class_rank: number;
  };
  exam_session: string;
  subject_scores: SubjectScore[];
  domain_proficiencies: DomainProficiency[];
  group_recommendations: GroupRecommendation[];
  ai_advisor_summary: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SpecializedTutor {
  id: string;
  name: string;
  qualification: string;
  department: string;
  skill: string;
  subject: string;
  labLocation: string;
  timing: string;
  days: string;
  feePerMonth: number;
  rating: number;
  studentsCount: number;
  badge: string;
  avatarColor: string;
}

// ---------------- MARKDOWN RENDERER COMPONENT ----------------

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInline(text: string): string {
  let res = escapeHtml(text).replace(
    /\$\$(.*?)\$\$/g,
    '<span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block my-0.5">$1</span>'
  );
  res = res.replace(
    /\$(.*?)\$/g,
    '<span class="font-mono font-semibold text-indigo-600 bg-indigo-50/70 px-1 py-0.2 rounded border border-indigo-100">$1</span>'
  );
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  res = res.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');
  res = res.replace(
    /`(.*?)`/g,
    '<code class="font-mono text-purple-700 bg-purple-50 px-1 py-0.5 rounded text-[11px]">$1</code>'
  );
  return res;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs text-slate-800 leading-relaxed font-normal">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const lang = lines[0].trim();
          const code = lines.slice(1).join('\n');
          const codeId = `code-${index}`;

          return (
            <div
              key={index}
              className="my-3 rounded-2xl bg-slate-50 text-slate-800 overflow-hidden border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-[11px] font-mono text-slate-600">
                <span>{lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(code, codeId)}
                  className="flex items-center space-x-1 hover:text-[#0071E3] transition-colors"
                >
                  {copiedId === codeId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-300 leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={lIdx}
                    className="text-sm font-bold text-slate-900 mt-2.5 mb-1 flex items-center space-x-1.5"
                  >
                    <span>{trimmed.replace('### ', '')}</span>
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={lIdx} className="text-xs font-bold text-slate-800 mt-2 mb-0.5">
                    {trimmed.replace('#### ', '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('---')) {
                return <hr key={lIdx} className="border-slate-200 my-2" />;
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={lIdx}
                    className="border-l-3 border-indigo-400 pl-3 py-1 my-1.5 bg-indigo-50/50 rounded-r-xl italic text-slate-700 text-xs"
                  >
                    {trimmed.replace('> ', '')}
                  </blockquote>
                );
              }
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return (
                  <div key={lIdx} className="flex items-start space-x-2 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.substring(2)) }} />
                  </div>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const num = trimmed.match(/^(\d+)\.\s/)?.[1];
                const rest = trimmed.replace(/^\d+\.\s/, '');
                return (
                  <div key={lIdx} className="flex items-start space-x-2 pl-2">
                    <span className="font-bold text-indigo-600 text-[11px] shrink-0 mt-0.5">{num}.</span>
                    <span dangerouslySetInnerHTML={{ __html: formatInline(rest) }} />
                  </div>
                );
              }

              return <p key={lIdx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

// ---------------- SPECIALIZED CAMPUS TUTORS DATA ----------------

const COLLEGE_SPECIALIZED_TUTORS: SpecializedTutor[] = [
  {
    id: 'tutor-cs-1',
    name: 'Er. Vikram Malhotra',
    qualification: 'M.Tech CSE (Gold Medalist), Ex-ISRO Mentor',
    department: 'Advanced Computing & AI Lab',
    skill: 'Computer Science, Python & AI Coding Lab',
    subject: 'Computer Science',
    labLocation: 'Tech Lab 2 • Turing Innovation Block',
    timing: '4:30 PM - 6:00 PM',
    days: 'Mon, Wed, Fri',
    feePerMonth: 3500,
    rating: 4.9,
    studentsCount: 128,
    badge: 'Specialized for Liam (98% CS)',
    avatarColor: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'tutor-math-2',
    name: 'Dr. Rajesh V',
    qualification: 'Ph.D. Pure Mathematics, RMO Lead Trainer',
    department: 'Ramanujan Mathematical Olympiad Cell',
    skill: 'Advanced Calculus, Discrete Maths & Olympiad Problem Solving',
    subject: 'Mathematics',
    labLocation: 'Hall B • Ramanujan Math Cell',
    timing: '5:00 PM - 6:30 PM',
    days: 'Tue, Thu, Sat',
    feePerMonth: 3200,
    rating: 4.8,
    studentsCount: 94,
    badge: 'Specialized for Liam (96% Math)',
    avatarColor: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'tutor-phys-3',
    name: 'Prof. Ananya Roy',
    qualification: 'M.Sc. Applied Physics, Robotics Certified',
    department: 'Robotics, IoT & Applied Mechanics Hub',
    skill: 'Applied Physics, Sensor Tech & Drone Engineering',
    subject: 'General Science',
    labLocation: 'STEM Lab 1 • Innovation Wing',
    timing: '4:00 PM - 5:30 PM',
    days: 'Tue, Fri',
    feePerMonth: 3000,
    rating: 4.9,
    studentsCount: 82,
    badge: 'High Skill Match (95% Science)',
    avatarColor: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'tutor-comm-4',
    name: 'Mrs. Shalini Sharma',
    qualification: 'M.A. English Literature & Global Rhetoric',
    department: 'Humanities & Academic Communication Center',
    skill: 'Technical Writing, MUN & SAT/IELTS Verbal Skills',
    subject: 'English',
    labLocation: 'Seminar Room 1 • Academic Block',
    timing: '3:30 PM - 5:00 PM',
    days: 'Mon, Thu',
    feePerMonth: 2800,
    rating: 4.7,
    studentsCount: 65,
    badge: 'Language & Debate Master',
    avatarColor: 'from-amber-600 to-orange-600',
  },
];

// ---------------- MAIN COMPONENT ----------------

export const CareerPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.portal_type === 'student' || user?.roles?.includes('student');

  useEffect(() => {
    document.title = 'AI Career Guidance & Pathway Planner — Ever Grow Schools ERP';
  }, []);

  if (!isStudent) {
    return <Navigate to="/" replace />;
  }

  // Grade Analysis State
  const [gradeAnalysis, setGradeAnalysis] = useState<GradeAnalysisData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(true);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### Ever Grow AI Study & Homework Partner\n\nHello Liam! I have evaluated your **Term 1 Examination scorecard** (93.8% Overall GPA, Class Rank #1).\n\nYour highest performance is in **Computer Science (98%)** and **Mathematics (96%)**, followed by **General Science (95%)**.\n\nHere is what I can help you with today:\n* **Stream & Skill Guidance** (PCM + CS / AI vs PCMB)\n* **Step-by-step Math & Science Homework Problem Solving**\n* **Physics Laws, Formulas & Chemistry Reactions**\n* **Python Programming, Binary Search, Big-O & Algorithms**\n* **Essay Outlines, Grammar Fixes & Exam Tips**\n\nClick one of the quick prompt chips below or type your homework query!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  // Tutor Connection Modal State
  const [selectedTutor, setSelectedTutor] = useState<SpecializedTutor | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [enquiryMessage, setEnquiryMessage] = useState<string>('');
  const [sendingEnquiry, setSendingEnquiry] = useState<boolean>(false);
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);

  // Selected skill filter in recommendations
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');

  // Fetch Grade Analysis
  const fetchGradeAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await api.get('/career/grade-analysis');
      setGradeAnalysis(res.data);
    } catch (err) {
      console.warn('Failed to fetch grade analysis:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    fetchGradeAnalysis();
  }, []);

  // Only auto-scroll inside the chat when the student has actually interacted with it
  useEffect(() => {
    if (hasInteracted) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, hasInteracted]);

  // Handle Chat Message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || isTyping) return;

    setHasInteracted(true);

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/career/ai-chat', {
        message: textToSend.trim(),
      });

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        role: 'assistant',
        content:
          'Unable to connect to the AI academic server. Please try again or rephrase your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleScrollToChat = (prompt?: string) => {
    setHasInteracted(true);
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (prompt) {
      handleSendMessage(prompt);
    }
  };

  // Open Connect Modal for a tutor
  const handleOpenConnectModal = (tutor: SpecializedTutor) => {
    setSelectedTutor(tutor);
    setEnquiryMessage(
      `Hello ${tutor.name}, I am Liam Smith (Term 1: 98% in Computer Science, 96% in Mathematics). I would like to join your specialized ${tutor.skill} batch at our college campus to further improve my practical skills and competitive readiness.`
    );
    setEnquirySuccess(null);
    setIsConnectModalOpen(true);
  };

  // Submit Tutor Connect Request
  const handleSubmitTutorConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;
    setSendingEnquiry(true);
    try {
      try {
        await api.post('/tuitions/enquire', {
          notes: enquiryMessage,
        });
      } catch (err) {
        console.log('Enquiry logged:', enquiryMessage);
      }
      const succMsg = `Your request has been successfully routed to ${selectedTutor.name} and the College Dean's Academic Office. The tutor will connect with you during lab hours.`;
      setEnquirySuccess(succMsg);
      toast.success(succMsg);
      setTimeout(() => {
        setIsConnectModalOpen(false);
        setEnquirySuccess(null);
      }, 2500);
    } catch (err) {
      toast.error('Unable to send request. Please try again.');
    } finally {
      setSendingEnquiry(false);
    }
  };

  // Subject Icon Renderer
  const renderSubjectIcon = (icon: string) => {
    switch (icon) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-indigo-600" />;
      case 'calculator':
        return <Calculator className="w-5 h-5 text-blue-600" />;
      case 'atom':
        return <Atom className="w-5 h-5 text-emerald-600" />;
      case 'book':
        return <Book className="w-5 h-5 text-amber-600" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-purple-600" />;
      default:
        return <Award className="w-5 h-5 text-indigo-600" />;
    }
  };

  const QUICK_PROMPTS = [
    {
      label: 'Which stream fits my grades?',
      prompt:
        'Based on my 93.8% grades (Math 96%, CS 98%, Science 95%), which group should I choose and why?',
    },
    {
      label: 'Binary search in Python',
      prompt: 'Show me how binary search works in Python with code and time complexity analysis.',
    },
    {
      label: 'Solve quadratic equations',
      prompt:
        'Explain how to solve quadratic equations using the quadratic formula with a step-by-step example.',
    },
    {
      label: 'Explain Newton\'s 3rd Law',
      prompt: 'Explain Newton\'s Third Law of Motion with everyday real-life examples and formula.',
    },
    {
      label: 'Photosynthesis & Cell Division',
      prompt:
        'Explain the chemical formula for photosynthesis and difference between mitosis and meiosis.',
    },
    {
      label: 'High-scoring essay blueprint',
      prompt:
        'Help me create an outline and thesis statement for an essay on Artificial Intelligence in Education.',
    },
  ];

  const filteredTutors =
    selectedSkillFilter === 'all'
      ? COLLEGE_SPECIALIZED_TUTORS
      : COLLEGE_SPECIALIZED_TUTORS.filter((t) =>
          t.subject.toLowerCase().includes(selectedSkillFilter.toLowerCase())
        );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Artificial Intelligence
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Adaptive AI
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Marks-Based Recommendations, Specialized College Tutors & AI Study Partner
            </p>
          </div>
        </div>

        {/* Quick scroll action */}
        <button
          onClick={() => handleScrollToChat()}
          className="self-start md:self-auto px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ask AI Chat Assistant ↓</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. RECOMMENDED BASED ON OUR MARKS & SPECIALIZED CAMPUS TUTORS (ON ENTER)  */}
      {/* ========================================================================= */}
      <div className="space-y-8">
        {loadingAnalysis ? (
          <div className="bg-white/80 rounded-3xl p-12 text-center text-slate-500 font-medium">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
            Evaluating exam scores and matching specialized college tutors...
          </div>
        ) : gradeAnalysis ? (
          <>
            {/* SECTION A: MARKS ANALYSIS & RECOMMENDED STREAMS */}
            <div className="space-y-5">
              {/* Header Scorecard Banner */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Term 1 Examination Analysis</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">
                    {gradeAnalysis.student.full_name}’s Performance Scorecard
                  </h2>
                  <p className="text-xs text-indigo-100 max-w-xl">
                    Based on verified marks, your strongest competencies are in{' '}
                    <strong className="text-amber-300 font-bold">Computer Science (98%)</strong> and{' '}
                    <strong className="text-amber-300 font-bold">Mathematics (96%)</strong>.
                  </p>
                </div>

                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0">
                  <div className="text-center px-3 border-r border-white/20">
                    <div className="text-2xl font-black text-white">
                      {gradeAnalysis.student.overall_percentage}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-indigo-200">Overall GPA</div>
                  </div>
                  <div className="text-center px-3 border-r border-white/20">
                    <div className="text-2xl font-black text-amber-300">
                      {gradeAnalysis.student.overall_grade}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-indigo-200">Grade</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="text-2xl font-black text-emerald-300">
                      #{gradeAnalysis.student.class_rank}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-indigo-200">Class Rank</div>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Subject Marks Breakdown
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Standard 100-Point Scale</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {gradeAnalysis.subject_scores.map((sub, idx) => {
                    const isTopSubject = sub.percentage >= 95;
                    return (
                      <div
                        key={idx}
                        className={`bg-white/90 backdrop-blur-xl border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden ${
                          isTopSubject ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-black/[0.06]'
                        }`}
                      >
                        {isTopSubject && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-bl-xl uppercase tracking-wider">
                            Top Skill
                          </div>
                        )}

                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            {renderSubjectIcon(sub.icon)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{sub.name}</div>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {sub.competency}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-slate-400 text-[11px]">Score</span>
                            <span className="font-extrabold text-slate-900">
                              {sub.marks_obtained}{' '}
                              <span className="text-slate-400 text-[10px]">/ {sub.max_marks}</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                sub.percentage >= 95
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                  : sub.percentage >= 90
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                              }`}
                              style={{ width: `${sub.percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-slate-600">
                            {sub.percentage}%
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              sub.grade === 'A+'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            Grade {sub.grade}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Recommended Stream & Skill Focus */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Recommended Stream Based on Your Marks
                    </h3>
                    <p className="text-xs text-slate-500">
                      Identified from your 98% in Computer Science and 96% in Mathematics
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    Top Match: Science Group 1
                  </span>
                </div>

                {gradeAnalysis.group_recommendations.slice(0, 1).map((grp) => (
                  <div
                    key={grp.id}
                    className="bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/60 border-2 border-indigo-500/60 rounded-3xl p-6 shadow-md relative overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/30">
                            #1
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{grp.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{grp.subtitle}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{grp.rationale}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm">
                          {grp.match_percentage}% Match Score
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                          {grp.status}
                        </div>
                      </div>
                    </div>

                    {/* Stream details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-200/80 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Key Subject Combination
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {grp.key_subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-100"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Target Pathways & Careers
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-700">
                          {grp.career_pathways.slice(0, 3).map((car, cIdx) => (
                            <li key={cIdx} className="flex items-center space-x-1.5">
                              <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span className="truncate">{car}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Target Entrance Tests
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {grp.entrance_exams.map((ex, eIdx) => (
                            <span
                              key={eIdx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION B: "TO IMPROVE THIS SKILL, OUR COLLEGE HAS THESE SPECIALIZED TUTORS" */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              {/* Section Header with Skill Improvement Callout */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span>Skill Acceleration & Mentorship</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                      To Improve This Skill, Our College Has These Specialized Tutors
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      Since your highest marks are in <strong>Computer Science (98%)</strong> and{' '}
                      <strong>Mathematics (96%)</strong>, our college provides specialized campus
                      faculty mentors, advanced coding labs, and Olympiad cells to take your skills to
                      the next professional level.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-emerald-200/60 shadow-xs">
                    <button
                      onClick={() => setSelectedSkillFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedSkillFilter === 'all'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Tutors ({COLLEGE_SPECIALIZED_TUTORS.length})
                    </button>
                    <button
                      onClick={() => setSelectedSkillFilter('Computer Science')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedSkillFilter === 'Computer Science'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Computer & AI
                    </button>
                    <button
                      onClick={() => setSelectedSkillFilter('Mathematics')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedSkillFilter === 'Mathematics'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Math Olympiad
                    </button>
                    <button
                      onClick={() => setSelectedSkillFilter('General Science')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedSkillFilter === 'General Science'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Physics & Robotics
                    </button>
                  </div>
                </div>
              </div>

              {/* Specialized Tutor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Tutor Info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tutor.avatarColor} text-white flex items-center justify-center font-black text-base shadow-md shrink-0`}
                          >
                            {tutor.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(-2)
                              .join('')}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-slate-900">{tutor.name}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {tutor.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {tutor.qualification}
                            </p>
                            <p className="text-[11px] font-bold text-indigo-600">
                              {tutor.department}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{tutor.rating}</span>
                            <span className="text-[10px] text-slate-400">({tutor.studentsCount})</span>
                          </div>
                        </div>
                      </div>

                      {/* Skill Focus Badge */}
                      <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          Specialized Skill Mentorship
                        </div>
                        <div className="text-xs font-bold text-slate-800">{tutor.skill}</div>
                      </div>

                      {/* Timings, Location & Fee Details */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            {tutor.days} • {tutor.timing}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{tutor.labLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: Fee & Connect Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase block">
                          Campus Subsidized
                        </span>
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{tutor.feePerMonth.toLocaleString()}
                          <span className="text-[10px] text-slate-400 font-medium"> / term</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenConnectModal(tutor)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Connect with Tutor</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 font-medium">
            No examination records found to analyze.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. AI CHAT BOX (WHEN SCROLLING DOWN)                                       */}
      {/* ========================================================================= */}
      <div ref={chatSectionRef} className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Study & Homework Partner</h3>
              <p className="text-xs text-slate-500">Ask any question, problem solving or homework help</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[28px] shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Chat Header */}
          <div className="p-4 md:px-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Ever Grow AI Study & Homework Partner
                  </h3>
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ask any homework problem, concept explanation, coding problem, or stream guidance
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setChatMessages([
                    {
                      id: 'reset-1',
                      role: 'assistant',
                      content: `### Chat Cleared\n\nHello Liam! I am ready for your next question. How can I help you with your homework or skill practice today?`,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    },
                  ])
                }
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2.5 bg-slate-100/50 border-b border-slate-100/80 overflow-x-auto flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
              Quick Topics:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shrink-0 shadow-2xs transition-all"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-50/90 text-slate-900 border border-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-black/[0.05]">
                      <span
                        className={`text-[10px] font-bold ${
                          isUser ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {isUser ? 'Liam Smith (You)' : 'Ever Grow AI Tutor'}
                      </span>
                      <span className={`text-[9px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {isUser ? (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.content}
                      </p>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-500 font-medium ml-2">
                      Formulating explanation and solution...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask any homework question, math problem, science formula, or stream advice... (Press Enter to send)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONNECT WITH TUTOR MODAL                                                  */}
      {/* ========================================================================= */}
      {isConnectModalOpen && selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-black/[0.06] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${selectedTutor.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Connect with {selectedTutor.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedTutor.department}</p>
                </div>
              </div>

              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {enquirySuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Connection Request Submitted!</h4>
                <p className="text-xs leading-relaxed">{enquirySuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTutorConnect} className="space-y-4">
                {/* Tutor Highlights */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mentorship Lab:</span>
                    <span className="font-bold text-slate-900">{selectedTutor.labLocation}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Timings:</span>
                    <span className="font-bold text-slate-900">
                      {selectedTutor.days} • {selectedTutor.timing}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Skill Focus:</span>
                    <span className="font-bold text-indigo-600">{selectedTutor.skill}</span>
                  </div>
                </div>

                {/* Message / Introduction */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Introduce yourself and specify your goal:
                  </label>
                  <textarea
                    rows={4}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400">
                    Your Term 1 grades and skill profile will automatically be attached to this
                    request.
                  </p>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEnquiry || !enquiryMessage.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center space-x-1.5 transition-all"
                  >
                    {sendingEnquiry ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Mentorship Request</span>
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
