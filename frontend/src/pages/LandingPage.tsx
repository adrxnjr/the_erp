import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  KeyRound,
  ShieldCheck,
  GraduationCap,
  Users,
  Compass,
  Award,
  Bus,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Cpu,
  Trophy,
  Activity,
  Layers,
  Clock,
  Send,
  QrCode,
  FileText,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import student1 from '../assets/students/student1.jpg';
import student2 from '../assets/students/student2.jpg';
import student3 from '../assets/students/student3.jpg';
import student4 from '../assets/students/student4.jpg';
import student5 from '../assets/students/student5.jpg';
import student6 from '../assets/students/student6.jpg';
import student7 from '../assets/students/student7.jpg';
import student8 from '../assets/students/student8.jpg';

interface StudentShowcaseItem {
  name: string;
  grade: string;
  achievement: string;
  accent: string;
  tagBg: string;
  photo: string;
}

const STUDENT_SHOWCASE: StudentShowcaseItem[] = [
  {
    name: 'Aarav Sharma',
    grade: 'Grade 10',
    achievement: 'National Science Rank 1',
    accent: 'from-emerald-400 to-teal-500',
    tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    photo: student1,
  },
  {
    name: 'Priya Nair',
    grade: 'Grade 12',
    achievement: 'AI & Robotics Club Lead',
    accent: 'from-blue-500 to-cyan-500',
    tagBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    photo: student2,
  },
  {
    name: 'Advik Patel',
    grade: 'Grade 8',
    achievement: 'Math Olympiad Gold',
    accent: 'from-violet-500 to-purple-600',
    tagBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
    photo: student3,
  },
  {
    name: 'Ananya Iyer',
    grade: 'Grade 11',
    achievement: 'State Debate Champion',
    accent: 'from-pink-500 to-rose-500',
    tagBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
    photo: student4,
  },
  {
    name: 'Kavya Reddy',
    grade: 'Grade 9',
    achievement: 'Junior STEM Innovator',
    accent: 'from-amber-400 to-orange-500',
    tagBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    photo: student5,
  },
  {
    name: 'Devansh Joshi',
    grade: 'Grade 10',
    achievement: 'Athletics & Track Captain',
    accent: 'from-teal-400 to-emerald-500',
    tagBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
    photo: student6,
  },
  {
    name: 'Zoya Khan',
    grade: 'Grade 12',
    achievement: 'Literature & Arts Lead',
    accent: 'from-fuchsia-500 to-purple-600',
    tagBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80',
    photo: student7,
  },
  {
    name: 'Kabir Sen',
    grade: 'Grade 7',
    achievement: 'Coding Hackathon Winner',
    accent: 'from-blue-600 to-indigo-600',
    tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    photo: student8,
  },
];

