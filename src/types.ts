export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  category: string; // "IT & Software" | "Govt Outsourced" | "Work From Home" | "Banking & Finance" | "Healthcare" | "Engineering" | "Sales & Marketing" | "Hospitality" | "Overseas Placement"
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Government Outsourced";
  workMode: "Remote / WFH" | "On-site" | "Hybrid" | "Overseas / Gulf";
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: "per month" | "per annum";
  experienceMin: number; // 0 for freshers
  experienceMax: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  perks: string[];
  contactEmail: string;
  contactPhone: string;
  postedBy: string; // Recruiter name or user
  postedDate: string;
  deadline?: string;
  views: number;
  applicantsCount: number;
  isUrgent?: boolean;
  isFeatured?: boolean;
  isGovtOutsourced?: boolean;
  isVerifiedWFH?: boolean;
  status: "Active" | "Closed";
}

export interface UploadedResumeFile {
  name: string;
  size: number;
  type: string; // "pdf" | "zip" | "jpeg" | "png" or mime type
  dataUrl: string; // Base64 data URI for viewing and downloading
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  fullName: string;
  email: string;
  phone: string;
  currentCity: string;
  totalExperience: string;
  currentCTC?: string;
  expectedCTC?: string;
  noticePeriod?: string;
  resumeUrlOrSummary: string;
  resumeFile?: UploadedResumeFile;
  coverNote?: string;
  appliedDate: string;
  status: "Submitted" | "Under Review" | "Shortlisted" | "Interview Scheduled" | "Rejected";
}

export interface PlatformStats {
  totalActiveJobs: number;
  totalApplicants: number;
  placedCandidates: number;
  partnerCompanies: number;
  wfhJobsCount: number;
  govtJobsCount: number;
  consultancyExperienceYears: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: "Job Seeker" | "Employer / Bulk Hiring" | "Govt Outsourcing" | "Overseas Placements" | "Interview Coaching";
  message: string;
  createdAt: string;
}

export interface AIJobAssistRequest {
  title: string;
  category: string;
  experienceLevel: string;
  keySkills: string;
}

export interface AIResumeMatchRequest {
  candidateProfile: string;
  experienceYears: number;
  preferredCategory?: string;
}

export interface AIResumeMatchResult {
  matchPercentage: number;
  summaryFeedback: string;
  topStrengths: string[];
  suggestedRoles: string[];
  matchedJobIds: string[];
  interviewTips: string[];
}

export type UserRole = "admin" | "job_seeker";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  token?: string;
}

export interface WebsiteSettings {
  portalName: string;
  tagline: string;
  announcementNotice: string;
  announcementEnabled: boolean;
  helplinePhone: string;
  secondaryPhone: string;
  supportEmail: string;
  officeAddress: string;
  whatsappNumber: string;
  whatsappMessage: string;
  aboutUsText?: string;
}
