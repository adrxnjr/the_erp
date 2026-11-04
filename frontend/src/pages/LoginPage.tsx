import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
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
  Bus,
} from 'lucide-react';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { AnimatedLogo } from '../components/AnimatedLogo';

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
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-[#EBEEF2] overflow-y-auto lg:overflow-hidden select-none">
      {/* ─────────────────────────────────────────────────────────────
          LEFT SIDE: BRAND ARTWORK & INSTITUTIONAL DESIGN PANEL
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[48%] h-full max-h-screen relative flex flex-col justify-between p-5 lg:p-7 xl:p-9 overflow-hidden bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/70 border-b lg:border-b-0 lg:border-r border-slate-200/80">
        {/* Decorative Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Quick Return Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-[#0071E3] transition-colors py-1.5 px-3.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Return to School Website</span>
          </Link>
        </div>

        {/* Center: Brand Showcase & Animated Logo */}
        <div className="relative z-10 my-auto py-2 xl:py-4 space-y-4 xl:space-y-6 max-w-lg">
          {/* Animated Logo */}
          <div className="flex justify-center lg:justify-start">
            <AnimatedLogo className="w-full max-w-[260px] sm:max-w-[300px] xl:max-w-[340px]" idPrefix="login-left" />
          </div>

          {/* Core Institutional Typography */}
          <div className="space-y-2 xl:space-y-3">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Empowering Future Leaders with Smart Governance
            </h1>
            <p className="text-xs xl:text-sm text-slate-600 leading-relaxed">
              Welcome to the official Ever Grow Schools management portal. Access academic records,
              grading, attendance registers, bus GPS tracking, and school communications.
            </p>
          </div>

          {/* Quick Institutional Highlights */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs space-y-0.5">
              <div className="flex items-center space-x-1.5 text-[#0071E3]">
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="text-xs font-black text-slate-900">2,500+ Students</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Holistic CBSE & State Curriculum</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs space-y-0.5">
              <div className="flex items-center space-x-1.5 text-emerald-600">
                <Bus className="w-3.5 h-3.5" />
                <span className="text-xs font-black text-slate-900">24 Smart Fleets</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Live GPS Student Transit Safety</p>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Accreditation */}
        <div className="relative z-10 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-medium gap-1.5">
          <span>CBSE Affiliation No: 1930482</span>
          <span>•</span>
          <span>ISO 9001:2025 Certified Campus</span>
          <span>•</span>
          <span>Ever Grow International</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT SIDE: NEUMORPHIC PILL FORM (EXACT MATCH TO REFERENCE DESIGN)
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[52%] h-full max-h-screen flex flex-col justify-between p-5 lg:p-7 xl:p-9 bg-[#EBEEF2] overflow-hidden">
        {/* Main Form Body - Neumorphic Pill Design */}
        <div className="w-full max-w-sm xl:max-w-md mx-auto my-auto space-y-4 xl:space-y-4.5">
          {/* Neumorphic Segmented Portal Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#EBEEF2] rounded-full shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF]">
            <button
              type="button"
              onClick={() => {
                setPortalType('staff');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                portalType === 'staff'
                  ? 'bg-[#EBEEF2] text-slate-800 shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Staff / Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType('student');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                portalType === 'student'
                  ? 'bg-[#EBEEF2] text-slate-800 shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalType('parent');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                portalType === 'parent'
                  ? 'bg-[#EBEEF2] text-slate-800 shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Parent</span>
            </button>
          </div>

          {/* In-Page Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-shake shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Credential Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 xl:space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    portalType === 'staff'
                      ? 'User name (e.g. adrin)'
                      : portalType === 'student'
                      ? 'Admission number or username'
                      : 'Parent phone or username'
                  }
                  className="w-full pl-11 pr-5 py-3 bg-[#EBEEF2] rounded-full text-xs sm:text-sm text-slate-700 placeholder-slate-400 shadow-[inset_4px_4px_8px_#C8D0DC,inset_-4px_-4px_8px_#FFFFFF] focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all font-medium border-none"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-11 pr-11 py-3 bg-[#EBEEF2] rounded-full text-xs sm:text-sm text-slate-700 placeholder-slate-400 shadow-[inset_4px_4px_8px_#C8D0DC,inset_-4px_-4px_8px_#FFFFFF] focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all font-mono border-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-2 pt-0.5">
              <label className="flex items-center space-x-1.5 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-slate-600 focus:ring-0 border-slate-300"
                />
                <span className="text-[11px] font-medium text-slate-500">Keep me signed in</span>
              </label>

              <div className="flex items-center space-x-2">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('To reset your credentials, please contact the campus IT Helpdesk or Administrator.');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                >
                  Forgot password?
                </a>
                <span className="text-slate-300">•</span>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>SSL</span>
                </div>
              </div>
            </div>

            {/* Neumorphic Pill Submit Button (Matching Reference Image) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-[#EBEEF2] text-slate-600 hover:text-slate-900 font-bold text-sm tracking-wide shadow-[5px_5px_12px_#C8D0DC,-5px_-5px_12px_#FFFFFF] hover:shadow-[6px_6px_14px_#C0CAD8,-6px_-6px_14px_#FFFFFF] active:shadow-[inset_3px_3px_6px_#C8D0DC,inset_-3px_-3px_6px_#FFFFFF] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer border-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {portalType === 'staff'
                      ? 'Sign In to Staff Desk'
                      : portalType === 'student'
                      ? 'Sign In to Student Portal'
                      : 'Sign In to Parent Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Badges - Styled as Soft Neumorphic Cards */}
          <div className="pt-2 border-t border-slate-300/50 space-y-2">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-1">
              Quick Demo Logins (One-Click Testing):
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('adrin', '123', 'staff')}
                className="p-2 xl:p-2.5 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_9px_#C0CAD8,-4px_-4px_9px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] text-left transition-all flex items-center space-x-2 cursor-pointer border-none"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></div>
                <div className="truncate">
                  <strong className="text-slate-800 block leading-tight text-[11px]">Super Admin</strong>
                  <span className="text-[10px] text-slate-500 font-mono">adrin / 123</span>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('staff3', '123', 'staff')}
                className="p-2 xl:p-2.5 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_9px_#C0CAD8,-4px_-4px_9px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] text-left transition-all flex items-center space-x-2 cursor-pointer border-none"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></div>
                <div className="truncate">
                  <strong className="text-slate-800 block leading-tight text-[11px]">Teacher</strong>
                  <span className="text-[10px] text-slate-500 font-mono">staff3 / 123</span>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('parent1', '123', 'parent')}
                className="p-2 xl:p-2.5 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_9px_#C0CAD8,-4px_-4px_9px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] text-left transition-all flex items-center space-x-2 cursor-pointer border-none"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></div>
                <div className="truncate">
                  <strong className="text-slate-800 block leading-tight text-[11px]">Parent</strong>
                  <span className="text-[10px] text-slate-500 font-mono">parent1 / 123</span>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin('student1', '123', 'student')}
                className="p-2 xl:p-2.5 rounded-2xl bg-[#EBEEF2] shadow-[3px_3px_7px_#C8D0DC,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_9px_#C0CAD8,-4px_-4px_9px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C8D0DC,inset_-2px_-2px_4px_#FFFFFF] text-left transition-all flex items-center space-x-2 cursor-pointer border-none"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0"></div>
                <div className="truncate">
                  <strong className="text-slate-800 block leading-tight text-[11px]">Student</strong>
                  <span className="text-[10px] text-slate-500 font-mono">student1 / 123</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Flat Bottom Security Assurance Footer */}
        <div className="w-full pt-2 border-t border-slate-300/40 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ever Grow Institutional Security</span>
          </div>
          <span className="text-slate-400">Version 2.4.0-LTS</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
