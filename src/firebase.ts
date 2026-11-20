import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Job, JobApplication, CandidateCertificate, WebsiteSettings } from './types.js';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with the provisioned firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const ADMIN_EMAILS = [
  'rentpe.support.in@gmail.com',
  'admin@shinegroupjobs.com',
  'admin@shinegroupjob.com'
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function isFirebaseAdminSession(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return Boolean(user.emailVerified && isAuthorizedAdminEmail(user.email));
}

export function formatFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'your-site.netlify.app';
    return `Domain "${host}" is not authorized in Firebase Authentication. Go to Firebase Console -> Authentication -> Settings -> Authorized domains -> Add "${host}".`;
  }
  if (code === 'auth/popup-blocked') {
    return 'Popup was blocked by browser. Please allow popups for this site and click Continue with Google again.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in popup was closed before completing login.';
  }
  return err?.message || 'Google Sign-In failed. Please try again.';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  const serialized = JSON.stringify(errInfo);
  console.error('Firestore Error: ', serialized);
  throw new Error(serialized);
}

// Test initial connection to Firestore
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Auto-run connection test
testFirestoreConnection().catch(() => {});

// ---------------- VOLUMETRIC & SCHEMA SANITIZATION ---------------- //

function clipStr(val: unknown, maxLen: number, fallback = ''): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function cleanStringList(arr: unknown, maxItems: number, maxItemLen = 300): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, maxItems)
    .map(item => item.trim().slice(0, maxItemLen));
}

/**
 * Compresses large uploaded image data URLs so job documents stay safely under
 * Firestore's 1 MB document limit and our 800 KB security-rule limit.
 */
