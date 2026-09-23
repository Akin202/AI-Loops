import React, { useState } from 'react';
import { Mail, ArrowRight, Shield, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { loopsConfig } from '../../../config/loops.config.ts';

interface ConsoleLoginProps {
  onNavigatePublic: () => void;
}

export const ConsoleLogin: React.FC<ConsoleLoginProps> = ({ onNavigatePublic }) => {
  const { signInWithMagicLink, devBypassLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid work email address');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const { error } = await signInWithMagicLink(email.trim());

    if (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Unable to send magic link. Please check email address.');
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col justify-between selection:bg-[#1D4ED8] selection:text-white">
      {/* Top minimal bar */}
      <header className="w-full border-b border-[#E7E5E4] bg-[#FFFFFF]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-lg tracking-tight uppercase">
            {loopsConfig.name}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] px-1.5 py-0.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded">
            Console
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigatePublic}
          className="inline-flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#1C1917] font-medium transition-colors"
        >
          <span>Public Index</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl shadow-xs p-6 sm:p-8">
          <div className="mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mb-4 text-[#1D4ED8]">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
              Loops Console Sign In
            </h1>
            <p className="mt-1 text-sm text-[#78716C]">
              Internal access for UniPod partnerships, curatorial team, and leadership.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-5 text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Magic link sent</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                We sent a secure one-click login link to <strong className="font-semibold">{email}</strong>.
                Check your inbox and tap the link to sign in.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#44403C] mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@unipod.ng"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-2.5 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {status === 'submitting' ? (
                  <span>Sending magic link...</span>
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-[#F5F5F4] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => devBypassLogin('Lead')}
                  className="w-full py-2 px-3 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#44403C] text-xs font-medium rounded-lg text-center transition-colors"
                >
                  Quick Dev Bypass (Continue as Lead)
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#F5F5F4] text-center">
            <p className="text-[11px] text-[#A8A29E] font-mono">
              Passwordless authentication. Sessions persist 30 days.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-[#A8A29E]">
        <span>{loopsConfig.org.name}</span> · <span>{loopsConfig.undpProgrammeLine}</span>
      </footer>
    </div>
  );
};
