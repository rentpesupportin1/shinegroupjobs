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
  X,
  Award,
  Printer,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { Job, JobApplication, User, WebsiteSettings, UploadedResumeFile, CandidateCertificate, CertificateStatus, CertificateType } from '../types.js';
import { EditJobModal } from './EditJobModal.js';
import { CertificateModal } from './CertificateModal.js';
import { 
  getStoredUsers, 
  setLocalJobStatus, 
  deleteLocalJob, 
  updateLocalApplicationStatus, 
  saveStoredSettings,
  getStoredCertificates,
  approveCertificate,
  rejectCertificate,
  adminDirectIssueCertificate,
  deleteLocalCertificate,
  deleteLocalUser,
  deleteLocalApplication
} from '../utils/localPersistence.js';

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
  onDeleteJob?: (jobId: string) => void;
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
  onSelectJob,
  onDeleteJob
}) => {
  type AdminTab = 'dashboard' | 'jobs' | 'applications' | 'users' | 'certificates' | 'settings';
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Certificates Management State
  const [certificates, setCertificates] = useState<CandidateCertificate[]>(() => getStoredCertificates());
  const [certSearch, setCertSearch] = useState('');
  const [certStatusFilter, setCertStatusFilter] = useState('all');
  const [selectedCertForPrint, setSelectedCertForPrint] = useState<CandidateCertificate | null>(null);
  
  // Review & Approval Modal state
  const [reviewingCert, setReviewingCert] = useState<CandidateCertificate | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    certificateNumber: '',
    issueDate: '',
    grade: 'Grade A+ (Distinction)',
    approvedBy: 'Director, Shine Group Jobs Placement Desk',
    signatoryTitle: 'Authorized Signatory • Jabalpur Office',
    adminRemarks: ''
  });

  // Rejection modal state
  const [rejectingCert, setRejectingCert] = useState<CandidateCertificate | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Record verification details could not be validated by administration.');

  // Direct Issue Certificate Modal state
  const [isDirectIssueOpen, setIsDirectIssueOpen] = useState(false);
  const [directIssueForm, setDirectIssueForm] = useState({
    candidateName: '',
    fatherName: '',
    candidateEmail: '',
    candidatePhone: '',
    certificateType: 'Training & Skill Completion' as CertificateType,
    courseOrRole: 'Advanced Office Operations & Data Management',
    duration: '3 Months (June 2026 - August 2026)',
    grade: 'Grade A+ (Distinction)',
    certificateNumber: '',
    adminRemarks: 'Directly verified and issued by Shine Group Administration.'
  });

  // Job Search & Filtering
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('all');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  // Application Search & Filtering
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Resume Document Viewer Modal State (Supports full candidate application & attached documents)
  const [selectedResumeApp, setSelectedResumeApp] = useState<JobApplication | null>(null);

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

  // In-App Confirmation Modal state (prevents iframe popup blocking)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    confirmLabel?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setRegisteredUsers(data.users);
          setUsersLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load users from API, loading local users:', e);
    }
    // Netlify static fallback
    const localUsers = getStoredUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone
    }));
    setRegisteredUsers(localUsers);
    setUsersLoading(false);
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
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        await res.json();
      }
    } catch (err) {
      console.warn('Backend job status update failed, saving locally:', err);
    }
    setLocalJobStatus(job.id, newStatus);
    setFeedbackMessage(`Job '${job.title}' marked as ${newStatus}`);
    onRefreshJobs();
    setActionLoadingId(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Delete Job (Safe In-App Modal)
  const handleDeleteJob = (job: Job) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job Vacancy',
      message: 'Are you sure you want to delete this job vacancy? It will be permanently removed from all listings on the portal.',
      itemName: `${job.title} • ${job.company}`,
      confirmLabel: 'Delete Vacancy',
      onConfirm: async () => {
        setActionLoadingId(job.id);
        deleteLocalJob(job.id);
        if (onDeleteJob) {
          onDeleteJob(job.id);
        }
        setFeedbackMessage(`Job opening '${job.title}' deleted successfully.`);
        try {
          await fetch(`/api/jobs/${job.id}`, {
            method: 'DELETE',
            headers: {
              'x-user-role': 'admin',
              'Authorization': 'Bearer admin-token'
            }
          });
        } catch (err) {
          console.warn('Backend job delete sync failed, removed locally:', err);
        }
        onRefreshJobs();
        setActionLoadingId(null);
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    });
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
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        await res.json();
      }
    } catch (err) {
      console.warn('Backend app status update failed, saving locally:', err);
    }
    updateLocalApplicationStatus(appId, newStatus);
    setFeedbackMessage(`Candidate status updated: ${newStatus}`);
    onRefreshApplications();
    setActionLoadingId(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Delete User Account (Safe In-App Modal)
  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Registered User',
      message: 'Are you sure you want to permanently remove this registered user account? The candidate will no longer be able to log in.',
      itemName: userName,
      confirmLabel: 'Delete User Account',
      onConfirm: async () => {
        setActionLoadingId(userId);
        deleteLocalUser(userId);
        setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
        setFeedbackMessage(`User account '${userName}' removed successfully.`);
        try {
          await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'x-user-role': 'admin',
              'Authorization': 'Bearer admin-token'
            }
          });
        } catch (err) {
          console.warn('Backend user delete sync failed, removed locally:', err);
        }
        fetchUsers();
        setActionLoadingId(null);
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    });
  };

  // Delete Candidate Job Application (Safe In-App Modal)
  const handleDeleteApplication = (appId: string, candidateName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Candidate Application',
      message: 'Are you sure you want to remove this job application? This candidate submission will be permanently deleted.',
      itemName: candidateName,
      confirmLabel: 'Delete Application',
      onConfirm: async () => {
        setActionLoadingId(appId);
        deleteLocalApplication(appId);
        setFeedbackMessage(`Application for '${candidateName}' deleted successfully.`);
        try {
          await fetch(`/api/applications/${appId}`, {
            method: 'DELETE',
            headers: {
              'x-user-role': 'admin',
              'Authorization': 'Bearer admin-token'
            }
          });
        } catch (err) {
          console.warn('Backend application delete sync failed, removed locally:', err);
        }
        onRefreshApplications();
        setActionLoadingId(null);
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    });
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
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        await res.json();
      }
    } catch (err) {
      console.warn('Backend settings update failed, saving locally:', err);
    }
    saveStoredSettings(cmsSettings);
    setFeedbackMessage('Website settings & announcement notice updated live!');
    onRefreshSettings();
    setCmsSaving(false);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // ---------------- CERTIFICATES ACTION HANDLERS ---------------- //
  const refreshCertificates = () => {
    setCertificates(getStoredCertificates());
  };

  const handleOpenReview = (cert: CandidateCertificate) => {
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setReviewingCert(cert);
    setApprovalForm({
      certificateNumber: cert.certificateNumber,
      issueDate: cert.issueDate || todayFormatted,
      grade: cert.grade || 'Grade A+ (Distinction)',
      approvedBy: cert.approvedBy || 'Director, Shine Group Jobs Placement Desk',
      signatoryTitle: cert.signatoryTitle || 'Authorized Signatory • Jabalpur Office',
      adminRemarks: cert.adminRemarks || 'Verified and approved after candidate examination.'
    });
  };

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingCert) return;
    try {
      await fetch(`/api/certificates/${reviewingCert.id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(approvalForm)
      });
    } catch (err) {
      console.warn('Backend certificate approval sync failed, saving locally:', err);
    }

    const updated = approveCertificate(reviewingCert.id, approvalForm);
    if (updated) {
      setFeedbackMessage(`Certificate ${updated.certificateNumber} officially approved & issued for ${updated.candidateName}!`);
      refreshCertificates();
      setReviewingCert(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleOpenReject = (cert: CandidateCertificate) => {
    setRejectingCert(cert);
    setRejectionReason('Candidate training attendance or documentation could not be verified by administration.');
  };

  const handleConfirmRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCert) return;
    try {
      await fetch(`/api/certificates/${rejectingCert.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
    } catch (err) {
      console.warn('Backend certificate rejection sync failed, saving locally:', err);
    }

    const updated = rejectCertificate(rejectingCert.id, rejectionReason);
    if (updated) {
      setFeedbackMessage(`Certificate request for ${updated.candidateName} marked as rejected.`);
      refreshCertificates();
      setRejectingCert(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleDirectIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directIssueForm.candidateName.trim() || !directIssueForm.courseOrRole.trim()) {
      alert('Please fill candidate name and course/role.');
      return;
    }

    try {
      await fetch('/api/certificates/direct-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(directIssueForm)
      });
    } catch (err) {
      console.warn('Backend direct certificate issue sync failed, saving locally:', err);
    }

    const newCert = adminDirectIssueCertificate(directIssueForm);
    setFeedbackMessage(`Official certificate ${newCert.certificateNumber} generated and issued for ${newCert.candidateName}!`);
    refreshCertificates();
    setIsDirectIssueOpen(false);
    setDirectIssueForm({
      candidateName: '',
      fatherName: '',
      candidateEmail: '',
      candidatePhone: '',
      certificateType: 'Training & Skill Completion',
      courseOrRole: 'Advanced Office Operations & Data Management',
      duration: '3 Months (June 2026 - August 2026)',
      grade: 'Grade A+ (Distinction)',
      certificateNumber: '',
      adminRemarks: 'Directly verified and issued by Shine Group Administration.'
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleDeleteCert = (certId: string, certNumber: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Certificate Record',
      message: 'Are you sure you want to permanently delete this candidate certificate record? It will be removed from system databases and will no longer verify online.',
      itemName: certNumber,
      confirmLabel: 'Delete Certificate',
      onConfirm: async () => {
        deleteLocalCertificate(certId);
        setCertificates(prev => prev.filter(c => c.id !== certId && c.certificateNumber !== certNumber));
        setFeedbackMessage(`Certificate '${certNumber}' removed from records.`);
        try {
          await fetch(`/api/certificates/${certId}`, {
            method: 'DELETE',
            headers: {
              'x-user-role': 'admin',
              'Authorization': 'Bearer admin-token'
            }
          });
        } catch (err) {
          console.warn('Backend certificate delete sync failed, removed locally:', err);
        }
        refreshCertificates();
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    });
  };

  const filteredCertificates = certificates.filter(c => {
    const q = certSearch.toLowerCase().trim();
    const matchSearch = 
      !q ||
      c.certificateNumber.toLowerCase().includes(q) ||
      c.candidateName.toLowerCase().includes(q) ||
      c.candidateEmail.toLowerCase().includes(q) ||
      (c.candidatePhone && c.candidatePhone.includes(q)) ||
      c.courseOrRole.toLowerCase().includes(q);
    
    const matchStatus = certStatusFilter === 'all' || c.status === certStatusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCertsCount = certificates.filter(c => c.status === 'Pending Approval').length;


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

            {/* Certificates Management Tab with Pending Badge */}
            <button
              onClick={() => {
                setActiveTab('certificates');
                refreshCertificates();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'certificates'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Certificates Desk</span>
              </div>
              <div className="flex items-center gap-1.5">
                {pendingCertsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                    {pendingCertsCount} Pending
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                  {certificates.length}
                </span>
              </div>
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
                        <button
                          onClick={() => setSelectedResumeApp(app)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-blue-200"
                          title={`View candidate application & resume: ${app.fullName}`}
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>{app.resumeFile ? 'View Resume' : 'View Profile'}</span>
                        </button>
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
                            <div className="flex items-center gap-2.5">
                              {job.imageUrl ? (
                                <div 
                                  onClick={() => onSelectJob(job)}
                                  className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-2xs cursor-pointer hover:opacity-80 transition-opacity"
                                  title="Click to view poster"
                                >
                                  <img 
                                    src={job.imageUrl} 
                                    alt={job.title} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                              ) : null}
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                  <span>{job.title}</span>
                                  {job.imageUrl && (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-0.5" title="Has attached poster photo">
                                      <ImageIcon className="w-2.5 h-2.5" /> Photo
                                    </span>
                                  )}
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
                              </div>
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
                                onClick={() => setSelectedResumeApp(app)}
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
                        <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                          <span className="text-slate-500">Digital Qualifications & Bio Submitted</span>
                          <button
                            onClick={() => setSelectedResumeApp(app)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 border border-blue-200 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>View Full Profile & Bio</span>
                          </button>
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

                        <button
                          onClick={() => handleDeleteApplication(app.id, app.fullName)}
                          disabled={actionLoadingId === app.id}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
                          title="Delete this candidate application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

          {/* ========================================================
              TAB 5: CERTIFICATES MANAGEMENT & ADMIN APPROVAL
             ======================================================== */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              
              {/* Header card with Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>ISO 9001:2015 Certification Controller</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                    Official Certificates & Admin Approval Desk
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Review and approve candidate certificate requests. Har certificate ka unique number hota hai jisse aap turant find aur verify kar sakte hain.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsDirectIssueOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Issue Direct Certificate</span>
                  </button>
                </div>
              </div>

              {/* Status Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div 
                  onClick={() => setCertStatusFilter('all')}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                    certStatusFilter === 'all' ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Certificates</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{certificates.length}</div>
                  <span className="text-[10px] text-slate-500">All registered records</span>
                </div>

                <div 
                  onClick={() => setCertStatusFilter('Pending Approval')}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                    certStatusFilter === 'Pending Approval' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Approval
                  </span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{pendingCertsCount}</div>
                  <span className="text-[10px] text-amber-700 font-semibold">Requires Admin review</span>
                </div>

                <div 
                  onClick={() => setCertStatusFilter('Approved')}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                    certStatusFilter === 'Approved' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved & Issued
                  </span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {certificates.filter(c => c.status === 'Approved').length}
                  </div>
                  <span className="text-[10px] text-emerald-700">Official digital certificates</span>
                </div>

                <div 
                  onClick={() => setCertStatusFilter('Rejected')}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                    certStatusFilter === 'Rejected' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                  </span>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {certificates.filter(c => c.status === 'Rejected').length}
                  </div>
                  <span className="text-[10px] text-slate-500">Unverified requests</span>
                </div>
              </div>

              {/* Search Bar - Find Certificate by Unique Number */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
                <div className="relative grow w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={certSearch}
                    onChange={(e) => setCertSearch(e.target.value)}
                    placeholder="Find certificate by Unique Number (e.g. SGJ-CERT-2026-10492), Candidate Name, Email, or Course..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {certSearch && (
                    <button
                      onClick={() => setCertSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <select
                    value={certStatusFilter}
                    onChange={(e) => setCertStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending Approval">Pending Approval Only</option>
                    <option value="Approved">Approved Only</option>
                    <option value="Rejected">Rejected Only</option>
                  </select>
                </div>
              </div>

              {/* Certificates Records Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Unique Cert Number</th>
                        <th className="py-3 px-4">Candidate Details</th>
                        <th className="py-3 px-4">Certificate Type & Role</th>
                        <th className="py-3 px-4">Duration & Dates</th>
                        <th className="py-3 px-4">Status & Grade</th>
                        <th className="py-3 px-4 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCertificates.map((cert) => {
                        const isApproved = cert.status === 'Approved';
                        const isPending = cert.status === 'Pending Approval';
                        const isRejected = cert.status === 'Rejected';

                        return (
                          <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Unique Certificate Number with Copy */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                                <span>{cert.certificateNumber}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(cert.certificateNumber);
                                    setFeedbackMessage(`Copied ${cert.certificateNumber}`);
                                    setTimeout(() => setFeedbackMessage(null), 2500);
                                  }}
                                  className="text-amber-700 hover:text-amber-950 p-0.5 cursor-pointer"
                                  title="Copy unique number"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="block text-[10px] text-slate-400 font-sans mt-0.5 font-normal">
                                UID: {cert.id}
                              </span>
                            </td>

                            {/* Candidate Details */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 text-sm">{cert.candidateName}</div>
                              {cert.fatherName && (
                                <div className="text-[11px] text-slate-500">S/D of {cert.fatherName}</div>
                              )}
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{cert.candidateEmail}</span>
                              </div>
                              {cert.candidatePhone && (
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{cert.candidatePhone}</span>
                                </div>
                              )}
                            </td>

                            {/* Certificate Type & Course/Role */}
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-800 block text-xs">
                                {cert.courseOrRole}
                              </span>
                              <span className="text-[11px] text-amber-800 bg-amber-50/80 px-1.5 py-0.2 rounded border border-amber-200/50 inline-block mt-0.5">
                                {cert.certificateType}
                              </span>
                              {cert.adminRemarks && (
                                <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">
                                  "{cert.adminRemarks}"
                                </p>
                              )}
                            </td>

                            {/* Duration & Dates */}
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-slate-800">{cert.duration}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Req: {cert.requestedDate}
                              </div>
                              {cert.issueDate && (
                                <div className="text-[11px] text-emerald-700 font-semibold">
                                  Issued: {cert.issueDate}
                                </div>
                              )}
                            </td>

                            {/* Status & Grade */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                                {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                                <span>{cert.status}</span>
                              </span>
                              {cert.grade && isApproved && (
                                <span className="block text-[11px] font-semibold text-slate-700 mt-1">
                                  {cert.grade}
                                </span>
                              )}
                              {isRejected && cert.rejectionReason && (
                                <span className="block text-[10px] text-rose-600 mt-1 line-clamp-1">
                                  {cert.rejectionReason}
                                </span>
                              )}
                            </td>

                            {/* Admin Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending ? (
                                  <>
                                    <button
                                      onClick={() => handleOpenReview(cert)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                                      title="Review details and approve certificate"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenReject(cert)}
                                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 cursor-pointer"
                                      title="Reject certificate request"
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setSelectedCertForPrint(cert)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                                    title="View & Print Official Certificate"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                                    <span>View / Print</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteCert(cert.id, cert.certificateNumber)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer ml-1"
                                  title="Delete certificate"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredCertificates.length === 0 && (
                  <div className="p-12 text-center text-slate-500 text-xs space-y-2">
                    <Award className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">No certificates match your search query.</p>
                    <p className="text-[11px] text-slate-400">Try searching with candidate name or another unique certificate number.</p>
                  </div>
                )}
              </div>

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

      {/* Admin Candidate Resume & Dossier Modal */}
      {selectedResumeApp && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedResumeApp(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">
                      {selectedResumeApp.fullName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedResumeApp.status === 'Shortlisted' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                      selectedResumeApp.status === 'Interview Scheduled' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      selectedResumeApp.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {selectedResumeApp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">
                    Role: <span className="text-amber-400 font-semibold">{selectedResumeApp.jobTitle}</span> • {selectedResumeApp.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedResumeApp.resumeFile && (
                  <a
                    href={selectedResumeApp.resumeFile.dataUrl}
                    download={selectedResumeApp.resumeFile.name}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    title="Download resume file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download File</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedResumeApp(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Candidate Action Sub-bar */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${selectedResumeApp.phone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call: {selectedResumeApp.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${selectedResumeApp.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedResumeApp.fullName)},%20this%20is%20Shine%20Group%20Jobs%20regarding%20your%20application%20for%20${encodeURIComponent(selectedResumeApp.jobTitle)}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                {selectedResumeApp.email && (
                  <a
                    href={`mailto:${selectedResumeApp.email}?subject=Regarding your application for ${encodeURIComponent(selectedResumeApp.jobTitle)} - Shine Group Jobs`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedResumeApp.email}</span>
                  </a>
                )}
              </div>

              {/* Status Pipeline Direct Changer */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Application Stage:</span>
                <select
                  value={selectedResumeApp.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as JobApplication['status'];
                    handleUpdateAppStatus(selectedResumeApp.id, newStatus);
                    setSelectedResumeApp({ ...selectedResumeApp, status: newStatus });
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Submitted">Submitted (New)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Modal Body (Scrollable Dossier + Document) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 grow bg-slate-100/60 text-xs">
              
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Current City</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block">{selectedResumeApp.currentCity}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Total Experience</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block">{selectedResumeApp.totalExperience}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Notice Period</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block">{selectedResumeApp.noticePeriod || 'Immediate'}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Expected / Current CTC</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 block">
                    {selectedResumeApp.expectedSalary || (selectedResumeApp as any).expectedCTC || 'As per norms'}
                  </span>
                </div>
              </div>

              {/* Candidate Qualifications & Career Summary */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-blue-700">
                  <Award className="w-3.5 h-3.5" />
                  <span>Candidate Qualifications & Experience Summary</span>
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-[13px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedResumeApp.resumeUrlOrSummary}
                </p>
                {selectedResumeApp.coverNote && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-700 block text-[11px]">Cover Note / Message from Candidate:</span>
                    <p className="italic text-slate-600 mt-1">"{selectedResumeApp.coverNote}"</p>
                  </div>
                )}
              </div>

              {/* Attached Resume Document (PDF / Image / Archive) */}
              {selectedResumeApp.resumeFile ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[280px]">
                        {selectedResumeApp.resumeFile.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold uppercase">
                        {selectedResumeApp.resumeFile.name.split('.').pop() || 'FILE'}
                      </span>
                      <span className="text-slate-400 text-xs">
                        ({formatFileSize(selectedResumeApp.resumeFile.size)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={selectedResumeApp.resumeFile.dataUrl}
                        download={selectedResumeApp.resumeFile.name}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Resume Document</span>
                      </a>
                    </div>
                  </div>

                  {/* Document Preview Renderer */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    {selectedResumeApp.resumeFile.name.toLowerCase().endsWith('.pdf') || selectedResumeApp.resumeFile.type.includes('pdf') || selectedResumeApp.resumeFile.dataUrl.startsWith('data:application/pdf') ? (
                      <div className="flex flex-col">
                        <object
                          data={selectedResumeApp.resumeFile.dataUrl}
                          type="application/pdf"
                          className="w-full h-[520px] bg-white border-none"
                        >
                          <iframe
                            src={selectedResumeApp.resumeFile.dataUrl}
                            title="Candidate Resume PDF"
                            className="w-full h-[520px] border-none"
                          />
                        </object>
                        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                          <span>PDF Document Preview</span>
                          <a
                            href={selectedResumeApp.resumeFile.dataUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>Open PDF in New Window</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : selectedResumeApp.resumeFile.name.toLowerCase().endsWith('.zip') || selectedResumeApp.resumeFile.type.includes('zip') ? (
                      <div className="p-8 text-center space-y-3">
                        <FileArchive className="w-12 h-12 text-amber-500 mx-auto" />
                        <h4 className="font-bold text-slate-900 text-sm">Candidate Portfolio Archive ({selectedResumeApp.resumeFile.name})</h4>
                        <p className="text-slate-500 text-xs">This compressed file package contains candidate certificates and work samples.</p>
                        <a
                          href={selectedResumeApp.resumeFile.dataUrl}
                          download={selectedResumeApp.resumeFile.name}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Archive File</span>
                        </a>
                      </div>
                    ) : (
                      /* Image preview */
                      <div className="p-4 flex flex-col items-center justify-center max-h-[520px] overflow-auto bg-slate-900/5">
                        <img
                          src={selectedResumeApp.resumeFile.dataUrl}
                          alt="Resume Preview"
                          className="max-w-full max-h-[480px] h-auto object-contain rounded-lg shadow-sm border border-slate-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Verified Digital Career Profile Submitted</span>
                    <p className="mt-0.5 text-blue-800 leading-relaxed">
                      Candidate ne online portal form ke madhyam se apna complete experience aur qualification details darj kiya hai (details above). Is application ke sath alag se koi PDF file attach nahi ki gayi thi.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500">
                Application UID: <span className="font-mono text-slate-700 font-semibold">{selectedResumeApp.id}</span> • Applied: {selectedResumeApp.appliedDate}
              </span>
              <button
                onClick={() => setSelectedResumeApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Review & Approve Certificate Modal */}
      {reviewingCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Review & Approve Certificate</h3>
                  <p className="text-xs text-slate-300">Issue official verified certificate with unique number</p>
                </div>
              </div>
              <button
                onClick={() => setReviewingCert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="p-6 space-y-4 text-xs">
              
              {/* Candidate Info Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-bold text-slate-900 text-sm">{reviewingCert.candidateName}</span>
                </div>
                {reviewingCert.fatherName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Father's Name:</span>
                    <span className="font-semibold text-slate-800">{reviewingCert.fatherName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Type & Role:</span>
                  <span className="font-semibold text-amber-900">{reviewingCert.certificateType} • {reviewingCert.courseOrRole}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-medium text-slate-700">{reviewingCert.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email / Phone:</span>
                  <span className="font-medium text-slate-700">{reviewingCert.candidateEmail} {reviewingCert.candidatePhone ? `• ${reviewingCert.candidatePhone}` : ''}</span>
                </div>
              </div>

              {/* Unique Certificate Number (Editable/Confirm) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unique Certificate Number * (Official Serial ID)
                </label>
                <input
                  type="text"
                  required
                  value={approvalForm.certificateNumber}
                  onChange={(e) => setApprovalForm({ ...approvalForm, certificateNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Ye unique number certificate verify karne ke liye use hoga.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Issue Date */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Issue Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={approvalForm.issueDate}
                    onChange={(e) => setApprovalForm({ ...approvalForm, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Performance Evaluation Grade *
                  </label>
                  <select
                    value={approvalForm.grade}
                    onChange={(e) => setApprovalForm({ ...approvalForm, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Grade A+ (Distinction)">Grade A+ (Distinction)</option>
                    <option value="Grade A (Excellent)">Grade A (Excellent)</option>
                    <option value="Grade B+ (Good)">Grade B+ (Good)</option>
                    <option value="First Division with Honors">First Division with Honors</option>
                    <option value="Successful Completion">Successful Completion</option>
                  </select>
                </div>
              </div>

              {/* Authorized Signatory Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Authorized Signatory Designation
                </label>
                <input
                  type="text"
                  value={approvalForm.approvedBy}
                  onChange={(e) => setApprovalForm({ ...approvalForm, approvedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Admin Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Admin Internal Approval Note
                </label>
                <textarea
                  rows={2}
                  value={approvalForm.adminRemarks}
                  onChange={(e) => setApprovalForm({ ...approvalForm, adminRemarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingCert(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Issue Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base">Reject Certificate Request</h3>
              </div>
              <button
                onClick={() => setRejectingCert(null)}
                className="text-rose-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to reject the certificate request for <strong className="text-slate-900">{rejectingCert.candidateName}</strong> ({rejectingCert.certificateNumber})?
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingCert(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Direct Issue Certificate Modal */}
      {isDirectIssueOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Direct Issue Official Certificate</h3>
                  <p className="text-xs text-slate-300">Generate and issue directly with status Approved</p>
                </div>
              </div>
              <button
                onClick={() => setIsDirectIssueOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectIssueSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={directIssueForm.candidateName}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, candidateName: e.target.value })}
                    placeholder="e.g. Rahul Shrivastava"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Father's / Guardian Name</label>
                  <input
                    type="text"
                    value={directIssueForm.fatherName}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, fatherName: e.target.value })}
                    placeholder="e.g. Shri Ramesh Shrivastava"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Email *</label>
                  <input
                    type="email"
                    required
                    value={directIssueForm.candidateEmail}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, candidateEmail: e.target.value })}
                    placeholder="candidate@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={directIssueForm.candidatePhone}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, candidatePhone: e.target.value })}
                    placeholder="+91 9752661102"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Certificate Type *</label>
                  <select
                    value={directIssueForm.certificateType}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, certificateType: e.target.value as CertificateType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Training & Skill Completion">Training & Skill Completion</option>
                    <option value="Internship Completion">Internship Completion</option>
                    <option value="Job Placement & Experience Verification">Job Placement & Experience Verification</option>
                    <option value="Job Offer & Appointment Verification">Job Offer & Appointment Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Performance Grade *</label>
                  <select
                    value={directIssueForm.grade}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Grade A+ (Distinction)">Grade A+ (Distinction)</option>
                    <option value="Grade A (Excellent)">Grade A (Excellent)</option>
                    <option value="Grade B+ (Good)">Grade B+ (Good)</option>
                    <option value="First Division with Honors">First Division with Honors</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course / Training / Role Title *</label>
                <input
                  type="text"
                  required
                  value={directIssueForm.courseOrRole}
                  onChange={(e) => setDirectIssueForm({ ...directIssueForm, courseOrRole: e.target.value })}
                  placeholder="e.g. Advanced Office Operations & Data Management"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration / Period *</label>
                  <input
                    type="text"
                    required
                    value={directIssueForm.duration}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, duration: e.target.value })}
                    placeholder="e.g. 3 Months (June 2026 - August 2026)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Custom Unique Cert No (Optional - leave blank for auto)
                  </label>
                  <input
                    type="text"
                    value={directIssueForm.certificateNumber}
                    onChange={(e) => setDirectIssueForm({ ...directIssueForm, certificateNumber: e.target.value.toUpperCase() })}
                    placeholder="Auto-generated e.g. SGJ-CERT-2026-XXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDirectIssueOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>Generate & Issue Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Modal for High-Resolution View & Print */}
      <CertificateModal
        certificate={selectedCertForPrint}
        isOpen={!!selectedCertForPrint}
        onClose={() => setSelectedCertForPrint(null)}
      />

      {/* Safe In-App Confirmation Modal (Replaces blocked window.confirm) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {confirmModal.title || 'Confirm Deletion'}
            </h3>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              {confirmModal.message}
            </p>
            {confirmModal.itemName && (
              <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 break-words flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span className="truncate">{confirmModal.itemName}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const onConfirmAction = confirmModal.onConfirm;
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  if (onConfirmAction) {
                    await onConfirmAction();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{confirmModal.confirmLabel || 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

