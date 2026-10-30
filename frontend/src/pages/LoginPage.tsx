import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { resolveApiBaseUrl } from '../api/client';
import {
  School,
  ShieldAlert,
  KeyRound,
  User,
  Server,
  Globe,
  CheckCircle2,
  X,
  Zap,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Users,
} from 'lucide-react';
import { WelcomeScreen } from '../components/WelcomeScreen';
import logoImg from '../assets/logo.png';

export const LoginPage: React.FC = () => {
  const [portalType, setPortalType] = useState<'staff' | 'parent' | 'student'>('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('Ever Grow Schools');

  // Server Endpoint Configuration State (for multi-computer / cloud deployment)
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => localStorage.getItem('EVERGROW_API_URL') || '');
  const [serverSaved, setServerSaved] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        portal_type: portalType,
        username,
        password,
      });

      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      login(access_token, refresh_token, meRes.data);

      const portalLabel =
        portalType === 'parent'
          ? 'Parent Guardian Portal — Ever Grow Schools'
          : portalType === 'student'
          ? 'Student Portal — Ever Grow Schools'
          : 'Staff Campus — Ever Grow Schools';
      setWelcomeSubtitle(portalLabel);
      setShowWelcome(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Authentication failed. Verify credentials or portal selection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInstantLogin = async (
    targetPortal: 'staff' | 'parent' | 'student',
    targetUser: string,
    targetPass: string = '123'
  ) => {
    setPortalType(targetPortal);
    setUsername(targetUser);
    setPassword(targetPass);
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        portal_type: targetPortal,
        username: targetUser,
        password: targetPass,
      });

      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      login(access_token, refresh_token, meRes.data);

      const portalLabel =
        targetPortal === 'parent'
          ? 'Parent Guardian Portal — Ever Grow Schools'
          : targetPortal === 'student'
          ? 'Student Portal — Ever Grow Schools'
          : 'Staff Campus — Ever Grow Schools';
      setWelcomeSubtitle(portalLabel);
      setShowWelcome(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Instant authentication failed. Please verify credentials or backend status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrlInput.trim()) {
      localStorage.removeItem('EVERGROW_API_URL');
    } else {
      let cleaned = serverUrlInput.trim();
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        cleaned = 'https://' + cleaned;
      }
      localStorage.setItem('EVERGROW_API_URL', cleaned);
    }
    setServerSaved(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
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

  const currentEndpoint = resolveApiBaseUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FB] via-[#EEF2F8] to-[#E3EBF6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[30px] shadow-[0_20px_60px_rgba(0,113,227,0.08)] border border-white/80 overflow-hidden">
        {/* Header */}
        <div className="p-7 text-center bg-gradient-to-b from-slate-50/80 to-white/90 border-b border-black/[0.05]">
          <div className="flex justify-center mb-2">
            <img
              src={logoImg}
              alt="Ever Grow Schools Logo"
              className="h-20 max-w-[280px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform hover:scale-105 duration-300"
            />
          </div>
          <p className="text-xs text-[#86868B] mt-0.5 font-medium">Enterprise Campus Management Platform</p>

          {/* iOS Segmented Pill Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black/[0.05] p-1 rounded-full mt-6">
            {(['staff', 'parent', 'student'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPortalType(p);
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-full capitalize transition-all duration-200 ${
                  portalType === p
                    ? 'bg-white text-[#0071E3] shadow-xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-[#FF2D55] text-xs font-medium rounded-[14px] flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
              {portalType === 'student'
                ? 'Registration Number or Username'
                : portalType === 'parent'
                ? 'Parent Phone Number or Username'
                : 'Username, Email, or Phone Number'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#86868B] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  portalType === 'student'
                    ? 'e.g. 1 to 10 or student1'
                    : portalType === 'parent'
                    ? 'e.g. 1111111111 to 5555555555'
                    : 'e.g. adrin, staff1, or 6666666666'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all placeholder-[#86868B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#86868B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-black/[0.08] rounded-[14px] text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all placeholder-[#86868B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ios-gloss-btn w-full mt-2 py-3 text-sm disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Sign In to {portalType} portal</span>
            )}
          </button>

          {/* Instant 1-Click Role Switcher */}
          <div className="pt-4 border-t border-black/[0.05] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Instant 1-Click Login</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Select Any Role</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleInstantLogin('student', 'student1', '123')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100 transition-all text-left flex flex-col justify-between active:scale-[0.98] shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Student</span>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="font-bold text-slate-800 text-xs mt-1">Student 1</span>
                <span className="text-[10px] text-emerald-700 font-mono">student1 / 123</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantLogin('staff', 'adrin', '123')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 hover:bg-purple-100 transition-all text-left flex flex-col justify-between active:scale-[0.98] shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Super Admin</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="font-bold text-slate-800 text-xs mt-1">Trustee Adrin</span>
                <span className="text-[10px] text-purple-700 font-mono">adrin / 123</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantLogin('staff', 'staff1', '123')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 hover:bg-indigo-100 transition-all text-left flex flex-col justify-between active:scale-[0.98] shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Principal</span>
                  <School className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="font-bold text-slate-800 text-xs mt-1">Dr. Rajesh V</span>
                <span className="text-[10px] text-indigo-700 font-mono">staff1 / 123</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantLogin('staff', 'staff3', '123')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 hover:bg-blue-100 transition-all text-left flex flex-col justify-between active:scale-[0.98] shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Faculty</span>
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="font-bold text-slate-800 text-xs mt-1">Maths Faculty</span>
                <span className="text-[10px] text-blue-700 font-mono">staff3 / 123</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleInstantLogin('parent', 'parent1', '123')}
              disabled={loading}
              className="w-full p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 hover:bg-amber-100 transition-all text-left flex items-center justify-between active:scale-[0.98] shadow-2xs"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Parent Guardian</span>
                  <span className="text-[10px] text-amber-800 font-mono">parent1 / 123</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Parent Portal &rarr;
              </span>
            </button>
          </div>

          <div className="pt-3 text-center border-t border-black/[0.05] space-y-2">
            <div>
              <Link
                to="/admission-enquiry"
                className="text-xs text-[#0071E3] hover:text-[#5856D6] font-semibold transition-colors"
              >
                Prospective Student? Submit Admission Enquiry &rarr;
              </Link>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowServerModal(true)}
                className="text-[11px] text-[#86868B] hover:text-[#0071E3] transition-colors inline-flex items-center space-x-1"
                title={`Current API Target: ${currentEndpoint}`}
              >
                <Server className="w-3 h-3 text-[#0071E3]" />
                <span>Server Endpoint: <span className="font-mono text-[10px] text-slate-600">{currentEndpoint.replace('http://', '').replace('https://', '')}</span></span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Server Endpoint Configuration Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ios-modal rounded-[30px] shadow-2xl max-w-sm w-full p-6 border border-white/80 relative">
            <button
              onClick={() => setShowServerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Server Endpoint</h3>
                <p className="text-xs text-slate-500">Connect to online school backend</p>
              </div>
            </div>

            {serverSaved && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Endpoint updated! Reloading application...</span>
              </div>
            )}

            <form onSubmit={handleSaveServer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  HTTPS Backend Server URL
                </label>
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="https://api.evergrowschools.com/api/v1"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave empty to restore default environment endpoint ({currentEndpoint}).
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="ios-gloss-btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ios-gloss-btn flex-1 py-2 text-xs"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
