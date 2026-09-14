import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  Briefcase, 
  Users, 
  UserCheck,
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Edit3,
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  IndianRupee, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Lock,
  ArrowRight,
  Settings,
  Globe,
  Bell,
  Sliders,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Eye,
  FileText,
  Download,
  FileArchive,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Job, JobApplication, User, WebsiteSettings, UploadedResumeFile } from '../types.js';
import { EditJobModal } from './EditJobModal.js';

interface AdminPanelProps {
  currentUser: User | null;
  onOpenLogin: (initialRole?: 'admin' | 'job_seeker') => void;
  onOpenPostJob: () => void;
  onLogout: () => void;
  onSwitchToPublicSite: () => void;
  jobs: Job[];
  applications: JobApplication[];
  websiteSettings: WebsiteSettings;
  onRefreshJobs: () => void;
  onRefreshApplications: () => void;
  onRefreshSettings: () => void;
  onSelectJob: (job: Job) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onOpenLogin,
  onOpenPostJob,
  onLogout,
  onSwitchToPublicSite,
  jobs,
  applications,
  websiteSettings,
  onRefreshJobs,
  onRefreshApplications,
  onRefreshSettings,
  onSelectJob
}) => {
  type AdminTab = 'dashboard' | 'jobs' | 'applications' | 'users' | 'settings';
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Job Search & Filtering
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('all');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  // Application Search & Filtering
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Resume Document Viewer Modal State
  const [selectedResume, setSelectedResume] = useState<{
    file: UploadedResumeFile;
    candidateName: string;
    jobTitle: string;
    email?: string;
    phone?: string;
  } | null>(null);

  // Registered Users State
  const [registeredUsers, setRegisteredUsers] = useState<Array<{ id: string; name: string; email: string; role: string; phone: string }>>([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Edit Job Modal state
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);

  // Website Settings Form state
  const [cmsSettings, setCmsSettings] = useState<WebsiteSettings>(websiteSettings);
  const [cmsSaving, setCmsSaving] = useState(false);

  // Feedback notifications
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Sync cmsSettings when props update
  useEffect(() => {
    setCmsSettings(websiteSettings);
  }, [websiteSettings]);

  // Fetch registered users for user management tab
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setRegisteredUsers(data.users);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  // If user is not logged in as Admin, show the protected login gateway
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-2xl relative overflow-hidden max-w-lg w-full text-center">
          {/* Official Brand Logo */}
          <div className="flex justify-center mb-5">
            <div className="relative overflow-hidden rounded-2xl shadow-xl border border-red-700/50 bg-[#c40011] hover:scale-105 transition-transform">
              <img
                src="/shine_group_logo.png"
                alt="Shine Group Jobs - ISO 9001:2015 Certified"
                referrerPolicy="no-referrer"
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Admin Restricted Area
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Shine Group Admin Portal
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Welcome to the internal administration portal. Only authorized placement officers can manage vacancies, view candidate profiles, and update website settings.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => onOpenLogin('admin')}
              className="w-full px-6 py-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 hover:from-slate-900 hover:to-indigo-900 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-950/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Login with Admin Key (Click for 1-Click Demo)</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={onSwitchToPublicSite}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
            >
              ← Return to Candidate Job Search
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
            <p className="font-semibold text-slate-700">Restricted Shine Group Admin Portal</p>
            <p className="mt-0.5 text-slate-500 text-[11px]">Authorized administration and recruitment staff only.</p>
          </div>
        </div>
      </div>
    );
  }

  // File size formatter
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Admin stats calculations
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const closedJobs = jobs.filter(j => j.status === 'Closed').length;
  const urgentJobs = jobs.filter(j => j.isUrgent).length;
  const totalApps = applications.length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length;
  const underReviewApps = applications.filter(a => a.status === 'Under Review' || a.status === 'Submitted').length;

  // Filtered jobs
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.location.toLowerCase().includes(jobSearch.toLowerCase());
    
    const matchesCategory = jobCategoryFilter === 'all' || j.category === jobCategoryFilter;
    const matchesStatus = jobStatusFilter === 'all' || j.status === jobStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered applications
  const filteredApplications = applications.filter(a => {
    const matchesSearch = 
      a.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.phone.includes(appSearch) ||
      a.currentCity.toLowerCase().includes(appSearch.toLowerCase());
    
    const matchesStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered registered users
  const filteredUsers = registeredUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(userSearch))
  );

  // Toggle Job Status
  const handleToggleJobStatus = async (job: Job) => {
    setActionLoadingId(job.id);
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      const res = await fetch(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage(`Job '${job.title}' marked as ${newStatus}`);
        onRefreshJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Delete Job
  const handleDeleteJob = async (job: Job) => {
    if (!window.confirm(`Delete job opening: '${job.title}'? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(job.id);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage(`Job removed from portal.`);
        onRefreshJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Update Application Status
  const handleUpdateAppStatus = async (appId: string, newStatus: JobApplication['status']) => {
    setActionLoadingId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage(`Candidate status updated: ${newStatus}`);
        onRefreshApplications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete registered user account '${userName}'?`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage(`User account removed.`);
        fetchUsers();
      } else {
        alert(data.message || 'Could not delete user.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Save Website CMS Settings (Website Update)
  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsSaving(true);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(cmsSettings)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage('Website settings & announcement notice updated live!');
        onRefreshSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCmsSaving(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Top Admin Command Header */}
      <div className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3">
              <div className="relative overflow-hidden rounded-xl shadow-md border border-red-700/50 bg-[#c40011] shrink-0 p-1 flex items-center justify-center">
                <img
                  src="/shine_group_logo.png"
                  alt="Shine Group Jobs - ISO 9001:2015 Certified"
                  referrerPolicy="no-referrer"
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight font-display text-white">
                    SHINE GROUP ADMIN SUITE
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Full Control
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-200 border border-red-700/40">
                    ISO 9001:2015
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Recruiter & Webmaster Control Center • Logged in: <strong className="text-white">{currentUser.name}</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions in Topbar */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onOpenPostJob}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Post Job</span>
              </button>

              <button
                onClick={onSwitchToPublicSite}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                title="Preview public job seeker view"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Preview Website</span>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                title="Log out of admin session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Admin Body with Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grow flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1 sticky top-24">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-blue-500" />
                <span>Dashboard Overview</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Live</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-purple-500" />
                <span>Job Postings</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold">
                {totalJobs}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Candidate Applications</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                {totalApps}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                fetchUsers();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <span>User Management</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold">
                {registeredUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Website CMS & Settings</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">CMS</span>
            </button>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 px-3">
              <p className="font-semibold text-slate-700">Placement Desk Jabalpur</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Shine Group Placements</p>
            </div>

          </div>
        </aside>

        {/* Dynamic Admin Content Pane */}
        <main className="grow space-y-6">
          
          {/* Global Feedback notification banner */}
          {feedbackMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* ========================================================
              TAB 1: DASHBOARD OVERVIEW
             ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Jobs</span>
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2 font-display">
                    {activeJobs}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    ● Live on portal
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Applications</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-blue-600 mt-2 font-display">
                    {totalApps}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    {underReviewApps} pending review
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Shortlisted</span>
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-purple-600 mt-2 font-display">
                    {shortlistedApps}
                  </div>
                  <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
                    Ready for interview
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registered Users</span>
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2 font-display">
                    {registeredUsers.length}
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">
                    In database
                  </span>
                </div>
              </div>

              {/* Quick Actions & CMS Notice status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Quick Administration Actions</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={onOpenPostJob}
                      className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold transition-all text-left flex flex-col justify-between cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 mb-2 text-blue-600" />
                      <span>Post New Vacancy</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('applications')}
                      className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-all text-left flex flex-col justify-between cursor-pointer"
                    >
                      <Users className="w-4 h-4 mb-2 text-emerald-600" />
                      <span>Review Applicants</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold transition-all text-left flex flex-col justify-between cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 mb-2 text-indigo-600" />
                      <span>Manage Users</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition-all text-left flex flex-col justify-between cursor-pointer"
                    >
                      <Globe className="w-4 h-4 mb-2 text-amber-600" />
                      <span>Update Website CMS</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5" /> Live Announcement Banner
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cmsSettings.announcementEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {cmsSettings.announcementEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic mt-2 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                      "{cmsSettings.announcementNotice}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Helpline: {cmsSettings.helplinePhone}</span>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      Edit Notice →
                    </button>
                  </div>
                </div>

              </div>

              {/* Recent Applications Feed */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Recent Incoming Applications</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    View All ({applications.length}) →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{app.fullName}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="text-blue-700 font-semibold">{app.jobTitle}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {app.phone} • {app.currentCity} • Exp: {app.totalExperience}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'Shortlisted' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'Interview Scheduled' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {app.status}
                        </span>
                        {app.resumeFile && (
                          <button
                            onClick={() => setSelectedResume({
                              file: app.resumeFile!,
                              candidateName: app.fullName,
                              jobTitle: app.jobTitle,
                              email: app.email,
                              phone: app.phone
                            })}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-blue-200"
                            title={`View attached resume: ${app.resumeFile.name}`}
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>Resume</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('applications');
                            setAppSearch(app.fullName);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-[11px] cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: JOB POSTINGS MANAGEMENT (Full CRUD)
             ======================================================== */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              
              {/* Toolbar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by title, company, or location..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={jobCategoryFilter}
                    onChange={(e) => setJobCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
                  >
                    <option value="all">All Sectors</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Govt Outsourced">Govt Outsourced</option>
                    <option value="Work From Home">Work From Home</option>
                    <option value="Banking & Finance">Banking & Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                  </select>

                  <select
                    value={jobStatusFilter}
                    onChange={(e) => setJobStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active Only</option>
                    <option value="Closed">Closed Only</option>
                  </select>

                  <button
                    onClick={onOpenPostJob}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Post New Job</span>
                  </button>
                </div>
              </div>

              {/* Jobs Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">Role & Employer</th>
                        <th className="py-3.5 px-4">Category / Mode</th>
                        <th className="py-3.5 px-4">Compensation</th>
                        <th className="py-3.5 px-4">Applicants</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                          
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{job.title}</span>
                              {job.isUrgent && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <span>{job.company}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" />{job.location}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {job.category}
                            </span>
                            <div className="text-slate-400 text-[10px] mt-0.5">
                              {job.workMode}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-emerald-700">
                            ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / {job.salaryPeriod === 'per annum' ? 'yr' : 'mo'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                              <Users className="w-3 h-3" />
                              {job.applicantsCount} candidates
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleJobStatus(job)}
                              disabled={actionLoadingId === job.id}
                              title="Click to toggle status"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                                job.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              {job.status}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setJobToEdit(job);
                                  setIsEditJobModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Edit job details"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteJob(job)}
                                disabled={actionLoadingId === job.id}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] transition-all cursor-pointer"
                                title="Delete job opening"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredJobs.length === 0 && (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No jobs match your filter criteria.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: CANDIDATE APPLICATIONS (Pipeline Management)
             ======================================================== */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              
              {/* Applications Toolbar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, phone, city, or job..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
                  >
                    <option value="all">All Pipeline Stages ({applications.length})</option>
                    <option value="Submitted">Submitted (New)</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <button
                    onClick={onRefreshApplications}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Refresh applications"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Candidate Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApplications.map((app) => (
                  <div 
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {app.fullName}
                          </h4>
                          <p className="text-xs text-blue-700 font-semibold mt-0.5">
                            Position: {app.jobTitle}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {app.company}
                          </p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          app.status === 'Shortlisted' 
                            ? 'bg-purple-100 text-purple-800'
                            : app.status === 'Interview Scheduled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {/* Direct Candidate Action Shortcuts */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mt-3 pt-3 border-t border-slate-100">
                        <a
                          href={`tel:${app.phone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{app.phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(app.fullName)},%20this%20is%20Shine%20Group%20Jobs%20regarding%20your%20application`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.currentCity}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Exp: {app.totalExperience}</span>
                        </span>
                      </div>

                      {/* Resume / Profile Summary */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider mb-1">
                          Candidate Qualifications:
                        </span>
                        <p className="line-clamp-3 leading-relaxed">
                          {app.resumeUrlOrSummary}
                        </p>
                        {app.coverNote && (
                          <p className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 italic">
                            "{app.coverNote}"
                          </p>
                        )}
                      </div>

                      {/* Uploaded Resume File (ZIP, PDF, JPEG, PNG) */}
                      {app.resumeFile ? (
                        <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Icon or Thumbnail */}
                              {app.resumeFile.name.toLowerCase().endsWith('.pdf') ? (
                                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <FileText className="w-5 h-5" />
                                </div>
                              ) : app.resumeFile.name.toLowerCase().endsWith('.zip') ? (
                                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <FileArchive className="w-5 h-5" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs">
                                  <img 
                                    src={app.resumeFile.dataUrl} 
                                    alt="Resume thumbnail" 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs truncate max-w-[220px] sm:max-w-[280px]" title={app.resumeFile.name}>
                                    {app.resumeFile.name}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase shrink-0">
                                    {app.resumeFile.name.split('.').pop() || 'FILE'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>{formatFileSize(app.resumeFile.size)}</span>
                                  <span>•</span>
                                  <span className="text-blue-700 font-semibold">Attached Resume</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <button
                                onClick={() => setSelectedResume({
                                  file: app.resumeFile!,
                                  candidateName: app.fullName,
                                  jobTitle: app.jobTitle,
                                  email: app.email,
                                  phone: app.phone
                                })}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Resume</span>
                              </button>
                              <a
                                href={app.resumeFile.dataUrl}
                                download={app.resumeFile.name}
                                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-medium cursor-pointer transition-colors"
                                title="Download resume file"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>No resume file uploaded (Text summary provided)</span>
                        </div>
                      )}
                    </div>

                    {/* Pipeline Stage Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Applied: {app.appliedDate}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'Shortlisted')}
                          disabled={actionLoadingId === app.id}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Shortlist
                        </button>

                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'Interview Scheduled')}
                          disabled={actionLoadingId === app.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Call Interview
                        </button>

                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'Rejected')}
                          disabled={actionLoadingId === app.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {filteredApplications.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No applications found for this filter.
                </div>
              )}

            </div>
          )}

          {/* ========================================================
              TAB 4: USER MANAGEMENT (User Database)
             ======================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search registered users by name, email, or phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">
                    Total Users: {registeredUsers.length}
                  </span>
                  <button
                    onClick={fetchUsers}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Refresh user list"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">User Name</th>
                        <th className="py-3.5 px-4">Email Address</th>
                        <th className="py-3.5 px-4">Phone Number</th>
                        <th className="py-3.5 px-4">Account Role</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {u.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {u.phone}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                              {u.role === 'admin' ? 'Administrator' : 'Job Seeker'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove user account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    {usersLoading ? 'Loading user directory...' : 'No users found matching query.'}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 5: WEBSITE CMS & SETTINGS (Website Update)
             ======================================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Website CMS & Placement Desk Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update website announcements, contact helplines, Jabalpur office address, and WhatsApp message templates.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live Sync Active
                </span>
              </div>

              <form onSubmit={handleSaveCmsSettings} className="space-y-6 text-xs text-slate-700">
                
                {/* Announcement Banner */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-950 flex items-center gap-2 text-sm">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <span>Website Announcement Banner</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cmsSettings.announcementEnabled}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, announcementEnabled: e.target.checked })}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-bold text-amber-900">Show Banner On Website</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={cmsSettings.announcementNotice}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, announcementNotice: e.target.value })}
                    placeholder="Enter announcement headline displayed to all site visitors..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs text-slate-800"
                  />
                  <p className="text-[11px] text-amber-800">
                    Displayed prominently at the top of the homepage to notify freshers and job seekers about upcoming recruitment drives.
                  </p>
                </div>

                {/* Contact & Helplines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Primary Placement Helpline *</label>
                    <input
                      type="text"
                      required
                      value={cmsSettings.helplinePhone}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, helplinePhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Secondary / Direct Call Number</label>
                    <input
                      type="text"
                      value={cmsSettings.secondaryPhone}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, secondaryPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Candidate Support Email *</label>
                    <input
                      type="email"
                      required
                      value={cmsSettings.supportEmail}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, supportEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">WhatsApp Business Number</label>
                    <input
                      type="text"
                      value={cmsSettings.whatsappNumber}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Jabalpur Office Address */}
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Jabalpur Head Office / Walk-in Center Address *</label>
                  <input
                    type="text"
                    required
                    value={cmsSettings.officeAddress}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, officeAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* Default WhatsApp Message */}
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Default WhatsApp Message Template</label>
                  <input
                    type="text"
                    value={cmsSettings.whatsappMessage}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, whatsappMessage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* About Us Narrative / Content */}
                <div>
                  <label className="block font-bold text-slate-900 mb-1">About Us Content / Placement Consultancy Overview</label>
                  <p className="text-xs text-slate-500 mb-2">Displayed in the public "About & Office" page. Paragraphs separated by double blank lines.</p>
                  <textarea
                    rows={6}
                    value={cmsSettings.aboutUsText || ''}
                    onChange={(e) => setCmsSettings({ ...cmsSettings, aboutUsText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs leading-relaxed"
                    placeholder="Enter About Us description..."
                  />
                </div>

                {/* Save CTA */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={cmsSaving}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{cmsSaving ? 'Updating Website Settings...' : 'Save & Update Website'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </main>

      </div>

      {/* Edit Job Modal */}
      <EditJobModal
        job={jobToEdit}
        isOpen={isEditJobModalOpen}
        onClose={() => {
          setIsEditJobModalOpen(false);
          setJobToEdit(null);
        }}
        onJobUpdated={() => {
          onRefreshJobs();
          setFeedbackMessage('Job opening successfully updated on the portal.');
        }}
      />

      {/* Admin Resume Document Viewer Modal */}
      {selectedResume && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedResume(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  {selectedResume.file.name.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="w-5 h-5" />
                  ) : selectedResume.file.name.toLowerCase().endsWith('.zip') ? (
                    <FileArchive className="w-5 h-5" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {selectedResume.candidateName} — Resume
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase shrink-0">
                      {selectedResume.file.name.split('.').pop() || 'DOCUMENT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Applied for: <span className="font-semibold text-slate-700">{selectedResume.jobTitle}</span>
                    {selectedResume.phone && <span> • {selectedResume.phone}</span>}
                    {selectedResume.email && <span> • {selectedResume.email}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Direct Download Button */}
                <a
                  href={selectedResume.file.dataUrl}
                  download={selectedResume.file.name}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Download file to computer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Close button */}
                <button
                  onClick={() => setSelectedResume(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* File Meta Sub-bar */}
            <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">File:</span>
                <span className="font-mono text-slate-800 truncate max-w-[280px]">{selectedResume.file.name}</span>
                <span className="text-slate-400">•</span>
                <span>Size: {formatFileSize(selectedResume.file.size)}</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Shine Verified Candidate Document
              </span>
            </div>

            {/* Document Body View */}
            <div className="p-4 sm:p-6 overflow-y-auto grow bg-slate-100 flex items-center justify-center">
              {selectedResume.file.name.toLowerCase().endsWith('.pdf') || selectedResume.file.type.includes('pdf') ? (
                <div className="w-full h-[65vh] flex flex-col bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200">
                  <iframe
                    src={selectedResume.file.dataUrl}
                    title="Candidate Resume PDF"
                    className="w-full h-full border-none"
                  />
                </div>
              ) : selectedResume.file.name.toLowerCase().endsWith('.zip') || selectedResume.file.type.includes('zip') ? (
                <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                    <FileArchive className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Compressed Archive Resume Package
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Candidate uploaded a ZIP archive containing their portfolio, certificates, and resume documents.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1">
                    <div><span className="text-slate-500">Archive Name:</span> <span className="font-mono font-bold text-slate-800">{selectedResume.file.name}</span></div>
                    <div><span className="text-slate-500">Archive Size:</span> <span className="font-semibold text-slate-800">{formatFileSize(selectedResume.file.size)}</span></div>
                  </div>
                  <a
                    href={selectedResume.file.dataUrl}
                    download={selectedResume.file.name}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download & Extract ZIP Archive</span>
                  </a>
                </div>
              ) : (
                /* Image (JPEG / PNG) */
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="bg-white p-2 rounded-2xl shadow-md border border-slate-200 max-w-full">
                    <img
                      src={selectedResume.file.dataUrl}
                      alt="Candidate Resume Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain mx-auto"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Full resolution image preview • Click Download button to save original document
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
