import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Laptop, 
  ArrowRight,
  Flame,
  Award,
  Users
} from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string, category: string, location?: string) => void;
  onOpenAIMatcher: () => void;
  totalJobs: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOpenAIMatcher,
  totalJobs
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');

  const popularTags = [
    "Work From Home",
    "Govt Outsourced",
    "Data Entry Operator",
    "React Developer",
    "Banking Clerk",
    "Jabalpur",
    "Freshers Welcome",
    "Gulf Placements"
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, category, location);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag, 'all', 'all');
  };

  return (
    <section className="relative overflow-hidden hero-gradient-bg text-white pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      
      {/* Background radial glow accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full hero-mesh-pattern opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Brand Identity Showcase */}
        <div className="flex justify-center mb-6">
          <div className="relative group inline-flex items-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:scale-105 transition-all duration-300">
            <img
              src="/shine_group_logo.png"
              alt="Shine Group Jobs - ISO 9001:2015 Certified"
              referrerPolicy="no-referrer"
              className="h-16 sm:h-20 md:h-24 w-auto rounded-xl object-contain shadow-md"
            />
          </div>
        </div>

        {/* Floating Verified Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{totalJobs}+ Live Openings Across India & MP</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>ISO 9001:2015 Certified Agency</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% job placement guarantee</span>
          </div>
        </div>

        {/* Hero Title & Bilingual Subhead */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-tight sm:leading-[1.15]">
            Find Verified Jobs with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">Shine Group Jobs</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Madhya Pradesh's leading placement consultancy for <span className="text-emerald-300 font-semibold">100% Genuine Work From Home</span>, <span className="text-amber-300 font-semibold">Government Outsourced Staffing</span>, IT, and Corporate Careers.
          </p>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            (सीधी भर्ती • सरकारी आउटसोर्सिंग • प्रमाणित घर बैठे कार्य • जबलपुर एवं पूरे भारत में)
          </p>
        </div>

        {/* High-Impact Interactive Search Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-slate-200 text-slate-900 max-w-4xl mx-auto">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            
            {/* Search Keyword */}
            <div className="md:col-span-4 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Job title, skills (e.g. Data Entry, React, Clerk)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 sm:pl-11 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3 relative flex items-center">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by industry"
                className="w-full pl-9 pr-7 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium text-slate-800 cursor-pointer appearance-none"
              >
                <option value="all">All Industries</option>
                <option value="Govt Outsourced">Govt Outsourced</option>
                <option value="Work From Home">Work From Home (WFH)</option>
                <option value="IT & Software">IT & Software</option>
                <option value="Banking & Finance">Banking & Finance</option>
                <option value="Healthcare">Healthcare & Pharma</option>
                <option value="Overseas Placement">Overseas Placement</option>
                <option value="Engineering">Engineering & Logistics</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="md:col-span-3 relative flex items-center">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Filter by location"
                className="w-full pl-9 pr-7 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium text-slate-800 cursor-pointer appearance-none"
              >
                <option value="all">All Locations</option>
                <option value="Jabalpur">Jabalpur (Central MP)</option>
                <option value="Indore">Indore</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Remote">Work From Home (Remote)</option>
                <option value="Pan India">Pan India</option>
                <option value="Dubai">Overseas (Gulf / Dubai)</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

          </form>

          {/* Quick Trending Tags */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" /> Trending:
            </span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Live Trust Metrics Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/70 rounded-2xl p-4 text-center hover:border-slate-600 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-display">
              15,400+
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Candidates Placed
            </p>
            <span className="text-[10px] text-slate-400">Across MP & India</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/70 rounded-2xl p-4 text-center hover:border-slate-600 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              78+
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Verified WFH Roles
            </p>
            <span className="text-[10px] text-slate-400">Zero Investment</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/70 rounded-2xl p-4 text-center hover:border-slate-600 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
              42+
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Govt Outsource Posts
            </p>
            <span className="text-[10px] text-slate-400">job placement</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/70 rounded-2xl p-4 text-center hover:border-slate-600 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-display">
              20+
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Years in Jabalpur
            </p>
            <span className="text-[10px] text-slate-400">Since 2002</span>
          </div>
        </div>

        {/* Feature Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onOpenAIMatcher}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-400/40 text-purple-100 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-purple-900/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>AI Career Matcher — Find Which Jobs Suit Your Profile</span>
          </button>
        </div>

      </div>
    </section>
  );
};
