import { Job, JobApplication, WebsiteSettings, User } from '../types.js';
import { INITIAL_JOBS } from '../data/initialJobs.js';

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: "app-1001",
    jobId: "job-101",
    jobTitle: "MP State e-Governance Data Analyst & Portal Operator",
    company: "MP State e-Mission (Outsourced Partner)",
    fullName: "Rahul Shrivastava",
    email: "rahul.shrivastava@example.com",
    phone: "+91 9826112233",
    currentCity: "Jabalpur",
    totalExperience: "1.5 Years",
    currentCTC: "₹18,000/mo",
    expectedCTC: "₹25,000/mo",
    noticePeriod: "Immediate",
    resumeUrlOrSummary: "B.Com with DCA certification. 1.5 yrs experience in citizen registry data entry at local MP Online kiosk.",
    coverNote: "Ready to join immediately. Proficient in Mangal font typing and Samagra database verification.",
    appliedDate: "2026-09-11",
    status: "Shortlisted"
  },
  {
    id: "app-1002",
    jobId: "job-102",
    jobTitle: "Verified Remote Data Quality & Indexing Specialist",
    company: "Apex Global Analytics (Shine Direct Placement)",
    fullName: "Priya Tiwari",
    email: "priya.t@example.com",
    phone: "+91 9407334455",
    currentCity: "Bhopal",
    totalExperience: "Fresher",
    expectedCTC: "₹20,000/mo",
    noticePeriod: "Immediate",
    resumeUrlOrSummary: "B.Sc Computer Science graduate. Dedicated home workstation with 50 Mbps fiber connection.",
    coverNote: "Looking for an authentic work-from-home position. 45 WPM English typing speed.",
    appliedDate: "2026-09-12",
    status: "Under Review"
  }
];

export const DEFAULT_SITE_SETTINGS: WebsiteSettings = {
  portalName: "SHINE GROUP JOBS",
  tagline: "Recruitment & Placement Consultancy • Jabalpur (Est. 2002)",
  announcementNotice: "🔥 Direct Walk-in Interviews scheduled for Jabalpur, Indore & WFH outsourced positions. Call +91 9752661102 for appointment.",
  announcementEnabled: true,
  helplinePhone: "+91 9752661102",
  secondaryPhone: "+91 9826112233",
  supportEmail: "support@shinegroupjobs.com",
  officeAddress: "2nd Floor, in front of Khalsa College, above Central Bank, Mahanadda, Jabalpur, Madhya Pradesh 482001",
  whatsappNumber: "+91 9752661102",
  whatsappMessage: "Hello Shine Group Placement Desk, I am seeking job placement assistance.",
  aboutUsText: "Shine Group Jobs in Jabalpur is actively engaged in providing reliable placement services across multiple industries. With years of experience in the job market, we effectively match candidates with suitable job opportunities based on their skills and career goals. Our strong association with leading companies allows us to inform candidates promptly whenever new vacancies arise. We also assist candidates in getting their CVs noticed and shortlisted among a large pool of applicants, helping them stand out in today’s highly competitive job market.\n\nOur team of experienced and well-qualified professionals conducts detailed screenings to identify the true potential and strengths of each candidate. By carefully understanding the requirements of both job seekers and employers, we ensure the right match for long-term success. Through ethical practices, transparency, and consistent quality service, we have earned trust, credibility, and goodwill. Our aim is to set industry benchmarks while contributing towards a fully employed and empowered society."
};

interface StoredUserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'job_seeker';
  phone?: string;
}

// ---------------- AUTHENTICATION HELPERS ---------------- //

export function getStoredUsers(): StoredUserRecord[] {
  try {
    const raw = localStorage.getItem('shine_registered_users');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading stored users:', e);
  }
  return [
    {
      id: "user-admin-1",
      name: "Shine Group Admin",
      email: "admin@shinegroupjobs.com",
      password: "Sumit@7400",
      role: "admin",
      phone: "+91 9752661102"
    }
  ];
}

