import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Filter, 
  X, 
  ChevronRight, 
  Building, 
  Laptop, 
  Globe, 
  Users, 
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Search,
  RotateCcw,
  Building2,
  Phone,
  Eye
} from 'lucide-react';
import { Job } from '../types.js';

interface JobsExplorerProps {
  jobs: Job[];
  loading: boolean;
  onApplyClick: (job: Job) => void;
  onJobSelect: (job: Job) => void;
  savedJobIds: string[];
  onToggleSaveJob: (jobId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedWorkMode: string;
  setSelectedWorkMode: (wm: string) => void;
  selectedExperience: string;
  setSelectedExperience: (exp: string) => void;
  selectedJobType: string;
  setSelectedJobType: (jt: string) => void;
  sortBy: string;
  setSortBy: (sb: string) => void;
  onlyVerifiedWFH: boolean;
  setOnlyVerifiedWFH: (v: boolean) => void;
  onlyGovtOutsourced: boolean;
  setOnlyGovtOutsourced: (v: boolean) => void;
  onResetFilters: () => void;
}

export const JobsExplorer: React.FC<JobsExplorerProps> = ({
  jobs,
  loading,
  onApplyClick,
  onJobSelect,
  savedJobIds,
  onToggleSaveJob,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedWorkMode,
  setSelectedWorkMode,
  selectedExperience,
  setSelectedExperience,
  selectedJobType,
  setSelectedJobType,
  sortBy,
  setSortBy,
  onlyVerifiedWFH,
  setOnlyVerifiedWFH,
  onlyGovtOutsourced,
  setOnlyGovtOutsourced,
  onResetFilters
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Govt Outsourced", label: "Govt Outsourced", count: 42 },
    { value: "Work From Home", label: "Work From Home (WFH)", count: 78 },
    { value: "IT & Software", label: "IT & Software", count: 95 },
    { value: "Banking & Finance", label: "Banking & Finance", count: 64 },
    { value: "Healthcare", label: "Healthcare & Pharma", count: 38 },
    { value: "Overseas Placement", label: "Gulf & Overseas", count: 29 },
    { value: "Engineering", label: "Engineering & Logistics", count: 34 }
  ];

  const workModes = [
    { value: "all", label: "All Work Modes" },
    { value: "Remote / WFH", label: "Remote / 100% WFH" },
    { value: "On-site", label: "On-site Office" },
    { value: "Hybrid", label: "Hybrid (2-3 days remote)" },
    { value: "Overseas / Gulf", label: "Overseas / Gulf Countries" }
  ];

  const experienceOptions = [
    { value: "all", label: "All Experience Levels" },
    { value: "fresher", label: "Freshers (0 - 1 Yrs)" },
    { value: "1-3", label: "1 - 3 Years" },
    { value: "3-5", label: "3 - 5 Years" },
    { value: "5+", label: "5+ Years (Senior / Lead)" }
  ];

  const jobTypes = [
    { value: "all", label: "All Employment Types" },
    { value: "Full-time", label: "Permanent Full-time" },
    { value: "Government Outsourced", label: "Government Contractual" },
    { value: "Part-time", label: "Flexible Part-time" },
    { value: "Contract", label: "Project Contract" },
    { value: "Internship", label: "Paid Internship" }
  ];

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedWorkMode !== 'all',
    selectedExperience !== 'all',
    selectedJobType !== 'all',
    onlyVerifiedWFH,
    onlyGovtOutsourced,
    Boolean(searchQuery.trim())
  ].filter(Boolean).length;

