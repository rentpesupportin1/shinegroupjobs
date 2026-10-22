import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  MapPin, 
  IndianRupee, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  Eye, 
  Clock, 
  FileText, 
  AlertCircle,
  Mail,
  Phone,
  Building,
  Laptop,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { Job, JobApplication } from '../types.js';

interface PostedJobsManagerProps {
  jobs: Job[];
  applications: JobApplication[];
  onDeleteJob: (jobId: string) => void;
  onOpenPostJob: () => void;
  onSelectJobForDetail: (job: Job) => void;
  isAdmin?: boolean;
}

export const PostedJobsManager: React.FC<PostedJobsManagerProps> = ({
  jobs,
  applications,
  onDeleteJob,
  onOpenPostJob,
  onSelectJobForDetail,
  isAdmin = false
}) => {
  const [selectedJobIdForApplicants, setSelectedJobIdForApplicants] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'wfh' | 'govt'>('all');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(j => {
    if (filterType === 'wfh') return j.workMode === 'Remote / WFH' || j.isVerifiedWFH;
    if (filterType === 'govt') return j.category === 'Govt Outsourced' || j.isGovtOutsourced;
    return true;
  });

  const getApplicantsForJob = (jobId: string) => {
    return applications.filter(a => a.jobId === jobId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
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
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                Recruiter & Posted Jobs Board
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                {jobs.length} Active Postings
              </span>
              <span className="text-[10px] font-bold text-red-600 border border-red-200 px-1.5 py-0.5 rounded bg-red-50 hidden sm:inline-block">
                ISO 9001:2015
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Review all live job opportunities, manage postings, and track real-time candidate applicants.
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPostJob}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post New Job (Admin Only)</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">
            {jobs.length}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Live across all categories</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Applications</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">
            {applications.length}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Logged in Shine recruitment system</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Job Impressions</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">
            {jobs.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Candidate views</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-8 mb-4">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Postings ({jobs.length})
        </button>
        <button
          onClick={() => setFilterType('wfh')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filterType === 'wfh' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          WFH Roles
        </button>
        <button
          onClick={() => setFilterType('govt')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filterType === 'govt' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Govt Contracts
        </button>
      </div>

      {/* Jobs Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Job Title & Company</th>
                <th className="px-6 py-3.5">Category & Mode</th>
                <th className="px-6 py-3.5">Salary Range</th>
                <th className="px-6 py-3.5">Applicants</th>
                <th className="px-6 py-3.5">Posted On</th>
                <th className="px-6 py-3.5 text-right">{isAdmin ? 'Actions (Admin Only)' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => {
                const jobApplicants = getApplicantsForJob(job.id);
                const isExpanded = selectedJobIdForApplicants === job.id;

                return (
                  <React.Fragment key={job.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Title & Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {job.imageUrl && (
                            <div 
                              onClick={() => onSelectJobForDetail(job)}
                              className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-xs cursor-pointer hover:opacity-85 transition-opacity"
                              title="Click to view poster"
                            >
                              <img 
                                src={job.imageUrl} 
                                alt={job.title} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5 flex-wrap" onClick={() => onSelectJobForDetail(job)}>
                              <span>{job.title}</span>
                              {job.imageUrl && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-0.5">
                                  <ImageIcon className="w-2.5 h-2.5" /> Photo
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-slate-700">{job.company}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {job.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Mode */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                          {job.category}
                        </span>
                        <div className="text-xs text-slate-500 mt-1">
                          {job.workMode} • {job.jobType}
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                          ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          /{job.salaryPeriod === 'per annum' ? 'annum' : 'month'}
                        </span>
                      </td>

                      {/* Applicants */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedJobIdForApplicants(isExpanded ? null : job.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{job.applicantsCount} Applicants</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>

                      {/* Posted On */}
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {job.postedDate}
                        <div className="text-[11px] text-slate-400">by {job.postedBy}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectJobForDetail(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Public Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {isAdmin && (
                            <button
                              onClick={() => setJobToDelete(job)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Posting (Admin Only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>

                    {/* Expandable Applicants Row */}
                    {isExpanded && (
                      <tr className="bg-blue-50/30">
                        <td colSpan={6} className="px-6 py-4 border-t border-b border-blue-100">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                                Applicants for "{job.title}" ({jobApplicants.length} Profiles)
                              </h4>
                              <span className="text-xs text-slate-500">
                                Recruiter Contact: {job.contactPhone}
                              </span>
                            </div>

                            {jobApplicants.length === 0 ? (
                              <p className="text-xs text-slate-500 italic py-2">
                                No candidate applications submitted yet for this opening.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {jobApplicants.map((app) => (
                                  <div key={app.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900">{app.fullName}</span>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                        {app.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {app.phone}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> {app.email}
                                      </span>
                                    </div>
                                    <div className="text-slate-600">
                                      <span className="font-medium">City:</span> {app.currentCity} • <span className="font-medium">Exp:</span> {app.totalExperience} • <span className="font-medium">Notice:</span> {app.noticePeriod}
                                    </div>
                                    {app.resumeUrlOrSummary && (
                                      <p className="text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 mt-1 line-clamp-2">
                                        {app.resumeUrlOrSummary}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safe In-App Confirmation Modal for Deleting Job Post */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Delete Job Posting?
            </h3>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Are you sure you want to remove the posting for <strong className="text-slate-900 font-semibold">{jobToDelete.title}</strong>? This job vacancy will be permanently deleted and removed from the portal.
            </p>
            <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 break-words flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span className="truncate">{jobToDelete.title} • {jobToDelete.company}</span>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = jobToDelete.id;
                  setJobToDelete(null);
                  onDeleteJob(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Vacancy</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
