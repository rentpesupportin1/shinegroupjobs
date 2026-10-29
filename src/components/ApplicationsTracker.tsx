import React, { useState } from 'react';
import { 
  FileCheck, 
  MapPin, 
  CheckCircle2, 
  Trash2,
  ShieldCheck,
  ChevronRight,
  Lock,
  LogIn,
  User as UserIcon,
  FileText,
  Award
} from 'lucide-react';
import { JobApplication, Job, User } from '../types.js';
import { CertificateGeneratorView } from './CertificateGeneratorView.js';

interface ApplicationsTrackerProps {
  applications: JobApplication[];
  savedJobs: Job[];
  jobs?: Job[];
  currentUser?: User | null;
  onOpenLogin?: (role?: 'admin' | 'job_seeker') => void;
  onSelectJob: (job: Job) => void;
  onRemoveSavedJob: (jobId: string) => void;
  onExploreClick: () => void;
  defaultSubTab?: 'applications' | 'certificates';
}

export const ApplicationsTracker: React.FC<ApplicationsTrackerProps> = ({
  applications,
  savedJobs,
  jobs = [],
  currentUser,
  onOpenLogin,
  onSelectJob,
  onRemoveSavedJob,
  onExploreClick,
  defaultSubTab = 'applications'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'certificates'>(defaultSubTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Subpage Header Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2">
            <span>Candidate Portal Desk</span>
            <span className="text-[10px] font-bold text-red-600 border border-red-200 px-1.5 py-0.5 rounded bg-red-50">
              ISO 9001:2015
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your submitted candidatures, saved vacancies, and certificate requests.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit border border-slate-200/80">
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'applications'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Submitted Candidatures</span>
            {applications.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
                {applications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('certificates')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'certificates'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Certificate Generator</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-400 text-slate-950 uppercase">
              NEW
            </span>
          </button>
        </div>
      </div>

      {/* RENDER SUBPAGE 2: Certificate Generator & Verification */}
      {activeSubTab === 'certificates' && (
        <CertificateGeneratorView
          currentUser={currentUser}
          onOpenLogin={onOpenLogin}
          onSwitchToApplicationsTab={() => setActiveSubTab('applications')}
        />
      )}

      {/* RENDER SUBPAGE 1: Applications & Saved Positions */}
      {activeSubTab === 'applications' && (
        <>
          {/* If logged out, show sign in message */}
          {!currentUser ? (
            <div className="max-w-4xl mx-auto py-4 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Candidate Verification Desk</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
                  Candidate Sign In Required
                </h3>
                <p className="text-slate-600 max-w-lg mx-auto mt-2 text-sm leading-relaxed">
                  Aap abhi logged out hain. Apne submitted job applications, coordinator review status, aur interview notifications dekhne ke liye candidate account me Sign In karein.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => onOpenLogin?.('job_seeker')}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Candidate Sign In / Register</span>
                  </button>
                  <button
                    onClick={onExploreClick}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    Browse Open Jobs
                  </button>
                </div>
              </div>

              {/* Saved Jobs for guest */}
              {savedJobs.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-lg font-bold tracking-tight text-slate-900 font-display">
                        Saved / Bookmarked Positions
                      </h4>
                      <p className="text-xs text-slate-500">
                        Positions you bookmarked on this device to review or apply for later.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {savedJobs.length} Saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {savedJobs.map((job) => (
                      <div key={job.id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-500">{job.company}</span>
                            <button
                              onClick={() => onRemoveSavedJob(job.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h5 
                            onClick={() => onSelectJob(job)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-sm mt-1 cursor-pointer line-clamp-1"
                          >
                            {job.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{job.location}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-900 mt-1">
                            ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / mo
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">{job.workMode}</span>
                          <button
                            onClick={() => onSelectJob(job)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>View & Apply</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {/* Applications Section for Logged-in Candidate */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div className="flex items-center gap-3.5">
                    <div className="relative overflow-hidden rounded-xl shadow-md border border-red-700/40 bg-[#c40011] shrink-0 p-1 flex items-center justify-center">
                      <img
                        src="/shine_group_logo.png"
                        alt="Shine Group Jobs - ISO 9001:2015 Certified"
                        referrerPolicy="no-referrer"
                        className="h-11 sm:h-12 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                          Candidate Applications Desk
                        </h3>
                        <span className="text-[10px] font-bold text-red-600 border border-red-200 px-1.5 py-0.5 rounded bg-red-50">
                          ISO 9001:2015
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <p className="text-xs sm:text-sm text-slate-500">
                          Live status of your submitted candidatures with Shine Group placement coordinators.
                        </p>
                        {currentUser && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            <UserIcon className="w-3 h-3" />
                            {currentUser.name} ({currentUser.email || currentUser.phone})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold w-fit shrink-0">
                    {applications.length} Submissions Logged
                  </span>
                </div>


        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto my-6 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No applications submitted under this account</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Browse available openings and click "Apply Now" to submit your candidature for review.
            </p>
            <button
              onClick={onExploreClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Browse Openings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400">ID: {app.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      app.status === 'Shortlisted' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'Interview Scheduled'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <h3 
                    onClick={() => {
                      const matched = jobs.find(j => j.id === app.jobId);
                      if (matched) onSelectJob(matched);
                    }}
                    className="text-base font-bold text-slate-900 mt-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {app.jobTitle}
                  </h3>
                  <div className="text-xs font-medium text-slate-600">
                    {app.company}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Applied Date:</span>
                      <span className="font-semibold text-slate-800">{app.appliedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Notice Period:</span>
                      <span className="font-semibold text-slate-800">{app.noticePeriod || "Immediate"}</span>
                    </div>
                  </div>

                  {app.coverNote && (
                    <p className="mt-2.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{app.coverNote}"
                    </p>
                  )}

                  {app.resumeFile && (
                    <div className="mt-2.5 p-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate text-[11px]">{app.resumeFile.name}</span>
                      </div>
                      <a
                        href={app.resumeFile.dataUrl}
                        download={app.resumeFile.name}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Review by Placement Desk</span>
                  </div>
                  <span className="text-[11px]">Contact: +91 9039881102</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Jobs Section */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 font-display">
              Saved / Bookmarked Positions
            </h3>
            <p className="text-xs text-slate-500">
              Vacancies you marked to review or apply for later.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {savedJobs.length} Saved
          </span>
        </div>

        {savedJobs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center italic">
            You have not bookmarked any jobs yet. Click the bookmark icon on any job card to save it here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {savedJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">{job.company}</span>
                    <button
                      onClick={() => onRemoveSavedJob(job.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 
                    onClick={() => onSelectJob(job)}
                    className="font-bold text-slate-900 hover:text-blue-600 text-sm mt-1 cursor-pointer line-clamp-1"
                  >
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">
                    ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / mo
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{job.workMode}</span>
                  <button
                    onClick={() => onSelectJob(job)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View & Apply</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

