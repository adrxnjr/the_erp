import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  X,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Users,
  Briefcase,
  Layers,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPortalType?: 'staff' | 'student' | 'parent';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialPortalType = 'staff',
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [portalType, setPortalType] = useState<'staff' | 'student' | 'parent'>(initialPortalType);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync initial portal type when opened
  useEffect(() => {
    if (isOpen) {
      setPortalType(initialPortalType);
      setError(null);
    }
  }, [isOpen, initialPortalType]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent, customCredentials?: { u: string; p: string; portal: 'staff' | 'student' | 'parent' }) => {
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
      onClose();
      navigate('/');
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Rectangular Modal Container */}
      <div
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Top Header Bar */}
        <div className="bg-[#F8FAFC] border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img src={logoImg} alt="Ever Grow Schools Logo" className="w-8 h-8 object-contain" />
            <div>
              <h2 id="login-modal-title" className="text-sm font-extrabold text-slate-900 tracking-tight">
                Ever Grow Schools Portal
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Institutional Sign In
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
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

          {/* In-Modal Error Banner */}
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
              className="w-full py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062C4] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {portalType === 'staff' ? 'Staff Desk' : portalType === 'student' ? 'Student Portal' : 'Parent Portal'}</span>
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
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5"
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
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5"
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
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5"
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
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center space-x-1.5"
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
  );
};

