import React, { useState, useMemo, useEffect, useRef } from 'react';
import logo from './assets/logo.png';
import { supabase } from './lib/supabaseClient';
import { api } from './lib/api';
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
  Layers,
  FolderKanban,
  Code2,
  Link2,
  Tag,
  LogOut,
  Loader2,
  AlertTriangle,
  Globe
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

const NAV_TABS = [
  { key: 'ledger', label: 'The Ledger' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'portals', label: 'Portals' },
  { key: 'projects', label: 'Projects' },
  { key: 'interviews', label: 'Prep Bank' }
];

// ---------------------------------------------------------------------------
// Supabase row <-> app-state mappers (DB columns are snake_case; the app's
// state and JSX below use camelCase throughout).
// ---------------------------------------------------------------------------

const mapJobFromDb = (row) => ({
  id: row.id,
  company: row.company,
  role: row.role,
  status: row.status,
  portal: row.portal,
  dateApplied: row.date_applied,
  salary: row.salary,
  location: row.location,
  hrName: row.hr_name,
  hrTitle: row.hr_title,
  hrEmail: row.hr_email,
  hrPhone: row.hr_phone,
  hrNotes: row.hr_notes,
  jd: row.jd,
  interviews: row.interviews || []
});

const mapJobToDb = (job) => ({
  company: job.company,
  role: job.role,
  status: job.status,
  portal: job.portal,
  date_applied: job.dateApplied || null,
  salary: job.salary,
  location: job.location,
  hr_name: job.hrName,
  hr_title: job.hrTitle,
  hr_email: job.hrEmail,
  hr_phone: job.hrPhone,
  hr_notes: job.hrNotes,
  jd: job.jd,
  interviews: job.interviews || []
});

const mapContactFromDb = (row) => ({
  id: row.id,
  name: row.name,
  role: row.role,
  company: row.company,
  email: row.email,
  phone: row.phone,
  notes: row.notes,
  linkedJobId: row.linked_job_id || ''
});

const mapContactToDb = (contact) => ({
  name: contact.name,
  role: contact.role,
  company: contact.company,
  email: contact.email,
  phone: contact.phone,
  notes: contact.notes,
  linked_job_id: contact.linkedJobId || null
});

const mapPortalFromDb = (row) => ({
  id: row.id,
  name: row.name,
  url: row.url,
  status: row.status,
  lastChecked: row.last_checked
});

const mapPortalToDb = (portal) => ({
  name: portal.name,
  url: portal.url,
  status: portal.status,
  last_checked: portal.lastChecked
});

const mapEventFromDb = (row) => ({
  id: row.id,
  date: row.date,
  title: row.title,
  company: row.company,
  type: row.type,
  time: row.time
});

const mapEventToDb = (event) => ({
  date: event.date,
  title: event.title,
  company: event.company,
  type: event.type,
  time: event.time
});

const mapProjectFromDb = (row) => ({
  id: row.id,
  name: row.name,
  status: row.status,
  tags: row.tags || [],
  description: row.description,
  repoUrl: row.repo_url,
  liveUrl: row.live_url,
  linkedJobId: row.linked_job_id || '',
  updatedAt: row.updated_at
});

const mapProjectToDb = (project) => ({
  name: project.name,
  status: project.status,
  tags: project.tags || [],
  description: project.description,
  repo_url: project.repoUrl,
  live_url: project.liveUrl,
  linked_job_id: project.linkedJobId || null,
  updated_at: project.updatedAt
});

