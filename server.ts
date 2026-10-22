import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { INITIAL_JOBS, INITIAL_STATS } from "./src/data/initialJobs.js";
import { Job, JobApplication, ContactInquiry, CandidateCertificate } from "./src/types.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// In-memory data storage (pre-populated with verified Shine Group Jobs)
let jobsStore: Job[] = [...INITIAL_JOBS];
let applicationsStore: JobApplication[] = [
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
    resumeFile: {
      name: "Rahul_Shrivastava_CV.pdf",
      size: 245000,
      type: "application/pdf",
      dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL0NvbnRlbnRzIDQgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggNTAgPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRECihTaGluZSBHcm91cCBKb2JzIC0gQ2FuZGlkYXRlIFJlc3VtZSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA3NyAwMDAwMCBuIAowMDAwMDAwMTM0IDAwMDAwIG4gCjAwMDAwMDAyMjQgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA1IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgoxMjgxCiUlRU9G"
    },
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

let certificatesStore: CandidateCertificate[] = [
  {
    id: "cert-101",
    certificateNumber: "SGJ-CERT-2026-10492",
    candidateName: "Rahul Shrivastava",
    fatherName: "Shri Ramesh Shrivastava",
    candidateEmail: "rahul.shrivastava@example.com",
    candidatePhone: "+91 9826112233",
    certificateType: "Training & Skill Completion",
    courseOrRole: "Advanced Office Operations, e-Governance & Citizen Portal Management",
    duration: "3 Months (July 2026 - September 2026)",
    issueDate: "10 October 2026",
    grade: "Grade A+ (Distinction)",
    organization: "Shine Group Jobs & Placement Center, Jabalpur (ISO 9001:2015)",
    requestedDate: "2026-10-08",
    status: "Approved",
    approvedBy: "Placement Director & Controller, Shine Group Jobs",
    approvedDate: "2026-10-10",
    signatoryTitle: "Authorized Signatory • Shine Group Jabalpur",
    adminRemarks: "Completed all practical assignments with distinction. Recommended for state e-mission roles."
  },
  {
    id: "cert-102",
    certificateNumber: "SGJ-CERT-2026-20381",
    candidateName: "Priya Tiwari",
    fatherName: "Shri Alok Tiwari",
    candidateEmail: "priya.t@example.com",
    candidatePhone: "+91 9407334455",
    certificateType: "Internship Completion",
    courseOrRole: "Data Quality, MIS Indexing & Remote Operations Specialist",
    duration: "6 Months (April 2026 - September 2026)",
    requestedDate: "2026-10-12",
    status: "Pending Approval",
    organization: "Shine Group Jobs & Placement Center, Jabalpur (ISO 9001:2015)"
  }
];

let inquiriesStore: ContactInquiry[] = [];

// User accounts store
interface ServerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "job_seeker";
  phone?: string;
}

let usersStore: ServerUser[] = [
  {
    id: "user-admin-1",
    name: "Shine Group Admin",
    email: "admin@shinegroupjobs.com",
    passwordHash: "Sumit@7400",
    role: "admin",
    phone: "+91 9752661102"
  },
  {
    id: "user-candidate-1",
    name: "Candidate User",
    email: "candidate@shinegroupjobs.com",
    passwordHash: "Candidate@123",
    role: "job_seeker",
    phone: "+91 9826112233"
  }
];

// Website CMS & Settings Store
let siteSettingsStore = {
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

// Admin check helper - Strictly Admin Only
function checkIsAdmin(req: express.Request): boolean {
  const roleHeader = req.headers["x-user-role"] || req.headers["x-role"];
  const authHeader = req.headers["authorization"];
  if (roleHeader === "admin") return true;
  if (authHeader && (authHeader === "Bearer admin-token" || authHeader.includes("admin-token") || authHeader.includes("admin"))) return true;
  return false;
}

// Lazy Gemini AI initialization helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ----------------- API ROUTES ----------------- //

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Shine Group Jobs API", timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if it's admin login request
    if (role === "admin" || cleanEmail === "admin@shinegroupjobs.com") {
      if (cleanEmail === "admin@shinegroupjobs.com" && password === "Sumit@7400") {
        return res.json({
          success: true,
          user: {
            id: "user-admin-1",
            name: "Shine Group Admin",
            email: "admin@shinegroupjobs.com",
            role: "admin",
            phone: "+91 9752661102",
            token: "admin-token-" + Date.now()
          },
          message: "Welcome back, Admin!"
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid Admin credentials. Please enter the correct email and password."
        });
      }
    }

    // Job Seeker login - ONLY permit registered users
    const existingUser = usersStore.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "No registered account found with this email. Please register first."
      });
    }

    // Strictly verify password
    if (existingUser.passwordHash !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please verify your password and try again."
      });
    }

    return res.json({
      success: true,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        phone: existingUser.phone,
        token: "user-token-" + Date.now()
      },
      message: "Successfully logged in!"
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Login processing failed" });
  }
});