export function offlineAuthLogin(email: string, password: string, role?: string): { success: boolean; user?: User; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  
  // Admin Login
  if (role === 'admin' || cleanEmail === 'admin@shinegroupjobs.com') {
    if (cleanEmail === 'admin@shinegroupjobs.com' && password === 'Sumit@7400') {
      const adminUser: User = {
        id: "user-admin-1",
        name: "Shine Group Admin",
        email: "admin@shinegroupjobs.com",
        role: "admin",
        phone: "+91 9752661102",
        token: "admin-token-offline-" + Date.now()
      };
      return {
        success: true,
        user: adminUser,
        message: "Welcome back, Admin!"
      };
    } else {
      return {
        success: false,
        message: "Invalid Admin credentials. Please check email (admin@shinegroupjobs.com) and password."
      };
    }
  }

  // Job Seeker Login
  const users = getStoredUsers();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (found) {
    if (found.password && found.password !== password) {
      return {
        success: false,
        message: "Incorrect password. Please verify and try again."
      };
    }
    return {
      success: true,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        phone: found.phone,
        token: "user-token-" + Date.now()
      },
      message: "Successfully logged in!"
    };
  }

  // If first time candidate signing in, auto-create candidate account for seamless UX
  const newCandidate: StoredUserRecord = {
    id: "user-" + Date.now(),
    name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    email: cleanEmail,
    password: password,
    role: "job_seeker",
    phone: "+91 9876543210"
  };

  try {
    const updated = [...users, newCandidate];
    localStorage.setItem('shine_registered_users', JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving new candidate:', e);
  }

  return {
    success: true,
    user: {
      id: newCandidate.id,
      name: newCandidate.name,
      email: newCandidate.email,
      role: newCandidate.role,
      phone: newCandidate.phone,
      token: "user-token-" + Date.now()
    },
    message: "Successfully logged in as candidate!"
  };
}

export function offlineAuthRegister(
  name: string,
  email: string,
  password: string,
  phone: string,
  role: 'admin' | 'job_seeker' = 'job_seeker',
  adminPasscode?: string
): { success: boolean; user?: User; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return {
      success: false,
      message: "An account with this email already exists. Please login instead."
    };
  }

  let finalRole: 'admin' | 'job_seeker' = 'job_seeker';
  if (role === 'admin') {
    if (adminPasscode === 'Sumit@7400' || password === 'Sumit@7400') {
      finalRole = 'admin';
    } else {
      return {
        success: false,
        message: "Invalid Admin Passcode. Admin registration restricted to authorized personnel."
      };
    }
  }

  const newUser: StoredUserRecord = {
    id: "user-" + Date.now(),
    name: name.trim(),
    email: cleanEmail,
    password,
    phone: phone.trim(),
    role: finalRole
  };

  try {
    localStorage.setItem('shine_registered_users', JSON.stringify([...users, newUser]));
  } catch (e) {
    console.error('Error registering user:', e);
  }

  return {
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      token: "token-" + Date.now()
    },
    message: "Account created successfully!"
  };
}

// ---------------- JOBS STORAGE HELPERS ---------------- //

export function getStoredJobs(): Job[] {
  let jobs = [...INITIAL_JOBS];
  try {
    // Check custom added jobs
    const customRaw = localStorage.getItem('shine_custom_jobs');
    if (customRaw) {
      const customJobs: Job[] = JSON.parse(customRaw);
      // Prepend custom jobs
      jobs = [...customJobs, ...jobs.filter(j => !customJobs.some(cj => cj.id === j.id))];
    }

    // Check status overrides (e.g. closed/active)
    const statusOverridesRaw = localStorage.getItem('shine_job_status_overrides');
    if (statusOverridesRaw) {
      const overrides: Record<string, "Active" | "Closed"> = JSON.parse(statusOverridesRaw);
      jobs = jobs.map(j => overrides[j.id] ? { ...j, status: overrides[j.id] } : j);
    }

    // Check deleted jobs
    const deletedRaw = localStorage.getItem('shine_deleted_job_ids');
    if (deletedRaw) {
      const deletedIds: string[] = JSON.parse(deletedRaw);
      jobs = jobs.filter(j => !deletedIds.includes(j.id));
    }
  } catch (e) {
    console.error('Error reading stored jobs:', e);
  }
  return jobs;
}