export default function Dashboard({ onExitToLanding, session } = {}) {
  useEffect(() => {
    injectCustomFonts();
  }, []);

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'calendar' | 'contacts' | 'portals' | 'projects' | 'interviews'
  const [jobs, setJobs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [portals, setPortals] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('jd'); // 'jd' | 'contact' | 'qa'

  // Prep Bank Active States
  const [prepSelectedJobId, setPrepSelectedJobId] = useState('');
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

  // Profile Menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Nav Tab Slider
  const navRef = useRef(null);
  const navButtonRefs = useRef({});
  const [navSlider, setNavSlider] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const measure = () => {
      const navEl = navRef.current;
      const activeButton = navButtonRefs.current[activeTab];
      if (!navEl || !activeButton) return;

      const navRect = navEl.getBoundingClientRect();
      const btnRect = activeButton.getBoundingClientRect();
      setNavSlider({
        left: btnRect.left - navRect.left + navEl.scrollLeft,
        width: btnRect.width,
        ready: true
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeTab]);

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

  // Portals States
  const [showAddPortalForm, setShowAddPortalForm] = useState(false);
  const [newPortalData, setNewPortalData] = useState({
    name: '',
    url: '',
    status: 'Actively Looking'
  });

  // Project Tracker States
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    status: 'Planning',
    tags: '',
    description: '',
    repoUrl: '',
    liveUrl: '',
    linkedJobId: ''
  });

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    company: '',
    type: 'Interview',
    time: '10:00'
  });

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      setIsLoadingData(true);
      setLoadError('');

      const { data, error } = await api.bootstrap();

      if (!isMounted) return;

      if (error) {
        setLoadError(error.message);
        setIsLoadingData(false);
        return;
      }

      setJobs(data.jobs.map(mapJobFromDb));
      setContacts(data.contacts.map(mapContactFromDb));
      setPortals(data.portals.map(mapPortalFromDb));
      setEvents(data.events.map(mapEventFromDb));
      setProjects(data.projects.map(mapProjectFromDb));
      setIsLoadingData(false);
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJobData.company || !newJobData.role) {
      showToast('Please enter both Company and Role.');
      return;
    }

    const payload = mapJobToDb({
      ...newJobData,
      salary: newJobData.salary || 'Undisclosed',
      location: newJobData.location || 'Remote',
      jd: newJobData.jd || 'No description provided.',
      interviews: [
        {
          id: 'int_gen_' + Date.now(),
          roundName: 'General Review',
          questions: []
        }
      ]
    });

    const { data, error } = await api.create('jobs', payload);
    if (error) {
      showToast('Could not save application.');
      return;
    }

    const jobToAdd = mapJobFromDb(data);
    setJobs([jobToAdd, ...jobs]);
    setIsAddJobOpen(false);
    setExpandedJobId(jobToAdd.id);
    setActiveSubTab('jd');
    setPrepSelectedJobId(jobToAdd.id);
    showToast(`Added ${jobToAdd.role} at ${jobToAdd.company}`);

    if (jobToAdd.hrName && jobToAdd.hrName.trim()) {
      const contactPayload = mapContactToDb({
        name: jobToAdd.hrName,
        role: jobToAdd.hrTitle || 'Talent Partner',
        company: jobToAdd.company,
        email: jobToAdd.hrEmail,
        phone: jobToAdd.hrPhone,
        notes: jobToAdd.hrNotes || 'Synchronized from applied job profile.',
        linkedJobId: jobToAdd.id
      });
      const { data: contactData, error: contactError } = await api.create('contacts', contactPayload);
      if (!contactError) setContacts(prev => [mapContactFromDb(contactData), ...prev]);
    }

    const eventPayload = mapEventToDb({
      date: newJobData.dateApplied,
      title: 'Applied to Role',
      company: newJobData.company,
      type: 'Deadline',
      time: '09:00'
    });
    const { data: eventData, error: eventError } = await api.create('events', eventPayload);
    if (!eventError) setEvents(prev => [...prev, mapEventFromDb(eventData)]);

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

  const handleDeleteJob = async (id, e) => {
    e.stopPropagation();
    const removed = jobs.find(j => j.id === id);

    const { error } = await api.remove('jobs', id);
    if (error) {
      showToast('Could not archive application.');
      return;
    }

    const linkedContactIds = contacts.filter(c => c.linkedJobId === id).map(c => c.id);
    if (linkedContactIds.length > 0) {
      await Promise.all(linkedContactIds.map(cid => api.remove('contacts', cid)));
    }

    setJobs(jobs.filter(j => j.id !== id));
    setContacts(contacts.filter(c => c.linkedJobId !== id));

    if (expandedJobId === id) setExpandedJobId(null);
    if (prepSelectedJobId === id) {
      const remaining = jobs.filter(j => j.id !== id);
      setPrepSelectedJobId(remaining.length > 0 ? remaining[0].id : '');
    }
    showToast(`Archived application for ${removed?.company}`);
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    const { error } = await api.update('jobs', jobId, { status: newStatus });
    if (error) {
      showToast('Could not update status.');
      return;
    }
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    showToast(`Status updated to ${newStatus}`);
  };

  const handleAddInterviewRound = async (jobId) => {
    if (!newRoundName.trim()) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedInterviews = [
      ...(job.interviews || []),
      { id: 'int_' + Date.now(), roundName: newRoundName, questions: [] }
    ];

    const { error } = await api.update('jobs', jobId, { interviews: updatedInterviews });
    if (error) {
      showToast('Could not add interview round.');
      return;
    }

    setJobs(jobs.map(j => j.id === jobId ? { ...j, interviews: updatedInterviews } : j));
    setNewRoundName('');
    showToast('Interview round added.');
  };

  const handleAddQuestionToRound = async (jobId, roundId) => {
    const text = newQuestionText[roundId];
    if (!text || !text.trim()) return;

    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedInterviews = job.interviews.map(r => {
      if (r.id === roundId) {
        return {
          ...r,
          questions: [...r.questions, { id: 'q_' + Date.now(), text: text.trim(), done: false }]
        };
      }
      return r;
    });

    const { error } = await api.update('jobs', jobId, { interviews: updatedInterviews });
    if (error) {
      showToast('Could not save question.');
      return;
    }

    setJobs(jobs.map(j => j.id === jobId ? { ...j, interviews: updatedInterviews } : j));
    setNewQuestionText(prev => ({ ...prev, [roundId]: '' }));
    showToast('Question saved.');
  };

  const handleToggleQuestionDone = async (jobId, roundId, questionId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedInterviews = job.interviews.map(r => {
      if (r.id === roundId) {
        return {
          ...r,
          questions: r.questions.map(q => q.id === questionId ? { ...q, done: !q.done } : q)
        };
      }
      return r;
    });

    const { error } = await api.update('jobs', jobId, { interviews: updatedInterviews });
    if (error) {
      showToast('Could not update question.');
      return;
    }

    setJobs(jobs.map(j => j.id === jobId ? { ...j, interviews: updatedInterviews } : j));
  };

  const handleDeleteQuestion = async (jobId, roundId, questionId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedInterviews = job.interviews.map(r => {
      if (r.id === roundId) {
        return { ...r, questions: r.questions.filter(q => q.id !== questionId) };
      }
      return r;
    });

    const { error } = await api.update('jobs', jobId, { interviews: updatedInterviews });
    if (error) {
      showToast('Could not remove question.');
      return;
    }

    setJobs(jobs.map(j => j.id === jobId ? { ...j, interviews: updatedInterviews } : j));
    showToast('Question removed.');
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!newContactData.name.trim() || !newContactData.company.trim()) {
      showToast('Name and Company are required.');
      return;
    }

    const payload = mapContactToDb({
      ...newContactData,
      role: newContactData.role || 'Recruiting Partner',
      notes: newContactData.notes || 'Manually logged contact.',
      linkedJobId: ''
    });

    const { data, error } = await api.create('contacts', payload);
    if (error) {
      showToast('Could not save contact.');
      return;
    }

    const contactToAdd = mapContactFromDb(data);
    setContacts([contactToAdd, ...contacts]);
    setShowAddContactForm(false);
    setNewContactData({ name: '', role: '', company: '', email: '', phone: '', notes: '' });
    showToast(`Registered contact: ${contactToAdd.name}`);
  };

  const handleDeleteContact = async (id) => {
    const target = contacts.find(c => c.id === id);
    const { error } = await api.remove('contacts', id);
    if (error) {
      showToast('Could not archive contact.');
      return;
    }
    setContacts(contacts.filter(c => c.id !== id));
    showToast(`Archived ${target?.name}`);
  };

  const handleCreatePortal = async (e) => {
    e.preventDefault();
    if (!newPortalData.name.trim()) {
      showToast('Please name the portal.');
      return;
    }

    const payload = mapPortalToDb({ ...newPortalData, lastChecked: 'Just added' });
    const { data, error } = await api.create('portals', payload);
    if (error) {
      showToast('Could not save portal.');
      return;
    }

    setPortals([mapPortalFromDb(data), ...portals]);
    setShowAddPortalForm(false);
    setNewPortalData({ name: '', url: '', status: 'Actively Looking' });
    showToast(`Added portal: ${data.name}`);
  };

  const handleDeletePortal = async (id) => {
    const target = portals.find(p => p.id === id);
    const { error } = await api.remove('portals', id);
    if (error) {
      showToast('Could not remove portal.');
      return;
    }
    setPortals(portals.filter(p => p.id !== id));
    showToast(`Removed ${target?.name}`);
  };

  const handlePortalStatusChange = async (portalId, newStatus) => {
    const { error } = await api.update('portals', portalId, { status: newStatus });
    if (error) {
      showToast('Could not update portal status.');
      return;
    }
    setPortals(portals.map(p => p.id === portalId ? { ...p, status: newStatus } : p));
    showToast('Portal status adjusted');
  };

  const handleAddCalendarEvent = async (e) => {
    e.preventDefault();
    if (!newEventData.title.trim() || !newEventData.company.trim()) {
      showToast('Please fill out the title and company.');
      return;
    }

    const payload = mapEventToDb({
      date: selectedDateStr,
      title: newEventData.title,
      company: newEventData.company,
      type: newEventData.type,
      time: newEventData.time
    });

    const { data, error } = await api.create('events', payload);
    if (error) {
      showToast('Could not schedule event.');
      return;
    }

    setEvents([...events, mapEventFromDb(data)]);
    setShowAddEventModal(false);
    setNewEventData({ title: '', company: '', type: 'Interview', time: '10:00' });
    showToast(`Event scheduled for ${selectedDateStr}`);
  };

  const handleRemoveEvent = async (eventId) => {
    const { error } = await api.remove('events', eventId);
    if (error) {
      showToast('Could not remove event.');
      return;
    }
    setEvents(events.filter(e => e.id !== eventId));
    showToast('Event removed from schedule.');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectData.name.trim()) {
      showToast('Please name the project.');
      return;
    }

    const payload = mapProjectToDb({
      name: newProjectData.name,
      status: newProjectData.status,
      tags: newProjectData.tags.split(',').map(t => t.trim()).filter(Boolean),
      description: newProjectData.description || 'No description provided.',
      repoUrl: newProjectData.repoUrl,
      liveUrl: newProjectData.liveUrl,
      linkedJobId: newProjectData.linkedJobId,
      updatedAt: new Date().toISOString().split('T')[0]
    });

    const { data, error } = await api.create('projects', payload);
    if (error) {
      showToast('Could not save project.');
      return;
    }

    setProjects([mapProjectFromDb(data), ...projects]);
    setShowAddProjectForm(false);
    setNewProjectData({ name: '', status: 'Planning', tags: '', description: '', repoUrl: '', liveUrl: '', linkedJobId: '' });
    showToast(`Added project: ${data.name}`);
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    const updatedAt = new Date().toISOString().split('T')[0];
    const { error } = await api.update('projects', projectId, { status: newStatus, updated_at: updatedAt });
    if (error) {
      showToast('Could not update project status.');
      return;
    }
    setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus, updatedAt } : p));
    showToast(`Project status updated to ${newStatus}`);
  };

  const handleDeleteProject = async (id) => {
    const target = projects.find(p => p.id === id);
    const { error } = await api.remove('projects', id);
    if (error) {
      showToast('Could not archive project.');
      return;
    }
    setProjects(projects.filter(p => p.id !== id));
    showToast(`Archived project: ${target?.name}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const query = projectSearchQuery.toLowerCase();
      const matchesSearch = project.name.toLowerCase().includes(query) ||
                            project.tags.some(t => t.toLowerCase().includes(query));
      const matchesStatus = projectStatusFilter === 'All' || project.status === projectStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, projectSearchQuery, projectStatusFilter]);

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

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FBFBFA]">
        <Loader2 className="w-5 h-5 text-[#8A8881] animate-spin" />
        <span className="text-xs font-semibold text-[#8A8881] font-sans-clean tracking-wide uppercase">
          Loading your workspace…
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FBFBFA] px-6 text-center">
        <AlertTriangle className="w-6 h-6 text-[#B83E29]" />
        <p className="text-sm font-semibold text-[#1C1C1A]">Could not load your data from Supabase.</p>
        <p className="text-xs text-[#8A8881] max-w-sm">{loadError}</p>
        <p className="text-[11px] text-[#A8A69F] max-w-sm">
          Check that your Supabase project URL/anon key are set in .env.local and that supabase/schema.sql has been run.
        </p>
        <button
          onClick={handleSignOut}
          className="mt-2 text-xs font-bold text-[#6C6A63] hover:text-[#1C1C1A] underline"
        >
          Sign Out
        </button>
      </div>
    );
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
      <header className="sticky top-0 z-30 bg-[#FBFBFA]/90 backdrop-blur-md">
        <div className="w-full px-8 h-18 flex items-center justify-between gap-6">

          <img
            src={logo}
            alt="Job Deck"
            onClick={onExitToLanding}
            className={`w-14 h-14 rounded-xl object-cover select-none shrink-0 ${onExitToLanding ? 'cursor-pointer' : ''}`}
          />

          <nav
            ref={navRef}
            className="relative flex items-center gap-1 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {navSlider.ready && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 bg-[#2C2C28] rounded-full shadow-sm transition-[left,width] duration-300 ease-out"
                style={{ left: navSlider.left, width: navSlider.width }}
              />
            )}
            {NAV_TABS.map((tab) => (
              <button
                key={tab.key}
                ref={(el) => { navButtonRefs.current[tab.key] = el; }}
                onClick={() => setActiveTab(tab.key)}
                className={`relative z-10 shrink-0 whitespace-nowrap text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'text-[#FBFBFA]'
                    : 'text-[#6C6A63] hover:text-[#1C1C1A] hover:bg-[#FAF9F3]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddJobOpen(true)}
              className="px-4 py-2 bg-[#2C2C28] text-[#FBFBFA] text-xs font-semibold rounded-lg hover:bg-[#3E3E39] active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Application
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                title={session?.user?.email}
                className="w-9 h-9 rounded-full bg-[#2C2C28] text-[#FBFBFA] flex items-center justify-center font-serif-elegant text-sm font-bold select-none hover:bg-[#3E3E39] active:scale-95 transition-all shadow-sm"
              >
                {(session?.user?.email?.[0] || '?').toUpperCase()}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#ECEAE4] rounded-xl shadow-xl shadow-gray-200/60 py-2 z-40 animate-scale-in">
                  <div className="px-3.5 py-2 border-b border-[#F2F1EC]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8881]">Signed in as</p>
                    <p className="text-xs font-semibold text-[#1C1C1A] truncate mt-0.5">{session?.user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#B83E29] hover:bg-[#FCF2F2] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#ECEAE4] pb-4 gap-4">
              <div>
                <h3 className="font-serif-elegant text-2xl font-bold text-[#1C1C1A]">Public Profiles & Synced Portals</h3>
                <p className="text-xs text-[#8A8881] mt-0.5">Control your outreach status indicators on active developer and designer networks.</p>
              </div>
              <button
                onClick={() => setShowAddPortalForm(!showAddPortalForm)}
                className="px-4 py-2 border border-[#2C2C28] text-[#2C2C28] hover:bg-[#2C2C28] hover:text-[#FBFBFA] rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddPortalForm ? "Collapse Form" : "Add Portal"}
              </button>
            </div>

            {showAddPortalForm && (
              <form onSubmit={handleCreatePortal} className="bg-[#FAF9F3] border border-[#ECEAE4] rounded-2xl p-6 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-2">
                  <span className="font-serif-elegant text-base font-bold text-[#2C2C28]">Register New Portal</span>
                  <button type="button" onClick={() => setShowAddPortalForm(false)} className="text-[#8A8881] hover:text-[#2C2C28]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Portal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LinkedIn Profile"
                      value={newPortalData.name}
                      onChange={(e) => setNewPortalData({ ...newPortalData, name: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://linkedin.com/in/you"
                      value={newPortalData.url}
                      onChange={(e) => setNewPortalData({ ...newPortalData, url: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPortalForm(false)}
                    className="px-4 py-2 border border-[#ECEAE4] rounded-lg text-xs font-bold hover:bg-[#FFF]"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2C2C28] text-[#FBFBFA] rounded-lg text-xs font-bold hover:bg-[#3E3E39]"
                  >
                    Add Portal
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portals.map((portal) => (
                <div key={portal.id} className="border border-[#ECEAE4] rounded-2xl p-5 bg-[#FFF] space-y-4 shadow-sm flex flex-col justify-between relative group">
                  <button
                    onClick={() => handleDeletePortal(portal.id)}
                    className="absolute top-4 right-4 text-[#A8A69F] hover:text-[#B83E29] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Portal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-start justify-between pr-6">
                      <div>
                        <h4 className="font-serif-elegant text-lg font-bold text-[#1C1C1A]">{portal.name}</h4>
                        {portal.url && (
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#8C8A82] hover:text-[#2C2C28] flex items-center gap-0.5 mt-0.5 font-medium hover:underline"
                          >
                            {portal.url.replace('https://', '')} <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
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
              {portals.length === 0 && (
                <div className="md:col-span-3 text-center py-12 bg-[#FFF] border border-[#ECEAE4] rounded-2xl">
                  <Globe className="w-8 h-8 text-[#A8A69F] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#8A8881] font-serif-elegant italic text-lg">No portals registered.</p>
                  <p className="text-[11px] text-[#A8A69F]">Add your LinkedIn, GitHub, or resume host to track outreach status here.</p>
                </div>
              )}
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
        {/* VIEW 4.5: PROJECT TRACKER                              */}
        {/* ======================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#ECEAE4] pb-4 gap-4">
              <div>
                <h3 className="font-serif-elegant text-2xl font-bold text-[#1C1C1A]">Project Tracker</h3>
                <p className="text-xs text-[#8A8881] mt-0.5">Log portfolio and side projects you are building to strengthen active applications.</p>
              </div>

              <button
                onClick={() => setShowAddProjectForm(!showAddProjectForm)}
                className="px-4 py-2 border border-[#2C2C28] text-[#2C2C28] hover:bg-[#2C2C28] hover:text-[#FBFBFA] rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddProjectForm ? "Collapse Form" : "New Project"}
              </button>
            </div>

            {showAddProjectForm && (
              <form onSubmit={handleCreateProject} className="bg-[#FAF9F3] border border-[#ECEAE4] rounded-2xl p-6 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-[#ECEAE4] pb-2">
                  <span className="font-serif-elegant text-base font-bold text-[#2C2C28]">Log New Project</span>
                  <button type="button" onClick={() => setShowAddProjectForm(false)} className="text-[#8A8881] hover:text-[#2C2C28]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Project Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Design System Toolkit"
                      value={newProjectData.name}
                      onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Stage</label>
                    <select
                      value={newProjectData.status}
                      onChange={(e) => setNewProjectData({ ...newProjectData, status: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Shipped">Shipped</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Repository URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/you/project"
                      value={newProjectData.repoUrl}
                      onChange={(e) => setNewProjectData({ ...newProjectData, repoUrl: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Live URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://project.dev"
                      value={newProjectData.liveUrl}
                      onChange={(e) => setNewProjectData({ ...newProjectData, liveUrl: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Tailwind, Node"
                      value={newProjectData.tags}
                      onChange={(e) => setNewProjectData({ ...newProjectData, tags: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Linked Application</label>
                    <select
                      value={newProjectData.linkedJobId}
                      onChange={(e) => setNewProjectData({ ...newProjectData, linkedJobId: e.target.value })}
                      className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                    >
                      <option value="">None</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.company} &mdash; {j.role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8A8881] mb-1">Description</label>
                  <textarea
                    rows="2"
                    placeholder="What does this project demonstrate, and why is it worth showcasing?"
                    value={newProjectData.description}
                    onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                    className="w-full p-2.5 border border-[#ECEAE4] rounded-lg text-xs bg-[#FFF] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProjectForm(false)}
                    className="px-4 py-2 border border-[#ECEAE4] rounded-lg text-xs font-bold hover:bg-[#FFF]"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2C2C28] text-[#FBFBFA] rounded-lg text-xs font-bold hover:bg-[#3E3E39]"
                  >
                    Add to Tracker
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF9F3] border border-[#ECEAE4] p-3 rounded-xl shadow-sm">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-[#8C8A82] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by project name or tag..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-transparent rounded-lg text-xs bg-transparent focus:outline-none focus:bg-[#FFF] focus:border-[#ECEAE4] placeholder-[#8A8881] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#ECEAE4]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C8A82] ml-2" />
                <span className="text-[11px] text-[#6C6A63] font-medium uppercase tracking-wider">Stage:</span>
                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-[#ECEAE4] bg-[#FFF] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2C2C28] text-[#4C4A43]"
                >
                  <option value="All">All Stages</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Shipped">Shipped</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => {
                  const linkedJob = jobs.find(j => j.id === project.linkedJobId);
                  return (
                    <div
                      key={project.id}
                      className="bg-[#FFF] border border-[#ECEAE4] rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#C6C5BF] transition-all relative group flex flex-col justify-between"
                    >
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="absolute top-4 right-4 text-[#A8A69F] hover:text-[#B83E29] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Archive Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3 pr-6">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-[#FAF9F3] border border-[#ECEAE4] flex items-center justify-center shrink-0">
                              <FolderKanban className="w-4 h-4 text-[#8C8A82]" />
                            </span>
                            <h4 className="font-serif-elegant text-lg font-bold text-[#1C1C1A] truncate">{project.name}</h4>
                          </div>
                        </div>

                        {linkedJob && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF9F3] border border-[#ECEAE4] rounded-md text-[10px] font-bold text-[#6C6A63]">
                            <Briefcase className="w-3 h-3 text-[#A8A69F]" />
                            <span>Built for {linkedJob.company}</span>
                          </div>
                        )}

                        <p className="text-xs leading-relaxed text-[#5C5A53]">
                          {project.description}
                        </p>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAFBF9] border border-[#F2F1EC] rounded-md text-[10px] font-semibold text-[#6C6A63]">
                                <Tag className="w-2.5 h-2.5 text-[#A8A69F]" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#F2F1EC] flex items-center justify-between gap-3">
                        <select
                          value={project.status}
                          onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border font-sans-clean focus:outline-none ${
                            project.status === 'Shipped' ? 'bg-[#EDFAF3] text-[#25854B] border-[#CDE9DA]' :
                            project.status === 'In Progress' ? 'bg-[#EBF7FC] text-[#297AB8] border-[#CDDEE9]' :
                            project.status === 'On Hold' ? 'bg-[#FCF2F2] text-[#B83E29] border-[#E9CDCD]' :
                            'bg-[#FDF9F2] text-[#B87A29] border-[#F2E3CD]'
                          }`}
                        >
                          <option value="Planning">Planning</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Shipped">Shipped</option>
                          <option value="On Hold">On Hold</option>
                        </select>

                        <div className="flex items-center gap-3 text-[#8C8A82] shrink-0">
                          {project.repoUrl && (
                            <a href={project.repoUrl} target="_blank" rel="noreferrer" title="Repository" className="hover:text-[#2C2C28]">
                              <Code2 className="w-4 h-4" />
                            </a>
                          )}
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noreferrer" title="Live URL" className="hover:text-[#2C2C28]">
                              <Link2 className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#FFF] border border-[#ECEAE4] rounded-2xl">
                <FolderKanban className="w-8 h-8 text-[#A8A69F] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#8A8881] font-serif-elegant italic text-lg">No projects matching queries.</p>
                <p className="text-[11px] text-[#A8A69F]">Log a portfolio or side project to start tracking it here.</p>
              </div>
            )}

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