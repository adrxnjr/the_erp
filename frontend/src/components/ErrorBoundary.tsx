import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#E9EEF5] flex flex-col items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-[#E9EEF5] p-8 md:p-10 rounded-3xl shadow-[8px_8px_20px_#C5D0E0,-8px_-8px_20px_#FFFFFF] border border-white/80 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                Application Stability Guard
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
                Something went wrong
              </h1>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                An unexpected interface error occurred. Our automated stability boundary prevented the application from terminating.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-white/70 p-3 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 font-mono break-words max-h-28 overflow-y-auto shadow-inner">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs active:scale-95 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
