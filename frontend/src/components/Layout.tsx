import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { Menu, WifiOff, ShieldCheck, RefreshCw } from 'lucide-react';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeLogo, schoolName } = useBranding();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [isServerOffline, setIsServerOffline] = useState<boolean>(false);
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
<<<<<<< HEAD
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col antialiased selection:bg-[#0066FF] selection:text-white">
=======
    <div className="min-h-screen min-h-dvh bg-[#E9EEF5] flex flex-col antialiased selection:bg-[#0066FF] selection:text-white w-full max-w-full overflow-x-hidden">
>>>>>>> d560d95 (Mobile responsievness fixed)
      {/* Sticky Server-Down / Offline Banner */}
      {isServerOffline && (
        <aside
          role="alert"
          aria-live="polite"
          className="sticky top-0 z-[60] w-full bg-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-fadeIn"
        >
          <div className="flex items-center gap-2.5 mx-auto">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>{offlineMessage}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            aria-label="Retry connection"
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </aside>
      )}

      {/* Mobile Top Navigation Bar (< 768px) */}
<<<<<<< HEAD
      <header className="md:hidden sticky top-0 z-40 bg-[#F5F6F8]/95 backdrop-blur-md border-b border-white/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-2xl bg-[#F5F6F8] text-slate-700 hover:text-blue-600 border border-white/80 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D4DAE5,inset_-2px_-2px_4px_#FFFFFF] transition"
=======
      <header className="md:hidden sticky top-0 z-40 bg-[#E9EEF5]/90 backdrop-blur-md border-b border-white/80 px-3.5 py-2.5 flex items-center justify-between shadow-[0_2px_10px_#C5D0E0] max-w-full overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-2xl bg-[#E9EEF5] text-slate-700 hover:text-blue-600 shadow-[3px_3px_6px_#C5D0E0,-3px_-3px_6px_#FFFFFF] active:scale-95 transition shrink-0"
>>>>>>> d560d95 (Mobile responsievness fixed)
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src={activeLogo} alt={`${schoolName} Logo`} className="h-7 w-auto object-contain shrink-0" />
            <span className="font-black text-slate-900 text-sm tracking-tight truncate">{schoolName}</span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center font-bold text-xs shadow-inner">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
        />
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full max-w-full min-w-0">
        <Sidebar mobileOpen={mobileDrawerOpen} onCloseMobile={() => setMobileDrawerOpen(false)} />
        <main className="flex-1 min-w-0 px-3 py-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-60px)] md:min-h-screen overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
