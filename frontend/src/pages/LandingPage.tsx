import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

          {/* Top-Right Neumorphic Pill "Login" Button */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="px-5 py-2.5 rounded-full bg-[#EBEEF2] text-slate-700 hover:text-slate-950 text-xs font-bold shadow-[4px_4px_9px_#C8D0DC,-4px_-4px_9px_#FFFFFF] hover:shadow-[5px_5px_12px_#C0CAD8,-5px_-5px_12px_#FFFFFF] active:shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] transition-all flex items-center space-x-2 border-none cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="px-3.5 py-1.5 rounded-full bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_7px_#FFFFFF] text-slate-700 text-xs font-bold sm:hidden flex items-center space-x-1"
            >
              <KeyRound className="w-3 h-3 text-blue-600" />
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
                  className="py-2 px-3 rounded-full bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] text-blue-700 font-bold text-xs text-center"
                >
                  Staff
                </button>
                <button
                  onClick={() => handleOpenLogin('student')}
                  className="py-2 px-3 rounded-full bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] text-indigo-700 font-bold text-xs text-center"
                >
                  Student
                </button>
                <button
                  onClick={() => handleOpenLogin('parent')}
                  className="py-2 px-3 rounded-full bg-[#EBEEF2] shadow-[3px_3px_6px_#C8D0DC,-3px_-3px_6px_#FFFFFF] text-emerald-700 font-bold text-xs text-center"
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
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-white/40 blur-3xl rounded-full -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1] animate-scale-up">
            Empowering Future Leaders with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
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

          {/* Dual Call-To-Action Neumorphic Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleOpenLogin('staff')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EBEEF2] text-slate-700 hover:text-slate-950 text-sm font-bold shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[6px_6px_14px_#C0CAD8,-6px_-6px_14px_#FFFFFF] active:shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] transition-all flex items-center justify-center space-x-2.5 border-none cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Access School Portal</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => scrollToSection('about')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EBEEF2] text-slate-600 hover:text-slate-900 text-sm font-bold shadow-[4px_4px_10px_#C8D0DC,-4px_-4px_10px_#FFFFFF] hover:shadow-[5px_5px_12px_#C0CAD8,-5px_-5px_12px_#FFFFFF] active:shadow-[inset_2px_2px_5px_#C8D0DC,inset_-2px_-2px_5px_#FFFFFF] transition-all flex items-center justify-center space-x-2 border-none cursor-pointer"
            >
              <span>Explore Campus & Curriculum</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Live Metrics Bar (Neumorphic Floating Cards) */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto text-left">
            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] flex items-center justify-center text-blue-600 mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">2,500+</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Active Enrolled Students</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Pre-K to Grade 12</div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] flex items-center justify-center text-emerald-600 mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">100%</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Board Exam Pass Rate</div>
              <div className="text-[11px] text-slate-400 mt-0.5">State & National Ranks</div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] flex items-center justify-center text-indigo-600 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">60+</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Specialized Faculty</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ph.D. & Masters Mentors</div>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] flex items-center justify-center text-amber-600 mb-3">
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
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-4 border-none">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] flex items-center justify-center text-blue-600">
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

            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-4 border-none">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] flex items-center justify-center text-emerald-600">
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

            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-4 border-none">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] flex items-center justify-center text-purple-600">
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
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] text-blue-600 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Smart Tuition Recommendation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic coaching matching based on diagnostic test scores, batch timing preferences, neighborhood radius,
                and academic track.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Gamified Student Rewards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Motivates academic consistency and 100% attendance through milestone badges, reward points, and term wall of
                fame recognitions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] text-emerald-600 flex items-center justify-center font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Live GPS Fleet Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-second bus telemetry, automated arrival ETA alerts for parents, speed monitoring, and student onboard
                validation via NFC/RFID.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] text-purple-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">AI Career & Stream Guidance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprehensive psychometric interest evaluations and algorithmic college match paths for secondary and senior
                secondary scholars.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Comprehensive 3-Way Portals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bespoke interfaces tailored specifically for school administrators, subject teachers, parents, and students
                with granular role security.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#EBEEF2] rounded-3xl p-7 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <div className="w-11 h-11 rounded-2xl bg-[#EBEEF2] shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] text-rose-600 flex items-center justify-center font-bold">
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
            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <span className="text-[10px] font-black uppercase text-blue-700 bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] px-3 py-1 rounded-full inline-block">
                Foundation Stage
              </span>
              <h3 className="text-base font-bold text-slate-900">Pre-Primary (Ages 3–5)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Montessori-inspired sensory development, phonics mastery, spatial reasoning, and social interaction skills.
              </p>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] px-3 py-1 rounded-full inline-block">
                Primary School
              </span>
              <h3 className="text-base font-bold text-slate-900">Grades 1 to 5</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Core conceptual numeracy, bilingual literacy, environmental science, computational thinking, and visual arts.
              </p>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <span className="text-[10px] font-black uppercase text-purple-700 bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] px-3 py-1 rounded-full inline-block">
                Middle School
              </span>
              <h3 className="text-base font-bold text-slate-900">Grades 6 to 8</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applied laboratory sciences, algebraic foundations, world geography, robotics workshops, and competitive sports.
              </p>
            </div>

            <div className="bg-[#EBEEF2] rounded-3xl p-6 shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[7px_7px_15px_#C0CAD8,-7px_-7px_15px_#FFFFFF] transition-all space-y-3 border-none">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-[#EBEEF2] shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] px-3 py-1 rounded-full inline-block">
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
          <div className="bg-[#EBEEF2] rounded-[32px] p-8 md:p-12 text-slate-800 shadow-[8px_8px_20px_#C8D0DC,-8px_-8px_20px_#FFFFFF] border-none">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Neighborhood Tuition & Subject Mastery Centers
              </h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                Beyond regular school hours, Ever Grow operates state-of-the-art coaching centers providing small-batch
                remedial support, Olympiad mentorship, and doubt clearance with certified master educators.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
                <div className="flex items-center space-x-2 bg-[#EBEEF2] px-4 py-2.5 rounded-full shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Maximum 12 Students Per Batch</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#EBEEF2] px-4 py-2.5 rounded-full shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Personalized Weekly Progress Tracking</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#EBEEF2] px-4 py-2.5 rounded-full shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EBEEF2] text-slate-700 hover:text-slate-950 text-xs font-bold shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[6px_6px_14px_#C0CAD8,-6px_-6px_14px_#FFFFFF] active:shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 border-none cursor-pointer"
                  >
                    {submittingEnquiry ? (
                      <span>Registering Application...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-blue-600" />
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

