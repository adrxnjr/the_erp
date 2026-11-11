import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Page Not Found — Ever Grow Schools ERP';
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center p-6 text-slate-700">
      <div className="max-w-md w-full bg-[#F5F6F8] p-8 md:p-10 rounded-3xl shadow-[8px_8px_20px_#D4DAE5,-8px_-8px_20px_#FFFFFF] border border-white/80 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-inner">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            Error 404
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight pt-2">
            Page Not Found
          </h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            The page or resource you are looking for does not exist, has been relocated, or requires higher access credentials.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-[4px_4px_10px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/70 hover:bg-white text-slate-600 font-bold text-sm border border-slate-200 shadow-xs active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-400 mt-8">
        Ever Grow International Schools • Campus Enterprise Resource Planning
      </p>
    </div>
  );
};

