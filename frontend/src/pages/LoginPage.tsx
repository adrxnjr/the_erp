import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Layers,
} from 'lucide-react';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { AnimatedLogo } from '../components/AnimatedLogo';
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

  useEffect(() => {
    document.title = 'Secure Portal Sign In — Ever Grow Schools ERP';
  }, []);
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

      const { access_token, refresh_token, user_id, full_name, roles } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Build profile from login response
      let profile = {
        id: user_id || res.data.id,
        username: res.data.username || username,
        email: res.data.email || null,
        full_name: full_name || res.data.username || username,
        portal_type: res.data.portal_type || portalType,
        roles: roles || [portalType],
      };

      // Best-effort full profile enrichment from /auth/me
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
        portalType === 'parent'
          ? 'Parent Guardian Portal — Ever Grow Schools'
          : portalType === 'student'
          ? 'Student Portal — Ever Grow Schools'
          : 'Staff Campus — Ever Grow Schools';
      setWelcomeSubtitle(portalLabel);
      setShowWelcome(true);
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.response?.data?.detail;
      setError(
        serverMsg ||
        (!err.response || err.message === 'Network Error'
          ? 'Cannot reach backend server. Please ensure the backend is running on http://127.0.0.1:8000.'
          : 'Authentication failed. Verify credentials or portal selection.')
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

      const { access_token, refresh_token, user_id, full_name, roles } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Build profile from login response
      let profile = {
        id: user_id || res.data.id,
        username: res.data.username || targetUser,
        email: res.data.email || null,
        full_name: full_name || res.data.username || targetUser,
        portal_type: res.data.portal_type || targetPortal,
        roles: roles || [targetPortal],
      };

      // Best-effort full profile enrichment from /auth/me
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
        targetPortal === 'parent'
          ? 'Parent Guardian Portal — Ever Grow Schools'
          : targetPortal === 'student'
          ? 'Student Portal — Ever Grow Schools'
          : 'Staff Campus — Ever Grow Schools';
      setWelcomeSubtitle(portalLabel);
      setShowWelcome(true);
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.response?.data?.detail;
      setError(
        serverMsg ||
        (!err.response || err.message === 'Network Error'
          ? 'Cannot reach backend server. Please ensure the backend is running on http://127.0.0.1:8000.'
          : 'Instant authentication failed. Please verify credentials or backend status.')
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
    <div className="min-h-screen w-full bg-[#E9EEF5] relative flex flex-col justify-center items-center px-4 py-8 select-none">
      {/* Center: Main Login Interface */}
      <div className="w-full max-w-xl mx-auto my-auto space-y-6 z-10">
        {/* Logo & Platform Header */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <AnimatedLogo className="w-full max-w-[380px] sm:max-w-[430px]" />
          </div>

          {/* Neumorphic Segmented Pill Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#E9EEF5] p-1.5 rounded-full shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] border border-white/40 max-w-md mx-auto">
            {(['staff', 'parent', 'student'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPortalType(p);
                  setError(null);
                }}
                className={`py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-full capitalize transition-all duration-200 ${
                  portalType === p
                    ? 'bg-[#E9EEF5] text-[#0066FF] shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] border border-white/60'
                    : 'text-slate-500 hover:text-slate-900 border border-transparent'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#FF2D55] text-xs sm:text-sm font-medium rounded-xl shadow-[inset_2px_2px_4px_#fecdd3] flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              {portalType === 'student'
                ? 'Registration Number or Username'
                : portalType === 'parent'
                ? 'Phone Number or Username'
                : 'Username or Email'}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  portalType === 'student'
                    ? 'Enter registration number or username'
                    : portalType === 'parent'
                    ? 'Enter phone number or username'
                    : 'Enter username or email'
                }
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-[#E9EEF5] border border-white/50 rounded-2xl text-sm sm:text-base text-slate-800 placeholder-slate-400 shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 sm:top-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-[#E9EEF5] border border-white/50 rounded-2xl text-sm sm:text-base text-slate-800 placeholder-slate-400 shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-2xl shadow-[5px_5px_14px_rgba(0,102,255,0.35),-3px_-3px_8px_#FFFFFF] hover:shadow-[7px_7px_18px_rgba(0,102,255,0.45),-4px_-4px_10px_#FFFFFF] active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>

      {/* Right: Small Instant 1-Click Login Widget */}
      <div className="w-full max-w-sm lg:w-72 xl:w-80 lg:fixed lg:right-6 xl:right-10 lg:top-1/2 lg:-translate-y-1/2 mt-8 lg:mt-0 z-20">
        <div className="p-4 rounded-3xl bg-[#E9EEF5] shadow-[6px_6px_16px_#C5D0E0,-6px_-6px_16px_#FFFFFF] border border-white/70 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-300/50">
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-800">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Instant</span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">Test Roles</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleInstantLogin('student', 'student1', '123')}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#E9EEF5] border border-white/60 shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_10px_#BAC6D8,-4px_-4px_10px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C5D0E0] transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Student</span>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="font-bold text-slate-800 text-xs sm:text-[13px] mt-1">Student 1</span>
              <span className="text-[10px] text-emerald-700 font-mono">student1 / 123</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantLogin('staff', 'adrin', '123')}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#E9EEF5] border border-white/60 shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_10px_#BAC6D8,-4px_-4px_10px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C5D0E0] transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Super Admin</span>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="font-bold text-slate-800 text-xs sm:text-[13px] mt-1">Trustee Adrin</span>
              <span className="text-[10px] text-purple-700 font-mono">adrin / 123</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantLogin('staff', 'staff1', '123')}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#E9EEF5] border border-white/60 shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_10px_#BAC6D8,-4px_-4px_10px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C5D0E0] transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Principal</span>
                <School className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="font-bold text-slate-800 text-xs sm:text-[13px] mt-1">Dr. Rajesh V</span>
              <span className="text-[10px] text-indigo-700 font-mono">staff1 / 123</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantLogin('staff', 'staff3', '123')}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#E9EEF5] border border-white/60 shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_10px_#BAC6D8,-4px_-4px_10px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C5D0E0] transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Faculty</span>
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="font-bold text-slate-800 text-xs sm:text-[13px] mt-1">Maths Faculty</span>
              <span className="text-[10px] text-blue-700 font-mono">staff3 / 123</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantLogin('staff', 'coordinator1', '123')}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#E9EEF5] border border-white/60 shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_10px_#BAC6D8,-4px_-4px_10px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C5D0E0] transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Coordinator</span>
                <Layers className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <span className="font-bold text-slate-800 text-xs sm:text-[13px] mt-1">Elena Rostova</span>
              <span className="text-[10px] text-teal-700 font-mono">coordinator1 / 123</span>
            </button>

            <button
              type="button"
              onClick={() => handleInstantLogin('parent', 'parent1', '123')}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#E9EEF5] border border-white/60 shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] hover:shadow-[4px_4px_10px_#BAC6D8,-4px_-4px_10px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C5D0E0] transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Parent</span>
                <Users className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="font-bold text-slate-800 text-xs sm:text-[13px] mt-1">Parent Guardian</span>
              <span className="text-[10px] text-amber-700 font-mono">parent1 / 123</span>
            </button>
          </div>
        </div>
      </div>

      {/* Neumorphic Server Endpoint Configuration Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E9EEF5] rounded-3xl shadow-[16px_16px_36px_#BAC6D8,-16px_-16px_36px_#FFFFFF] max-w-sm w-full p-6 border border-white/80 relative">
            <button
              onClick={() => setShowServerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-[#E9EEF5] shadow-[2px_2px_5px_#C5D0E0,-2px_-2px_5px_#FFFFFF] border border-white/60 active:shadow-[inset_2px_2px_4px_#C5D0E0]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E9EEF5] shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] text-[#0066FF] flex items-center justify-center border border-white/70">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Server Endpoint</h3>
                <p className="text-xs text-slate-500">Connect to online school backend</p>
              </div>
            </div>

            {serverSaved && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200 shadow-[inset_2px_2px_4px_#a7f3d0]">
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
                  className="w-full px-3 py-2 text-xs bg-[#E9EEF5] border border-white/60 rounded-xl shadow-[inset_3px_3px_6px_#C5D0E0,inset_-3px_-3px_6px_#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave empty to restore default environment endpoint ({currentEndpoint}).
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#E9EEF5] text-slate-700 border border-white/70 shadow-[3px_3px_7px_#C5D0E0,-3px_-3px_7px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#C5D0E0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#0066FF] text-white shadow-[3px_3px_8px_rgba(0,102,255,0.4),-2px_-2px_6px_#FFFFFF] hover:bg-[#0052CC] active:scale-[0.98]"
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
