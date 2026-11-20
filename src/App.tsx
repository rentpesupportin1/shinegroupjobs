import React, { useState, useEffect, useMemo } from 'react';
import { Navbar, TabType } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { CategoryHighlights } from './components/CategoryHighlights.js';
import { JobsExplorer } from './components/JobsExplorer.js';
import { PostedJobsManager } from './components/PostedJobsManager.js';
import { ApplicationsTracker } from './components/ApplicationsTracker.js';
import { AdminPanel } from './components/AdminPanel.js';
import { AboutContactSection } from './components/AboutContactSection.js';
import { Footer } from './components/Footer.js';
import { JobDetailModal } from './components/JobDetailModal.js';
import { ApplyModal } from './components/ApplyModal.js';
import { PostJobModal } from './components/PostJobModal.js';
import { AIResumeMatcherModal } from './components/AIResumeMatcherModal.js';
import { AuthModal } from './components/AuthModal.js';
import { Job, JobApplication, User, WebsiteSettings } from './types.js';
import { INITIAL_JOBS, initialJobs, initialApplications } from './data/initialJobs.js';
import { 
  getStoredJobs, 
  getStoredApplications, 
  getStoredSettings, 
  saveStoredSettings,
  deleteLocalJob 
} from './utils/localPersistence.js';
import {
  db,
  auth,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  isFirebaseAdminSession,
  sanitizeJobForFirestore,
  handleFirestoreError,
  OperationType
} from './firebase.js';
import { MessageCircle, Bell } from 'lucide-react';

