import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, School } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/75 backdrop-blur-2xl border-b border-black/[0.06] sticky top-0 z-30 flex items-center justify-between px-6 transition-all">
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-3">
          <img src={logoImg} alt="Ever Grow Schools Logo" className="h-12 w-auto max-w-[200px] object-contain drop-shadow-xs" />
          <div className="flex items-center space-x-2">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-blue-500/10 text-[#0071E3] rounded-full border border-blue-500/20">
              <span>
                {user?.portal_type === 'parent'
                  ? 'Parent Portal'
                  : user?.portal_type === 'student'
                  ? 'Student Portal'
                  : 'Staff Campus'}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3.5">
        {user && (
          <div className="flex items-center space-x-3 pr-3 border-r border-black/[0.08]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs border border-black/[0.08] shadow-inner">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[13px] font-semibold text-[#1D1D1F] leading-tight">
                {user.full_name}
              </div>
              <div className="text-[11px] text-[#86868B] flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{user.roles.join(', ') || 'Authorized User'}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#86868B] hover:text-[#FF2D55] hover:bg-rose-50/80 rounded-full transition-all border border-black/[0.06] hover:border-rose-200 active:scale-95 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
