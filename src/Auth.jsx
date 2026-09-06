import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const injectAuthFonts = () => {
  if (typeof window !== 'undefined' && !document.getElementById('jobdeck-fonts')) {
    const style = document.createElement('style');
    style.id = 'jobdeck-fonts';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      .font-serif-elegant { font-family: 'Instrument Serif', Georgia, serif; }
      .font-sans-clean { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    `;
    document.head.appendChild(style);
  }
};

const friendlyErrorMessage = (rawMessage) => {
  const message = rawMessage || '';
  if (/failed to fetch|network|load failed/i.test(message)) {
    return "Couldn't reach Supabase. Check your internet connection and that VITE_SUPABASE_URL in .env.local is correct.";
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Incorrect email or password.';
  }
  if (/user already registered/i.test(message)) {
    return 'An account with this email already exists — try signing in instead.';
  }
  return message;
};

export default function Auth() {
  useEffect(() => {
    injectAuthFonts();
  }, []);

  const [mode, setMode] = useState('sign-up'); // 'sign-up' | 'sign-in'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error: authError } = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (authError) {
      setError(friendlyErrorMessage(authError.message));
      return;
    }

    if (mode === 'sign-up') {
      setMessage('Account created. Check your email to confirm, then sign in.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222221] font-sans-clean antialiased flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative radial lighting, matching the Landing page's aesthetic */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#D0826C]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="text-center space-y-2 mb-6">
          <span className="w-12 h-12 rounded-2xl bg-[#2C2C28] text-[#FBFBFA] inline-flex items-center justify-center font-serif-elegant text-xl font-bold select-none shadow-lg shadow-black/5">
            JD
          </span>
          <h1 className="font-serif-elegant text-3xl font-bold text-[#1C1C1A] pt-1">Job Deck</h1>
          <p className="text-xs text-[#8A8881] inline-flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3 h-3 text-[#D0826C]" />
            Your private workspace for the job hunt
          </p>
        </div>

        <div className="bg-white border border-[#ECEAE4] rounded-2xl p-2 shadow-xl shadow-gray-200/60">
          <div className="flex items-center gap-1 bg-[#FAF9F3] border border-[#ECEAE4] p-1 rounded-full mb-5">
            <button
              type="button"
              onClick={() => switchMode('sign-up')}
              className={`flex-1 text-xs font-bold py-2 rounded-full transition-all duration-200 ${
                mode === 'sign-up' ? 'bg-[#2C2C28] text-[#FBFBFA] shadow-sm' : 'text-[#6C6A63] hover:text-[#1C1C1A]'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => switchMode('sign-in')}
              className={`flex-1 text-xs font-bold py-2 rounded-full transition-all duration-200 ${
                mode === 'sign-in' ? 'bg-[#2C2C28] text-[#FBFBFA] shadow-sm' : 'text-[#6C6A63] hover:text-[#1C1C1A]'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A8A69F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-white focus:outline-none focus:border-[#2C2C28] transition-all placeholder-[#A8A69F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A8A69F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-9 py-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-white focus:outline-none focus:border-[#2C2C28] transition-all placeholder-[#A8A69F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A69F] hover:text-[#2C2C28] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-[#FCF2F2] border border-[#E9CDCD] rounded-lg px-3 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#B83E29] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#B83E29] font-medium leading-relaxed">{error}</p>
              </div>
            )}
            {message && (
              <div className="flex items-start gap-2 bg-[#EDFAF3] border border-[#CDE9DA] rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25854B] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#25854B] font-medium leading-relaxed">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2C2C28] text-white text-xs font-bold rounded-lg hover:bg-[#3E3E39] active:scale-98 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#A8A69F] mt-5">
          {mode === 'sign-in' ? (
            <>Don't have an account? <button onClick={() => switchMode('sign-up')} className="font-bold text-[#6C6A63] hover:text-[#1C1C1A]">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => switchMode('sign-in')} className="font-bold text-[#6C6A63] hover:text-[#1C1C1A]">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