const defaultSettings: WebsiteSettings = {
  portalName: "SHINE GROUP JOBS",
  tagline: "Recruitment & Placement Consultancy • Jabalpur (Est. 2002)",
  announcementNotice: "🔥 Direct Walk-in Interviews scheduled for Jabalpur, Indore & WFH outsourced positions. Call +91 9039881102 for appointment.",
  announcementEnabled: true,
  helplinePhone: "+91 9039881102",
  secondaryPhone: "+91 9826112233",
  supportEmail: "admin@shinegroupjob.com",
  officeAddress: "2nd Floor, in front of Khalsa College, above Central Bank, Mahanadda, Jabalpur, Madhya Pradesh 482001",
  whatsappNumber: "+91 9039881102",
  whatsappMessage: "Hello Shine Group Placement Desk, I am seeking job placement assistance.",
  aboutUsText: "Shine Group Jobs in Jabalpur is actively engaged in providing reliable placement services across multiple industries. With years of experience in the job market, we effectively match candidates with suitable job opportunities based on their skills and career goals. Our strong association with leading companies allows us to inform candidates promptly whenever new vacancies arise. We also assist candidates in getting their CVs noticed and shortlisted among a large pool of applicants, helping them stand out in today’s highly competitive job market.\n\nOur team of experienced and well-qualified professionals conducts detailed screenings to identify the true potential and strengths of each candidate. By carefully understanding the requirements of both job seekers and employers, we ensure the right match for long-term success. Through ethical practices, transparency, and consistent quality service, we have earned trust, credibility, and goodwill. Our aim is to set industry benchmarks while contributing towards a fully employed and empowered society."
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('shine_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'admin' | 'job_seeker'>('job_seeker');

  // Saved Jobs in localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shine_saved_job_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Candidate's own applied applications tracked locally for logged-in candidate
  const [myApplicationIds, setMyApplicationIds] = useState<string[]>(() => {
    try {
      const savedUser = localStorage.getItem('shine_user_session');
      if (!savedUser) {
        localStorage.removeItem('shine_my_app_ids');
        return [];
      }
      const user = JSON.parse(savedUser);
      if (user?.email) {
        const saved = localStorage.getItem(`shine_my_app_ids_${user.email.toLowerCase()}`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [onlyVerifiedWFH, setOnlyVerifiedWFH] = useState(false);
  const [onlyGovtOutsourced, setOnlyGovtOutsourced] = useState(false);

  // Modals
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isAIResumeMatcherOpen, setIsAIResumeMatcherOpen] = useState(false);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);

  // Check URL Hash for #admin direct routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helper: Build canonical job list from Cloud Firestore (+ optional API/seed) and wipe legacy per-browser overrides
  const applyCloudJobsSnapshot = (
    snap: { forEach: (cb: (docSnap: { id: string; data: () => any }) => void) => void },
    apiJobs: Job[] | null = null
  ) => {
    const deletedInFirestore = new Set<string>();
    const firestoreJobs: Job[] = [];

    snap.forEach((d) => {
      const data = d.data() as Job & { isDeleted?: boolean };
      const docId = data.id || d.id;
      if (data.isDeleted) {
        deletedInFirestore.add(docId);
      } else {
        firestoreJobs.push({ ...data, id: docId });
      }
    });

    const mergedMap = new Map<string, Job>();
    for (const seedJob of INITIAL_JOBS) {
      mergedMap.set(seedJob.id, seedJob);
    }
    if (apiJobs) {
      for (const aj of apiJobs) {
        mergedMap.set(aj.id, aj);
      }
    }
    for (const fj of firestoreJobs) {
      mergedMap.set(fj.id, fj);
    }

    const activeJobs = Array.from(mergedMap.values())
      .filter((j) => !deletedInFirestore.has(j.id))
      .sort((a, b) => {
        const aIsSeed = INITIAL_JOBS.some((ij) => ij.id === a.id);
        const bIsSeed = INITIAL_JOBS.some((ij) => ij.id === b.id);
        if (aIsSeed !== bIsSeed) return aIsSeed ? 1 : -1;
        const aTime = Date.parse((a as any).updatedAt || a.postedDate || '') || 0;
        const bTime = Date.parse((b as any).updatedAt || b.postedDate || '') || 0;
        return bTime - aTime;
      });

    // Clear stale per-browser localStorage overrides so different Chrome profiles never drift out of sync
    try {
      localStorage.setItem('shine_deleted_job_ids', JSON.stringify(Array.from(deletedInFirestore)));
      localStorage.setItem('shine_custom_jobs', JSON.stringify(firestoreJobs));
      localStorage.removeItem('shine_job_status_overrides');
    } catch {
      // ignore storage quota errors
    }

    setJobs(activeJobs);
  };

  // Fetch jobs from backend API + Cloud Firestore (permanent cross-device source of truth on Netlify)
  const fetchJobs = async () => {
    setLoading(true);
    let apiJobs: Job[] | null = null;
    try {
      const res = await fetch('/api/jobs');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          apiJobs = data.jobs;
        }
      }
    } catch (err) {
      console.warn('Could not fetch from backend API, syncing via Cloud Firestore:', err);
    }

    const deletedRaw = localStorage.getItem('shine_deleted_job_ids');
    const localDeletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

    try {
      const snap = await getDocs(collection(db, 'jobs'));
      applyCloudJobsSnapshot(snap, apiJobs);
      setLoading(false);
      return;
    } catch (fsErr) {
      console.warn('Firestore jobs lookup notice, falling back to API/local state:', fsErr);
    } finally {
      setLoading(false);
    }

    if (apiJobs) {
      setJobs(apiJobs.filter((j: Job) => !localDeletedIds.includes(j.id)));
      return;
    }

    // Offline fallback
    setJobs(getStoredJobs());
  };

  // Fetch applications from backend API or authorized Cloud Firestore scope
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          setApplications(data.applications);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch applications from API, using Cloud Firestore/local state:', err);
    }

    // Only query Firestore applications if signed into Firebase Auth (enforces PII isolation rules)
    const fbUser = auth.currentUser;
    if (fbUser) {
      try {
        const firestoreApps: JobApplication[] = [];
        if (isFirebaseAdminSession()) {
          const snap = await getDocs(collection(db, 'applications'));
          snap.forEach((d) => {
            firestoreApps.push({ ...(d.data() as JobApplication), id: (d.data() as any).id || d.id });
          });
        } else {
          const uidSnap = await getDocs(
            query(collection(db, 'applications'), where('applicantUid', '==', fbUser.uid))
          );
          uidSnap.forEach((d) => {
            firestoreApps.push({ ...(d.data() as JobApplication), id: (d.data() as any).id || d.id });
          });

          if (fbUser.emailVerified && fbUser.email) {
            try {
              const emailSnap = await getDocs(
                query(collection(db, 'applications'), where('email', '==', fbUser.email.toLowerCase()))
              );
              emailSnap.forEach((d) => {
                const appObj = { ...(d.data() as JobApplication), id: (d.data() as any).id || d.id };
                if (!firestoreApps.some((a) => a.id === appObj.id)) {
                  firestoreApps.push(appObj);
                }
              });
            } catch {
              // Token email casing may differ; applicantUid query already succeeded
            }
          }
        }

        const localApps = getStoredApplications();
        const merged = [...firestoreApps];
        for (const la of localApps) {
          if (!merged.some((m) => m.id === la.id)) {
            merged.push(la);
          }
        }
        setApplications(merged);
        return;
      } catch (fsErr) {
        console.warn('Firestore applications lookup notice:', fsErr);
      }
    }

    setApplications(getStoredApplications());
  };

  // Fetch website CMS settings from API + Cloud Firestore
  const fetchSettings = async () => {
    let apiSettings: WebsiteSettings | null = null;
    try {
      const res = await fetch('/api/site-settings');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.settings) {
          apiSettings = data.settings;
        }
      }
    } catch (err) {
      console.warn('Could not fetch site settings from API:', err);
    }

    try {
      const snap = await getDoc(doc(db, 'site_settings', 'main'));
      if (snap.exists()) {
        const cloudSettings = { ...defaultSettings, ...(snap.data() as Partial<WebsiteSettings>) };
        setWebsiteSettings(cloudSettings);
        saveStoredSettings(cloudSettings);
        return;
      }
    } catch (fsErr) {
      console.warn('Firestore site settings lookup notice:', fsErr);
    }

    if (apiSettings) {
      setWebsiteSettings(apiSettings);
      return;
    }

    setWebsiteSettings(getStoredSettings());
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchSettings();

    // Real-time Cloud Firestore listeners: keep every Chrome profile & device in sync automatically
    const unsubscribeJobs = onSnapshot(
      collection(db, 'jobs'),
      (snap) => {
        applyCloudJobsSnapshot(snap);
      },
      (err) => {
        console.warn('Realtime jobs listener notice:', err);
      }
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, 'site_settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          const cloudSettings = { ...defaultSettings, ...(snap.data() as Partial<WebsiteSettings>) };
          setWebsiteSettings(cloudSettings);
          saveStoredSettings(cloudSettings);
        }
      },
      (err) => {
        console.warn('Realtime settings listener notice:', err);
      }
    );

    const unsubscribeAuth = onAuthStateChanged(auth, () => {
      fetchApplications();
    });

    return () => {
      unsubscribeJobs();
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, []);

  // Save bookmarked IDs to localStorage
  const handleToggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const next = prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId];
      try {
        localStorage.setItem('shine_saved_job_ids', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Authentication Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('shine_user_session', JSON.stringify(user));
      if (user.email) {
        const saved = localStorage.getItem(`shine_my_app_ids_${user.email.toLowerCase()}`);
        if (saved) {
          setMyApplicationIds(JSON.parse(saved));
        } else {
          setMyApplicationIds([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    if (user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setCurrentUser(null);
    setMyApplicationIds([]);
    try {
      localStorage.removeItem('shine_user_session');
      localStorage.removeItem('shine_my_app_ids');
    } catch (e) {
      console.error(e);
    }
    // Always navigate back to public home/jobs on logout
    setActiveTab('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthModal = (role: 'admin' | 'job_seeker' = 'job_seeker') => {
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  // Job Posting Guard: ONLY verified admin can open the post job modal
  const handleOpenPostJob = () => {
    if (currentUser?.role === 'admin') {
      setIsPostJobModalOpen(true);
    } else {
      handleOpenAuthModal('admin');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedWorkMode('all');
    setSelectedExperience('all');
    setSelectedJobType('all');
    setOnlyVerifiedWFH(false);
    setOnlyGovtOutsourced(false);
    setSortBy('recent');
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesLocation = job.location.toLowerCase().includes(q);
        const matchesCategory = job.category.toLowerCase().includes(q);
        const matchesSkills = job.skills.some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesCategory && !matchesSkills) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && job.category !== selectedCategory) {
        return false;
      }

      // Work Mode filter
      if (selectedWorkMode !== 'all' && job.workMode !== selectedWorkMode) {
        return false;
      }

      // Job Type filter
      if (selectedJobType !== 'all' && job.jobType !== selectedJobType) {
        return false;
      }

      // Experience filter
      if (selectedExperience !== 'all') {
        if (selectedExperience === 'fresher' && job.experienceMin > 0) return false;
        if (selectedExperience === '1-3' && (job.experienceMin > 3 || job.experienceMax < 1)) return false;
        if (selectedExperience === '3-5' && (job.experienceMin > 5 || job.experienceMax < 3)) return false;
        if (selectedExperience === '5+' && job.experienceMax < 5) return false;
      }

      // Special tags
      if (onlyVerifiedWFH && !job.isVerifiedWFH) return false;
      if (onlyGovtOutsourced && !job.isGovtOutsourced) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'salary-high') {
        return b.salaryMax - a.salaryMax;
      }
      if (sortBy === 'urgent') {
        return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
      }
      if (sortBy === 'applicants') {
        return b.applicantsCount - a.applicantsCount;
      }
      // default: recent
      return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
    });
  }, [jobs, searchQuery, selectedCategory, selectedWorkMode, selectedJobType, selectedExperience, onlyVerifiedWFH, onlyGovtOutsourced, sortBy]);

  // Handle application submission callback
  const handleApplicationSuccess = (newApp: JobApplication) => {
    setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
    setMyApplicationIds(prev => {
      const next = [newApp.id, ...prev.filter(id => id !== newApp.id)];
      try {
        if (currentUser?.email) {
          localStorage.setItem(`shine_my_app_ids_${currentUser.email.toLowerCase()}`, JSON.stringify(next));
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    // increment count in job locally
    setJobs(prev => prev.map(j => j.id === newApp.jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j));
  };

  // Handle new job posted callback
  const handleJobPosted = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev.filter(j => j.id !== newJob.id)]);
    setActiveTab('posted-jobs');
  };

  // Handle delete job (Admin Only)
  const handleDeleteJob = async (jobId: string) => {
    if (currentUser?.role !== 'admin') {
      console.warn('Permission denied: only verified admin is permitted to delete jobs.');
      handleOpenAuthModal('admin');
      return;
    }

    const targetJob = jobs.find(j => j.id === jobId);

    // 1. Immediately update UI and local persistence
    deleteLocalJob(jobId);
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setSelectedJobForDetail(prev => (prev?.id === jobId ? null : prev));

    // 2. Synchronize deletion permanently in Cloud Firestore
    if (isFirebaseAdminSession()) {
      const isSeedJob = INITIAL_JOBS.some(ij => ij.id === jobId);
      try {
        if (isSeedJob) {
          await setDoc(
            doc(db, 'jobs', jobId),
            sanitizeJobForFirestore({ ...(targetJob || { id: jobId }), isDeleted: true }),
            { merge: true }
          );
        } else {
          await deleteDoc(doc(db, 'jobs', jobId));
        }
      } catch (fsErr) {
        try {
          handleFirestoreError(fsErr, OperationType.DELETE, `jobs/${jobId}`);
        } catch (err) {
          console.error('Firestore job delete failed:', err);
        }
      }
    }

    // 3. Synchronize with backend API (if running full-stack server)
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
          'Authorization': 'Bearer admin-token'
        }
      });
    } catch (e) {
      console.warn('Backend DELETE error, using Cloud/local state:', e);
    }
  };

  const handleHeroSearch = (query: string, category: string, workMode: string) => {
    setSearchQuery(query);
    setSelectedCategory(category);
    setSelectedWorkMode(workMode);
    setActiveTab('jobs');
    const el = document.getElementById('jobs-explorer-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryCardClick = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('jobs');
    const el = document.getElementById('jobs-explorer-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const savedJobs = useMemo(() => {
    return jobs.filter(j => savedJobIds.includes(j.id));
  }, [jobs, savedJobIds]);

  // Candidate's own applied applications (ONLY positions the logged-in user actually applied for)
  const candidateApplications = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const userPhone = (currentUser.phone || '').trim();

    return applications.filter(app => {
      const appEmail = (app.email || '').trim().toLowerCase();
      const appPhone = (app.phone || '').trim();
      return (userEmail && appEmail === userEmail) || 
             (userPhone && appPhone === userPhone) || 
             myApplicationIds.includes(app.id);
    });
  }, [applications, currentUser, myApplicationIds]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Live Announcement Banner (Configured via Website Update in Admin Panel) */}
      {websiteSettings.announcementEnabled && websiteSettings.announcementNotice && (
        <div className="bg-slate-950 border-b border-amber-500/30 text-white text-xs py-2.5 px-4 shadow-sm text-center flex items-center justify-center gap-2 font-medium">
          <span className="bg-amber-400 text-slate-950 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded tracking-wider flex items-center gap-1 shadow-xs">
            <Bell className="w-3 h-3" /> Live Notice
          </span>
          <span className="text-slate-200 text-xs sm:text-sm">
            {websiteSettings.announcementNotice}
          </span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAIMatcher={() => setIsAIResumeMatcherOpen(true)}
        totalJobsCount={jobs.length}
        savedCount={savedJobIds.length}
        applicationsCount={candidateApplications.length}
        currentUser={currentUser}
        onOpenLogin={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Content according to Active Tab */}
      <div className="grow">
        {/* TAB 1: Explore Jobs (Job Seekers & Guests) */}
        {activeTab === 'jobs' && (
          <>
            <HeroSection
              onSearch={handleHeroSearch}
              onOpenAIMatcher={() => setIsAIResumeMatcherOpen(true)}
              totalJobs={jobs.length}
            />

            <CategoryHighlights
              onSelectCategory={handleCategoryCardClick}
              selectedCategory={selectedCategory}
            />

            <JobsExplorer
              jobs={filteredJobs}
              loading={loading}
              onApplyClick={(job) => setSelectedJobForApply(job)}
              onJobSelect={(job) => setSelectedJobForDetail(job)}
              savedJobIds={savedJobIds}
              onToggleSaveJob={handleToggleSaveJob}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedWorkMode={selectedWorkMode}
              setSelectedWorkMode={setSelectedWorkMode}
              selectedExperience={selectedExperience}
              setSelectedExperience={setSelectedExperience}
              selectedJobType={selectedJobType}
              setSelectedJobType={setSelectedJobType}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onlyVerifiedWFH={onlyVerifiedWFH}
              setOnlyVerifiedWFH={setOnlyVerifiedWFH}
              onlyGovtOutsourced={onlyGovtOutsourced}
              setOnlyGovtOutsourced={setOnlyGovtOutsourced}
              onResetFilters={handleResetFilters}
            />
          </>
        )}

        {/* TAB 2: Posted Jobs Board */}
        {activeTab === 'posted-jobs' && (
          <PostedJobsManager
            jobs={jobs}
            applications={applications}
            onDeleteJob={handleDeleteJob}
            onOpenPostJob={handleOpenPostJob}
            onSelectJobForDetail={(job) => setSelectedJobForDetail(job)}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {/* TAB 3: Candidate's My Applications */}
        {activeTab === 'applications' && (
          <ApplicationsTracker
            applications={candidateApplications}
            savedJobs={savedJobs}
            jobs={jobs}
            currentUser={currentUser}
            onOpenLogin={handleOpenAuthModal}
            onSelectJob={(job) => setSelectedJobForDetail(job)}
            onRemoveSavedJob={handleToggleSaveJob}
            onExploreClick={() => setActiveTab('jobs')}
          />
        )}

        {/* TAB 4: Pura Admin Panel (Job Posting, Candidates, User Management, Website CMS Update) */}
        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            onOpenLogin={handleOpenAuthModal}
            onOpenPostJob={() => setIsPostJobModalOpen(true)}
            onLogout={handleLogout}
            onSwitchToPublicSite={() => setActiveTab('jobs')}
            jobs={jobs}
            applications={applications}
            websiteSettings={websiteSettings}
            onRefreshJobs={fetchJobs}
            onRefreshApplications={fetchApplications}
            onRefreshSettings={fetchSettings}
            onSelectJob={(job) => setSelectedJobForDetail(job)}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {/* TAB 5: About & Jabalpur Office */}
        {activeTab === 'about' && (
          <AboutContactSection websiteSettings={websiteSettings} />
        )}
      </div>

      {/* Footer */}
      <Footer
        onCategorySelect={(cat) => handleCategoryCardClick(cat)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        websiteSettings={websiteSettings}
      />

      {/* Modals */}
      <JobDetailModal
        job={selectedJobForDetail}
        onClose={() => setSelectedJobForDetail(null)}
        onApply={(job) => {
          setSelectedJobForDetail(null);
          setSelectedJobForApply(job);
        }}
        isSaved={selectedJobForDetail ? savedJobIds.includes(selectedJobForDetail.id) : false}
        onToggleSave={handleToggleSaveJob}
        isAdmin={currentUser?.role === 'admin'}
        onDeleteJob={handleDeleteJob}
      />

      <ApplyModal
        job={selectedJobForApply}
        currentUser={currentUser}
        onClose={() => setSelectedJobForApply(null)}
        onApplicationSuccess={handleApplicationSuccess}
      />

      {/* Post Job Modal (Protected for Admin) */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onJobPosted={handleJobPosted}
        currentUser={currentUser}
      />

      {/* AI Resume Matcher */}
      <AIResumeMatcherModal
        isOpen={isAIResumeMatcherOpen}
        onClose={() => setIsAIResumeMatcherOpen(false)}
        jobs={jobs}
        onSelectMatchedJob={(job) => setSelectedJobForDetail(job)}
      />

      {/* Authentication Modal (Login / Logout / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authModalRole}
      />

      {/* Floating WhatsApp Placement Helpline */}
      <div className="fixed bottom-24 right-6 z-40 flex items-center gap-2 group">
        <span className="hidden group-hover:inline-block bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-right duration-200">
          Chat on WhatsApp: {websiteSettings.helplinePhone}
        </span>
        <a
          href={`https://wa.me/${(websiteSettings.whatsappNumber || '919039881102').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(websiteSettings.whatsappMessage || 'Hello Shine Group Jobs')}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Direct WhatsApp Placement Desk Chat"
          className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <MessageCircle className="w-7 h-7 fill-white" />
        </a>
      </div>

    </div>
  );
}
