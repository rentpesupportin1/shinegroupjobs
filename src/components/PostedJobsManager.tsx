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
  ChevronUp
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

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={onOpenPostJob}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post New Job (Admin)</span>
            </button>
          ) : (
            <button
              onClick={onOpenPostJob}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-200"
              title="Admin authentication required to post jobs"
            >
              <span>Admin Login to Post Jobs</span>
            </button>
          )}
        </div>
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
                <th className="px-6 py-3.5 text-right">Actions</th>
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
                        <div className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onSelectJobForDetail(job)}>
                          {job.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
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
                          
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove the posting for '${job.title}'?`)) {
                                onDeleteJob(job.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Posting"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

    </div>
  );
};
