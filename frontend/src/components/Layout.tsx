import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { Menu, WifiOff, ShieldCheck, RefreshCw, X, LogOut } from 'lucide-react';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { activeLogo, schoolName } = useBranding();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [isServerOffline, setIsServerOffline] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [offlineMessage, setOfflineMessage] = useState<string>('Server is currently unreachable. Reconnecting to Ever Grow campus network...');

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Network / Server connection listener
  useEffect(() => {
    const handleStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOffline: boolean; message?: string }>;
      setIsServerOffline(Boolean(customEvent.detail?.isOffline));
      if (customEvent.detail?.message) {
        setOfflineMessage(customEvent.detail.message);
      }
    };

    const handleWindowOffline = () => {
      setIsServerOffline(true);
      setOfflineMessage('No Internet Connection. You are currently working offline.');
    };

    const handleWindowOnline = () => {
      setIsServerOffline(false);
    };

    window.addEventListener('evergrow:server-status', handleStatus);
    window.addEventListener('offline', handleWindowOffline);
    window.addEventListener('online', handleWindowOnline);

    return () => {
      window.removeEventListener('evergrow:server-status', handleStatus);
      window.removeEventListener('offline', handleWindowOffline);
      window.removeEventListener('online', handleWindowOnline);
    };
  }, []);

  return (
    <div className="min-h-screen min-h-dvh bg-[#F5F6F8] flex flex-col antialiased selection:bg-[#0066FF] selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Sticky Server-Down / Offline Banner */}
      {isServerOffline && !bannerDismissed && (
        <aside
          role="alert"
          aria-live="polite"
          className="sticky top-0 z-[60] w-full bg-rose-600 text-white px-3 sm:px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-fadeIn"
        >
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-rose-200" />
            <span className="truncate">{offlineMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.location.reload()}
              aria-label="Retry connection"
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss offline banner"
              className="p-1 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Drawer Backdrop (< 1024px) */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
        />
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col w-full max-w-full min-w-0 lg:pl-60">
        <Sidebar mobileOpen={mobileDrawerOpen} onCloseMobile={() => setMobileDrawerOpen(false)} />

        {/* Sticky Top Header on scroll (Mobile & Desktop) */}
        <header className="sticky top-0 z-40 bg-[#F5F6F8]/95 backdrop-blur-md border-b border-white/80 px-3.5 sm:px-6 py-2.5 flex items-center justify-between shadow-xs w-full shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-2xl bg-[#F5F6F8] text-slate-700 hover:text-blue-600 border border-white/80 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] transition shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src={activeLogo} alt={`${schoolName} Logo`} className="h-8 max-w-[130px] w-auto object-contain shrink-0" />
              <span className="font-black text-slate-900 text-sm tracking-tight truncate">{schoolName}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F6F8] border border-white/80 shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="truncate max-w-[150px]">{user.full_name || user.username}</span>
              </div>
            )}
            <button
              onClick={logout}
              aria-label="Log Out"
              title="Log Out"
              className="px-3 py-2 min-h-[40px] rounded-xl bg-[#F5F6F8] hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-white/80 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden xs:inline">Log Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-6 max-w-7xl mx-auto w-full min-h-[calc(100vh-60px)] lg:min-h-screen overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