export function saveLocalCustomJob(jobData: Partial<Job>): Job {
  const newJob: Job = {
    id: "job-" + Date.now(),
    title: jobData.title || "Job Opening",
    company: jobData.company || "Hiring Partner",
    category: jobData.category || "IT & Software",
    jobType: jobData.jobType || "Full-time",
    workMode: jobData.workMode || "On-site",
    location: jobData.location || "Jabalpur, Madhya Pradesh",
    salaryMin: Number(jobData.salaryMin) || 15000,
    salaryMax: Number(jobData.salaryMax) || 25000,
    salaryPeriod: jobData.salaryPeriod || "per month",
    experienceMin: Number(jobData.experienceMin) || 0,
    experienceMax: Number(jobData.experienceMax) || 2,
    description: jobData.description || "",
    responsibilities: jobData.responsibilities || [],
    requirements: jobData.requirements || [],
    skills: jobData.skills || ["Communication"],
    perks: jobData.perks || ["PF & ESI"],
    contactEmail: jobData.contactEmail || "support@shinegroupjobs.com",
    contactPhone: jobData.contactPhone || "+91 9752661102",
    postedBy: jobData.postedBy || "Shine Admin Desk",
    postedDate: new Date().toISOString().split('T')[0],
    deadline: jobData.deadline || "",
    views: 12,
    applicantsCount: 0,
    isUrgent: !!jobData.isUrgent,
    isFeatured: !!jobData.isFeatured,
    isGovtOutsourced: !!jobData.isGovtOutsourced,
    isVerifiedWFH: !!jobData.isVerifiedWFH,
    status: "Active"
  };

  try {
    const raw = localStorage.getItem('shine_custom_jobs');
    const list: Job[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem('shine_custom_jobs', JSON.stringify([newJob, ...list]));
  } catch (e) {
    console.error('Error saving local job:', e);
  }

  return newJob;
}

export function updateLocalCustomJob(updatedJob: Job): void {
  try {
    const raw = localStorage.getItem('shine_custom_jobs');
    const list: Job[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex(j => j.id === updatedJob.id);
    if (index >= 0) {
      list[index] = updatedJob;
      localStorage.setItem('shine_custom_jobs', JSON.stringify(list));
    } else {
      localStorage.setItem('shine_custom_jobs', JSON.stringify([updatedJob, ...list]));
    }
  } catch (e) {
    console.error('Error updating local job:', e);
  }
}

export function setLocalJobStatus(jobId: string, status: "Active" | "Closed"): void {
  try {
    const raw = localStorage.getItem('shine_job_status_overrides');
    const overrides: Record<string, "Active" | "Closed"> = raw ? JSON.parse(raw) : {};
    overrides[jobId] = status;
    localStorage.setItem('shine_job_status_overrides', JSON.stringify(overrides));
  } catch (e) {
    console.error('Error updating job status locally:', e);
  }
}

export function deleteLocalJob(jobId: string): void {
  try {
    const raw = localStorage.getItem('shine_deleted_job_ids');
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(jobId)) {
      list.push(jobId);
      localStorage.setItem('shine_deleted_job_ids', JSON.stringify(list));
    }
  } catch (e) {
    console.error('Error deleting local job:', e);
  }
}

// ---------------- APPLICATIONS STORAGE HELPERS ---------------- //

export function getStoredApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem('shine_stored_applications');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading applications:', e);
  }
  return INITIAL_APPLICATIONS;
}

export function saveLocalApplication(job: Job, appData: any): JobApplication {
  const newApp: JobApplication = {
    id: "app-" + Date.now(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    fullName: appData.fullName || "Candidate",
    email: appData.email || "",
    phone: appData.phone || "",
    currentCity: appData.currentCity || "Jabalpur",
    totalExperience: appData.totalExperience || "Fresher",
    currentCTC: appData.currentCTC,
    expectedCTC: appData.expectedCTC,
    noticePeriod: appData.noticePeriod || "Immediate",
    resumeUrlOrSummary: appData.resumeUrlOrSummary || "",
    resumeFile: appData.resumeFile,
    coverNote: appData.coverNote,
    appliedDate: new Date().toISOString().split('T')[0],
    status: "Submitted"
  };

  try {
    const current = getStoredApplications();
    const updated = [newApp, ...current];
    localStorage.setItem('shine_stored_applications', JSON.stringify(updated));

    // Also record under candidate email
    if (newApp.email) {
      const emailKey = `shine_my_app_ids_${newApp.email.toLowerCase()}`;
      const myIdsRaw = localStorage.getItem(emailKey);
      const myIds: string[] = myIdsRaw ? JSON.parse(myIdsRaw) : [];
      if (!myIds.includes(newApp.id)) {
        localStorage.setItem(emailKey, JSON.stringify([newApp.id, ...myIds]));
      }
    }
  } catch (e) {
    console.error('Error storing application locally:', e);
  }

  return newApp;
}

export function updateLocalApplicationStatus(appId: string, status: JobApplication['status']): void {
  try {
    const current = getStoredApplications();
    const updated = current.map(a => a.id === appId ? { ...a, status } : a);
    localStorage.setItem('shine_stored_applications', JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating application status:', e);
  }
}

// ---------------- SITE SETTINGS STORAGE HELPERS ---------------- //

export function getStoredSettings(): WebsiteSettings {
  try {
    const raw = localStorage.getItem('shine_site_settings');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading site settings:', e);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveStoredSettings(settings: WebsiteSettings): void {
  try {
    localStorage.setItem('shine_site_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving site settings:', e);
  }
}