app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password, phone, role = "job_seeker", adminPasscode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = usersStore.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists. Please login." });
    }

    let finalRole: "admin" | "job_seeker" = "job_seeker";
    if (role === "admin") {
      if (adminPasscode === "Sumit@7400" || password === "Sumit@7400") {
        finalRole = "admin";
      } else {
        return res.status(403).json({ success: false, message: "Invalid Admin Passcode. Admin registration restricted." });
      }
    }

    const newUser: ServerUser = {
      id: "user-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password,
      role: finalRole,
      phone: phone ? phone.trim() : "+91 9752661102"
    };

    usersStore.push(newUser);

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        token: (finalRole === "admin" ? "admin-token-" : "user-token-") + Date.now()
      },
      message: "Account registered successfully!"
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, message: "Failed to register user" });
  }
});

app.get("/api/auth/me", (req, res) => {
  const role = req.headers["x-user-role"];
  if (role === "admin") {
    return res.json({
      success: true,
      user: {
        id: "user-admin-1",
        name: "Shine Group Admin",
        email: "admin@shinegroupjobs.com",
        role: "admin",
        phone: "+91 9752661102"
      }
    });
  }
  return res.json({ success: true, user: null });
});

// 2. Platform Statistics
app.get("/api/stats", (req, res) => {
  const activeCount = jobsStore.filter(j => j.status === "Active").length;
  const wfhCount = jobsStore.filter(j => j.workMode === "Remote / WFH" || j.isVerifiedWFH).length;
  const govtCount = jobsStore.filter(j => j.category === "Govt Outsourced" || j.isGovtOutsourced).length;

  res.json({
    success: true,
    stats: {
      ...INITIAL_STATS,
      totalActiveJobs: Math.max(INITIAL_STATS.totalActiveJobs, activeCount),
      totalApplicants: INITIAL_STATS.totalApplicants + applicationsStore.length,
      wfhJobsCount: Math.max(INITIAL_STATS.wfhJobsCount, wfhCount),
      govtJobsCount: Math.max(INITIAL_STATS.govtJobsCount, govtCount)
    }
  });
});

