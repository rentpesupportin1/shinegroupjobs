import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Briefcase, 
  Building, 
  Laptop, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  ChevronRight,
  Flame,
  Calendar,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Job } from '../types.js';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onApply: (job: Job) => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  isAdmin?: boolean;
  onDeleteJob?: (jobId: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onApply,
  isSaved,
  onToggleSave,
  isAdmin = false,
  onDeleteJob
}) => {
  const [copied, setCopied] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!job) return null;

  const isWFH = job.workMode === 'Remote / WFH' || job.isVerifiedWFH;
  const isGovt = job.category === 'Govt Outsourced' || job.isGovtOutsourced;
  const isOverseas = job.workMode === 'Overseas / Gulf' || job.category === 'Overseas Placement';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-start gap-3.5">
            {job.company.toLowerCase().includes('shine') ? (
              <div className="relative overflow-hidden rounded-xl shadow-md border border-red-700/40 bg-[#c40011] shrink-0 p-1 flex items-center justify-center">
                <img
                  src="/shine_group_logo.png"
                  alt="Shine Group Jobs - ISO 9001:2015 Certified"
                  referrerPolicy="no-referrer"
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {job.company.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-700">
                  {job.company}
                </span>
                {job.isUrgent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    Urgent Hiring
                  </span>
                )}
                {isGovt && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    Govt Outsourced
                  </span>
                )}
                {isWFH && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    100% Remote WFH
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Posted {job.postedDate}
                </span>
                <span>•</span>
                <span>Job ID: {job.id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* Upper Photo / Hiring Poster Banner (Displayed only when image is provided) */}
          {job.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-950 flex items-center justify-center">
              <img
                src={job.imageUrl}
                alt={`${job.title} - ${job.company}`}
                referrerPolicy="no-referrer"
                className="w-full max-h-[440px] object-contain mx-auto"
              />
            </div>
          )}

          {/* Key Facts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Salary</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-0.5 mt-0.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500">/{job.salaryPeriod === 'per annum' ? 'annum' : 'month'}</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Experience</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                {job.experienceMin === 0 ? "Freshers (0+ yrs)" : `${job.experienceMin} - ${job.experienceMax} Yrs`}
              </span>
              <span className="text-[11px] text-slate-500">{job.jobType}</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Work Mode</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                {job.workMode}
              </span>
              <span className="text-[11px] text-slate-500">{job.category}</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Applicants</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                {job.applicantsCount} Applied
              </span>
              <span className="text-[11px] text-slate-500">{job.views} total views</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Role Overview
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Key Responsibilities
              </h4>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Candidate Requirements & Qualifications
              </h4>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Perks & Benefits */}
          {job.perks && job.perks.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Employee Benefits & Perks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs font-medium text-blue-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placement Desk & Recruiter Info */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg overflow-hidden bg-[#c40011] border border-red-700/50 shrink-0 p-0.5 flex items-center justify-center">
                  <img
                    src="/shine_group_logo.png"
                    alt="Shine Group Jobs - ISO 9001:2015 Certified"
                    referrerPolicy="no-referrer"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                  Shine Group Placement & Verification Desk
                </span>
              </div>
              <span className="text-[10px] font-bold text-red-400 border border-red-500/30 px-2 py-0.5 rounded bg-red-950/40">
                ISO 9001:2015
              </span>
            </div>
            <p className="text-xs text-slate-300">
              This opening is coordinated by <span className="font-semibold text-white">{job.postedBy}</span>. Candidate registration, initial telephone screening, and interview scheduling are managed at no extra charge to job seekers.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <a href={`tel:${job.contactPhone}`} className="flex items-center gap-1 text-emerald-400 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>{job.contactPhone}</span>
              </a>
              <a href={`mailto:${job.contactEmail}`} className="flex items-center gap-1 text-blue-300 hover:underline">
                <Mail className="w-3.5 h-3.5" />
                <span>{job.contactEmail}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(job.id)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-blue-600 fill-blue-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Job</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>

            {/* Admin Delete Action */}
            {isAdmin && onDeleteJob && (
              <>
                {!isConfirmingDelete ? (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Admin: Delete this vacancy"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Vacancy</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-xl animate-in fade-in duration-100">
                    <span className="text-[11px] font-bold text-rose-800">Confirm delete?</span>
                    <button
                      onClick={() => {
                        onDeleteJob(job.id);
                        onClose();
                      }}
                      className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onApply(job);
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Apply for this Job</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
