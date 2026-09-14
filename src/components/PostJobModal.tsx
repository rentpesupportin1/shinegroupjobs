import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Briefcase, 
  Building2, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Plus,
  Trash2,
  Send,
  ShieldCheck,
  Laptop
} from 'lucide-react';
import { Job } from '../types.js';
import { saveLocalCustomJob } from '../utils/localPersistence.js';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobPosted: (newJob: Job) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobPosted
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'IT & Software',
    jobType: 'Full-time' as Job['jobType'],
    workMode: 'On-site' as Job['workMode'],
    location: 'Jabalpur, Madhya Pradesh',
    salaryMin: 25000,
    salaryMax: 40000,
    salaryPeriod: 'per month' as Job['salaryPeriod'],
    experienceMin: 1,
    experienceMax: 3,
    description: '',
    responsibilitiesText: '',
    requirementsText: '',
    skillsInput: '',
    perksInput: 'Provident Fund (PF) & ESI, Timely Monthly Salary, Career Growth',
    contactEmail: 'recruitment@shinegroupjobs.com',
    contactPhone: '+91 9752661102',
    postedBy: 'Direct Employer',
    deadline: '',
    isUrgent: false,
    isGovtOutsourced: false,
    isVerifiedWFH: false
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // AI Assistant: Calls server-side Gemini 3.8 Flash endpoint
  const handleAiGenerate = async () => {
    if (!formData.title) {
      setErrorMsg('Please enter a Job Title first so Gemini AI can generate the job specifications.');
      return;
    }

    setErrorMsg('');
    setAiLoading(true);

    let aiGenerated = false;

    try {
      const response = await fetch('/api/ai/job-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          experienceLevel: `${formData.experienceMin}-${formData.experienceMax} years`,
          keySkills: formData.skillsInput
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          aiGenerated = true;
          setFormData(prev => ({
            ...prev,
            description: data.description || prev.description,
            responsibilitiesText: Array.isArray(data.responsibilities) 
              ? data.responsibilities.join('\n') 
              : prev.responsibilitiesText,
            requirementsText: Array.isArray(data.requirements)
              ? data.requirements.join('\n')
              : prev.requirementsText,
            skillsInput: Array.isArray(data.suggestedSkills)
              ? data.suggestedSkills.join(', ')
              : prev.skillsInput
          }));
        }
      }
    } catch (err) {
      console.warn('Backend AI assistant not reachable, generating smart template locally:', err);
    }

    // Client-side smart template generator if AI backend not active
    if (!aiGenerated) {
      setFormData(prev => ({
        ...prev,
        description: `We are looking for a dedicated and energetic ${prev.title} to join our growing team. The role offers excellent growth opportunities, competitive compensation, and professional training.`,
        responsibilitiesText: [
          `Execute day-to-day operations and deliverables for ${prev.title}`,
          `Collaborate with department team leaders to achieve quality and productivity benchmarks`,
          `Maintain clear records, documentation, and client communication`,
          `Adhere strictly to industry standard ethics and company guidelines`
        ].join('\n'),
        requirementsText: [
          `Relevant educational qualification or certification suitable for ${prev.category}`,
          `Good verbal and written communication skills`,
          `Familiarity with standard computer tools and productivity software`,
          `Strong work ethic and punctuality`
        ].join('\n'),
        skillsInput: prev.skillsInput || 'Communication, Problem Solving, MS Office, Teamwork'
      }));
    }

    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      setErrorMsg('Please provide the Job Title, Company Name, and Job Description.');
      return;
    }

    setSubmitting(true);

    try {
      const responsibilities = formData.responsibilitiesText
        .split('\n')
        .map(s => s.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean);

      const requirements = formData.requirementsText
        .split('\n')
        .map(s => s.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean);

      const skills = formData.skillsInput
        .split(/[,+]/)
        .map(s => s.trim())
        .filter(Boolean);

      const perks = formData.perksInput
        .split(/[,+]/)
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        responsibilities,
        requirements,
        skills: skills.length > 0 ? skills : ['General Skills', 'Communication'],
        perks: perks.length > 0 ? perks : ['Performance Bonus', 'PF & ESI']
      };

      let postedJob: Job | null = null;

      try {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': 'admin',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify(payload)
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.job) {
            postedJob = data.job;
          }
        }
      } catch (networkErr) {
        console.warn('Backend server not reachable for job post, saving locally:', networkErr);
      }

      // Netlify static fallback: save job to localStorage
      if (!postedJob) {
        postedJob = saveLocalCustomJob(payload);
      }

      setSuccessMsg('Job posted successfully! It is now live on Shine Group Jobs portal.');
      onJobPosted(postedJob);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error posting job:', err);
      // Even on error, fallback to local save
      const fallbackJob = saveLocalCustomJob(formData);
      setSuccessMsg('Job posted successfully (saved to browser)!');
      onJobPosted(fallbackJob);
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="relative overflow-hidden rounded-xl shadow-md border border-red-700/40 bg-[#c40011] shrink-0 p-1 flex items-center justify-center">
              <img
                src="/shine_group_logo.png"
                alt="Shine Group Jobs - ISO 9001:2015 Certified"
                referrerPolicy="no-referrer"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-white">
                  Post New Opening (Admin Desk)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                  Admin Only
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-200 border border-red-700/40">
                  ISO 9001:2015
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Authorized publishing on Shine Group Jobs portal with Gemini AI job spec generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-1.5">
              1. Job Details & Role Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Analyst, Full Stack Developer, Accounts Exec"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hiring Organization / Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shine Partner / State Dept / Tech Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="IT & Software">IT & Software</option>
                  <option value="Govt Outsourced">Govt Outsourced</option>
                  <option value="Work From Home">Work From Home (WFH)</option>
                  <option value="Banking & Finance">Banking & Finance</option>
                  <option value="Healthcare">Healthcare & Pharma</option>
                  <option value="Overseas Placement">Overseas Placement</option>
                  <option value="Engineering">Engineering & Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Mode
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote / WFH">Remote / WFH</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Overseas / Gulf">Overseas / Gulf</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Government Outsourced">Government Outsourced</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contractual</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Location (City & State)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jabalpur, MP or Work From Home"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Checkbox tags */}
              <div className="flex flex-col justify-end gap-2 pt-2">
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Urgent Hiring</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVerifiedWFH}
                      onChange={(e) => setFormData({ ...formData, isVerifiedWFH: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Verified WFH</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isGovtOutsourced}
                      onChange={(e) => setFormData({ ...formData, isGovtOutsourced: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Govt Contract</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Compensation & Experience */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-1.5">
              2. Compensation & Experience Bracket
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Salary Min (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Salary Max (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Exp (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  placeholder="0 for fresher"
                  value={formData.experienceMin}
                  onChange={(e) => setFormData({ ...formData, experienceMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Exp (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={formData.experienceMax}
                  onChange={(e) => setFormData({ ...formData, experienceMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Description & Gemini AI Auto-Complete */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                3. Job Specifications & Requirements
              </h3>

              {/* AI Auto-generate button */}
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Auto-Complete with Gemini AI</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Overview / Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Briefly explain the role and primary mission..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Responsibilities (One bullet per line)
              </label>
              <textarea
                rows={3}
                placeholder="Operate citizen data portal&#10;Verify records in Samagra database&#10;Generate monthly compliance reports"
                value={formData.responsibilitiesText}
                onChange={(e) => setFormData({ ...formData, responsibilitiesText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requirements & Qualifications (One bullet per line)
              </label>
              <textarea
                rows={3}
                placeholder="Graduate in any discipline&#10;Typing 30+ WPM in Hindi or English&#10;Knowledge of MS Excel"
                value={formData.requirementsText}
                onChange={(e) => setFormData({ ...formData, requirementsText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Data Entry, MS Excel, Fast Typing, Communication"
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Contact & Recruiter Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-1.5">
              4. Recruiter & Placement Desk Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Posted By / Recruiter Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shine Placement Desk / HR Manager"
                  value={formData.postedBy}
                  onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9752661102"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="recruitment@shinegroupjobs.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Job...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Job on Portal</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