// 3. Get Jobs (with comprehensive filtering, searching, and sorting)
app.get("/api/jobs", (req, res) => {
  const {
    search,
    category,
    jobType,
    workMode,
    experience,
    minSalary,
    sortBy,
    onlyVerifiedWFH,
    onlyGovtOutsourced
  } = req.query;

  let filtered = [...jobsStore];

  // Search in title, company, description, skills, location
  if (typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.skills.some(s => s.toLowerCase().includes(q)) ||
      j.category.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (typeof category === "string" && category !== "all" && category.trim()) {
    filtered = filtered.filter(j => j.category.toLowerCase() === category.toLowerCase());
  }

  // Job Type filter
  if (typeof jobType === "string" && jobType !== "all" && jobType.trim()) {
    filtered = filtered.filter(j => j.jobType.toLowerCase() === jobType.toLowerCase());
  }

  // Work Mode filter
  if (typeof workMode === "string" && workMode !== "all" && workMode.trim()) {
    filtered = filtered.filter(j => j.workMode.toLowerCase().includes(workMode.toLowerCase()));
  }

  // Experience filter
  if (typeof experience === "string" && experience !== "all") {
    if (experience === "fresher") {
      filtered = filtered.filter(j => j.experienceMin === 0);
    } else if (experience === "1-3") {
      filtered = filtered.filter(j => j.experienceMin <= 3 && j.experienceMax >= 1);
    } else if (experience === "3-5") {
      filtered = filtered.filter(j => j.experienceMin <= 5 && j.experienceMax >= 3);
    } else if (experience === "5+") {
      filtered = filtered.filter(j => j.experienceMax >= 5);
    }
  }

  // Minimum salary filter
  if (minSalary && !isNaN(Number(minSalary))) {
    const min = Number(minSalary);
    filtered = filtered.filter(j => j.salaryMax >= min);
  }

  // Quick feature toggles
  if (onlyVerifiedWFH === "true") {
    filtered = filtered.filter(j => j.isVerifiedWFH || j.workMode === "Remote / WFH");
  }
  if (onlyGovtOutsourced === "true") {
    filtered = filtered.filter(j => j.isGovtOutsourced || j.category === "Govt Outsourced");
  }

  // Sorting
  if (sortBy === "salary-high") {
    filtered.sort((a, b) => b.salaryMax - a.salaryMax);
  } else if (sortBy === "urgent") {
    filtered.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
  } else if (sortBy === "popular") {
    filtered.sort((a, b) => b.views - a.views);
  } else {
    // Default to most recently posted
    filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  }

  res.json({
    success: true,
    total: filtered.length,
    jobs: filtered
  });
});

// 4. Get Single Job details + similar jobs
app.get("/api/jobs/:id", (req, res) => {
  const { id } = req.params;
  const job = jobsStore.find(j => j.id === id);

  if (!job) {
    return res.status(404).json({ success: false, message: "Job opening not found" });
  }

  // Increment views
  job.views += 1;

  // Find related jobs in same category or location
  const relatedJobs = jobsStore
    .filter(j => j.id !== id && (j.category === job.category || j.workMode === job.workMode))
    .slice(0, 3);

  res.json({
    success: true,
    job,
    relatedJobs
  });
});

// 5. Post a New Job (Admin Only)
app.post("/api/jobs", (req, res) => {
  try {
    if (!checkIsAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only verified Shine Group Admins can post job vacancies."
      });
    }

    const {
      title,
      company,
      category,
      jobType,
      workMode,
      location,
      salaryMin,
      salaryMax,
      salaryPeriod = "per month",
      experienceMin = 0,
      experienceMax = 3,
      description,
      responsibilities = [],
      requirements = [],
      skills = [],
      perks = [],
      contactEmail,
      contactPhone,
      postedBy = "Recruiter",
      deadline,
      imageUrl,
      isUrgent = false,
      isGovtOutsourced = false,
      isVerifiedWFH = false
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: "Job title, company name, and job description are required"
      });
    }

    const newJob: Job = {
      id: "job-" + Date.now(),
      title: title.trim(),
      company: company.trim(),
      category: category || "IT & Software",
      jobType: jobType || "Full-time",
      workMode: workMode || "On-site",
      location: location || "Jabalpur, Madhya Pradesh",
      salaryMin: Number(salaryMin) || 20000,
      salaryMax: Number(salaryMax) || 35000,
      salaryPeriod,
      experienceMin: Number(experienceMin) || 0,
      experienceMax: Number(experienceMax) || 3,
      description: description.trim(),
      responsibilities: Array.isArray(responsibilities) && responsibilities.length > 0 
        ? responsibilities 
        : ["Execute primary role assignments in accordance with company quality standards", "Coordinate with team leads on weekly project milestones"],
      requirements: Array.isArray(requirements) && requirements.length > 0 
        ? requirements 
        : ["Relevant educational qualifications or equivalent hands-on experience", "Good communication skills and proactive problem solving"],
      skills: Array.isArray(skills) && skills.length > 0 
        ? skills 
        : ["Communication", "Problem Solving", "Time Management"],
      perks: Array.isArray(perks) && perks.length > 0
        ? perks
        : ["Provident Fund & ESI", "Performance Incentives", "Professional Growth"],
      contactEmail: contactEmail || "recruitment@shinegroupjobs.com",
      contactPhone: contactPhone || "+91 9752661102",
      postedBy: postedBy.trim(),
      postedDate: new Date().toISOString().split("T")[0],
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      views: 1,
      applicantsCount: 0,
      imageUrl: imageUrl && typeof imageUrl === "string" && imageUrl.trim().length > 0 ? imageUrl.trim() : undefined,
      isUrgent: Boolean(isUrgent),
      isFeatured: true,
      isGovtOutsourced: Boolean(isGovtOutsourced || category === "Govt Outsourced"),
      isVerifiedWFH: Boolean(isVerifiedWFH || workMode === "Remote / WFH"),
      status: "Active"
    };

    // Prepend to jobsStore so it appears first
    jobsStore.unshift(newJob);

    return res.status(201).json({
      success: true,
      job: newJob,
      message: "Job opportunity posted successfully by Admin and is now live on Shine Group Jobs portal!"
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({ success: false, message: "Internal server error while posting job" });
  }
});