  return (
    <div id="jobs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Section Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
              Live Job Openings & Vacancies
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold shadow-2xs">
              {jobs.length} Found
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real jobs verified by Shine Group placement desks. Direct interviews with zero candidate fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </button>

          {/* Sort Control */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500 hidden sm:inline font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort job openings"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="recent">Recently Added (Newest)</option>
              <option value="salary-high">Highest Salary (Max CTC)</option>
              <option value="urgent">Urgent Openings First</option>
              <option value="popular">Most Applied & Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Jobs Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* FILTERS SIDEBAR */}
        <aside className={`lg:col-span-3.5 xl:col-span-3 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs sticky top-24">
            
            {/* Sidebar Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider">
                  Filter Criteria
                </h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Special Highlight Toggles */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Priority Categories
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                onlyVerifiedWFH 
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-xs' 
                  : 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/50'
              }`}>
                <input
                  type="checkbox"
                  checked={onlyVerifiedWFH}
                  onChange={(e) => setOnlyVerifiedWFH(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Work From Home
                  </span>
                  <span className="text-[11px] text-emerald-700">₹0 fee, guaranteed genuine</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                onlyGovtOutsourced 
                  ? 'border-amber-500 bg-amber-50/70 shadow-xs' 
                  : 'border-amber-200 bg-amber-50/20 hover:bg-amber-50/50'
              }`}>
                <input
                  type="checkbox"
                  checked={onlyGovtOutsourced}
                  onChange={(e) => setOnlyGovtOutsourced(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber-600" />
                    Govt Outsourced Contracts
                  </span>
                  <span className="text-[11px] text-amber-700">MP State & public missions</span>
                </div>
              </label>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Industry Sector
              </label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.value
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Work Mode
              </label>
              <div className="space-y-1.5">
                {workModes.map((mode) => (
                  <label key={mode.value} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="workMode"
                      checked={selectedWorkMode === mode.value}
                      onChange={() => setSelectedWorkMode(mode.value)}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={selectedWorkMode === mode.value ? 'font-bold text-blue-900' : ''}>
                      {mode.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Experience Tier
              </label>
              <div className="space-y-1.5">
                {experienceOptions.map((exp) => (
                  <label key={exp.value} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer py-1">
                    <input
                      type="radio"
                      name="experience"
                      checked={selectedExperience === exp.value}
                      onChange={() => setSelectedExperience(exp.value)}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={selectedExperience === exp.value ? 'font-bold text-blue-900' : ''}>
                      {exp.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Employment Type
              </label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                aria-label="Filter by employment type"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {jobTypes.map((jt) => (
                  <option key={jt.value} value={jt.value}>
                    {jt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Placement Helpline Card */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <div className="p-3.5 rounded-xl bg-slate-900 text-white text-left space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Placement Assistance Desk
                </span>
                <p className="text-xs text-slate-300 leading-snug">
                  Need help applying or finding matching jobs in Jabalpur?
                </p>
                <a
                  href="tel:+919039881102"
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call +91 9039881102</span>
                </a>
              </div>
            </div>

          </div>
        </aside>

        {/* JOBS STREAM */}
        <main className="lg:col-span-8.5 xl:col-span-9 space-y-4">
          
          {/* Active Filter Pills */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs text-slate-500 font-semibold">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="hover:text-blue-900 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} aria-label="Clear category" className="hover:text-blue-900 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {selectedWorkMode !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  {selectedWorkMode}
                  <button onClick={() => setSelectedWorkMode('all')} aria-label="Clear work mode" className="hover:text-emerald-900 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {onlyVerifiedWFH && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                  Verified WFH
                  <button onClick={() => setOnlyVerifiedWFH(false)} aria-label="Remove WFH filter" className="hover:text-emerald-950 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {onlyGovtOutsourced && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  Govt Outsourced
                  <button onClick={() => setOnlyGovtOutsourced(false)} aria-label="Remove Govt filter" className="hover:text-amber-950 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                onClick={onResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 ml-2 underline cursor-pointer"
              >
                Clear all ({activeFiltersCount})
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-16 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                No matching jobs found
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                We couldn't find vacancies matching your active filter combination. Reset your filters or post a new requirement.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onResetFilters}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* Job Cards Stream */}
          {!loading && jobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const isWFH = job.workMode === 'Remote / WFH' || job.isVerifiedWFH;
            const isGovt = job.category === 'Govt Outsourced' || job.isGovtOutsourced;
            const isOverseas = job.workMode === 'Overseas / Gulf' || job.category === 'Overseas Placement';

            return (
              <div
                key={job.id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500/80 p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-xl relative flex flex-col justify-between"
              >
                <div>
                  
                  {/* Upper Photo / Hiring Poster (If uploaded, shown prominently above; if not, only details shown) */}
                  {job.imageUrl && (
                    <div 
                      onClick={() => onJobSelect(job)}
                      className="w-full h-48 sm:h-56 -mt-1 mb-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer shadow-xs relative group/img"
                    >
                      <img 
                        src={job.imageUrl} 
                        alt={job.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex items-end p-3.5 opacity-90 group-hover/img:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow-md">
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> Click to view full vacancy details
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Top Badges & Company Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {job.company.toLowerCase().includes('shine') ? (
                        <div className="h-10 sm:h-11 rounded-xl overflow-hidden shadow-xs border border-red-700/40 bg-[#c40011] shrink-0 p-1 flex items-center justify-center">
                          <img
                            src="/shine_group_logo.png"
                            alt="Shine Group Jobs"
                            referrerPolicy="no-referrer"
                            className="h-full w-auto object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-100 via-blue-50 to-indigo-100 text-blue-700 flex items-center justify-center font-extrabold text-base border border-blue-200/60 shadow-2xs shrink-0">
                          {job.company.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-800">
                            {job.company}
                          </span>
                          <span title="Verified Recruiter" className="text-blue-600">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-blue-600 text-white" />
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Posted {job.postedDate} • by {job.postedBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.isUrgent && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 shadow-2xs">
                          <Flame className="w-3 h-3 text-rose-500" /> Urgent
                        </span>
                      )}

                      {isGovt && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200 shadow-2xs">
                          <Building className="w-3 h-3 text-amber-600" /> Govt Outsourced
                        </span>
                      )}

                      {isWFH && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
                          <Laptop className="w-3 h-3 text-emerald-600" /> 100% WFH
                        </span>
                      )}

                      {isOverseas && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200 shadow-2xs">
                          <Globe className="w-3 h-3 text-teal-600" /> Gulf Overseas
                        </span>
                      )}

                      {/* Bookmark button */}
                      <button
                        onClick={() => onToggleSaveJob(job.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
                        title={isSaved ? "Remove bookmark" : "Save job"}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-blue-600 fill-blue-600" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Job Title */}
                  <h3 
                    onClick={() => onJobSelect(job)}
                    className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer font-display tracking-tight"
                  >
                    {job.title}
                  </h3>

                  {/* Key Highlights Bar: Salary, Location, Experience */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-slate-600">
                    
                    {/* Salary */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / {job.salaryPeriod === 'per annum' ? 'yr' : 'mo'}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {job.experienceMin === 0 ? "Freshers Welcome" : `${job.experienceMin} - ${job.experienceMax} Yrs Exp`}
                      </span>
                    </div>

                    {/* Applicants count */}
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.applicantsCount} applied</span>
                    </div>

                  </div>

                  {/* Short Description */}
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                    {job.skills.slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="text-[11px] text-slate-400 font-semibold">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>

                </div>

                {/* Bottom Actions Row */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Free Direct Interview via Shine Placement Desk</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onJobSelect(job)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onApplyClick(job)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

        </main>
      </div>

    </div>
  );
};
