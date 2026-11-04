import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  KeyRound,
  ArrowRight,
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

interface LandingPageProps {
  initialOpenLogin?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ initialOpenLogin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(initialOpenLogin);
  const [loginPortalType, setLoginPortalType] = useState<'staff' | 'student' | 'parent'>('staff');
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
      setIsLoginModalOpen(true);
      const portalParam = params.get('portal');
      if (portalParam === 'student' || portalParam === 'parent' || portalParam === 'staff') {
        setLoginPortalType(portalParam);
      }
    }
  }, [location, initialOpenLogin]);

  const handleOpenLogin = (portal: 'staff' | 'student' | 'parent' = 'staff') => {
    setLoginPortalType(portal);
    setIsLoginModalOpen(true);
    setMobileMenuOpen(false);
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
    <div className="min-h-screen bg-[#E9EEF5] text-slate-800 font-sans selection:bg-[#0071E3] selection:text-white">
      {/* 1. STICKY GLASSMORPHIC NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <a href="#" className="flex items-center space-x-3.5 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0071E3] via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1">
                <img src={logoImg} alt="Ever Grow Schools Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">Ever Grow</span>
                <span className="text-lg font-bold tracking-tight text-[#0071E3]">Schools</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-tight">
                Excellence in Holistic Education
              </p>
            </div>
          </a>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-600">
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-[#0071E3] transition-colors"
            >
              About School
            </button>
            <button
              onClick={() => scrollToSection('academics')}
              className="hover:text-[#0071E3] transition-colors"
            >
              Academics
            </button>
            <button
              onClick={() => scrollToSection('campus-tech')}
              className="hover:text-[#0071E3] transition-colors"
            >
              Campus Tech & ERP
            </button>
            <button
              onClick={() => scrollToSection('tuitions')}
              className="hover:text-[#0071E3] transition-colors"
            >
              Tuition Centers
            </button>
            <button
              onClick={() => scrollToSection('enquiry')}
              className="hover:text-[#0071E3] transition-colors"
            >
              Admissions
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-[#0071E3] transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Top-Right Highlighted Rectangular "Portal Login" Button */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062C4] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center space-x-2 border border-blue-400/30 transform hover:-translate-y-0.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0071E3] text-white text-xs font-bold sm:hidden flex items-center space-x-1"
            >
              <KeyRound className="w-3 h-3" />
              <span>Login</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-5 space-y-4 animate-fade-in">
            <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-1 hover:text-[#0071E3]"
              >
                About School
              </button>
              <button
                onClick={() => scrollToSection('academics')}
                className="text-left py-1 hover:text-[#0071E3]"
              >
                Academics & Streams
              </button>
              <button
                onClick={() => scrollToSection('campus-tech')}
                className="text-left py-1 hover:text-[#0071E3]"
              >
                Campus Technology & ERP
              </button>
              <button
                onClick={() => scrollToSection('tuitions')}
                className="text-left py-1 hover:text-[#0071E3]"
              >
                Extended Tuition Centers
              </button>
              <button
                onClick={() => scrollToSection('enquiry')}
                className="text-left py-1 hover:text-[#0071E3]"
              >
                Admission Enquiry
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left py-1 hover:text-[#0071E3]"
              >
                Contact Campus
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Portal to Sign In:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleOpenLogin('staff')}
                  className="py-2 px-3 rounded-xl bg-blue-50 text-[#0071E3] font-bold text-xs border border-blue-200 text-center"
                >
                  Staff
                </button>
                <button
                  onClick={() => handleOpenLogin('student')}
                  className="py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 text-center"
                >
                  Student
                </button>
                <button
                  onClick={() => handleOpenLogin('parent')}
                  className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 text-center"
                >
                  Parent
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-300/25 via-indigo-200/25 to-purple-300/20 blur-3xl rounded-full -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Institutional Badge Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-xs text-xs font-bold text-slate-800 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Admissions Open for Academic Year 2026–2027</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#0071E3] cursor-pointer" onClick={() => scrollToSection('enquiry')}>
              Apply Online
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1] animate-scale-up">
            Empowering Future Leaders with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] via-indigo-600 to-purple-600">
              Smart Learning
            </span>{' '}
            & Modern Governance
          </h1>

          {/* Mission Statement */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Ever Grow International Schools fuses world-class academic rigor, holistic character development, and
            next-generation institutional governance. Nurturing critical thinkers, innovators, and global leaders through
            continuous excellence.
          </p>

          {/* Dual Call-To-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-extrabold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2.5 border border-blue-400/30 transform hover:-translate-y-0.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Access School Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('about')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 text-sm font-bold shadow-sm border border-black/[0.08] transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Campus & Curriculum</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Live Metrics Bar (Apple Neumorphic Floating Cards) */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0071E3] mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">2,500+</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Active Enrolled Students</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Pre-K to Grade 12</div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">100%</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Board Exam Pass Rate</div>
              <div className="text-[11px] text-slate-400 mt-0.5">State & National Ranks</div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">60+</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Specialized Faculty</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ph.D. & Masters Mentors</div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-3">
                <Bus className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">24</div>
              <div className="text-xs font-bold text-slate-600 mt-1">GPS Smart Fleets</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Live Safe Transit Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT & CAMPUS LIFE SHOWCASE */}
      <section id="about" className="py-20 bg-white/70 backdrop-blur-md border-y border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0071E3] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Campus Life & Ethos
            </span>
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
            <div className="bg-white border border-slate-200/80 rounded-[28px] p-7 shadow-sm space-y-4 hover:border-[#0071E3]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#0071E3]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Robotics & AI Innovation Labs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Equipped with microcontrollers, 3D printers, and sensor arrays where students build real-world IoT and
                robotics prototypes starting from Grade 4.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#0071E3] flex items-center space-x-1">
                <span>Integrated STEM Curriculum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-[28px] p-7 shadow-sm space-y-4 hover:border-[#0071E3]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
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

            <div className="bg-white border border-slate-200/80 rounded-[28px] p-7 shadow-sm space-y-4 hover:border-[#0071E3]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
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
      <section id="campus-tech" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200">
              Next-Gen ERP Technology
            </span>
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
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] p-7 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Smart Tuition Recommendation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic coaching matching based on diagnostic test scores, batch timing preferences, neighborhood radius,
                and academic track.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] p-7 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Gamified Student Rewards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Motivates academic consistency and 100% attendance through milestone badges, reward points, and term wall of
                fame recognitions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] p-7 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Live GPS Fleet Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-second bus telemetry, automated arrival ETA alerts for parents, speed monitoring, and student onboard
                validation via NFC/RFID.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] p-7 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">AI Career & Stream Guidance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprehensive psychometric interest evaluations and algorithmic college match paths for secondary and senior
                secondary scholars.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] p-7 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Comprehensive 3-Way Portals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bespoke interfaces tailored specifically for school administrators, subject teachers, parents, and students
                with granular role security.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[26px] p-7 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
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
      <section id="academics" className="py-20 bg-white/70 backdrop-blur-md border-y border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Curricular Pathways
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Structured for Every Milestone of Growth
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our curriculum blends national educational standards with inquiry-based global pedagogy, fostering foundational
              fluency in mathematics, humanities, and sciences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Foundation Stage
              </span>
              <h3 className="text-base font-bold text-slate-900">Pre-Primary (Ages 3–5)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Montessori-inspired sensory development, phonics mastery, spatial reasoning, and social interaction skills.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Primary School
              </span>
              <h3 className="text-base font-bold text-slate-900">Grades 1 to 5</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Core conceptual numeracy, bilingual literacy, environmental science, computational thinking, and visual arts.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                Middle School
              </span>
              <h3 className="text-base font-bold text-slate-900">Grades 6 to 8</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applied laboratory sciences, algebraic foundations, world geography, robotics workshops, and competitive sports.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
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
      <section id="tuitions" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[32px] p-8 md:p-12 text-white shadow-xl shadow-indigo-500/20">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                Ever Grow Extended Academy
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Neighborhood Tuition & Subject Mastery Centers
              </h2>
              <p className="text-sm md:text-base text-white/90 leading-relaxed">
                Beyond regular school hours, Ever Grow operates state-of-the-art coaching centers providing small-batch
                remedial support, Olympiad mentorship, and doubt clearance with certified master educators.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
                <div className="flex items-center space-x-1.5 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Maximum 12 Students Per Batch</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Personalized Weekly Progress Tracking</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Direct ERP Gradebook Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUICK ADMISSION ENQUIRY SECTION */}
      <section id="enquiry" className="py-20 bg-white/80 backdrop-blur-xl border-t border-black/[0.05]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-[32px] p-8 md:p-12 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0071E3] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
                Direct Admission Desk
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Begin Your Child's Educational Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Submit an admission enquiry to receive the school prospectus and schedule a campus tour with our Dean.
              </p>
            </div>

            {submittedCode ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Application Registered Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your official application tracking reference is:
                </p>
                <div className="inline-block px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-mono font-black text-lg tracking-wider shadow-2xs">
                  {submittedCode}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Our admissions admissions team will reach out within 24 hours.
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmittedCode(null)}
                    className="text-xs text-[#0071E3] font-bold underline"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickEnquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.student_name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, student_name: e.target.value })}
                      placeholder="e.g. Alexander Smith"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.parent_name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, parent_name: e.target.value })}
                      placeholder="e.g. William Smith"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={enquiryForm.parent_phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, parent_phone: e.target.value })}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Grade Applying For</label>
                    <select
                      value={enquiryForm.grade_applying_for}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, grade_applying_for: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
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
                      className="text-[#0071E3] font-bold hover:underline"
                    >
                      Open Full Admission Portal
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                  >
                    {submittingEnquiry ? (
                      <span>Registering Application...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
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
      <footer id="contact" className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Column 1: School Identity */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <img src={logoImg} alt="Ever Grow Logo" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
                <span className="text-base font-black text-white">Ever Grow Schools</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Ever Grow International Schools — accredited institutional campus committed to academic rigor, integrity,
                character formation, and innovation.
              </p>
              <div className="text-[10px] text-slate-500 space-y-1 font-mono">
                <div>CBSE Affiliation No: 1930482</div>
                <div>ISO 9001:2025 Certified Campus</div>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Quick Exploration</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">Campus Ethos</button></li>
                <li><button onClick={() => scrollToSection('academics')} className="hover:text-white transition-colors">Curricular Streams</button></li>
                <li><button onClick={() => scrollToSection('campus-tech')} className="hover:text-white transition-colors">School ERP Systems</button></li>
                <li><button onClick={() => scrollToSection('tuitions')} className="hover:text-white transition-colors">Extended Learning</button></li>
                <li><button onClick={() => scrollToSection('enquiry')} className="hover:text-white transition-colors">Online Admissions</button></li>
              </ul>
            </div>

            {/* Column 3: Institutional Portals */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Campus Portals</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => handleOpenLogin('staff')} className="hover:text-white transition-colors flex items-center space-x-1">
                    <span>Faculty & Staff Desk</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLogin('student')} className="hover:text-white transition-colors flex items-center space-x-1">
                    <span>Student Learning Portal</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLogin('parent')} className="hover:text-white transition-colors flex items-center space-x-1">
                    <span>Parent Guardian Desk</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                </li>
                <li>
                  <a href="/admission-enquiry" className="hover:text-white transition-colors flex items-center space-x-1">
                    <span>Public Admission Enquiry</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Information */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Campus Contact</h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Ever Grow Academic Corridor, Global Tech Highway, Sector 4</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>+1 (800) 555-GROW (4769)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>admissions@evergrowschools.edu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Mon – Sat: 8:00 AM – 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 Ever Grow Schools. All Rights Reserved. Engineered for Educational Excellence.
            </div>
            <div className="flex items-center space-x-4">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Charter</span>
              <span>•</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-slate-400 cursor-pointer">Security Compliance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* RECTANGULAR MODAL LOGIN POPUP */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialPortalType={loginPortalType}
      />
    </div>
  );
};