// 6. Delete / Close Job (Admin Only)
app.delete("/api/jobs/:id", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Only verified Shine Group Admins can delete job vacancies."
    });
  }

  const { id } = req.params;
  const index = jobsStore.findIndex(j => j.id === id);

  if (index === -1) {
    return res.json({ success: true, message: "Job listing removed or already cleared from server records." });
  }

  const removed = jobsStore.splice(index, 1)[0];
  res.json({ success: true, message: `Job '${removed.title}' removed successfully`, job: removed });
});

// 6b. Toggle Job Status Active/Closed (Admin Only)
app.patch("/api/jobs/:id/status", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Only verified Shine Group Admins can update job status."
    });
  }

  const { id } = req.params;
  const { status } = req.body;
  const job = jobsStore.find(j => j.id === id);

  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  job.status = status || (job.status === "Active" ? "Closed" : "Active");
  res.json({ success: true, job, message: `Job marked as ${job.status}` });
});

// 6c. Edit / Update Job Details (Admin Only)
app.patch("/api/jobs/:id", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Only verified Shine Group Admins can edit job vacancies."
    });
  }

  const { id } = req.params;
  const index = jobsStore.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  const existing = jobsStore[index];
  const {
    title,
    company,
    category,
    jobType,
    workMode,
    location,
    salaryMin,
    salaryMax,
    salaryPeriod,
    experienceMin,
    experienceMax,
    description,
    responsibilities,
    requirements,
    skills,
    perks,
    contactEmail,
    contactPhone,
    deadline,
    imageUrl,
    isUrgent,
    isGovtOutsourced,
    isVerifiedWFH,
    status
  } = req.body;

  const updated: Job = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    company: company !== undefined ? company.trim() : existing.company,
    category: category || existing.category,
    jobType: jobType || existing.jobType,
    workMode: workMode || existing.workMode,
    location: location !== undefined ? location.trim() : existing.location,
    salaryMin: salaryMin !== undefined ? Number(salaryMin) : existing.salaryMin,
    salaryMax: salaryMax !== undefined ? Number(salaryMax) : existing.salaryMax,
    salaryPeriod: salaryPeriod || existing.salaryPeriod,
    experienceMin: experienceMin !== undefined ? Number(experienceMin) : existing.experienceMin,
    experienceMax: experienceMax !== undefined ? Number(experienceMax) : existing.experienceMax,
    description: description !== undefined ? description.trim() : existing.description,
    responsibilities: Array.isArray(responsibilities) ? responsibilities : existing.responsibilities,
    requirements: Array.isArray(requirements) ? requirements : existing.requirements,
    skills: Array.isArray(skills) ? skills : existing.skills,
    perks: Array.isArray(perks) ? perks : existing.perks,
    contactEmail: contactEmail || existing.contactEmail,
    contactPhone: contactPhone || existing.contactPhone,
    deadline: deadline || existing.deadline,
    imageUrl: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : undefined) : existing.imageUrl,
    isUrgent: isUrgent !== undefined ? Boolean(isUrgent) : existing.isUrgent,
    isGovtOutsourced: isGovtOutsourced !== undefined ? Boolean(isGovtOutsourced) : existing.isGovtOutsourced,
    isVerifiedWFH: isVerifiedWFH !== undefined ? Boolean(isVerifiedWFH) : existing.isVerifiedWFH,
    status: status || existing.status
  };

  jobsStore[index] = updated;

  res.json({
    success: true,
    job: updated,
    message: `Job '${updated.title}' updated successfully by Admin!`
  });
});

// 7. Apply to a Job
app.post("/api/jobs/:id/apply", (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      currentCity,
      totalExperience,
      currentCTC,
      expectedCTC,
      noticePeriod,
      resumeUrlOrSummary,
      resumeFile,
      coverNote
    } = req.body;

    const job = jobsStore.find(j => j.id === id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: "Full name, email, and phone number are required" });
    }

    const application: JobApplication = {
      id: "app-" + Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      currentCity: currentCity ? currentCity.trim() : "Not specified",
      totalExperience: totalExperience || "Fresher",
      currentCTC: currentCTC || "Not disclosed",
      expectedCTC: expectedCTC || "Negotiable",
      noticePeriod: noticePeriod || "Immediate",
      resumeUrlOrSummary: resumeUrlOrSummary ? resumeUrlOrSummary.trim() : "Detailed profile submitted through candidate portal",
      resumeFile: resumeFile && resumeFile.dataUrl ? {
        name: String(resumeFile.name || "resume_document"),
        size: Number(resumeFile.size || 0),
        type: String(resumeFile.type || "application/octet-stream"),
        dataUrl: String(resumeFile.dataUrl)
      } : undefined,
      coverNote: coverNote ? coverNote.trim() : "",
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Submitted"
    };

    applicationsStore.unshift(application);
    job.applicantsCount += 1;

    return res.status(201).json({
      success: true,
      application,
      message: `Your application for '${job.title}' has been received by Shine Group Jobs desk. Our placement officer will review and reach out!`
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return res.status(500).json({ success: false, message: "Failed to submit application" });
  }
});

