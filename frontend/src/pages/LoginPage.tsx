import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  X,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Users,
  Briefcase,
  CheckCircle2,
  BookOpen,
  Award,
  Bus,
  School,
  Globe,
} from 'lucide-react';
import { WelcomeScreen } from '../components/WelcomeScreen';
import logoImg from '../assets/logo.png';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read initial portal type from query parameters e.g. /login?portal=student
  const searchParams = new URLSearchParams(location.search);
  const portalParam = searchParams.get('portal');
  const initialPortal: 'staff' | 'student' | 'parent' =
    portalParam === 'student' || portalParam === 'parent' ? portalParam : 'staff';

  const [portalType, setPortalType] = useState<'staff' | 'student' | 'parent'>(initialPortal);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('Ever Grow Schools');

  useEffect(() => {
    document.title = 'Institutional Portal Sign In — Ever Grow Schools';
  }, []);

  useEffect(() => {
    if (portalParam === 'student' || portalParam === 'parent' || portalParam === 'staff') {
      setPortalType(portalParam);
    }
  }, [portalParam]);

  const handleSubmit = async (
    e?: React.FormEvent,
    customCredentials?: { u: string; p: string; portal: 'staff' | 'student' | 'parent' }
  ) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const userToLogin = customCredentials ? customCredentials.u : username;
    const passToLogin = customCredentials ? customCredentials.p : password;
    const portalToLogin = customCredentials ? customCredentials.portal : portalType;

    if (!userToLogin.trim()) {
      setError('Please enter your username, admission number, or employee ID.');
      setLoading(false);
      return;
    }

    if (!passToLogin) {
      setError('Please enter your account password.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', {
        portal_type: portalToLogin,
        username: userToLogin.trim(),
        password: passToLogin,
      });

      const { access_token, refresh_token, user_id, full_name, roles } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      let profile = {
        id: user_id || res.data.id,
        username: res.data.username || userToLogin.trim(),
        email: res.data.email || null,
        full_name: full_name || res.data.username || userToLogin.trim(),
        portal_type: res.data.portal_type || portalToLogin,
        roles: roles || [portalToLogin],
      };

      try {
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (meRes.data && meRes.data.id) {
          profile = {
            id: meRes.data.id,
            username: meRes.data.username,
            email: meRes.data.email,
            full_name: meRes.data.full_name,
            portal_type: meRes.data.portal_type,
            roles: meRes.data.roles,
          };
        }
      } catch {
        // Fallback already prepared from /auth/login payload
      }

      login(access_token, refresh_token, profile);

      const portalLabel =
        portalToLogin === 'parent'
          ? 'Parent Guardian Desk'
          : portalToLogin === 'student'
          ? 'Student Learning Portal'
          : 'Faculty & Administrative Desk';
      setWelcomeSubtitle(`${portalLabel} — Ever Grow Schools`);
      setShowWelcome(true);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Authentication failed. Please verify your credentials or portal selection.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (u: string, p: string, portal: 'staff' | 'student' | 'parent') => {
    setUsername(u);
    setPassword(p);
    setPortalType(portal);
    handleSubmit(undefined, { u, p, portal });
  };

  if (showWelcome) {
    return (
      <WelcomeScreen
        schoolName={welcomeSubtitle}
        onComplete={() => {
          navigate('/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* ─────────────────────────────────────────────────────────────
          LEFT SIDE: BRAND ARTWORK & INSTITUTIONAL DESIGN PANEL
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[48%] min-h-[380px] lg:min-h-screen relative flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/70 border-b lg:border-b-0 lg:border-r border-slate-200/80">
        {/* Decorative Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Badge & Quick Return Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#0071E3] transition-colors py-1 px-3 rounded-full bg-white/80 border border-slate-200/80 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Return to School Website</span>
          </Link>

          <div className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-white/70 px-3 py-1 rounded-full border border-slate-200/60 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure Enterprise Node</span>
          </div>
        </div>

        {/* Center: Artistic Illustration & Brand Showcase */}
        <div className="relative z-10 my-auto py-8 sm:py-12 space-y-8 max-w-lg">
          {/* Stylized Botanical & Brand Graphic */}
          <div className="relative">
            {/* SVG Organic Foliage & Growth Silhouette Graphic */}
            <svg
              className="w-full max-w-[320px] sm:max-w-[380px] h-auto drop-shadow-md mx-auto lg:mx-0"
              viewBox="0 0 400 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0071E3" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="leafGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="leafGrad3" x1="0%" y1="50%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="leafGrad4" x1="50%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Layered Organic Foliage Curves Inspired by School Logo */}
              <path
                d="M40 220 C60 120, 160 80, 260 90 C320 95, 360 140, 380 220 Z"
                fill="url(#leafGrad1)"
              />
              <path
                d="M70 220 C90 140, 180 110, 280 120 C330 125, 360 170, 370 220 Z"
                fill="#FFFFFF"
                fillOpacity="0.6"
              />
              <path
                d="M10 220 C40 100, 140 40, 230 60 C300 75, 320 150, 330 220 Z"
                fill="url(#leafGrad2)"
              />
              <path
                d="M110 220 C140 130, 220 90, 300 110 C340 120, 360 170, 370 220 Z"
                fill="url(#leafGrad3)"
              />
              <path
                d="M150 220 C180 150, 240 120, 310 135 C340 145, 360 185, 365 220 Z"
                fill="url(#leafGrad4)"
              />

              {/* Central Stylized Emblem Card */}
              <rect
                x="135"
                y="30"
                width="130"
                height="130"
                rx="32"
                fill="#FFFFFF"
                fillOpacity="0.95"
                stroke="#E2E8F0"
                strokeWidth="1.5"
                filter="drop-shadow(0 10px 20px rgba(0, 113, 227, 0.12))"
              />
            </svg>

            {/* Centered Brand Emblem over SVG */}
            <div className="absolute top-[38px] left-[143px] w-[114px] h-[114px] flex items-center justify-center pointer-events-none">
              <img
                src={logoImg}
                alt="Ever Grow Schools Logo"
                className="w-20 h-20 object-contain drop-shadow-sm animate-pulse-slow"
              />
            </div>
          </div>

          {/* Core Institutional Typography */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/70 text-[#0071E3] text-xs font-black uppercase tracking-wider border border-blue-200/60">
              <School className="w-3.5 h-3.5" />
              <span>Institutional Campus Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Empowering Future Leaders with Smart Governance
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Welcome to the official Ever Grow Schools management portal. Access academic records,
              grading, attendance registers, bus GPS tracking, and school communications.
            </p>
          </div>

          {/* Quick Institutional Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center space-x-2 text-[#0071E3]">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-black text-slate-900">2,500+ Students</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Holistic CBSE & State Curriculum</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center space-x-2 text-emerald-600">
                <Bus className="w-4 h-4" />
                <span className="text-xs font-black text-slate-900">24 Smart Fleets</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Live GPS Student Transit Safety</p>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Accreditation */}
        <div className="relative z-10 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium gap-2">
          <span>CBSE Affiliation No: 1930482</span>
          <span>•</span>
          <span>ISO 9001:2025 Certified Campus</span>
          <span>•</span>
          <span>Ever Grow International</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT SIDE: THE EXACT POPUP LOGIN BOX PRESERVED AS FULL-PAGE
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[52%] flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative min-h-screen bg-slate-50/50">
        {/* Subtle return button on top right for quick navigation */}
        <div className="w-full max-w-md flex justify-end mb-4">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center space-x-1"
          >
            <span>Exit to Website</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ─── THE EXACT BOX CONTAINER (Identical styling & details) ─── */}
        <div
          className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative"
          role="dialog"
          aria-labelledby="login-form-title"
        >
          {/* Top Header Bar */}
          <div className="bg-[#F8FAFC] border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <img src={logoImg} alt="Ever Grow Schools Logo" className="w-8 h-8 object-contain" />
              <div>
                <h2 id="login-form-title" className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Ever Grow Schools Portal
                </h2>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Institutional Sign In
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              aria-label="Return to home"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-7 space-y-5">
            {/* Rectangular Segmented Portal Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setPortalType('staff');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  portalType === 'staff'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Staff / Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPortalType('student');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  portalType === 'student'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPortalType('parent');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  portalType === 'parent'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Parent</span>
              </button>
            </div>

            {/* In-Card Error Banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            {/* Credential Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {portalType === 'staff'
                    ? 'Employee ID / Staff Username'
                    : portalType === 'student'
                    ? 'Admission Number / Student ID'
                    : 'Registered Parent Email / Phone / ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      portalType === 'staff'
                        ? 'e.g. adrin or staff1'
                        : portalType === 'student'
                        ? 'e.g. student1 or ADM-2026-0001'
                        : 'e.g. parent1 or parent phone'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Account Password</label>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      setError('To reset your credentials, please contact the campus IT Helpdesk or Administrator.');
                    }}
                    className="text-[11px] text-[#0071E3] font-semibold hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#0071E3] focus:ring-[#0071E3] border-slate-300"
                  />
                  <span className="text-[11px] font-medium">Keep me signed in</span>
                </label>
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* Rectangular Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062C4] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Sign In to{' '}
                      {portalType === 'staff'
                        ? 'Staff Desk'
                        : portalType === 'student'
                        ? 'Student Portal'
                        : 'Parent Portal'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins Badges */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Quick Demo Logins (One-Click Testing):
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('adrin', '123', 'staff')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <div className="truncate">
                    <strong className="text-slate-900 block leading-tight">Super Admin</strong>
                    <span className="text-[10px] text-slate-500 font-mono">adrin / 123</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('staff3', '123', 'staff')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="truncate">
                    <strong className="text-slate-900 block leading-tight">Teacher</strong>
                    <span className="text-[10px] text-slate-500 font-mono">staff3 / 123</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('parent1', '123', 'parent')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  <div className="truncate">
                    <strong className="text-slate-900 block leading-tight">Parent</strong>
                    <span className="text-[10px] text-slate-500 font-mono">parent1 / 123</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('student1', '123', 'student')}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  <div className="truncate">
                    <strong className="text-slate-900 block leading-tight">Student</strong>
                    <span className="text-[10px] text-slate-500 font-mono">student1 / 123</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Security Assurance */}
          <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-2.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ever Grow Institutional Security</span>
            </div>
            <span className="text-slate-400">Version 2.4.0-LTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
