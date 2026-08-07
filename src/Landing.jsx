import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  ChevronDown, 
  Zap, 
  Lock, 
  Command, 
  Globe, 
  Terminal, 
  ArrowUpRight, 
  Menu, 
  X,
  Play,
  Briefcase,
  ExternalLink,
  MessageSquare,
  Shield,
  Sliders
} from 'lucide-react';

const injectCustomFontsAndStyles = () => {
  if (typeof window !== 'undefined' && !document.getElementById('jobdeck-landing-fonts')) {
    const style = document.createElement('style');
    style.id = 'jobdeck-landing-fonts';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      
      .font-serif-elegant { 
        font-family: 'Instrument Serif', Georgia, serif; 
      }
      .font-sans-clean { 
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif; 
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes pulseSlow {
        0%, 100% { opacity: 0.25; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(1.05); }
      }
      @keyframes drawLine {
        from { width: 0; }
        to { width: 100%; }
      }
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      .animate-pulse-slow {
        animation: pulseSlow 8s ease-in-out infinite;
      }
      .animate-slide-up {
        animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      
      .grid-pattern {
        background-image: radial-gradient(#2c2c28 0.75px, transparent 0.75px);
        background-size: 24px 24px;
        opacity: 0.04;
      }
    `;
    document.head.appendChild(style);
  }
};

export default function Landing({ onLaunchDashboard }) {
  useEffect(() => {
    injectCustomFontsAndStyles();
  }, []);

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'prep' | 'schedule'
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeFaq, setActiveFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  // Interactive mock app state for the playground
  const [mockJobs, setMockJobs] = useState([
    { id: 1, company: 'Linear', role: 'Product Designer', status: 'Interviewing', loc: 'Remote' },
    { id: 2, company: 'Vercel', role: 'Frontend Engineer', status: 'Offer', loc: 'Berlin' },
    { id: 3, company: 'Supabase', role: 'Developer Advocate', status: 'Applied', loc: 'Remote' },
    { id: 4, company: 'Stripe', role: 'Design Engineer', status: 'Applied', loc: 'NYC (Hybrid)' }
  ]);

  const [mockQuestions, setMockQuestions] = useState([
    { id: 'q1', text: 'Walk us through your design system craft. How do you handle dark scaling?', done: true },
    { id: 'q2', text: 'How would you build real-time optimistic updates with high layout shift rules?', done: false },
    { id: 'q3', text: 'Explain the runtime rendering steps of modern edge functions to a junior developer.', done: false }
  ]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleMockQuestion = (id) => {
    setMockQuestions(mockQuestions.map(q => q.id === id ? { ...q, done: !q.done } : q));
    const target = mockQuestions.find(q => q.id === id);
    if (target) {
      triggerToast(!target.done ? "Question completed!" : "Question marked for revision");
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    triggerToast(`Welcome to the craft! Access sent to ${newsletterEmail}`);
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222221] font-sans-clean antialiased selection:bg-[#EAE8E3] overflow-x-hidden relative">
      
      {/* Dynamic Grid Overlay Background */}
      <div className="absolute inset-0 grid-pattern pointer-events-none z-0" />
      
      {/* Decorative Radial Lighting */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#D0826C]/5 to-transparent rounded-full blur-[100px] pointer-events-none z-0 animate-pulse-slow" />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1C1A] text-[#FAF9F5] px-4 py-3 rounded-xl text-xs font-medium tracking-tight shadow-lg flex items-center gap-3 border border-[#2D2D2A] animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-[#D0826C] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#FBFBFA]/80 backdrop-blur-md border-b border-[#ECEAE4]/80">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="w-8 h-8 rounded-lg bg-[#2C2C28] text-[#FBFBFA] flex items-center justify-center font-serif-elegant text-lg font-bold select-none">
              JD
            </span>
            <div className="flex flex-col">
              <span className="font-serif-elegant text-lg tracking-tight font-bold text-[#1C1C1A]">
                Job Deck
              </span>
              <span className="text-[8px] uppercase tracking-widest text-[#8A8881] font-semibold -mt-1 font-sans-clean">
                Studio Edition
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#6C6A63]">
            <a href="#features" className="hover:text-[#1C1C1A] transition-colors">Workspace</a>
            <a href="#playground" className="hover:text-[#1C1C1A] transition-colors">Interactive Demo</a>
            <a href="#craft" className="hover:text-[#1C1C1A] transition-colors">The Philosophy</a>
            <a href="#pricing" className="hover:text-[#1C1C1A] transition-colors">Plans</a>
            <a href="#faq" className="hover:text-[#1C1C1A] transition-colors">FAQ</a>
          </nav>

          {/* CTA Group */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLaunchDashboard}
              className="text-xs font-bold text-[#6C6A63] hover:text-[#1C1C1A] transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button 
              onClick={onLaunchDashboard}
              className="px-4 py-2 bg-[#2C2C28] text-[#FBFBFA] text-xs font-semibold rounded-lg hover:bg-[#3E3E39] active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              Launch Studio
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-1 md:hidden text-[#2C2C28] hover:bg-[#FAF9F3] rounded-md cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-18 z-40 bg-[#FBFBFA] border-t border-[#ECEAE4] md:hidden px-6 py-6 space-y-6 animate-slide-up">
          <nav className="flex flex-col gap-4 text-sm font-semibold text-[#6C6A63]">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1C1C1A]">Workspace</a>
            <a href="#playground" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1C1C1A]">Interactive Demo</a>
            <a href="#craft" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1C1C1A]">Philosophy</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1C1C1A]">Pricing Plans</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1C1C1A]">FAQ Accordion</a>
          </nav>
          <div className="pt-6 border-t border-[#ECEAE4] flex flex-col gap-3">
            <button 
              onClick={() => { setMobileMenuOpen(false); onLaunchDashboard(); }}
              className="w-full py-2.5 text-center text-xs font-bold text-[#6C6A63] bg-[#FAF9F3] rounded-lg cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onLaunchDashboard(); }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#2C2C28] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Launch Studio <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <section className="relative max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-16 text-center z-10">
        
        {/* Release Pill Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F3] border border-[#ECEAE4] text-[10px] font-bold text-[#D0826C] tracking-wide mb-6 uppercase animate-slide-up">
          <Sparkles className="w-3 h-3 text-[#D0826C] animate-pulse" />
          Studio Release 2026.07
        </div>

        {/* Hero Headings */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-serif-elegant text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-[#1C1C1A]">
            The application ledger for <span className="italic font-normal">high-craft professionals</span>.
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#6C6A63] font-sans-clean max-w-2xl mx-auto leading-relaxed pt-2">
            A precise, beautifully integrated workspace built for designers, engineers, and creatives navigating elite pipelines. Organize leads, schedules, custom contacts, and your Q&A prep index in absolute pixel perfection.
          </p>
        </div>

        {/* Hero Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button 
            onClick={() => {
              const target = document.getElementById('playground');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
              triggerToast("Scrolled to interactive product sandbox.");
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#2C2C28] text-[#FBFBFA] text-xs font-bold rounded-xl hover:bg-[#3E3E39] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-[#FAF9F5] text-none animate-pulse" />
            Try Interactive Demo
          </button>
          
          <button 
            onClick={onLaunchDashboard}
            className="w-full sm:w-auto px-6 py-3.5 border border-[#C6C5BF] bg-[#FFF] text-[#2C2C28] text-xs font-bold rounded-xl hover:bg-[#FAFBF9] hover:border-[#2C2C28] active:scale-98 transition-all inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            Get Started Free
            <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8881]" />
          </button>
        </div>

        {/* Subtle Visual Anchor */}
        <div className="mt-12 flex items-center justify-center gap-8 text-[11px] font-bold text-[#8A8881] uppercase tracking-widest pt-4">
          <span className="flex items-center gap-1"><Command className="w-3.5 h-3.5" /> Keyboard Efficient</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ECEAE4]" />
          <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> No Tracker Cookies</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ECEAE4]" />
          <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Sync Anywhere</span>
        </div>

      </section>

      <section id="playground" className="max-w-5xl mx-auto px-6 py-10 z-10 relative">
        
        <div className="text-center space-y-2 mb-10">
          <span className="font-serif-elegant text-3xl font-bold tracking-tight block">Experience the Interface</span>
          <p className="text-xs text-[#8A8881] max-w-md mx-auto">This is a live interactive mock sandbox. Click the workspace tabs below to test drive the core views.</p>
        </div>

        {/* Showcase Widget Wrapper */}
        <div className="border border-[#ECEAE4] rounded-3xl bg-[#FFF] overflow-hidden shadow-xl shadow-gray-200/50">
          
          {/* Top Bar Navigation Mockup */}
          <div className="bg-[#FAFBF9] border-b border-[#ECEAE4] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C6C5BF]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ECEAE4]" />
              <span className="text-xs font-serif-elegant font-bold text-[#2C2C28] ml-1">Mock Sandbox Environment</span>
            </div>

            {/* Sandbox Tabs */}
            <div className="flex items-center gap-1 bg-[#FAF9F3] border border-[#ECEAE4] p-1 rounded-full shadow-inner">
              <button 
                onClick={() => { setActiveTab('ledger'); triggerToast("Mock ledger active"); }}
                className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'ledger' ? 'bg-[#2C2C28] text-white' : 'text-[#6C6A63]'
                }`}
              >
                The Ledger
              </button>
              <button 
                onClick={() => { setActiveTab('prep'); triggerToast("Mock practice desk active"); }}
                className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'prep' ? 'bg-[#2C2C28] text-white' : 'text-[#6C6A63]'
                }`}
              >
                Prep Vault
              </button>
              <button 
                onClick={() => { setActiveTab('schedule'); triggerToast("Mock schedule active"); }}
                className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'schedule' ? 'bg-[#2C2C28] text-white' : 'text-[#6C6A63]'
                }`}
              >
                Schedule
              </button>
            </div>

            <div className="text-[10px] uppercase tracking-wider font-bold text-[#D0826C] shrink-0">
              Live Preview
            </div>

          </div>

          {/* Sandbox Body Panel */}
          <div className="p-6 md:p-8 bg-white min-h-[380px] flex flex-col justify-between">
            
            {activeTab === 'ledger' && (
              <div className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF9F3]">
                  <p className="text-xs font-bold text-[#1C1C1A]">Active Applications Ledger</p>
                  <span className="text-[10px] text-[#8A8881] font-semibold">{mockJobs.length} Positions</span>
                </div>

                <div className="divide-y divide-[#ECEAE4] border border-[#ECEAE4] rounded-xl overflow-hidden">
                  {mockJobs.map(job => (
                    <div key={job.id} className="p-4 bg-white hover:bg-[#FAF9F3]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif-elegant text-lg font-bold text-[#2C2C28]">{job.company}</span>
                        <span className="text-xs text-[#6C6A63] font-medium">{job.role}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-[#8A8881]">&bull; {job.loc}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          job.status === 'Offer' ? 'bg-[#EDFAF3] text-[#25854B]' :
                          job.status === 'Interviewing' ? 'bg-[#EBF7FC] text-[#297AB8]' : 'bg-[#FDF9F2] text-[#B87A29]'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prep' && (
              <div className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF9F3]">
                  <div>
                    <p className="text-xs font-bold text-[#1C1C1A]">Vercel Prep: Technical Architecture Round</p>
                    <p className="text-[10px] text-[#8A8881]">Interactive checklist items</p>
                  </div>
                  <span className="text-[10px] text-[#D0826C] font-bold">
                    {mockQuestions.filter(q => q.done).length}/{mockQuestions.length} Checked
                  </span>
                </div>

                <div className="space-y-2.5">
                  {mockQuestions.map(q => (
                    <div 
                      key={q.id} 
                      onClick={() => toggleMockQuestion(q.id)}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        q.done 
                          ? 'bg-[#FAFBF9] border-[#E2EFEB]/60 text-[#8A8881]' 
                          : 'bg-white border-[#ECEAE4] hover:border-[#2C2C28] text-[#1C1C1A]'
                      }`}
                    >
                      <button className="mt-0.5 flex-shrink-0 cursor-pointer">
                        {q.done ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-[#25854B]" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border border-[#C6C5BF] hover:border-[#2C2C28]" />
                        )}
                      </button>
                      <span className={`text-xs font-medium leading-relaxed ${q.done ? 'line-through' : ''}`}>
                        {q.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF9F3]">
                  <p className="text-xs font-bold text-[#1C1C1A]">Milestone Events Timeline</p>
                  <span className="text-[10px] text-[#8A8881] font-semibold">July 2026</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF9F3] border border-[#ECEAE4] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#B87A29] bg-[#FDF9F2] px-2 py-0.5 rounded">Deadline</span>
                      <span className="text-[10px] font-bold text-[#8A8881]">July 15</span>
                    </div>
                    <h5 className="text-xs font-bold text-[#2C2C28]">Submit Application officially</h5>
                    <p className="text-[11px] text-[#6C6A63] italic">at Amie Client</p>
                  </div>

                  <div className="p-4 bg-[#FAF9F3] border border-[#ECEAE4] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#297AB8] bg-[#EBF7FC] px-2 py-0.5 rounded">Live Screen</span>
                      <span className="text-[10px] font-bold text-[#8A8881]">July 22</span>
                    </div>
                    <h5 className="text-xs font-bold text-[#2C2C28]">Product Design Layout Deep Dive</h5>
                    <p className="text-[11px] text-[#6C6A63] italic">at Linear App</p>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Action Link */}
            <div className="pt-6 border-t border-[#F2F1EC] flex justify-end">
              <button 
                onClick={onLaunchDashboard}
                className="text-xs text-[#2C2C28] font-bold flex items-center gap-1 hover:underline hover:text-[#D0826C] transition-colors cursor-pointer"
              >
                Log your own first company application 
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </section>

      <section id="features" className="max-w-5xl mx-auto px-6 py-20 z-10 relative space-y-16">
        
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-[#D0826C] uppercase tracking-widest block mb-1">Architecture of Job Deck</span>
          <h2 className="font-serif-elegant text-4xl sm:text-5xl font-bold text-[#1C1C1A]">
            Built with exact detail. Engineered for absolute focus.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-6 bg-[#FAF9F3] border border-[#ECEAE4] rounded-2xl space-y-4 shadow-sm hover:border-[#C6C5BF] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#ECEAE4] flex items-center justify-center text-[#2C2C28] group-hover:bg-[#2C2C28] group-hover:text-white transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-serif-elegant text-xl font-bold text-[#1C1C1A]">Unified Ledger</h4>
            <p className="text-xs text-[#6C6A63] leading-relaxed">
              Ditch fragile multiple spreadsheets. Maintain a single source of truth detailing stages, salaries, recruiters, and key internal documentation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-[#FAF9F3] border border-[#ECEAE4] rounded-2xl space-y-4 shadow-sm hover:border-[#C6C5BF] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#ECEAE4] flex items-center justify-center text-[#2C2C28] group-hover:bg-[#2C2C28] group-hover:text-white transition-all">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="font-serif-elegant text-xl font-bold text-[#1C1C1A]">Prep Desk & Q&A</h4>
            <p className="text-xs text-[#6C6A63] leading-relaxed">
              Log technical prompt queries, specific design test logs, and dynamic company checklists to stay razor-sharp prior to every stage.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-[#FAF9F3] border border-[#ECEAE4] rounded-2xl space-y-4 shadow-sm hover:border-[#C6C5BF] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#ECEAE4] flex items-center justify-center text-[#2C2C28] group-hover:bg-[#2C2C28] group-hover:text-white transition-all">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-serif-elegant text-xl font-bold text-[#1C1C1A]">Integrated Schedule</h4>
            <p className="text-xs text-[#6C6A63] leading-relaxed">
              Never miss call deadlines or follow-ups. See key milestones synchronized chronologically with dynamic color coordination tags.
            </p>
          </div>

        </div>

      </section>

      <section id="craft" className="max-w-5xl mx-auto px-6 py-16 z-10 relative">
        <div className="bg-[#1C1C1A] text-[#FAF9F5] rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          
          {/* Subtle Grid overlay for dark section */}
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
          
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-[#D0826C] uppercase tracking-wide">
              No Clutter. High-fidelity.
            </div>
            
            <h3 className="font-serif-elegant text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              "We believe looking for your next challenge shouldn’t feel like updating a database."
            </h3>

            <p className="text-xs text-[#A8A69F] leading-relaxed font-sans-clean">
              Most platforms are bloated with unnecessary workflows and analytics cookies designed to keep you trapped in system loop dashboards. Job Deck Studio is constructed with extreme design-centric layout craft, high keyboard-first speed, and zero latency. It is simply a highly responsive desk tailored for top talent.
            </p>

            <div className="flex flex-wrap gap-6 pt-4 text-[10px] uppercase font-bold tracking-widest text-[#EFEFEA]/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D0826C]" /> Local-First Fast
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D0826C]" /> Zero Layout Shift
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D0826C]" /> Markdown Exportable
              </div>
            </div>
          </div>

          {/* Floated aesthetic abstract preview box */}
          <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-64 p-5 bg-[#2C2C28] border border-white/10 rounded-2xl space-y-3 shadow-xl transform rotate-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9px] text-[#A8A69F] tracking-widest uppercase font-bold">Linear Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D0826C]" />
            </div>
            <p className="font-serif-elegant text-base italic text-white">"Appreciates premium visual design craft."</p>
            <div className="flex items-center justify-between text-[8px] text-[#8A8881] pt-2">
              <span>Recruiter Lead</span>
              <span className="text-white">Kaisa Lindqvist</span>
            </div>
          </div>

        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20 z-10 relative space-y-12">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#D0826C] uppercase tracking-widest block">Flexible Pricing</span>
          <h3 className="font-serif-elegant text-4xl sm:text-5xl font-bold text-[#1C1C1A]">Tuned to your pipeline scale</h3>
          
          {/* Plan Interval Toggle */}
          <div className="inline-flex items-center bg-[#FAF9F3] border border-[#ECEAE4] p-1 rounded-full shadow-inner mt-4">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                !isAnnual ? 'bg-[#2C2C28] text-white shadow-sm' : 'text-[#6C6A63]'
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                isAnnual ? 'bg-[#2C2C28] text-white shadow-sm' : 'text-[#6C6A63]'
              }`}
            >
              Annually
              <span className="bg-[#D0826C] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full scale-90">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Plan 1 */}
          <div className="bg-white border border-[#ECEAE4] rounded-3xl p-8 space-y-6 shadow-sm relative flex flex-col justify-between hover:border-[#C6C5BF] transition-colors">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#8A8881] uppercase tracking-wider block">Community Studio</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif-elegant text-5xl font-bold text-[#1C1C1A]">$0</span>
                <span className="text-xs text-[#8A8881] font-medium">Free Forever</span>
              </div>
              <p className="text-xs text-[#6C6A63]">Perfect for designers and builders tracking up to 3 active premium roles concurrently.</p>
              
              <ul className="space-y-3 pt-4 border-t border-[#FAFBF9] text-xs text-[#4C4A43]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D0826C]" /> Up to 3 Active Applications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D0826C]" /> Core Prep Q&A Bank
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D0826C]" /> Minimalist Milestone Schedule
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D0826C]" /> No External Ad Trackers
                </li>
              </ul>
            </div>

            <button 
              onClick={() => { triggerToast("Initializing Free Tier Sandbox Setup..."); setTimeout(onLaunchDashboard, 800); }}
              className="w-full py-2.5 mt-6 bg-[#FAF9F3] hover:bg-[#ECEAE4] text-[#2C2C28] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2 */}
          <div className="bg-[#FAF9F3] border-2 border-[#2C2C28] rounded-3xl p-8 space-y-6 shadow-md relative flex flex-col justify-between">
            <span className="absolute -top-3.5 right-6 bg-[#D0826C] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Most Appreciated
            </span>

            <div className="space-y-4">
              <span className="text-xs font-bold text-[#2C2C28] uppercase tracking-wider block">Professional Studio</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif-elegant text-5xl font-bold text-[#1C1C1A]">
                  {isAnnual ? "$12" : "$15"}
                </span>
                <span className="text-xs text-[#8A8881] font-medium">/ month</span>
              </div>
              <p className="text-xs text-[#6C6A63]">Designed for high-impact developers and designers scaling multiple key offers simultaneously.</p>
              
              <ul className="space-y-3 pt-4 border-t border-[#FAF9F3] text-xs text-[#4C4A43]">
                <li className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-[#2C2C28]" /> Unlimited Pipeline Postings
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2C2C28]" /> Advanced Multi-Round Prep Modules
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2C2C28]" /> Email parsing connection forwarding
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2C2C28]" /> Multi-device real-time sync
                </li>
              </ul>
            </div>

            <button 
              onClick={() => { triggerToast("Launching Professional Workspace deployment..."); setTimeout(onLaunchDashboard, 800); }}
              className="w-full py-2.5 mt-6 bg-[#2C2C28] hover:bg-[#3E3E39] text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
            >
              Start Professional Studio
            </button>
          </div>

        </div>

      </section>

      <section id="faq" className="max-w-4xl mx-auto px-6 py-16 z-10 relative space-y-12">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#D0826C] uppercase tracking-widest block">Curious?</span>
          <h3 className="font-serif-elegant text-3xl sm:text-4xl font-bold text-[#1C1C1A]">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          {[
            {
              q: "Is my application data safe from crawlers?",
              a: "Absolutely. Job Deck Studio enforces strict privacy standards. Your logs, company contacts, and prep answers reside in fully sandboxed, encrypted cloud storages or local-first buffers. No tracking cookies or advertising networks will ever scrape your records."
            },
            {
              q: "How does the email parsing connection work?",
              a: "If you forward an application or offer confirmation email directly to sync@jobdeck.app, our parsing algorithms scan and construct a draft application record inside your dashboard within minutes."
            },
            {
              q: "Can I export my interview prep answers and ledger?",
              a: "Yes. You can immediately download your entire platform directory into raw Markdown grids or JSON packets at any time inside the app configurations."
            },
            {
              q: "Is there a custom keyboard shortcut workflow?",
              a: "Yes. Job Deck is heavily optimized for fast navigation. Use native command palettes to toggle states, add questions, and switch directory tags seamlessly."
            }
          ].map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-[#ECEAE4] bg-white rounded-xl overflow-hidden transition-all animate-fade-in"
              >
                <button
                  onClick={() => {
                    setActiveFaq(isOpen ? null : idx);
                    if(!isOpen) triggerToast("Revealed FAQ answer");
                  }}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-[#1C1C1A] hover:bg-[#FAF9F3]/60 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#8C8A82] transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#6C6A63] leading-relaxed border-t border-[#FAF9F3] bg-[#FAFBF9] animate-slide-up">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      <section className="max-w-3xl mx-auto px-6 py-12 z-10 relative">
        <div className="bg-[#FAF9F3] border border-[#ECEAE4] rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="space-y-2">
            <h4 className="font-serif-elegant text-2xl font-bold text-[#1C1C1A]">Subscribe to the Craft Newsletter</h4>
            <p className="text-xs text-[#8A8881] max-w-md mx-auto">Get design-centric workspace configurations, tech-prep guides, and direct studio update releases.</p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              required
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#ECEAE4] bg-white rounded-xl text-xs focus:outline-none focus:border-[#2C2C28] placeholder-[#A8A69F]"
            />
            <button 
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#2C2C28] text-white text-xs font-bold rounded-xl hover:bg-[#3E3E39] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              Join waitlist
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#ECEAE4] mt-16 bg-[#FAFBF9]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#2C2C28] text-[#FBFBFA] flex items-center justify-center font-serif-elegant text-base font-bold select-none">
              JD
            </span>
            <span className="font-serif-elegant text-lg font-bold text-[#1C1C1A]">
              Job Deck Studio
            </span>
          </div>

          <p className="text-[11px] text-[#8A8881] font-medium text-center">
            &copy; 2026 Job Deck. Designed with high craft. Built with absolute integrity. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs font-bold text-[#6C6A63]">
            <a href="#playground" className="hover:text-[#2C2C28]">Demo</a>
            <a href="#pricing" className="hover:text-[#2C2C28]">Plans</a>
            <a onClick={() => triggerToast("Reviewing Privacy protocols...")} className="hover:text-[#2C2C28] cursor-pointer">Security</a>
          </div>

        </div>
      </footer>

    </div>
  );
}