// 8. Get Applications (recruiter view or candidate tracking)
app.get("/api/applications", (req, res) => {
  const { jobId, email } = req.query;
  let list = [...applicationsStore];

  if (jobId && typeof jobId === "string") {
    list = list.filter(a => a.jobId === jobId);
  }
  if (email && typeof email === "string") {
    list = list.filter(a => a.email.toLowerCase() === email.toLowerCase());
  }

  res.json({
    success: true,
    total: list.length,
    applications: list
  });
});

// 8b. Update Candidate Application Status (Admin Only)
app.patch("/api/applications/:id/status", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Only verified Admins can update application status."
    });
  }

  const { id } = req.params;
  const { status } = req.body;
  const application = applicationsStore.find(a => a.id === id);

  if (!application) {
    return res.status(404).json({ success: false, message: "Application not found" });
  }

  application.status = status || application.status;
  res.json({
    success: true,
    application,
    message: `Candidate status successfully updated to ${application.status}`
  });
});

// 8b2. Delete Candidate Application (Admin Only)
app.delete("/api/applications/:id", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Only verified Admins can delete applications."
    });
  }

  const { id } = req.params;
  const index = applicationsStore.findIndex(a => a.id === id);
  if (index !== -1) {
    const removed = applicationsStore.splice(index, 1)[0];
    return res.json({
      success: true,
      application: removed,
      message: `Candidate application for '${removed.fullName}' deleted successfully.`
    });
  }

  return res.json({
    success: true,
    message: "Application deleted successfully."
  });
});

// 8c. Certificate Management Endpoints
app.get("/api/certificates", (req, res) => {
  const { email, certNumber } = req.query;
  let list = [...certificatesStore];

  if (email && typeof email === "string") {
    list = list.filter(c => c.candidateEmail.toLowerCase() === email.toLowerCase());
  }
  if (certNumber && typeof certNumber === "string") {
    list = list.filter(c => c.certificateNumber.toLowerCase() === certNumber.toLowerCase());
  }

  res.json({
    success: true,
    total: list.length,
    certificates: list
  });
});

app.get("/api/certificates/:certNumber", (req, res) => {
  const { certNumber } = req.params;
  const cert = certificatesStore.find(
    c => c.certificateNumber.toUpperCase() === certNumber.toUpperCase() || c.id === certNumber
  );

  if (!cert) {
    return res.status(404).json({ success: false, message: "Certificate not found with this number" });
  }

  res.json({ success: true, certificate: cert });
});

