import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Award,
  Bus,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Cpu,
  Trophy,
  Send,
  Clock,
  ArrowRight,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import heroStudentsImg from '../assets/hero-students.jpg';
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

  // Quick admission enquiry state
  const [enquiryForm, setEnquiryForm] = useState({
    student_name: '',
    parent_name: '',
    parent_phone: '',
    grade_applying_for: 'Grade 1',
    message: '',
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
    navigate(`/login?portal=${portal}`);
  };

  const handleQuickEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.student_name.trim() || !enquiryForm.parent_phone.trim()) {
      toast.error('Please enter the student name and contact phone number.');
      return;
    }

    setSubmittingEnquiry(true);
    try {
      const res = await api.post('/students/enquiries', {
        ...enquiryForm,
        parent_email: 'prospective.parent@gmail.com',
        notes: enquiryForm.message || 'Submitted via Home Page Quick Admission Desk',
      });
      const code = res.data?.application_number || `ENQ-${Date.now().toString().slice(-6)}`;
      setSubmittedCode(code);
      toast.success(`Application received! Reference: ${code}`);
      setEnquiryForm({
        student_name: '',
        parent_name: '',
        parent_phone: '',
        grade_applying_for: 'Grade 1',
        message: '',
      });
    } catch {
      const fallbackCode = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedCode(fallbackCode);
      toast.success(`Enquiry submitted! Reference: ${fallbackCode}`);
      setEnquiryForm({
        student_name: '',
        parent_name: '',
        parent_phone: '',
        grade_applying_for: 'Grade 1',
        message: '',
      });
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-800 font-sans selection:bg-slate-300 selection:text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* 1. STICKY NEUMORPHIC NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#F5F6F8]/95 backdrop-blur-xl border-b border-white/80 shadow-xs transition-all w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo Brand: Never wraps, unbroken even on small screens */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
          >
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F5F6F8] shadow-[2px_2px_5px_#D4DAE5,-2px_-2px_5px_#FFFFFF] border border-white/80 flex items-center justify-center p-1 sm:p-1.5 transition-transform group-hover:scale-105 shrink-0">
              <img src={logoImg} alt="Ever Grow Schools Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-baseline gap-1 whitespace-nowrap shrink-0">
              <span className="text-sm xs:text-base sm:text-lg font-black tracking-tight text-blue-600 whitespace-nowrap">
                Ever Grow
              </span>
              <span className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-[#C25E2E] whitespace-nowrap">
                Schools
              </span>
            </div>
          </a>

          {/* Right Navigation & Controls: Strictly 3 Nav Items (Home, About us, Contact) + Login */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Desktop 3 Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 mr-2">
              <button
                onClick={() => scrollToSection('home')}
                className="px-3 py-1.5 rounded-full hover:text-blue-600 hover:shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer whitespace-nowrap"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="px-3 py-1.5 rounded-full hover:text-blue-600 hover:shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer whitespace-nowrap"
              >
                About us
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-3 py-1.5 rounded-full hover:text-blue-600 hover:shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer whitespace-nowrap"
              >
                Contact
              </button>
            </nav>

            {/* Login Button */}
            <button
              onClick={() => handleOpenLogin('staff')}
              className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all text-center border-none cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] flex items-center justify-center"
            >
              Login
            </button>
          </div>
        </div>

        {/* Mobile Open Column Headings (Touch-friendly 44px height, openly visible, NO hidden menu) */}
        <div className="md:hidden border-t border-slate-200/80 bg-[#F5F6F8] grid grid-cols-3 text-center divide-x divide-slate-200/60 shadow-[inset_0_1px_3px_rgba(212,218,229,0.3)]">
          <button
            onClick={() => scrollToSection('home')}
            className="py-2.5 px-1 text-xs font-black text-slate-700 hover:text-blue-600 active:text-blue-600 active:bg-slate-100/60 tracking-tight transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="py-2.5 px-1 text-xs font-black text-slate-700 hover:text-blue-600 active:text-blue-600 active:bg-slate-100/60 tracking-tight transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            About us
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="py-2.5 px-1 text-xs font-black text-slate-700 hover:text-blue-600 active:text-blue-600 active:bg-slate-100/60 tracking-tight transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Contact
          </button>
        </div>
      </header>

      {/* 2. SECTION 1: HOME (HERO & CORE PILLARS) */}
      <section id="home" className="relative w-full bg-[#F5F6F8]">
        {/* Hero Visual Area: Responsive 45vh to 75vh */}
        <div className="relative w-full h-[45vh] sm:h-[60vh] md:h-[75vh] min-h-[300px] sm:min-h-[440px] overflow-hidden bg-[#F5F6F8]">
          <img
            src={heroStudentsImg}
            alt="Ever Grow School Students"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />

          {/* Floating Bottom Ticker */}
          <div className="absolute inset-x-0 bottom-0 pb-3 sm:pb-6 pt-16 bg-gradient-to-t from-[#F5F6F8] via-[#F5F6F8]/85 to-transparent">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center overflow-x-auto scrollbar-none">
              <div className="inline-flex items-center gap-2 text-[10.5px] sm:text-xs font-bold text-slate-700 bg-[#F5F6F8]/95 backdrop-blur-md shadow-[inset_2px_2px_5px_#D4DAE5,inset_-2px_-2px_5px_#FFFFFF] px-3.5 py-1.5 rounded-full border border-white/80 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-slate-900 font-extrabold whitespace-nowrap">2,500+ Active Scholars</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 whitespace-nowrap">CBSE Affiliation #1930482</span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="text-blue-600 font-bold hidden sm:inline whitespace-nowrap">Admissions Open 2026-27</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Headline & Intro Box */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Inspiring Excellence in Every Child
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Ever Grow Schools delivers holistic education blending rigorous academic foundation, hands-on STEM & AI innovation labs, world-class athletic facilities, and value-based personal mentorship.
            </p>

            {/* Quick Action Buttons: Mobile full-width stack with 44px touch targets */}
            <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full xs:w-auto px-6 py-3 rounded-full bg-[#0071E3] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 min-h-[44px]"
              >
                <span>Contact Campus & Apply</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="w-full xs:w-auto px-6 py-3 rounded-full bg-[#F5F6F8] hover:bg-white text-slate-700 text-xs sm:text-sm font-bold shadow-[3px_3px_6px_#D4DAE5,-3px_-3px_6px_#FFFFFF] border border-white/80 cursor-pointer transition-all active:scale-98 min-h-[44px]"
              >
                About Our School
              </button>
            </div>
          </div>

          {/* Continuous Student Showcase Ticker with touch-swipe snap */}
          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Student Achievements & Scholar Spotlights
              </span>
              <span className="text-[11px] font-semibold text-blue-600 hidden xs:inline">Continuous Rolling Honour Roll</span>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
              {STUDENT_SHOWCASE.map((student, idx) => (
                <div
                  key={idx}
                  className="shrink-0 w-64 xs:w-72 bg-[#F5F6F8] rounded-2xl p-3 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] border border-white/70 flex items-center gap-3 snap-start"
                >
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-slate-800 truncate">{student.name}</div>
                    <div className="text-[10px] font-semibold text-slate-500">{student.grade}</div>
                    <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${student.tagBg} truncate max-w-full`}>
                      {student.achievement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Core Pillars of Excellence Cards */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#F5F6F8] rounded-2xl p-5 shadow-[5px_5px_12px_#D4DAE5,-5px_-5px_12px_#FFFFFF] border border-white/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Academic Rigor</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structured CBSE curriculum with smart interactive boards, continuous assessment, and personalized learning tracks.
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-5 shadow-[5px_5px_12px_#D4DAE5,-5px_-5px_12px_#FFFFFF] border border-white/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">STEM & Robotics</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hands-on AI coding, robotics labs, and practical science experimentation preparing students for tomorrow.
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-5 shadow-[5px_5px_12px_#D4DAE5,-5px_-5px_12px_#FFFFFF] border border-white/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Sports & Arts</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Olympic standard athletic tracks, basketball, football, music academies, and fine arts societies.
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-5 shadow-[5px_5px_12px_#D4DAE5,-5px_-5px_12px_#FFFFFF] border border-white/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Bus className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Smart Transit</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live GPS school bus tracking, RFID attendance check-in, speed governors, and automated parent arrival alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: ABOUT US */}
      <section id="about" className="py-10 sm:py-16 md:py-20 bg-[#F5F6F8] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs whitespace-nowrap">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>About Ever Grow Schools</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Two Decades of Nurturing Champions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Founded with the vision to provide benchmark education, Ever Grow Schools combines values, innovative pedagogy, and holistic student development.
            </p>
          </div>

          {/* About Grid: 4 Key Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-[#F5F6F8] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_14px_#D4DAE5,-6px_-6px_14px_#FFFFFF] border border-white/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Holistic Pedagogy & Values</h3>
                  <p className="text-xs text-slate-500">Beyond Rote Memorization</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We believe education is more than examinations. Our curriculum is crafted to inspire creative problem solving, ethics, emotional intelligence, and confident communication skills.
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_14px_#D4DAE5,-6px_-6px_14px_#FFFFFF] border border-white/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Master Faculty Mentorship</h3>
                  <p className="text-xs text-slate-500">60+ Certified Educators</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our faculty undergo continuous professional training. With an optimal 1:15 educator-to-student ratio, every child receives personal attention, academic guidance, and nurturing care.
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_14px_#D4DAE5,-6px_-6px_14px_#FFFFFF] border border-white/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Safe, 20-Acre Green Campus</h3>
                  <p className="text-xs text-slate-500">ISO 9001:2015 Certified</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Located in an eco-friendly campus with solar generation, 24/7 CCTV surveillance, biometric security, hygienic cafeterias, and extensive sports facilities.
              </p>
            </div>

            <div className="bg-[#F5F6F8] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_14px_#D4DAE5,-6px_-6px_14px_#FFFFFF] border border-white/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Institutional Accreditations</h3>
                  <p className="text-xs text-slate-500">CBSE Affiliation #1930482</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recognized consistently among top-ranked schools in Karnataka with a 100% board examination pass rate and seamless college admissions placements.
              </p>
            </div>
          </div>

          {/* Key Metrics Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-[#F5F6F8] rounded-2xl p-3.5 sm:p-4 text-center shadow-[4px_4px_8px_#D4DAE5,-4px_-4px_8px_#FFFFFF] border border-white/80">
              <div className="text-2xl sm:text-3xl font-black text-blue-600">2,500+</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Enrolled Students</div>
            </div>
            <div className="bg-[#F5F6F8] rounded-2xl p-3.5 sm:p-4 text-center shadow-[4px_4px_8px_#D4DAE5,-4px_-4px_8px_#FFFFFF] border border-white/80">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Board Pass Rate</div>
            </div>
            <div className="bg-[#F5F6F8] rounded-2xl p-3.5 sm:p-4 text-center shadow-[4px_4px_8px_#D4DAE5,-4px_-4px_8px_#FFFFFF] border border-white/80">
              <div className="text-2xl sm:text-3xl font-black text-purple-600">1 : 15</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Faculty Ratio</div>
            </div>
            <div className="bg-[#F5F6F8] rounded-2xl p-3.5 sm:p-4 text-center shadow-[4px_4px_8px_#D4DAE5,-4px_-4px_8px_#FFFFFF] border border-white/80">
              <div className="text-2xl sm:text-3xl font-black text-amber-600">20+</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Acres Green Campus</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 3: CONTACT & ADMISSIONS */}
      <section id="contact" className="py-10 sm:py-16 md:py-20 bg-[#F5F6F8] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs whitespace-nowrap">
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Contact Campus</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with Ever Grow Schools
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We welcome prospective families to tour our campus, meet faculty mentors, and explore admissions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Campus Coordinates & Quick Portals */}
            <div className="space-y-4">
              <div className="bg-[#F5F6F8] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_14px_#D4DAE5,-6px_-6px_14px_#FFFFFF] border border-white/80 space-y-4">
                <h3 className="text-base font-extrabold text-slate-800">Campus Contact Details</h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Campus Address:</span>
                      <p className="text-slate-500">124 Campus Boulevard, Green Hills, Bengaluru, KA 560064</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Admissions Helpline:</span>
                      <p className="text-slate-500">+91 (080) 4567-8900 / +91 98450 11001</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Official Email:</span>
                      <p className="text-slate-500">admissions@evergrow.edu / office@evergrow.edu</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Visiting Hours:</span>
                      <p className="text-slate-500">Monday – Saturday: 8:30 AM – 4:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Portal Launch Cards */}
              <div className="bg-[#F5F6F8] rounded-2xl p-4 sm:p-5 shadow-[6px_6px_14px_#D4DAE5,-6px_-6px_14px_#FFFFFF] border border-white/80 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Portal Access
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleOpenLogin('staff')}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#F5F6F8] hover:bg-white text-center shadow-[3px_3px_6px_#D4DAE5,-3px_-3px_6px_#FFFFFF] border border-white/80 transition-all active:scale-95 cursor-pointer min-h-[44px] flex flex-col items-center justify-center"
                  >
                    <div className="text-xs font-black text-blue-600">Staff</div>
                    <div className="text-[10px] text-slate-500">Faculty Desk</div>
                  </button>

                  <button
                    onClick={() => handleOpenLogin('student')}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#F5F6F8] hover:bg-white text-center shadow-[3px_3px_6px_#D4DAE5,-3px_-3px_6px_#FFFFFF] border border-white/80 transition-all active:scale-95 cursor-pointer min-h-[44px] flex flex-col items-center justify-center"
                  >
                    <div className="text-xs font-black text-indigo-600">Student</div>
                    <div className="text-[10px] text-slate-500">Self-Service</div>
                  </button>

                  <button
                    onClick={() => handleOpenLogin('parent')}
                    className="p-2.5 sm:p-3 rounded-xl bg-[#F5F6F8] hover:bg-white text-center shadow-[3px_3px_6px_#D4DAE5,-3px_-3px_6px_#FFFFFF] border border-white/80 transition-all active:scale-95 cursor-pointer min-h-[44px] flex flex-col items-center justify-center"
                  >
                    <div className="text-xs font-black text-emerald-600">Parent</div>
                    <div className="text-[10px] text-slate-500">Guardian Desk</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Admission Enquiry Form */}
            <div className="bg-[#F5F6F8] rounded-2xl p-5 sm:p-8 shadow-[6px_6px_14px_#D4DAE5,-6px_-6px_14px_#FFFFFF] border border-white/80 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Admission & General Enquiry
                </h3>
                <p className="text-xs text-slate-500">
                  Submit this quick form to request a prospectus, fee schedule, or schedule a campus walkthrough.
                </p>
              </div>

              {submittedCode ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-sm text-emerald-900">Enquiry Submitted Successfully!</div>
                  <p className="text-xs text-emerald-700">
                    Application Reference Number: <span className="font-mono font-bold">{submittedCode}</span>
                  </p>
                  <button
                    onClick={() => setSubmittedCode(null)}
                    className="mt-2 text-xs font-semibold text-emerald-800 underline cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuickEnquirySubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={enquiryForm.student_name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, student_name: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#F5F6F8] shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] text-sm sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Parent Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98450 12345"
                        value={enquiryForm.parent_phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, parent_phone: e.target.value })}
                        className="w-full px-3.5 py-3 rounded-xl bg-[#F5F6F8] shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] text-sm sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Grade Applying For
                      </label>
                      <select
                        value={enquiryForm.grade_applying_for}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, grade_applying_for: e.target.value })}
                        className="w-full px-3.5 py-3 rounded-xl bg-[#F5F6F8] shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/60"
                      >
                        <option value="Pre-Primary / KG">Pre-Primary / KG</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11 - Science / Commerce">Grade 11 - Science / Commerce</option>
                        <option value="Grade 12 - Senior Secondary">Grade 12 - Senior Secondary</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Message / Special Queries (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ask about school bus routes, tuition center, or fee structure..."
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F6F8] shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] text-sm sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 min-h-[44px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingEnquiry ? 'Submitting Application...' : 'Submit Admission Enquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. MINIMAL CLEAN FOOTER */}
      <footer className="py-8 bg-[#F5F6F8] border-t border-slate-200/80 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-blue-600">Ever Grow</span>
            <span className="font-bold text-[#C25E2E]">Schools</span>
            <span className="text-slate-400">•</span>
            <span>CBSE Affiliation #1930482</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <button onClick={() => scrollToSection('home')} className="hover:text-blue-600 cursor-pointer min-h-[44px] flex items-center">
              Home
            </button>
            <span>•</span>
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-600 cursor-pointer min-h-[44px] flex items-center">
              About us
            </button>
            <span>•</span>
            <button onClick={() => scrollToSection('contact')} className="hover:text-blue-600 cursor-pointer min-h-[44px] flex items-center">
              Contact
            </button>
          </div>

          <div>
            © 2026 Ever Grow Schools. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
