import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { loopsConfig } from '../../config/loops.config';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141414] border border-[#262626] rounded-lg p-6 space-y-5 text-center shadow-xl">
            <div className="inline-flex p-3 rounded-full bg-rose-950/40 border border-rose-900/60 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[11px] text-[#737373] tracking-widest uppercase">
                System Fault Intercepted
              </span>
              <h2 className="text-xl font-bold text-[#FFFFFF]">
                An unexpected interface error occurred
              </h2>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                The application encountered an unhandled exception. Your input and offline queues are preserved in storage.
              </p>
              {this.state.error && (
                <div className="p-2.5 bg-[#0A0A0A] border border-[#262626] rounded text-left font-mono text-[11px] text-rose-400 overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FFFFFF] text-[#0A0A0A] rounded text-xs font-semibold hover:bg-[#E5E5E5] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#262626] text-[#E5E5E5] rounded text-xs font-medium hover:bg-[#333333] transition-colors"
              >
                <span>Return to Index</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#262626]">
              <p className="text-[11px] text-[#737373]">
                Persistent issue? Reach the UniPod partnerships team at{' '}
                <a
                  href={`mailto:partnerships@ai-loops.ng?subject=${encodeURIComponent('Platform Exception Report')}`}
                  className="text-[#D4D4D4] hover:underline"
                >
                  partnerships@ai-loops.ng
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