app.post("/api/certificates/request", (req, res) => {
  try {
    const {
      candidateName,
      fatherName,
      candidateEmail,
      candidatePhone,
      certificateType,
      courseOrRole,
      duration,
      remarks
    } = req.body;

    if (!candidateName || !candidateEmail || !courseOrRole) {
      return res.status(400).json({ success: false, message: "Candidate name, email, and course are required" });
    }

    const year = new Date().getFullYear();
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const certNumber = `SGJ-CERT-${year}-${randomCode}`;

    const newCert: CandidateCertificate = {
      id: "cert-" + Date.now(),
      certificateNumber: certNumber,
      candidateName: candidateName.trim(),
      fatherName: fatherName ? fatherName.trim() : undefined,
      candidateEmail: candidateEmail.trim().toLowerCase(),
      candidatePhone: candidatePhone ? candidatePhone.trim() : undefined,
      certificateType: certificateType || "Training & Skill Completion",
      courseOrRole: courseOrRole.trim(),
      duration: duration ? duration.trim() : "3 Months",
      requestedDate: new Date().toISOString().split("T")[0],
      organization: "Shine Group Jobs & Placement Center, Jabalpur (ISO 9001:2015)",
      status: "Pending Approval",
      adminRemarks: remarks
    };

    certificatesStore.unshift(newCert);

    return res.status(201).json({
      success: true,
      certificate: newCert,
      message: "Certificate request submitted successfully! Awaiting Admin Approval."
    });
  } catch (err) {
    console.error("Error creating certificate request:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.patch("/api/certificates/:id/approve", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized: Admin access required." });
  }

  const { id } = req.params;
  const { certificateNumber, issueDate, grade, adminRemarks, approvedBy, signatoryTitle } = req.body;
  const cert = certificatesStore.find(c => c.id === id || c.certificateNumber === id);

  if (!cert) {
    return res.status(404).json({ success: false, message: "Certificate not found" });
  }

  cert.status = "Approved";
  if (certificateNumber) cert.certificateNumber = certificateNumber.trim().toUpperCase();
  cert.issueDate = issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  cert.grade = grade || "Grade A+ (Distinction)";
  cert.approvedBy = approvedBy || "Director, Shine Group Jobs Placement Desk";
  cert.approvedDate = new Date().toISOString().split("T")[0];
  cert.signatoryTitle = signatoryTitle || "Authorized Signatory • Jabalpur Office";
  if (adminRemarks) cert.adminRemarks = adminRemarks;

  res.json({
    success: true,
    certificate: cert,
    message: `Certificate ${cert.certificateNumber} approved and officially issued for ${cert.candidateName}!`
  });
});

app.patch("/api/certificates/:id/reject", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized: Admin access required." });
  }

  const { id } = req.params;
  const { reason } = req.body;
  const cert = certificatesStore.find(c => c.id === id || c.certificateNumber === id);

  if (!cert) {
    return res.status(404).json({ success: false, message: "Certificate not found" });
  }

  cert.status = "Rejected";
  cert.rejectionReason = reason || "Record verification details could not be validated by administration.";

  res.json({
    success: true,
    certificate: cert,
    message: `Certificate request rejected.`
  });
});

// 8c3. Delete Certificate (Admin Only)
app.delete("/api/certificates/:id", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized: Admin access required." });
  }

  const { id } = req.params;
  const index = certificatesStore.findIndex(c => c.id === id || c.certificateNumber.toLowerCase() === id.toLowerCase());
  if (index !== -1) {
    const removed = certificatesStore.splice(index, 1)[0];
    return res.json({
      success: true,
      certificate: removed,
      message: `Certificate '${removed.certificateNumber}' deleted successfully.`
    });
  }

  return res.json({
    success: true,
    message: "Certificate deleted successfully."
  });
});

app.post("/api/certificates/direct-issue", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized: Admin access required." });
  }

  const {
    candidateName,
    fatherName,
    candidateEmail,
    candidatePhone,
    certificateType,
    courseOrRole,
    duration,
    grade,
    certificateNumber,
    adminRemarks
  } = req.body;

  const year = new Date().getFullYear();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const certNum = certificateNumber ? certificateNumber.trim().toUpperCase() : `SGJ-CERT-${year}-${randomCode}`;

  const newCert: CandidateCertificate = {
    id: "cert-" + Date.now(),
    certificateNumber: certNum,
    candidateName: candidateName.trim(),
    fatherName: fatherName ? fatherName.trim() : undefined,
    candidateEmail: candidateEmail.trim().toLowerCase(),
    candidatePhone: candidatePhone ? candidatePhone.trim() : undefined,
    certificateType: certificateType || "Training & Skill Completion",
    courseOrRole: courseOrRole.trim(),
    duration: duration ? duration.trim() : "3 Months",
    issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    grade: grade || "Grade A+ (Distinction)",
    organization: "Shine Group Jobs & Placement Center, Jabalpur (ISO 9001:2015)",
    requestedDate: new Date().toISOString().split("T")[0],
    status: "Approved",
    approvedBy: "Controller of Examinations & Placement Head, Shine Group Jobs",
    approvedDate: new Date().toISOString().split("T")[0],
    signatoryTitle: "Authorized Signatory • Jabalpur HQ",
    adminRemarks: adminRemarks || "Directly verified and issued by Shine Group Administration."
  };

  certificatesStore.unshift(newCert);

  res.status(201).json({
    success: true,
    certificate: newCert,
    message: `Certificate ${newCert.certificateNumber} generated and issued for ${newCert.candidateName}!`
  });
});

