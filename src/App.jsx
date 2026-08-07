import React, { useState, useMemo, useEffect } from 'react';
import Landing from './Landing.jsx';
import { 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Briefcase, 
  Search, 
  SlidersHorizontal, 
  Calendar as CalendarIcon, 
  BookOpen, 
  MapPin, 
  DollarSign, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Users,
  X,
  PlusCircle,
  CheckCircle2,
  HelpCircle,
  Layers
} from 'lucide-react';

const injectCustomFonts = () => {
  if (typeof window !== 'undefined' && !document.getElementById('jobdeck-fonts')) {
    const style = document.createElement('style');
    style.id = 'jobdeck-fonts';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      
      .font-serif-elegant { 
        font-family: 'Instrument Serif', Georgia, serif; 
      }
      .font-sans-clean { 
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif; 
      }
    `;
    document.head.appendChild(style);
  }
};

const INITIAL_JOBS = [
  {
    id: '1',
    company: 'Linear',
    role: 'Product Designer',
    status: 'Interviewing',
    portal: 'Read.cv',
    dateApplied: '2026-07-10',
    salary: '$150k - $175k',
    location: 'Remote',
    hrName: 'Kaisa Lindqvist',
    hrTitle: 'Talent Lead',
    hrEmail: 'kaisa@linear.app',
    hrPhone: '+358 40 123 4567',
    hrNotes: 'Appreciates high-craft layout engineering portfolios.',
    jd: "Looking for a designer to own core interface paradigms. You have an eye for spatial layouts, precise typography, and keyboard-first interactions.",
    interviews: [
      {
        id: 'int_1_1',
        roundName: 'Technical Screen',
        questions: [
          { id: 'q1', text: 'How do you design for keyboard-first efficiency without alienating mouse users?', done: true },
          { id: 'q2', text: 'Walk us through your design system craft. How do you handle sub-pixel grid alignment?', done: false }
        ]
      },
      {
        id: 'int_1_2',
        roundName: 'Portfolio Deep Dive',
        questions: [
          { id: 'q3', text: 'Explain a time you made visual compromises for extreme performance gains.', done: false },
          { id: 'q4', text: 'How do you structure token architecture for light/dark scaling?', done: false }
        ]
      }
    ]
  },
  {
    id: '2',
    company: 'Amie',
    role: 'Frontend Engineer',
    status: 'Applied',
    portal: 'Direct Link',
    dateApplied: '2026-07-15',
    salary: '€80k - €100k',
    location: 'Berlin (Hybrid)',
    hrName: 'Stefan Haas',
    hrTitle: 'Co-Founder',
    hrEmail: 'stefan@amie.so',
    hrPhone: '+49 172 889211',
    hrNotes: 'Reached out via direct DM. Playful aesthetic preference.',
    jd: "Help us build the most delightful calendar and email client in the world. Experience with Framer Motion and local-first database syncing.",
    interviews: [
      {
        id: 'int_2_1',
        roundName: 'Technical Chat',
        questions: [
          { id: 'q5', text: 'How would you approach real-time optimistic UI rendering for calendar drag & drop?', done: true }
        ]
      }
    ]
  },
  {
    id: '3',
    company: 'Vercel',
    role: 'Developer Relations',
    status: 'Offer',
    portal: 'Twitter/X',
    dateApplied: '2026-06-25',
    salary: '$160k - $185k',
    location: 'Remote',
    hrName: 'Elena Rostova',
    hrTitle: 'Developer Recruiter',
    hrEmail: 'elena.r@vercel.com',
    hrPhone: '',
    hrNotes: 'Requested response to the final package proposal by Friday.',
    jd: "Bridge the gap between Next.js core frameworks and developers. Author guides, design interactive open-source starters, and host workshop tracks.",
    interviews: [
      {
        id: 'int_3_1',
        roundName: 'Technical Architecture Round',
        questions: [
          { id: 'q6', text: 'Explain the runtime hydration process of React Server Components to a beginner.', done: true },
          { id: 'q7', text: 'How do you optimize network latency when streaming HTML parts over the edge?', done: false }
        ]
      },
      {
        id: 'int_3_2',
        roundName: 'Keynote & Presentation Screen',
        questions: [
          { id: 'q8', text: 'Give us a 5-minute impromptu walkthrough of a code snippet you are proud of.', done: true }
        ]
      }
    ]
  }
];

const INITIAL_CONTACTS = [
  {
    id: 'c1',
    name: 'Kaisa Lindqvist',
    role: 'Talent Lead',
    company: 'Linear',
    email: 'kaisa@linear.app',
    phone: '+358 40 123 4567',
    notes: 'Primary Linear contact. Highly responsive on Slack-based channels.',
    linkedJobId: '1'
  },
  {
    id: 'c2',
    name: 'Stefan Haas',
    role: 'Co-Founder',
    company: 'Amie',
    email: 'stefan@amie.so',
    phone: '+49 172 889211',
    notes: 'Founding conversations. Friendly, casual tone is appreciated.',
    linkedJobId: '2'
  },
  {
    id: 'c3',
    name: 'Elena Rostova',
    role: 'Developer Recruiter',
    company: 'Vercel',
    email: 'elena.r@vercel.com',
    phone: '',
    notes: 'Coordinating the stock option package discussions.',
    linkedJobId: '3'
  }
];

const INITIAL_PORTALS = [
  { id: 'p1', name: 'LinkedIn Profile', url: 'https://linkedin.com/in/johndoe', status: 'Actively Looking', lastChecked: 'Synced 1h ago' },
  { id: 'p2', name: 'Read.cv Resume', url: 'https://read.cv/johndoe', status: 'Open to Offers', lastChecked: 'Synced 4h ago' },
  { id: 'p3', name: 'GitHub Workspace', url: 'https://github.com/johndoe', status: 'Active Coding', lastChecked: 'Synced 1d ago' }
];

const INITIAL_EVENTS = [
  { id: 'e1', date: '2026-07-22', title: 'Technical Screen', company: 'Linear', type: 'Interview', time: '14:00' },
  { id: 'e2', date: '2026-07-15', title: 'Applied officially', company: 'Amie', type: 'Deadline', time: '09:00' },
  { id: 'e3', date: '2026-07-28', title: 'Decision Follow-up', company: 'Vercel', type: 'Follow-up', time: '11:30' }
];

export default function App() {
  useEffect(() => {
    injectCustomFonts();
  }, []);

  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'calendar' | 'contacts' | 'portals' | 'interviews'
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [portals, setPortals] = useState(INITIAL_PORTALS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [expandedJobId, setExpandedJobId] = useState('1'); 
  const [activeSubTab, setActiveSubTab] = useState('jd'); // 'jd' | 'contact' | 'qa'

  // Prep Bank Active States
  const [prepSelectedJobId, setPrepSelectedJobId] = useState('1');
  const [newRoundName, setNewRoundName] = useState('');
  const [newQuestionText, setNewQuestionText] = useState({}); // mapped by interview round ID

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  // Modals & Toast Alerts
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const [newJobData, setNewJobData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    portal: 'Read.cv',
    dateApplied: new Date().toISOString().split('T')[0],
    salary: '',
    location: '',
    hrName: '',
    hrTitle: '',
    hrEmail: '',
    hrPhone: '',
    hrNotes: '',
    jd: ''
  });

  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactData, setNewContactData] = useState({
    name: '',
    role: '',
    company: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 18)); // July 18, 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-07-22');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    company: '',
    type: 'Interview',
    time: '10:00'
  });

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!newJobData.company || !newJobData.role) {
      showToast('Please enter both Company and Role.');
      return;
    }

    const jobToAdd = {
      id: String(Date.now()),
      company: newJobData.company,
      role: newJobData.role,
      status: newJobData.status,
      portal: newJobData.portal,
      dateApplied: newJobData.dateApplied,
      salary: newJobData.salary || 'Undisclosed',
      location: newJobData.location || 'Remote',
      hrName: newJobData.hrName,
      hrTitle: newJobData.hrTitle,
      hrEmail: newJobData.hrEmail,
      hrPhone: newJobData.hrPhone,
      hrNotes: newJobData.hrNotes,
      jd: newJobData.jd || 'No description provided.',
      interviews: [
        {
          id: 'int_gen_' + Date.now(),
          roundName: 'General Review',
          questions: []
        }
      ]
    };

    setJobs([jobToAdd, ...jobs]);
    setIsAddJobOpen(false);
    setExpandedJobId(jobToAdd.id);
    setActiveSubTab('jd');
    setPrepSelectedJobId(jobToAdd.id);
    showToast(`Added ${jobToAdd.role} at ${jobToAdd.company}`);

    if (jobToAdd.hrName.trim()) {
      const syncedContact = {
        id: 'c_' + jobToAdd.id,
        name: jobToAdd.hrName,
        role: jobToAdd.hrTitle || 'Talent Partner',
        company: jobToAdd.company,
        email: jobToAdd.hrEmail,
        phone: jobToAdd.hrPhone,
        notes: jobToAdd.hrNotes || 'Synchronized from applied job profile.',
        linkedJobId: jobToAdd.id
      };
      setContacts(prev => [syncedContact, ...prev]);
    }

    const appliedEvent = {
      id: String(Date.now() + 1),
      date: newJobData.dateApplied,
      title: 'Applied to Role',
      company: newJobData.company,
      type: 'Deadline',
      time: '09:00'
    };
    setEvents(prev => [...prev, appliedEvent]);

    setNewJobData({
      company: '',
      role: '',
      status: 'Applied',
      portal: 'Read.cv',
      dateApplied: new Date().toISOString().split('T')[0],
      salary: '',
      location: '',
      hrName: '',
      hrTitle: '',
      hrEmail: '',
      hrPhone: '',
      hrNotes: '',
      jd: ''
    });
  };

  const handleDeleteJob = (id, e) => {
    e.stopPropagation();
    const removed = jobs.find(j => j.id === id);
    setJobs(jobs.filter(j => j.id !== id));
    setContacts(contacts.filter(c => c.linkedJobId !== id));

    if (expandedJobId === id) setExpandedJobId(null);
    if (prepSelectedJobId === id) {
      const remaining = jobs.filter(j => j.id !== id);
      setPrepSelectedJobId(remaining.length > 0 ? remaining[0].id : '');
    }
    showToast(`Archived application for ${removed?.company}`);
  };

  const handleUpdateStatus = (jobId, newStatus) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    showToast(`Status updated to ${newStatus}`);
  };

  const handleAddInterviewRound = (jobId) => {
    if (!newRoundName.trim()) return;

    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        const rounds = j.interviews || [];
        return {
          ...j,
          interviews: [
            ...rounds,
            {
              id: 'int_' + Date.now(),
              roundName: newRoundName,
              questions: []
            }
          ]
        };
      }
      return j;
    }));

    setNewRoundName('');
    showToast('Interview round added.');
  };

  const handleAddQuestionToRound = (jobId, roundId) => {
    const text = newQuestionText[roundId];
    if (!text || !text.trim()) return;

    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        const rounds = j.interviews.map(r => {
          if (r.id === roundId) {
            return {
              ...r,
              questions: [
                ...r.questions,
                { id: 'q_' + Date.now(), text: text.trim(), done: false }
              ]
            };
          }
          return r;
        });
        return { ...j, interviews: rounds };
      }
      return j;
    }));

    setNewQuestionText(prev => ({ ...prev, [roundId]: '' }));
    showToast('Question saved.');
  };

  const handleToggleQuestionDone = (jobId, roundId, questionId) => {
    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        const rounds = j.interviews.map(r => {
          if (r.id === roundId) {
            return {
              ...r,
              questions: r.questions.map(q => {
                if (q.id === questionId) {
                  return { ...q, done: !q.done };
                }
                return q;
              })
            };
          }
          return r;
        });
        return { ...j, interviews: rounds };
      }
      return j;
    }));
  };

  const handleDeleteQuestion = (jobId, roundId, questionId) => {
    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        const rounds = j.interviews.map(r => {
          if (r.id === roundId) {
            return {
              ...r,
              questions: r.questions.filter(q => q.id !== questionId)
            };
          }
          return r;
        });
        return { ...j, interviews: rounds };
      }
      return j;
    }));
    showToast('Question removed.');
  };

  const handleCreateContact = (e) => {
    e.preventDefault();
    if (!newContactData.name.trim() || !newContactData.company.trim()) {
      showToast('Name and Company are required.');
      return;
    }

    const contactToAdd = {
      id: String(Date.now()),
      name: newContactData.name,
      role: newContactData.role || 'Recruiting Partner',
      company: newContactData.company,
      email: newContactData.email,
      phone: newContactData.phone,
      notes: newContactData.notes || 'Manually logged contact.',
      linkedJobId: ''
    };

    setContacts([contactToAdd, ...contacts]);
    setShowAddContactForm(false);
    setNewContactData({ name: '', role: '', company: '', email: '', phone: '', notes: '' });
    showToast(`Registered contact: ${contactToAdd.name}`);
  };

  const handleDeleteContact = (id) => {
    const target = contacts.find(c => c.id === id);
    setContacts(contacts.filter(c => c.id !== id));
    showToast(`Archived ${target?.name}`);
  };

  const handlePortalStatusChange = (portalId, newStatus) => {
    setPortals(portals.map(p => p.id === portalId ? { ...p, status: newStatus } : p));
    showToast('Portal status adjusted');
  };

  const handleAddCalendarEvent = (e) => {
    e.preventDefault();
    if (!newEventData.title.trim() || !newEventData.company.trim()) {
      showToast('Please fill out the title and company.');
      return;
    }
    const createdEvent = {
      id: String(Date.now()),
      date: selectedDateStr,
      title: newEventData.title,
      company: newEventData.company,
      type: newEventData.type,
      time: newEventData.time
    };
    setEvents([...events, createdEvent]);
    setShowAddEventModal(false);
    setNewEventData({ title: '', company: '', type: 'Interview', time: '10:00' });
    showToast(`Event scheduled for ${selectedDateStr}`);
  };

  const handleRemoveEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    showToast('Event removed from schedule.');
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            job.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'All' || job.status === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [jobs, searchQuery, stageFilter]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const query = contactSearchQuery.toLowerCase();
      return contact.name.toLowerCase().includes(query) || 
             contact.company.toLowerCase().includes(query) || 
             (contact.role && contact.role.toLowerCase().includes(query));
    });
  }, [contacts, contactSearchQuery]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 
    
    const firstDayInstance = new Date(year, month, 1);
    const startingDayOfWeek = firstDayInstance.getDay(); 
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, totalDaysInPrevMonth - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        str: prevDate.toISOString().split('T')[0]
      });
    }

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currDate = new Date(year, month, i);
      days.push({
        date: currDate,
        isCurrentMonth: true,
        str: currDate.toISOString().split('T')[0]
      });
    }

    const totalGridCells = 42; 
    const remainingCells = totalGridCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        str: nextDate.toISOString().split('T')[0]
      });
    }

    return days;
  }, [currentDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectedDateEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDateStr);
  }, [events, selectedDateStr]);

  const formattedSelectedDateText = useMemo(() => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDateStr]);

  const activePrepJobObj = useMemo(() => {
    return jobs.find(j => j.id === prepSelectedJobId) || jobs[0];
  }, [jobs, prepSelectedJobId]);

  if (view === 'landing') {
    return <Landing onLaunchDashboard={() => setView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222221] font-sans-clean antialiased selection:bg-[#EAE8E3]">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1C1A] text-[#FAF9F5] px-4 py-3 rounded-lg text-xs font-medium tracking-tight shadow-lg flex items-center gap-3 border border-[#2D2D2A] animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D0826C]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#ECEAE4]">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <span className="w-8 h-8 rounded-lg bg-[#2C2C28] text-[#FBFBFA] flex items-center justify-center font-serif-elegant text-base font-bold select-none">
              JD
            </span>
            <div className="flex flex-col">
              <span className="font-serif-elegant text-xl tracking-tight font-bold text-[#1C1C1A]">
                Job Deck
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#8A8881] font-semibold -mt-1 font-sans-clean">
                Studio Edition
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-[#FAF9F3] border border-[#ECEAE4] p-1 rounded-full shadow-sm">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'ledger' 
                  ? 'bg-[#2C2C28] text-[#FBFBFA] shadow-sm' 
                  : 'text-[#6C6A63] hover:text-[#1C1C1A]'
              }`}
            >
              The Ledger
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'calendar' 
                  ? 'bg-[#2C2C28] text-[#FBFBFA] shadow-sm' 
                  : 'text-[#6C6A63] hover:text-[#1C1C1A]'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'contacts' 
                  ? 'bg-[#2C2C28] text-[#FBFBFA] shadow-sm' 
                  : 'text-[#6C6A63] hover:text-[#1C1C1A]'
              }`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('portals')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'portals' 
                  ? 'bg-[#2C2C28] text-[#FBFBFA] shadow-sm' 
                  : 'text-[#6C6A63] hover:text-[#1C1C1A]'
              }`}
            >
              Portals
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                activeTab === 'interviews' 
                  ? 'bg-[#2C2C28] text-[#FBFBFA] shadow-sm' 
                  : 'text-[#6C6A63] hover:text-[#1C1C1A]'
              }`}
            >
              Prep Bank
            </button>
          </nav>

          <div>
            <button
              onClick={() => setIsAddJobOpen(true)}
              className="px-4 py-2 bg-[#2C2C28] text-[#FBFBFA] text-xs font-semibold rounded-lg hover:bg-[#3E3E39] active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Application
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ======================================================= */}
        {/* VIEW 1: THE CENTRAL APPLICATION LEDGER                 */}
        {/* ======================================================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Filter Panel */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF9F3] border border-[#ECEAE4] p-3 rounded-xl shadow-sm">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-[#8C8A82] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by company, role, or position keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-transparent rounded-lg text-xs bg-transparent focus:outline-none focus:bg-[#FFF] focus:border-[#ECEAE4] placeholder-[#8A8881] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#ECEAE4]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C8A82] ml-2" />
                <span className="text-[11px] text-[#6C6A63] font-medium uppercase tracking-wider">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-1.5 border border-[#ECEAE4] bg-[#FFF] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2C2C28] text-[#4C4A43]"
                >
                  <option value="All">All Pipelines</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* List Index */}
            <div className="border border-[#ECEAE4] rounded-2xl bg-[#FFF] overflow-hidden shadow-sm">
              {filteredJobs.length > 0 ? (
                <div className="divide-y divide-[#ECEAE4]">
                  {filteredJobs.map((job) => {
                    const isExpanded = expandedJobId === job.id;
                    return (
                      <div 
                        key={job.id}
                        className={`transition-all duration-200 ${isExpanded ? 'bg-[#FAFBF9]' : 'hover:bg-[#FAF9F3]'}`}
                      >
                        
                        {/* Summary Block */}
                        <div 
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          className="px-6 py-5 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-baseline gap-3">
                              <span className="font-serif-elegant text-xl font-bold text-[#1C1C1A] tracking-tight">
                                {job.company}
                              </span>
                              <span className="text-xs text-[#6C6A63] font-medium font-sans-clean">
                                {job.role}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-[#8A8881]">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.location}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-[#ECEAE4]" />
                              <span>{job.portal}</span>
                              {job.salary && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-[#ECEAE4]" />
                                  <span className="flex items-center gap-0.5">
                                    <DollarSign className="w-3 h-3 text-[#A8A69F]" />
                                    {job.salary}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border font-sans-clean ${
                              job.status === 'Applied' ? 'bg-[#FDF9F2] text-[#B87A29] border-[#F2E3CD]' :
                              job.status === 'Interviewing' ? 'bg-[#EBF7FC] text-[#297AB8] border-[#CDDEE9]' :
                              job.status === 'Offer' ? 'bg-[#EDFAF3] text-[#25854B] border-[#CDE9DA]' :
                              'bg-[#FCF2F2] text-[#B83E29] border-[#E9CDCD]'
                            }`}>
                              {job.status}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#8C8A82]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#8C8A82]" />
                            )}
                          </div>
                        </div>

                        {/* Inline Workspace */}
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-1 border-t border-[#ECEAE4] bg-[#FFF]">
                            
                            {/* Inner Menu Tabs */}
                            <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-2 mb-4">
                              <div className="flex gap-4">
                                <button
                                  onClick={() => setActiveSubTab('jd')}
                                  className={`pb-2 text-xs font-bold transition-all ${
                                    activeSubTab === 'jd' 
                                      ? 'text-[#2C2C28] border-b-2 border-[#2C2C28]' 
                                      : 'text-[#8A8881] hover:text-[#2C2C28]'
                                  }`}
                                >
                                  Requirements & JD
                                </button>
                                <button
                                  onClick={() => setActiveSubTab('contact')}
                                  className={`pb-2 text-xs font-bold transition-all ${
                                    activeSubTab === 'contact' 
                                      ? 'text-[#2C2C28] border-b-2 border-[#2C2C28]' 
                                      : 'text-[#8A8881] hover:text-[#2C2C28]'
                                  }`}
                                >
                                  Recruiting Contact
                                </button>
                                <button
                                  onClick={() => setActiveSubTab('qa')}
                                  className={`pb-2 text-xs font-bold transition-all ${
                                    activeSubTab === 'qa' 
                                      ? 'text-[#2C2C28] border-b-2 border-[#2C2C28]' 
                                      : 'text-[#8A8881] hover:text-[#2C2C28]'
                                  }`}
                                >
                                  Interview Prep ({(job.interviews || []).reduce((acc, curr) => acc + (curr.questions || []).length, 0)})
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#8A8881] font-bold uppercase tracking-wider">Status:</span>
                                {['Applied', 'Interviewing', 'Offer', 'Rejected'].map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleUpdateStatus(job.id, st)}
                                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                                      job.status === st 
                                        ? 'bg-[#2C2C28] text-[#FBFBFA] border-[#2C2C28]' 
                                        : 'bg-[#FFF] text-[#6C6A63] border-[#ECEAE4] hover:text-[#1C1C1A]'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Subtab Content: Requirements & JD */}
                            {activeSubTab === 'jd' && (
                              <div className="space-y-4 animate-fade-in">
                                <div className="bg-[#FAFBF9] border border-[#ECEAE4] rounded-xl p-5">
                                  <p className="font-serif-elegant text-base italic text-[#4C4A43] mb-3">Position Scope</p>
                                  <p className="text-xs leading-relaxed text-[#5C5A53] whitespace-pre-wrap">
                                    {job.jd}
                                  </p>
                                </div>
                                <div className="flex justify-end pt-2">
                                  <button
                                    onClick={(e) => handleDeleteJob(job.id, e)}
                                    className="text-xs text-[#B83E29] hover:text-[#8C2314] font-semibold flex items-center gap-1 hover:underline transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Archive Application
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Subtab Content: Contact Info */}
                            {activeSubTab === 'contact' && (
                              <div className="animate-fade-in space-y-4">
                                {job.hrName ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#FAFBF9] border border-[#ECEAE4] rounded-xl p-5 space-y-3">
                                      <div>
                                        <p className="font-serif-elegant text-lg font-bold text-[#1C1C1A]">{job.hrName}</p>
                                        <p className="text-[11px] text-[#8A8881] font-medium">{job.hrTitle || 'HR Partner'}</p>
                                      </div>
                                      
                                      <div className="space-y-2 pt-3 border-t border-[#ECEAE4] text-xs text-[#5C5A53]">
                                        {job.hrEmail && (
                                          <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-[#8C8A82]" />
                                            <a href={`mailto:${job.hrEmail}`} className="hover:underline text-[#2C2C28]">{job.hrEmail}</a>
                                          </div>
                                        )}
                                        {job.hrPhone && (
                                          <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#8C8A82]" />
                                            <span>{job.hrPhone}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-[#FAFBF9] border border-[#ECEAE4] rounded-xl p-5">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-2">Internal Follow-up & Dialogue Notes</p>
                                      <p className="text-xs leading-relaxed text-[#5C5A53] italic">
                                        "{job.hrNotes || 'No specific recruitment style notes captured yet.'}"
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-6 bg-[#FAFBF9] border border-dashed border-[#ECEAE4] rounded-xl">
                                    <p className="text-xs text-[#8A8881] italic">No active contact assigned. Add a Recruiting Contact through Log Application or the Contact Directory.</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Subtab Content: Simplified Answers-Free Multi-Interview Q&A Log */}
                            {activeSubTab === 'qa' && (
                              <div className="animate-fade-in space-y-6">
                                
                                {/* List of Rounds and Questions */}
                                {(job.interviews && job.interviews.length > 0) ? (
                                  <div className="space-y-4">
                                    {job.interviews.map((round) => (
                                      <div key={round.id} className="border border-[#ECEAE4] rounded-xl bg-[#FAFBF9] p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b border-[#F2F1EC] pb-2">
                                          <div className="flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5 text-[#8C8A82]" />
                                            <span className="font-serif-elegant text-base font-bold text-[#1C1C1A]">{round.roundName}</span>
                                          </div>
                                          <span className="text-[10px] text-[#8A8881] font-semibold">{round.questions.length} Questions</span>
                                        </div>

                                        {/* Question List in Round */}
                                        {round.questions.length > 0 ? (
                                          <ul className="space-y-2">
                                            {round.questions.map((q) => (
                                              <li key={q.id} className="flex items-start justify-between gap-3 text-xs text-[#4C4A43] bg-white border border-[#F2F1EC] p-2.5 rounded-lg">
                                                <div className="flex items-start gap-2.5 flex-1">
                                                  <button
                                                    onClick={() => handleToggleQuestionDone(job.id, round.id, q.id)}
                                                    className="mt-0.5"
                                                  >
                                                    {q.done ? (
                                                      <CheckCircle2 className="w-4 h-4 text-[#25854B]" />
                                                    ) : (
                                                      <div className="w-4 h-4 rounded-full border border-[#C6C5BF] hover:border-[#2C2C28]" />
                                                    )}
                                                  </button>
                                                  <span className={q.done ? 'line-through text-[#A8A69F]' : 'text-[#2C2C28]'}>
                                                    {q.text}
                                                  </span>
                                                </div>
                                                <button 
                                                  onClick={() => handleDeleteQuestion(job.id, round.id, q.id)}
                                                  className="text-[#A8A69F] hover:text-[#B83E29]"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p className="text-[11px] text-[#8A8881] italic">No questions mapped to this round yet.</p>
                                        )}

                                        {/* Inline Add Question for this round */}
                                        <div className="flex gap-2 pt-1">
                                          <input
                                            type="text"
                                            placeholder="Add an interview question..."
                                            value={newQuestionText[round.id] || ''}
                                            onChange={(e) => setNewQuestionText({ ...newQuestionText, [round.id]: e.target.value })}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleAddQuestionToRound(job.id, round.id);
                                            }}
                                            className="flex-1 p-2 border border-[#ECEAE4] rounded-lg text-xs bg-white focus:outline-none focus:border-[#2C2C28] placeholder-[#A8A69F]"
                                          />
                                          <button
                                            onClick={() => handleAddQuestionToRound(job.id, round.id)}
                                            className="px-3 bg-[#2C2C28] text-white rounded-lg text-xs font-semibold hover:bg-[#3E3E39]"
                                          >
                                            Add
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 bg-[#FAFBF9] border border-dashed border-[#ECEAE4] rounded-xl">
                                    <p className="text-xs text-[#8A8881] italic">No active rounds registered.</p>
                                  </div>
                                )}

                                {/* Add New Round Section */}
                                <div className="bg-[#FAF9F3] border border-[#ECEAE4] rounded-xl p-4 space-y-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C6A63]">Add New Interview Round</p>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="e.g., Technical Screen, Founder Cultural Sync"
                                      value={newRoundName}
                                      onChange={(e) => setNewRoundName(e.target.value)}
                                      className="flex-1 p-2 border border-[#ECEAE4] rounded-lg text-xs bg-white focus:outline-none focus:border-[#2C2C28]"
                                    />
                                    <button
                                      onClick={() => handleAddInterviewRound(job.id)}
                                      className="px-4 py-2 bg-[#2C2C28] text-white text-xs font-bold rounded-lg hover:bg-[#3E3E39]"
                                    >
                                      Create Round
                                    </button>
                                  </div>
                                </div>

                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-xs font-semibold text-[#8A8881] font-serif-elegant italic text-lg">No application entries logged.</p>
                  <p className="text-[11px] text-[#A8A69F] mt-1">Refine your search tags or add an application to begin tracking.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 2: INTERACTIVE CALENDAR VIEW                      */}
        {/* ======================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#ECEAE4] pb-4 gap-4">
              <div>
                <h3 className="font-serif-elegant text-2xl font-bold text-[#1C1C1A]">The Daily Schedule</h3>
                <p className="text-xs text-[#8A8881] mt-0.5">Map out critical technical interviews, application targets, and follow-ups.</p>
              </div>

              <div className="flex items-center gap-3 bg-[#FAF9F3] border border-[#ECEAE4] px-3 py-1.5 rounded-lg shadow-sm">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-[#ECEAE4] rounded-md transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#4C4A43]" />
                </button>
                <span className="font-serif-elegant text-lg font-bold text-[#2C2C28] min-w-[110px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-[#ECEAE4] rounded-md transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#4C4A43]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-[#FFF] border border-[#ECEAE4] rounded-2xl p-5 shadow-sm">
                
                <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-[#8A8881] pb-3 border-b border-[#ECEAE4] mb-3">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((cell, idx) => {
                    const isSelected = selectedDateStr === cell.str;
                    const hasEvents = events.some(e => e.date === cell.str);
                    const dayEvents = events.filter(e => e.date === cell.str);
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDateStr(cell.str)}
                        className={`min-h-[75px] p-2 rounded-xl flex flex-col justify-between cursor-pointer border transition-all duration-150 ${
                          !cell.isCurrentMonth ? 'text-[#C6C5BF] border-transparent opacity-40' : 'text-[#1C1C1A]'
                        } ${
                          isSelected 
                            ? 'bg-[#2C2C28] text-[#FBFBFA] border-[#2C2C28] shadow-md transform scale-[1.03]' 
                            : 'bg-[#FFF] border-[#F2F1EC] hover:bg-[#FAF9F3] hover:border-[#ECEAE4]'
                        }`}
                      >
                        <span className="text-[11px] font-bold self-end font-sans-clean">{cell.date.getDate()}</span>
                        
                        {hasEvents && (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {dayEvents.slice(0, 2).map((ev) => (
                                <div 
                                  key={ev.id}
                                  className={`h-1 w-full rounded-full ${
                                    isSelected 
                                      ? 'bg-[#FAFBF9]/80' 
                                      : ev.type === 'Interview' ? 'bg-[#297AB8]' :
                                        ev.type === 'Deadline' ? 'bg-[#B87A29]' : 'bg-[#6C6A63]'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`text-[8px] font-bold tracking-tight block truncate ${isSelected ? 'text-[#EFEFEA]' : 'text-[#8A8881]'}`}>
                              {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              <div className="lg:col-span-4 space-y-4">
                
                <div className="bg-[#FAF9F3] border border-[#ECEAE4] rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-[#ECEAE4] pb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8881]">Selected Date</p>
                    <p className="font-serif-elegant text-xl font-bold text-[#1C1C1A] mt-0.5">{formattedSelectedDateText}</p>
                  </div>

                  <div className="space-y-3 min-h-[150px] max-h-[300px] overflow-y-auto pr-1">
                    {selectedDateEvents.length > 0 ? (
                      selectedDateEvents.map((ev) => (
                        <div key={ev.id} className="bg-[#FFF] border border-[#ECEAE4] rounded-xl p-3 shadow-sm relative group">
                          <button 
                            onClick={() => handleRemoveEvent(ev.id)}
                            className="absolute top-2.5 right-2.5 text-[#A8A69F] hover:text-[#B83E29] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              ev.type === 'Interview' ? 'bg-[#297AB8]' :
                              ev.type === 'Deadline' ? 'bg-[#B87A29]' : 'bg-[#6C6A63]'
                            }`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8881]">{ev.type}</span>
                          </div>

                          <p className="text-xs font-semibold text-[#1C1C1A]">{ev.title}</p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#FAF9F3] text-[10px] text-[#6C6A63] font-medium">
                            <span className="italic">at {ev.company}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {ev.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <CalendarIcon className="w-6 h-6 text-[#A8A69F] mb-1.5" />
                        <p className="text-xs text-[#8A8881] italic">No schedule milestones registered for this date.</p>
                      </div>
                    )}
                  </div>

                  {!showAddEventModal ? (
                    <button
                      onClick={() => setShowAddEventModal(true)}
                      className="w-full py-2 bg-[#2C2C28] text-[#FBFBFA] rounded-lg text-xs font-semibold hover:bg-[#3E3E39] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Scheduled Event
                    </button>
                  ) : (
                    <form onSubmit={handleAddCalendarEvent} className="bg-[#FFF] border border-[#ECEAE4] rounded-xl p-3.5 space-y-3 animate-scale-in">
                      <div className="flex items-center justify-between border-b border-[#F2F1EC] pb-1.5 mb-2">
                        <span className="text-[10px] font-bold uppercase text-[#8A8881]">New Event</span>
                        <button type="button" onClick={() => setShowAddEventModal(false)} className="text-[#8A8881] hover:text-[#2C2C28]">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Event Title (e.g. Technical Round)"
                          value={newEventData.title}
                          onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                          className="w-full p-2 border border-[#ECEAE4] rounded-md text-[11px] focus:outline-none focus:border-[#2C2C28]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Target Company"
                          value={newEventData.company}
                          onChange={(e) => setNewEventData({ ...newEventData, company: e.target.value })}
                          className="w-full p-2 border border-[#ECEAE4] rounded-md text-[11px] focus:outline-none focus:border-[#2C2C28]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={newEventData.type}
                            onChange={(e) => setNewEventData({ ...newEventData, type: e.target.value })}
                            className="p-2 border border-[#ECEAE4] rounded-md text-[11px] bg-[#FFF]"
                          >
                            <option value="Interview">Interview</option>
                            <option value="Deadline">Deadline</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Preparation">Preparation</option>
                          </select>
                          <input
                            type="time"
                            value={newEventData.time}
                            onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                            className="p-2 border border-[#ECEAE4] rounded-md text-[11px] text-[#4C4A43]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#2C2C28] text-[#FBFBFA] rounded-md text-xs font-semibold hover:bg-[#3E3E39]"
                      >
                        Add to Day
                      </button>
                    </form>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 3: CONTACT DIRECTORY                              */}
        {/* ======================================================= */}
        {activeTab === 'contacts' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#ECEAE4] pb-4 gap-4">
              <div>
                <h3 className="font-serif-elegant text-2xl font-bold text-[#1C1C1A]">Contact Directory</h3>
                <p className="text-xs text-[#8A8881] mt-0.5">Maintain professional relationships with HR contacts, recruitment agencies, and referrals.</p>
              </div>
              
              <button
                onClick={() => setShowAddContactForm(!showAddContactForm)}
                className="px-4 py-2 border border-[#2C2C28] text-[#2C2C28] hover:bg-[#2C2C28] hover:text-[#FBFBFA] rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddContactForm ? "Collapse Form" : "New Contact Record"}
              </button>
            </div>

            {showAddContactForm && (
              <form onSubmit={handleCreateContact} className="bg-[#FAF9F3] border border-[#ECEAE4] rounded-2xl p-6 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-2">
                  <span className="font-serif-elegant text-base font-bold text-[#2C2C28]">Record New Professional Contact</span>
                  <button type="button" onClick={() => setShowAddContactForm(false)} className="text-[#8A8881] hover:text-[#2C2C28]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane McRecruiter"
                      value={newContactData.name}
                      onChange={(e) => setNewContactData({ ...newContactData, name: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Principal Headhunter"
                      value={newContactData.role}
                      onChange={(e) => setNewContactData({ ...newContactData, role: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Associated Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stripe, Independent Agency"
                      value={newContactData.company}
                      onChange={(e) => setNewContactData({ ...newContactData, company: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. contact@domain.com"
                      value={newContactData.email}
                      onChange={(e) => setNewContactData({ ...newContactData, email: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Direct Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 019-2831"
                      value={newContactData.phone}
                      onChange={(e) => setNewContactData({ ...newContactData, phone: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Dialogue Logs / Interaction Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Log recruiting preferences, personal context, or active follow-up arrangements..."
                    value={newContactData.notes}
                    onChange={(e) => setNewContactData({ ...newContactData, notes: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContactForm(false)}
                    className="px-4 py-2 border border-[#ECEAE4] rounded-lg text-xs font-bold hover:bg-[#FFF]"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2C2C28] text-[#FBFBFA] rounded-lg text-xs font-bold hover:bg-[#3E3E39]"
                  >
                    Add to Directory
                  </button>
                </div>
              </form>
            )}

            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-[#8C8A82] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contact index by name, organization, or title..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#ECEAE4] rounded-xl text-xs bg-[#FFF] focus:outline-none focus:border-[#2C2C28]"
              />
            </div>

            {filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => {
                  const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  
                  return (
                    <div 
                      key={contact.id} 
                      className="bg-[#FFF] border border-[#ECEAE4] rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#C6C5BF] transition-all relative group flex flex-col justify-between"
                    >
                      <button 
                        onClick={() => handleDeleteContact(contact.id)}
                        className="absolute top-4 right-4 text-[#A8A69F] hover:text-[#B83E29] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Archive Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FAF9F3] border border-[#ECEAE4] flex items-center justify-center font-serif-elegant font-bold text-sm text-[#4C4A43] shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif-elegant text-lg font-bold text-[#1C1C1A] truncate">{contact.name}</h4>
                            <p className="text-[11px] text-[#8A8881] font-medium truncate">{contact.role}</p>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF9F3] border border-[#ECEAE4] rounded-md text-[10px] font-bold text-[#6C6A63]">
                          <Briefcase className="w-3 h-3 text-[#A8A69F]" />
                          <span>{contact.company}</span>
                        </div>

                        {contact.notes && (
                          <div className="text-xs text-[#5C5A53] leading-relaxed italic bg-[#FAFBF9] border border-[#F2F1EC] rounded-xl p-3">
                            "{contact.notes}"
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#F2F1EC] space-y-1.5 text-xs text-[#6C6A63]">
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-[#A8A69F]" />
                            <a href={`mailto:${contact.email}`} className="hover:underline hover:text-[#2C2C28] truncate">{contact.email}</a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#A8A69F]" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#FFF] border border-[#ECEAE4] rounded-2xl">
                <Users className="w-8 h-8 text-[#A8A69F] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#8A8881] font-serif-elegant italic text-lg">No directory logs matching queries.</p>
                <p className="text-[11px] text-[#A8A69F]">Create stand-alone contact sheets or review details in your active pipeline ledger.</p>
              </div>
            )}

          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 4: PORTALS HUB                                    */}
        {/* ======================================================= */}
        {activeTab === 'portals' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="border-b border-[#ECEAE4] pb-4">
              <h3 className="font-serif-elegant text-2xl font-bold text-[#1C1C1A]">Public Profiles & Synced Portals</h3>
              <p className="text-xs text-[#8A8881] mt-0.5">Control your outreach status indicators on active developer and designer networks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portals.map((portal) => (
                <div key={portal.id} className="border border-[#ECEAE4] rounded-2xl p-5 bg-[#FFF] space-y-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-serif-elegant text-lg font-bold text-[#1C1C1A]">{portal.name}</h4>
                        <a 
                          href={portal.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[11px] text-[#8C8A82] hover:text-[#2C2C28] flex items-center gap-0.5 mt-0.5 font-medium hover:underline"
                        >
                          {portal.url.replace('https://', '')} <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#F2F1EC]">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">
                      <span>Outreach Tag</span>
                      <span className="text-[#A8A69F]">{portal.lastChecked}</span>
                    </div>
                    <select
                      value={portal.status}
                      onChange={(e) => handlePortalStatusChange(portal.id, e.target.value)}
                      className="w-full px-2.5 py-2 border border-[#ECEAE4] bg-[#FAFBF9] rounded-lg text-xs font-bold focus:outline-none focus:border-[#2C2C28] text-[#4C4A43]"
                    >
                      <option value="Actively Looking">Actively Looking</option>
                      <option value="Open to Offers">Open to Offers</option>
                      <option value="Active Coding">Active Coding</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-dashed border-[#ECEAE4] rounded-2xl p-6 bg-[#FAFBF9] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#1C1C1A]">Automate incoming applications?</p>
                <p className="text-xs text-[#6C6A63] leading-relaxed">
                  Forward application details directly to <code className="bg-[#ECEAE4] px-1.5 py-0.5 rounded text-[#2C2C28] font-semibold text-[10px]">sync@jobdeck.app</code> to automatically generate application sheets.
                </p>
              </div>
              <button 
                onClick={() => showToast('In-bound email parsing configured successfully.')}
                className="px-3.5 py-1.5 border border-[#2C2C28] text-[#2C2C28] hover:bg-[#2C2C28] hover:text-[#FBFBFA] rounded-lg text-xs font-bold transition-all shrink-0"
              >
                Configure Forwarder
              </button>
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 5: UPGRADED ANSWERS-FREE PREP BANK                 */}
        {/* ======================================================= */}
        {}
        {activeTab === 'interviews' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="border-b border-[#ECEAE4] pb-4">
              <h3 className="font-serif-elegant text-2xl font-bold text-[#1C1C1A]">Prep Q&A Vault</h3>
              <p className="text-xs text-[#8A8881] mt-0.5">Manage, review, and mark off questions categorized precisely by company and individual interview round.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left Column: Company Selector */}
              <div className="md:col-span-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8881] block mb-2">Company Pipeline</span>
                <div className="flex flex-row md:flex-col overflow-x-auto gap-2 border-b md:border-b-0 pb-3 md:pb-0">
                  {jobs.map((j) => {
                    const totalRounds = (j.interviews || []).length;
                    const totalQ = (j.interviews || []).reduce((acc, curr) => acc + (curr.questions || []).length, 0);
                    const completedQ = (j.interviews || []).reduce((acc, r) => acc + (r.questions || []).filter(q => q.done).length, 0);
                    const isSelected = prepSelectedJobId === j.id;

                    return (
                      <button
                        key={j.id}
                        onClick={() => setPrepSelectedJobId(j.id)}
                        className={`text-left p-3 rounded-xl border text-xs flex flex-col justify-between transition-all duration-150 min-w-[150px] md:min-w-0 ${
                          isSelected 
                            ? 'bg-[#2C2C28] text-white border-[#2C2C28] shadow-md' 
                            : 'bg-white text-[#2C2C28] border-[#ECEAE4] hover:bg-[#FAF9F3] hover:border-[#C6C5BF]'
                        }`}
                      >
                        <div className="flex items-baseline justify-between w-full">
                          <span className="font-serif-elegant text-lg font-bold truncate">{j.company}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-widest ${isSelected ? 'text-white/60' : 'text-[#8A8881]'}`}>{j.role}</span>
                        </div>
                        <div className="flex items-center justify-between w-full mt-3 text-[10px] font-medium">
                          <span className={isSelected ? 'text-white/85' : 'text-[#6C6A63]'}>{totalRounds} Round{totalRounds === 1 ? '' : 's'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF9F3] text-[#2C2C28] border border-[#ECEAE4]'}`}>
                            {completedQ}/{totalQ} Review
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Dynamic Interview Rounds and Practice Cards */}
              <div className="md:col-span-8 space-y-6">
                {activePrepJobObj ? (
                  <div className="space-y-6">
                    
                    {/* Header Detail */}
                    <div className="flex items-center justify-between border-b border-[#F2F1EC] pb-3">
                      <div>
                        <h4 className="font-serif-elegant text-xl font-bold text-[#1C1C1A]">Prep Desk: {activePrepJobObj.company}</h4>
                        <p className="text-xs text-[#8A8881] mt-0.5">Role focus: {activePrepJobObj.role} &bull; Pipeline Stage: {activePrepJobObj.status}</p>
                      </div>

                      {/* Quick action to add a Round */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., Live Coding"
                          value={newRoundName}
                          onChange={(e) => setNewRoundName(e.target.value)}
                          className="p-1.5 border border-[#ECEAE4] rounded-lg text-xs bg-white focus:outline-none focus:border-[#2C2C28]"
                        />
                        <button
                          onClick={() => handleAddInterviewRound(activePrepJobObj.id)}
                          className="px-3 py-1.5 bg-[#2C2C28] text-white text-xs font-bold rounded-lg hover:bg-[#3E3E39]"
                        >
                          + Round
                        </button>
                      </div>
                    </div>

                    {/* Rendering Interview Rounds */}
                    {activePrepJobObj.interviews && activePrepJobObj.interviews.length > 0 ? (
                      <div className="space-y-5">
                        {activePrepJobObj.interviews.map((round) => (
                          <div key={round.id} className="bg-white border border-[#ECEAE4] rounded-2xl p-5 shadow-sm space-y-4">
                            
                            {/* Round Title Block */}
                            <div className="flex items-center justify-between border-b border-[#FAF9F3] pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#D0826C]" />
                                <span className="font-serif-elegant text-lg font-bold text-[#1C1C1A]">{round.roundName}</span>
                              </div>
                              <span className="text-[11px] font-semibold text-[#8A8881] bg-[#FAF9F3] px-2 py-0.5 rounded-md border border-[#F2F1EC]">
                                {round.questions.length} Question{round.questions.length === 1 ? '' : 's'}
                              </span>
                            </div>

                            {/* Answers-Free Dynamic Checklist Cards */}
                            {round.questions.length > 0 ? (
                              <div className="space-y-2.5">
                                {round.questions.map((q) => (
                                  <div 
                                    key={q.id} 
                                    className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-colors ${
                                      q.done 
                                        ? 'bg-[#FAFBF9] border-[#E2EFEB]/60' 
                                        : 'bg-white border-[#F2F1EC] hover:border-[#ECEAE4]'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3 flex-1">
                                      <button
                                        onClick={() => handleToggleQuestionDone(activePrepJobObj.id, round.id, q.id)}
                                        className="mt-0.5 flex-shrink-0"
                                      >
                                        {q.done ? (
                                          <CheckCircle2 className="w-4.5 h-4.5 text-[#25854B]" />
                                        ) : (
                                          <div className="w-4.5 h-4.5 rounded-full border border-[#C6C5BF] hover:border-[#2C2C28]" />
                                        )}
                                      </button>
                                      <span className={`text-xs leading-relaxed font-medium ${q.done ? 'line-through text-[#8A8881]' : 'text-[#1C1C1A]'}`}>
                                        {q.text}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteQuestion(activePrepJobObj.id, round.id, q.id)}
                                      className="text-[#A8A69F] hover:text-[#B83E29] transition-colors flex-shrink-0"
                                      title="Delete Question"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 border border-dashed border-[#ECEAE4] rounded-xl">
                                <HelpCircle className="w-5 h-5 text-[#A8A69F] mx-auto mb-1.5" />
                                <p className="text-xs text-[#8A8881] italic">No interview questions recorded for this round yet.</p>
                              </div>
                            )}

                            {/* Question Fast Add input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="e.g., What design frameworks or principles do you apply for grid scaling?"
                                value={newQuestionText[round.id] || ''}
                                onChange={(e) => setNewQuestionText({ ...newQuestionText, [round.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddQuestionToRound(activePrepJobObj.id, round.id);
                                }}
                                className="flex-1 p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-white focus:outline-none focus:border-[#2C2C28] placeholder-[#A8A69F]"
                              />
                              <button
                                onClick={() => handleAddQuestionToRound(activePrepJobObj.id, round.id)}
                                className="px-4 py-2 bg-[#2C2C28] text-white text-xs font-bold rounded-lg hover:bg-[#3E3E39]"
                              >
                                Save Question
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 border border-dashed border-[#ECEAE4] rounded-2xl bg-white shadow-sm">
                        <Layers className="w-8 h-8 text-[#A8A69F] mx-auto mb-2" />
                        <p className="font-serif-elegant text-lg font-bold text-[#1C1C1A]">No Interview Rounds logged.</p>
                        <p className="text-xs text-[#8A8881] mt-1">Add a round at the top right to begin capturing questions.</p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-[#ECEAE4] rounded-2xl bg-white shadow-sm">
                    <BookOpen className="w-8 h-8 text-[#A8A69F] mx-auto mb-2" />
                    <p className="font-serif-elegant text-lg font-bold text-[#1C1C1A]">Add applications first.</p>
                    <p className="text-xs text-[#8A8881] mt-1">Once logged, individual interview rounds and practice decks will construct here.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ======================================================= */}
      {/* DIALOG MODAL: LOG NEW APPLICATION                       */}
      {/* ======================================================= */}
      {isAddJobOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF] rounded-2xl border border-[#ECEAE4] max-w-xl w-full shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-[#ECEAE4] flex items-center justify-between">
              <div>
                <h3 className="font-serif-elegant text-xl font-bold text-[#1C1C1A]">Record New Application</h3>
                <p className="text-[11px] text-[#8A8881] mt-0.5">Track position targets, portal connections, and primary recruitment links.</p>
              </div>
              <button 
                onClick={() => setIsAddJobOpen(false)}
                className="text-[#8C8A82] hover:text-[#2C2C28] p-1.5 hover:bg-[#FAF9F3] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Linear"
                    value={newJobData.company}
                    onChange={(e) => setNewJobData({ ...newJobData, company: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none focus:border-[#2C2C28] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Role / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newJobData.role}
                    onChange={(e) => setNewJobData({ ...newJobData, role: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none focus:border-[#2C2C28] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Stage</label>
                  <select
                    value={newJobData.status}
                    onChange={(e) => setNewJobData({ ...newJobData, status: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:outline-none focus:border-[#2C2C28]"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Channel Source</label>
                  <select
                    value={newJobData.portal}
                    onChange={(e) => setNewJobData({ ...newJobData, portal: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:outline-none focus:border-[#2C2C28]"
                  >
                    <option value="Read.cv">Read.cv</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Twitter/X">Twitter/X</option>
                    <option value="Direct Link">Direct Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, Berlin"
                    value={newJobData.location}
                    onChange={(e) => setNewJobData({ ...newJobData, location: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none focus:border-[#2C2C28]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Compensation Scale</label>
                  <input
                    type="text"
                    placeholder="e.g. $140k - $160k"
                    value={newJobData.salary}
                    onChange={(e) => setNewJobData({ ...newJobData, salary: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none focus:border-[#2C2C28]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">Date Submitted</label>
                  <input
                    type="date"
                    value={newJobData.dateApplied}
                    onChange={(e) => setNewJobData({ ...newJobData, dateApplied: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:outline-none focus:border-[#2C2C28]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#ECEAE4] space-y-3">
                <h4 className="font-serif-elegant text-base font-bold text-[#2C2C28]">
                  Talent Partner Contacts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Partner Full Name"
                    value={newJobData.hrName}
                    onChange={(e) => setNewJobData({ ...newJobData, hrName: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Recruiting Manager)"
                    value={newJobData.hrTitle}
                    onChange={(e) => setNewJobData({ ...newJobData, hrTitle: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newJobData.hrEmail}
                    onChange={(e) => setNewJobData({ ...newJobData, hrEmail: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Direct Extension / Phone"
                    value={newJobData.hrPhone}
                    onChange={(e) => setNewJobData({ ...newJobData, hrPhone: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Primary recruiters follow-up frequency, preferences or note logs..."
                  rows="2"
                  value={newJobData.hrNotes}
                  onChange={(e) => setNewJobData({ ...newJobData, hrNotes: e.target.value })}
                  className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#ECEAE4]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1.5">
                  Job Description / Focus Areas
                </label>
                <textarea
                  placeholder="Paste direct platform requirements, targeted design stacks or tech specifications..."
                  rows="3"
                  value={newJobData.jd}
                  onChange={(e) => setNewJobData({ ...newJobData, jd: e.target.value })}
                  className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FAFBF9] focus:bg-[#FFF] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#ECEAE4] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddJobOpen(false)}
                  className="px-4 py-2 border border-[#ECEAE4] rounded-lg text-xs font-bold hover:bg-[#FAF9F3] transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2C2C28] text-[#FBFBFA] rounded-lg text-xs font-bold hover:bg-[#3E3E39] active:scale-95 transition-all shadow-sm"
                >
                  Log to Ledger
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}