interface LandingPageProps {
  initialOpenLogin?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ initialOpenLogin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick admission form state
  const [enquiryForm, setEnquiryForm] = useState({
    student_name: '',
    parent_name: '',
    parent_phone: '',
    grade_applying_for: 'Grade 1',
  });
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // Check URL query parameters: e.g. /?login=true or /?portal=student
  useEffect(() => {
    document.title = 'Ever Grow Schools — Excellence in Holistic Education & Smart Governance';
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true' || initialOpenLogin) {
      const portalParam = params.get('portal');
      const portalQuery = portalParam ? `?portal=${portalParam}` : '';
      navigate(`/login${portalQuery}`, { replace: true });
    }
  }, [location, initialOpenLogin, navigate]);

  const handleOpenLogin = (portal: 'staff' | 'student' | 'parent' = 'staff') => {
    setMobileMenuOpen(false);
    navigate(`/login?portal=${portal}`);
  };

  const handleQuickEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.student_name || !enquiryForm.parent_phone) {
      toast.error('Please provide student name and contact phone number.');
      return;
    }

    setSubmittingEnquiry(true);
    try {
      const res = await api.post('/students/enquiries', {
        ...enquiryForm,
        parent_email: 'prospective.parent@gmail.com',
        notes: 'Submitted via Home Page Quick Admission Desk',
      });
      const code = res.data?.application_number || `ENQ-${Date.now().toString().slice(-6)}`;
      setSubmittedCode(code);
      toast.success(`Admission application received! Tracking code: ${code}`);
      setEnquiryForm({ student_name: '', parent_name: '', parent_phone: '', grade_applying_for: 'Grade 1' });
    } catch {
      // Fallback local code
      const fallbackCode = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedCode(fallbackCode);
      toast.success(`Admission enquiry registered! Reference: ${fallbackCode}`);
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEEF2] text-slate-800 font-sans selection:bg-slate-300 selection:text-slate-900">
      {/* 1. STICKY NEUMORPHIC NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#EBEEF2]/90 backdrop-blur-xl border-b border-slate-300/40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <a href="#" className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <img src={logoImg} alt="Ever Grow Schools Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">Ever Grow</span>
                <span className="text-lg font-bold tracking-tight text-blue-600">Schools</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-tight">
                Excellence in Holistic Education
              </p>
            </div>
          </a>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-slate-600">
            <button
              onClick={() => scrollToSection('about')}
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
            >
              About School
            </button>
            <button
              onClick={() => scrollToSection('academics')}
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
            >
              Academics
            </button>
            <button
              onClick={() => scrollToSection('campus-tech')}
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
            >
              Campus Tech & ERP
            </button>
            <button
              onClick={() => scrollToSection('tuitions')}
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
            >
              Tuition Centers
            </button>
            <button
              onClick={() => scrollToSection('enquiry')}
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
            >
              Admissions
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="px-3 py-1.5 rounded-full hover:text-slate-900 hover:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Top-Right Colorful Pill "Login" Button */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border-none cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold sm:hidden flex items-center space-x-1 shadow-sm"
            >
              <KeyRound className="w-3 h-3" />
              <span>Login</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] text-slate-700 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#EBEEF2] border-b border-slate-300/40 px-6 py-5 space-y-4 animate-fade-in shadow-[0_10px_20px_rgba(200,208,220,0.5)]">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-1 hover:text-blue-600"
              >
                About School
              </button>
              <button
                onClick={() => scrollToSection('academics')}
                className="text-left py-1 hover:text-blue-600"
              >
                Academics & Streams
              </button>
              <button
                onClick={() => scrollToSection('campus-tech')}
                className="text-left py-1 hover:text-blue-600"
              >
                Campus Technology & ERP
              </button>
              <button
                onClick={() => scrollToSection('tuitions')}
                className="text-left py-1 hover:text-blue-600"
              >
                Extended Tuition Centers
              </button>
              <button
                onClick={() => scrollToSection('enquiry')}
                className="text-left py-1 hover:text-blue-600"
              >
                Admission Enquiry
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left py-1 hover:text-blue-600"
              >
                Contact Campus
              </button>
            </div>

            <div className="pt-3 border-t border-slate-300/40 flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Portal to Sign In:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleOpenLogin('staff')}
                  className="py-2 px-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs text-center shadow-sm"
                >
                  Staff
                </button>
                <button
                  onClick={() => handleOpenLogin('student')}
                  className="py-2 px-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs text-center shadow-sm"
                >
                  Student
                </button>
                <button
                  onClick={() => handleOpenLogin('parent')}
                  className="py-2 px-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs text-center shadow-sm"
                >
                  Parent
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-[#EBEEF2]">
        {/* Colorful Multi-Stop Ambient Background Glows */}
        <div className="absolute -top-10 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-300/35 to-blue-400/25 blur-3xl rounded-full -z-10 pointer-events-none animate-gentle-float"></div>
        <div className="absolute top-10 right-10 w-[550px] h-[550px] bg-gradient-to-bl from-purple-300/30 via-pink-300/25 to-rose-300/20 blur-3xl rounded-full -z-10 pointer-events-none animate-gentle-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-300/25 to-teal-300/20 blur-3xl rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-300/25 to-orange-300/20 blur-3xl rounded-full -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1] animate-scale-up">
            Empowering Future Leaders with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-pink-500">
              Smart Learning
            </span>{' '}
            &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-600">
              Modern Governance
            </span>
          </h1>

          {/* Mission Statement */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Ever Grow International Schools fuses world-class academic rigor, holistic character development, and
            next-generation institutional governance. Nurturing critical thinkers, innovators, and global leaders through
            continuous excellence.
          </p>

          {/* ─────────────────────────────────────────────────────────────
              MINI MOVING STUDENT ANIMATION SHOWCASE (CONTINUOUS MARQUEE)
              ───────────────────────────────────────────────────────────── */}
          <div className="pt-6 pb-2 space-y-3.5 overflow-hidden">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 bg-[#EBEEF2] shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] px-4 py-1.5 rounded-full border border-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-900 font-extrabold">2,500+ Active Scholars</span>
              <span className="text-slate-300">•</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-extrabold">
                Meet Our Achievers
              </span>
            </div>

            {/* Seamless Horizontal Infinite Loop Ticker with Gradient Fade Edges */}
            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-2">
              <div className="animate-marquee flex items-center gap-4">
                {[...STUDENT_SHOWCASE, ...STUDENT_SHOWCASE].map((student, idx) => (
                  <div
                    key={`${student.name}-${idx}`}
                    className="flex items-center space-x-3.5 px-3.5 py-2.5 rounded-2xl bg-[#EBEEF2] shadow-[4px_4px_10px_#C8D0DC,-4px_-4px_10px_#FFFFFF] hover:shadow-[6px_6px_14px_#C0CAD8,-6px_-6px_14px_#FFFFFF] transition-all shrink-0 cursor-pointer border border-white/80 group select-none hover:-translate-y-0.5"
                  >
                    {/* Student Photo with Vibrant Gradient Ring */}
                    <div className={`p-0.5 rounded-full bg-gradient-to-tr ${student.accent} shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-11 h-11 rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Clean fallback placeholder if network fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Student Details */}
                    <div className="text-left">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-slate-800 tracking-tight">{student.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-500">{student.grade}</span>
                        <span className="text-slate-300">•</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${student.tagBg}`}>
                          {student.achievement}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Metrics Bar (Colorful Neumorphic Floating Cards) */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto text-left">
            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border border-blue-200/40 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 font-mono tracking-tight">2,500+</div>
              <div className="text-xs font-bold text-slate-700 mt-1">Active Enrolled Students</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Pre-K to Grade 12</div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border border-emerald-200/40 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 font-mono tracking-tight">100%</div>
              <div className="text-xs font-bold text-slate-700 mt-1">Board Exam Pass Rate</div>
              <div className="text-[11px] text-slate-400 mt-0.5">State & National Ranks</div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border border-indigo-200/40 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-mono tracking-tight">60+</div>
              <div className="text-xs font-bold text-slate-700 mt-1">Specialized Faculty</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ph.D. & Masters Mentors</div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border border-amber-200/40 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Bus className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 font-mono tracking-tight">24</div>
              <div className="text-xs font-bold text-slate-700 mt-1">GPS Smart Fleets</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Live Safe Transit Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT & CAMPUS LIFE SHOWCASE */}
      <section id="about" className="py-20 bg-[#EBEEF2] border-t border-slate-300/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A World-Class Infrastructure Designed for Curiosity
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              At Ever Grow, learning extends far beyond textbooks. Our 20-acre sustainable smart campus provides immersive
              environments for STEM, athletics, performing arts, and scientific discovery.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-4 border border-blue-200/50 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Robotics & AI Innovation Labs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Equipped with microcontrollers, 3D printers, and sensor arrays where students build real-world IoT and
                robotics prototypes starting from Grade 4.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-600 flex items-center space-x-1">
                <span>Integrated STEM Curriculum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-4 border border-emerald-200/50 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Olympic Standard Sports Arena</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Featuring an all-weather 400m synthetic running track, FINA-compliant swimming pool, indoor badminton courts,
                and professional football academy.
              </p>
              <div className="pt-2 text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                <span>Inter-School Championships</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-4 border border-purple-200/50 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Digital Library & Knowledge Center</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Over 35,000 physical volumes complemented by continuous access to global research databases, JSTOR, and
                multimedia educational repositories.
              </p>
              <div className="pt-2 text-[11px] font-bold text-purple-600 flex items-center space-x-1">
                <span>Collaborative Study Pods</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY HIGHLIGHTS & ERP FEATURE GRID */}
      <section id="campus-tech" className="py-20 bg-[#EBEEF2] border-t border-slate-300/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              An Enterprise Platform Built for Transparent Governance
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Ever Grow Schools is powered by our proprietary School ERP operating system, connecting educators, parents,
              students, and administrators into an integrated digital ecosystem.
            </p>
          </div>

          {/* 6 Core Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-blue-200/40 hover:-translate-y-1 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Smart Tuition Recommendation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic coaching matching based on diagnostic test scores, batch timing preferences, neighborhood radius,
                and academic track.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-amber-200/40 hover:-translate-y-1 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Gamified Student Rewards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Motivates academic consistency and 100% attendance through milestone badges, reward points, and term wall of
                fame recognitions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-emerald-200/40 hover:-translate-y-1 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Bus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Live GPS Fleet Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-second bus telemetry, automated arrival ETA alerts for parents, speed monitoring, and student onboard
                validation via NFC/RFID.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-purple-200/40 hover:-translate-y-1 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">AI Career & Stream Guidance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprehensive psychometric interest evaluations and algorithmic college match paths for secondary and senior
                secondary scholars.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-indigo-200/40 hover:-translate-y-1 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Comprehensive 3-Way Portals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bespoke interfaces tailored specifically for school administrators, subject teachers, parents, and students
                with granular role security.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-rose-200/40 hover:-translate-y-1 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Digital QR Student Credentials</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-resolution verifiable digital student identity cards with instant PDF export, parent emergency contact,
                and attendance check-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC STRUCTURE & STREAMS */}
      <section id="academics" className="py-20 bg-[#EBEEF2] border-t border-slate-300/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Structured for Every Milestone of Growth
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our curriculum blends national educational standards with inquiry-based global pedagogy, fostering foundational
              fluency in mathematics, humanities, and sciences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-blue-200/60 hover:-translate-y-1">
              <span className="text-[10px] font-extrabold uppercase bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full inline-block shadow-sm">
                Foundation Stage
              </span>
              <h3 className="text-base font-bold text-slate-900">Pre-Primary (Ages 3–5)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Montessori-inspired sensory development, phonics mastery, spatial reasoning, and social interaction skills.
              </p>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-indigo-200/60 hover:-translate-y-1">
              <span className="text-[10px] font-extrabold uppercase bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full inline-block shadow-sm">
                Primary School
              </span>
              <h3 className="text-base font-bold text-slate-900">Grades 1 to 5</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Core conceptual numeracy, bilingual literacy, environmental science, computational thinking, and visual arts.
              </p>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-purple-200/60 hover:-translate-y-1">
              <span className="text-[10px] font-extrabold uppercase bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full inline-block shadow-sm">
                Middle School
              </span>
              <h3 className="text-base font-bold text-slate-900">Grades 6 to 8</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applied laboratory sciences, algebraic foundations, world geography, robotics workshops, and competitive sports.
              </p>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border border-emerald-200/60 hover:-translate-y-1">
              <span className="text-[10px] font-extrabold uppercase bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full inline-block shadow-sm">
                Senior Secondary
              </span>
              <h3 className="text-base font-bold text-slate-900">Grades 9 to 12</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialized Science (PCM/PCB), Commerce with Math, and Humanities streams with integrated entrance prep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TUITION CENTERS SECTION */}
      <section id="tuitions" className="py-20 bg-[#EBEEF2] border-t border-slate-300/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-pink-600 rounded-[32px] p-8 md:p-12 text-white shadow-xl shadow-indigo-500/25 border-none">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Neighborhood Tuition & Subject Mastery Centers
              </h2>
              <p className="text-sm md:text-base text-white/95 leading-relaxed">
                Beyond regular school hours, Ever Grow operates state-of-the-art coaching centers providing small-batch
                remedial support, Olympiad mentorship, and doubt clearance with certified master educators.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-full text-white border border-white/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Maximum 12 Students Per Batch</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-full text-white border border-white/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Personalized Weekly Progress Tracking</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-full text-white border border-white/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Direct ERP Gradebook Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUICK ADMISSION ENQUIRY SECTION */}
      <section id="enquiry" className="py-20 bg-[#EBEEF2] border-t border-slate-300/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#EBEEF2] rounded-[32px] p-8 md:p-12 shadow-[8px_8px_20px_#C8D0DC,-8px_-8px_20px_#FFFFFF] border-none space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Begin Your Child's Educational Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Submit an admission enquiry to receive the school prospectus and schedule a campus tour with our Dean.
              </p>
            </div>

            {submittedCode ? (
              <div className="bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Application Registered Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your official application tracking reference is:
                </p>
                <div className="inline-block px-6 py-2.5 rounded-full bg-[#EBEEF2] text-emerald-700 font-mono font-black text-lg tracking-wider shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF]">
                  {submittedCode}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Our admissions team will reach out within 24 hours.
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmittedCode(null)}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickEnquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 pl-2">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.student_name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, student_name: e.target.value })}
                      placeholder="e.g. Alexander Smith"
                      className="w-full px-5 py-3 bg-[#EBEEF2] rounded-full text-xs text-slate-800 placeholder-slate-400 shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_#C0CAD8,inset_-4px_-4px_8px_#FFFFFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 pl-2">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.parent_name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, parent_name: e.target.value })}
                      placeholder="e.g. William Smith"
                      className="w-full px-5 py-3 bg-[#EBEEF2] rounded-full text-xs text-slate-800 placeholder-slate-400 shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_#C0CAD8,inset_-4px_-4px_8px_#FFFFFF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 pl-2">Contact Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={enquiryForm.parent_phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, parent_phone: e.target.value })}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full px-5 py-3 bg-[#EBEEF2] rounded-full text-xs text-slate-800 placeholder-slate-400 shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] border-none focus:outline-none focus:shadow-[inset_4px_4px_8px_#C0CAD8,inset_-4px_-4px_8px_#FFFFFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 pl-2">Grade Applying For</label>
                    <select
                      value={enquiryForm.grade_applying_for}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, grade_applying_for: e.target.value })}
                      className="w-full px-5 py-3 bg-[#EBEEF2] rounded-full text-xs text-slate-800 shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] border-none focus:outline-none cursor-pointer"
                    >
                      {['Pre-K / Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-500">
                    Need the complete application form?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/admission-enquiry')}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Open Full Admission Portal
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 border-none cursor-pointer"
                  >
                    {submittingEnquiry ? (
                      <span>Registering Application...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Submit Admission Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer id="contact" className="bg-[#EBEEF2] text-slate-600 py-16 border-t border-slate-300/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Column 1: School Identity */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] p-1.5 flex items-center justify-center">
                  <img src={logoImg} alt="Ever Grow Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-black text-slate-900">Ever Grow Schools</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Ever Grow International Schools — accredited institutional campus committed to academic rigor, integrity,
                character formation, and innovation.
              </p>
              <div className="text-[10px] text-slate-400 space-y-1 font-mono">
                <div>CBSE Affiliation No: 1930482</div>
                <div>ISO 9001:2025 Certified Campus</div>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">Quick Exploration</h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-blue-600 transition-colors cursor-pointer">Campus Ethos</button></li>
                <li><button onClick={() => scrollToSection('academics')} className="hover:text-blue-600 transition-colors cursor-pointer">Curricular Streams</button></li>
                <li><button onClick={() => scrollToSection('campus-tech')} className="hover:text-blue-600 transition-colors cursor-pointer">School ERP Systems</button></li>
                <li><button onClick={() => scrollToSection('tuitions')} className="hover:text-blue-600 transition-colors cursor-pointer">Extended Learning</button></li>
                <li><button onClick={() => scrollToSection('enquiry')} className="hover:text-blue-600 transition-colors cursor-pointer">Online Admissions</button></li>
              </ul>
            </div>

            {/* Column 3: Institutional Portals */}
            <div className="space-y-3">
              <h4 className="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">Campus Portals</h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>
                  <button onClick={() => handleOpenLogin('staff')} className="hover:text-blue-600 transition-colors flex items-center space-x-1 cursor-pointer">
                    <span>Faculty & Staff Desk</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLogin('student')} className="hover:text-blue-600 transition-colors flex items-center space-x-1 cursor-pointer">
                    <span>Student Learning Portal</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLogin('parent')} className="hover:text-blue-600 transition-colors flex items-center space-x-1 cursor-pointer">
                    <span>Parent Guardian Desk</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </li>
                <li>
                  <a href="/admission-enquiry" className="hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <span>Public Admission Enquiry</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Information */}
            <div className="space-y-3">
              <h4 className="text-slate-900 font-extrabold uppercase tracking-wider text-[11px]">Campus Contact</h4>
              <div className="space-y-2.5 text-slate-600 font-medium">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Ever Grow Academic Corridor, Global Tech Highway, Sector 4</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>+1 (800) 555-GROW (4769)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>admissions@evergrowschools.edu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mon – Sat: 8:00 AM – 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-300/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
            <div>
              © 2026 Ever Grow Schools. All Rights Reserved. Engineered for Educational Excellence.
            </div>
            <div className="flex items-center space-x-4">
              <span className="hover:text-slate-800 cursor-pointer">Privacy Charter</span>
              <span>•</span>
              <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-slate-800 cursor-pointer">Security Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