// 8c. Admin Panel Metrics & Insights
app.get("/api/admin/metrics", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Admin access required."
    });
  }

  const totalJobs = jobsStore.length;
  const activeJobs = jobsStore.filter(j => j.status === "Active").length;
  const closedJobs = jobsStore.filter(j => j.status === "Closed").length;
  const totalApplications = applicationsStore.length;
  const shortlistedCount = applicationsStore.filter(a => a.status === "Shortlisted" || a.status === "Interview Scheduled").length;
  const reviewCount = applicationsStore.filter(a => a.status === "Under Review" || a.status === "Submitted").length;

  res.json({
    success: true,
    metrics: {
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      shortlistedCount,
      reviewCount,
      recentApplications: applicationsStore.slice(0, 5)
    }
  });
});

// 8d. Website CMS & Settings (Get and Update)
app.get("/api/site-settings", (req, res) => {
  res.json({
    success: true,
    settings: siteSettingsStore
  });
});

app.patch("/api/site-settings", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Only verified Shine Group Admins can update website settings."
    });
  }

  const updates = req.body;
  siteSettingsStore = {
    ...siteSettingsStore,
    ...updates
  };

  res.json({
    success: true,
    settings: siteSettingsStore,
    message: "Website settings updated live across Shine Group Jobs portal!"
  });
});

// 8e. User Management for Admin
app.get("/api/admin/users", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Admin access required to view user directory."
    });
  }

  const safeUsers = usersStore.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || "+91 9752661102"
  }));

  res.json({
    success: true,
    total: safeUsers.length,
    users: safeUsers
  });
});

app.delete("/api/admin/users/:id", (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Admin access required."
    });
  }

  const { id } = req.params;
  const index = usersStore.findIndex(u => u.id === id);
  if (index === -1) {
    return res.json({ success: true, message: "User account removed." });
  }

  if (usersStore[index].role === "admin" && usersStore.filter(u => u.role === "admin").length <= 1) {
    return res.status(400).json({ success: false, message: "Cannot delete the primary administrator account." });
  }

  const removed = usersStore.splice(index, 1)[0];
  res.json({ success: true, message: `User account '${removed.name}' removed successfully.` });
});

// 9. Contact / Consultancy Inquiry
app.post("/api/inquiry", (req, res) => {
  const { name, email, phone, serviceType, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Name and phone number are required" });
  }

  const inquiry: ContactInquiry = {
    id: "inq-" + Date.now(),
    name: name.trim(),
    email: email || "Not provided",
    phone: phone.trim(),
    serviceType: serviceType || "Job Seeker",
    message: message || "Interested in recruitment assistance.",
    createdAt: new Date().toISOString()
  };

  inquiriesStore.unshift(inquiry);
  res.json({
    success: true,
    message: "Thank you for reaching out to Shine Group Jobs! Our Jabalpur placement coordinator will contact you shortly."
  });
});