export async function compressImageDataUrl(dataUrl: string, maxChars = 550000): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') return '';
  if (!dataUrl.startsWith('data:image/') || dataUrl.length <= maxChars) {
    return dataUrl.length <= 780000 ? dataUrl : '';
  }

  // SVG or unsupported raster fallback
  if (dataUrl.startsWith('data:image/svg')) {
    return dataUrl.length <= 780000 ? dataUrl : '';
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);
        while (result.length > maxChars && quality > 0.3) {
          quality -= 0.15;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        if (result.length > 780000) {
          // Downscale further if still large
          canvas.width = Math.max(1, Math.round(width * 0.6));
          canvas.height = Math.max(1, Math.round(height * 0.6));
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          result = canvas.toDataURL('image/jpeg', 0.65);
        }

        resolve(result.length <= 780000 ? result : '');
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

export function sanitizeJobForFirestore(
  job: Partial<Job> & { id: string; isDeleted?: boolean }
): Record<string, any> {
  const payload: Record<string, any> = {
    id: clipStr(job.id, 128).replace(/[^a-zA-Z0-9_\-]/g, '-') || `job-${Date.now()}`,
    title: clipStr(job.title, 200, 'Job Opening'),
    company: clipStr(job.company, 200, 'Hiring Partner'),
    category: clipStr(job.category, 100, 'IT & Software'),
    jobType: clipStr(job.jobType, 60, 'Full-time'),
    workMode: clipStr(job.workMode, 60, 'On-site'),
    location: clipStr(job.location, 200, 'Jabalpur, Madhya Pradesh'),
    salaryMin: Number.isFinite(Number(job.salaryMin)) ? Number(job.salaryMin) : 0,
    salaryMax: Number.isFinite(Number(job.salaryMax)) ? Number(job.salaryMax) : 0,
    salaryPeriod: clipStr(job.salaryPeriod, 50, 'per month'),
    experienceMin: Number.isFinite(Number(job.experienceMin)) ? Number(job.experienceMin) : 0,
    experienceMax: Number.isFinite(Number(job.experienceMax)) ? Number(job.experienceMax) : 0,
    description: clipStr(job.description, 8000, 'Verified job opening on Shine Group Jobs.'),
    responsibilities: cleanStringList(job.responsibilities, 30),
    requirements: cleanStringList(job.requirements, 30),
    skills: cleanStringList(job.skills, 40),
    perks: cleanStringList(job.perks, 30),
    contactEmail: clipStr(job.contactEmail, 160, 'admin@shinegroupjob.com'),
    contactPhone: clipStr(job.contactPhone, 30, '+91 9039881102'),
    postedBy: clipStr(job.postedBy, 150, 'Shine Group Admin'),
    postedDate: clipStr(job.postedDate, 64, new Date().toISOString().split('T')[0]),
    views: Number.isFinite(Number(job.views)) ? Number(job.views) : 1,
    applicantsCount: Number.isFinite(Number(job.applicantsCount)) ? Number(job.applicantsCount) : 0,
    isUrgent: Boolean(job.isUrgent),
    isFeatured: Boolean(job.isFeatured),
    isGovtOutsourced: Boolean(job.isGovtOutsourced),
    isVerifiedWFH: Boolean(job.isVerifiedWFH),
    status: job.status === 'Closed' ? 'Closed' : 'Active',
    isDeleted: Boolean(job.isDeleted),
    updatedAt: new Date().toISOString()
  };

  if (job.companyLogo) {
    payload.companyLogo = clipStr(job.companyLogo, 1000);
  }
  if (job.deadline) {
    payload.deadline = clipStr(job.deadline, 64);
  }
  if (typeof job.imageUrl === 'string' && job.imageUrl.trim().length > 0 && job.imageUrl.trim().length <= 780000) {
    payload.imageUrl = job.imageUrl.trim();
  }

  return payload;
}

export function sanitizeApplicationForFirestore(
  appData: Partial<JobApplication> & { id: string; jobId: string; applicantUid?: string }
): Record<string, any> {
  const validStatuses = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
  const status = validStatuses.includes(String(appData.status)) ? appData.status : 'Submitted';

  const payload: Record<string, any> = {
    id: clipStr(appData.id, 128).replace(/[^a-zA-Z0-9_\-]/g, '-') || `app-${Date.now()}`,
    jobId: clipStr(appData.jobId, 128).replace(/[^a-zA-Z0-9_\-]/g, '-') || 'job-101',
    jobTitle: clipStr(appData.jobTitle, 200, 'Job Opening'),
    company: clipStr(appData.company, 200, 'Shine Partner'),
    fullName: clipStr(appData.fullName, 120, 'Candidate'),
    email: clipStr(appData.email, 160, 'candidate@example.com').toLowerCase(),
    phone: clipStr(appData.phone, 30, '+91 9039881102'),
    currentCity: clipStr(appData.currentCity, 120),
    totalExperience: clipStr(appData.totalExperience, 60),
    currentCTC: clipStr(appData.currentCTC, 60),
    expectedCTC: clipStr(appData.expectedCTC, 60),
    noticePeriod: clipStr(appData.noticePeriod, 60),
    resumeUrlOrSummary: clipStr(appData.resumeUrlOrSummary, 5000),
    coverNote: clipStr(appData.coverNote, 3000),
    appliedDate: clipStr(appData.appliedDate, 64, new Date().toISOString().split('T')[0]),
    status,
    updatedAt: new Date().toISOString()
  };

  if (appData.applicantUid) {
    payload.applicantUid = clipStr(appData.applicantUid, 128);
  } else if (auth.currentUser?.uid) {
    payload.applicantUid = auth.currentUser.uid;
  }

  return payload;
}

export function sanitizeCertificateForFirestore(
  cert: Partial<CandidateCertificate> & { id: string; isDeleted?: boolean }
): Record<string, any> {
  const validStatuses = ['Pending Approval', 'Approved', 'Rejected'];
  const status = validStatuses.includes(String(cert.status)) ? cert.status : 'Pending Approval';

  const payload: Record<string, any> = {
    id: clipStr(cert.id, 128).replace(/[^a-zA-Z0-9_\-]/g, '-') || `cert-${Date.now()}`,
    certificateNumber: clipStr(cert.certificateNumber, 100, `SGJ-CERT-${new Date().getFullYear()}-10000`),
    candidateName: clipStr(cert.candidateName, 120, 'Candidate'),
    candidateEmail: clipStr(cert.candidateEmail, 160, 'candidate@shinegroupjob.com').toLowerCase(),
    certificateType: clipStr(cert.certificateType, 120, 'Training & Skill Completion'),
    courseOrRole: clipStr(cert.courseOrRole, 250, 'Skill Program'),
    duration: clipStr(cert.duration, 120),
    organization: clipStr(cert.organization, 200, 'Shine Group Jobs & Placement Center, Jabalpur (ISO 9001:2015)'),
    requestedDate: clipStr(cert.requestedDate, 64, new Date().toISOString().split('T')[0]),
    status,
    isDeleted: Boolean(cert.isDeleted),
    updatedAt: new Date().toISOString()
  };

  if (cert.fatherName) payload.fatherName = clipStr(cert.fatherName, 120);
  if (cert.candidatePhone) payload.candidatePhone = clipStr(cert.candidatePhone, 30);
  if (cert.issueDate) payload.issueDate = clipStr(cert.issueDate, 80);
  if (cert.grade) payload.grade = clipStr(cert.grade, 100);
  if (cert.rejectionReason) payload.rejectionReason = clipStr(cert.rejectionReason, 500);
  if (cert.adminRemarks) payload.adminRemarks = clipStr(cert.adminRemarks, 1000);
  if (cert.approvedBy) payload.approvedBy = clipStr(cert.approvedBy, 150);
  if (cert.approvedDate) payload.approvedDate = clipStr(cert.approvedDate, 64);
  if (cert.signatoryTitle) payload.signatoryTitle = clipStr(cert.signatoryTitle, 150);

  return payload;
}

export function sanitizeSiteSettingsForFirestore(settings: WebsiteSettings): Record<string, any> {
  return {
    portalName: clipStr(settings.portalName, 120, 'SHINE GROUP JOBS'),
    tagline: clipStr(settings.tagline, 250),
    announcementNotice: clipStr(settings.announcementNotice, 1000),
    announcementEnabled: Boolean(settings.announcementEnabled),
    helplinePhone: clipStr(settings.helplinePhone, 30, '+91 9039881102'),
    secondaryPhone: clipStr(settings.secondaryPhone, 30),
    supportEmail: clipStr(settings.supportEmail, 160, 'admin@shinegroupjob.com'),
    officeAddress: clipStr(settings.officeAddress, 500),
    whatsappNumber: clipStr(settings.whatsappNumber, 30),
    whatsappMessage: clipStr(settings.whatsappMessage, 500),
    aboutUsText: clipStr(settings.aboutUsText, 5000),
    updatedAt: new Date().toISOString()
  };
}

export {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
};
export type { FirebaseUser };
