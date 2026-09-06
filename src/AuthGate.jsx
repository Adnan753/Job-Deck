import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import Auth from './Auth.jsx';

function SupabaseNotConfigured() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-[#ECEAE4] rounded-2xl p-8 shadow-sm space-y-4 text-center">
        <AlertTriangle className="w-8 h-8 text-[#B87A29] mx-auto" />
        <h1 className="text-lg font-bold text-[#1C1C1A]">Supabase isn't configured yet</h1>
        <p className="text-xs text-[#6C6A63] leading-relaxed">
          <code className="bg-[#FAF9F3] border border-[#ECEAE4] px-1.5 py-0.5 rounded text-[#2C2C28] font-semibold">.env.local</code> still
          has placeholder values for <code className="bg-[#FAF9F3] border border-[#ECEAE4] px-1.5 py-0.5 rounded text-[#2C2C28] font-semibold">VITE_SUPABASE_URL</code> and <code className="bg-[#FAF9F3] border border-[#ECEAE4] px-1.5 py-0.5 rounded text-[#2C2C28] font-semibold">VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <p className="text-xs text-[#6C6A63] leading-relaxed">
          Copy your Project URL and anon/public key from Supabase Project Settings → API into <code className="bg-[#FAF9F3] border border-[#ECEAE4] px-1.5 py-0.5 rounded text-[#2C2C28] font-semibold">.env.local</code>, run <code className="bg-[#FAF9F3] border border-[#ECEAE4] px-1.5 py-0.5 rounded text-[#2C2C28] font-semibold">supabase/schema.sql</code> in the SQL Editor, then restart the dev server.
        </p>
      </div>
    </div>
  );
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) setSession(newSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <SupabaseNotConfigured />;
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <span className="text-xs font-semibold text-[#8A8881] font-sans-clean tracking-wide uppercase">
          Loading Job Deck…
        </span>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return children(session);
}