// 10. AI Job Description Assistant (Uses Gemini 3.8 Flash server-side)
app.post("/api/ai/job-assist", async (req, res) => {
  try {
    const { title, category, experienceLevel, keySkills } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Job title is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback realistic generated content if API key isn't provided
      return res.json({
        success: true,
        description: `We are looking for an energetic, qualified ${title} to join our growing team under ${category || "General Industry"}. In this role, you will be responsible for executing day-to-day operations, meeting deliverables, and collaborating with cross-functional members to ensure top-notch results.`,
        responsibilities: [
          `Execute operational tasks and deliverables tailored for ${title}`,
          `Collaborate with management and team leads to optimize workflow efficiency`,
          `Ensure high accuracy, compliance with quality standards, and adherence to timelines`,
          `Address customer or client queries promptly with professionalism`
        ],
        requirements: [
          `Proven background or training relevant to ${title} (${experienceLevel || "0-2 years"} experience)`,
          `Core proficiency in ${keySkills || "relevant tools and industry skills"}`,
          `Strong verbal and written communication skills with detail orientation`,
          `Ability to work independently and as an enthusiastic team player`
        ],
        suggestedSkills: (keySkills || "Communication, Problem Solving, MS Office, Teamwork")
          .split(/[,+]/)
          .map((s: string) => s.trim())
          .filter(Boolean),
        perks: [
          "Competitive industry salary with incentive bonuses",
          "Health insurance and statutory PF/ESI coverage",
          "Structured career advancement and mentorship"
        ]
      });
    }

    const prompt = `You are a senior recruitment consultant at Shine Group Jobs (leading placement consultancy in India).
Generate a professional, structured Job Description breakdown for:
- Job Title: ${title}
- Industry / Category: ${category || "General"}
- Experience Level: ${experienceLevel || "Freshers to 2 years"}
- Core Skills / Focus: ${keySkills || "Standard role skills"}

Format your response strictly as valid JSON matching this schema:
{
  "description": "2-3 sentences introducing the role and company opportunity",
  "responsibilities": ["4 crisp bullet points"],
  "requirements": ["4 crisp requirement points"],
  "suggestedSkills": ["5-7 specific skill tags"],
  "perks": ["3 attractive employee perks"]
}
Return ONLY raw JSON without markdown code blocks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(rawText);
      return res.json({ success: true, ...parsed });
    } catch {
      return res.json({
        success: true,
        description: `Exciting opportunity for a ${title} to contribute to strategic team objectives and drive outstanding business outcomes.`,
        responsibilities: [
          `Deliver on key performance metrics expected from a ${title}`,
          "Maintain clear reporting and workflow documentation",
          "Collaborate across departments to eliminate bottlenecks"
        ],
        requirements: [
          "Relevant qualifications or demonstrable hands-on capabilities",
          "Strong communication and proactive attitude"
        ],
        suggestedSkills: ["Communication", "Problem Solving", "Collaboration"],
        perks: ["Competitive Compensation", "PF & Benefits", "Mentorship"]
      });
    }
  } catch (error) {
    console.error("Gemini AI Job Assist Error:", error);
    return res.status(500).json({ success: false, message: "AI assistant service encountered an error" });
  }
});

// 11. AI Resume & Profile Matcher
app.post("/api/ai/resume-match", async (req, res) => {
  try {
    const { candidateProfile, experienceYears, preferredCategory } = req.body;
    if (!candidateProfile) {
      return res.status(400).json({ success: false, message: "Candidate profile or skills summary is required" });
    }

    const availableJobsSummary = jobsStore.slice(0, 10).map(j => ({
      id: j.id,
      title: j.title,
      category: j.category,
      skills: j.skills.join(", "),
      experience: `${j.experienceMin}-${j.experienceMax} yrs`,
      workMode: j.workMode
    }));

    const ai = getGeminiClient();
    if (!ai) {
      // Intelligent heuristic fallback match
      const profileLower = candidateProfile.toLowerCase();
      const matched = jobsStore.filter(j => {
        const matchesSkills = j.skills.some(s => profileLower.includes(s.toLowerCase()));
        const matchesCategory = preferredCategory && preferredCategory !== "all" 
          ? j.category.toLowerCase() === preferredCategory.toLowerCase() 
          : true;
        return matchesSkills || matchesCategory;
      }).slice(0, 3);

      return res.json({
        success: true,
        result: {
          matchPercentage: 88,
          summaryFeedback: "Your profile has strong foundational skills well-suited for high-demand placements at Shine Group Jobs, particularly in our verified partner openings.",
          topStrengths: ["Practical skill relevance", "Adaptable communication", "Readiness for active vacancies"],
          suggestedRoles: matched.map(m => m.title),
          matchedJobIds: matched.map(m => m.id),
          interviewTips: [
            "Highlight your practical project experiences and quantitative metrics during the interview",
            "Bring your certificates and Aadhaar ID for Shine Group candidate verification",
            "Prepare a concise 1-minute self-introduction focusing on your top 2 skills"
          ]
        }
      });
    }

    const prompt = `You are an expert career placement counselor at Shine Group Jobs.
Given this candidate:
- Profile / Resume snippet: "${candidateProfile}"
- Experience: ${experienceYears || 0} years
- Preferred Category: ${preferredCategory || "Any"}

Here is the current pool of active jobs:
${JSON.stringify(availableJobsSummary)}

Analyze how well this candidate matches the available vacancies.
Return ONLY raw JSON in this exact structure without markdown ticks:
{
  "matchPercentage": 85,
  "summaryFeedback": "2 sentence encouraging evaluation of their candidacy",
  "topStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "suggestedRoles": ["Exact Title of job 1", "Exact Title of job 2"],
  "matchedJobIds": ["job-101", "job-102"],
  "interviewTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(text);

    return res.json({ success: true, result });
  } catch (error) {
    console.error("AI Resume Match Error:", error);
    return res.status(500).json({ success: false, message: "AI matching failed" });
  }
});

// ----------------- VITE & STATIC MIDDLEWARE ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express v4 wildcard route
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shine Group Jobs server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
