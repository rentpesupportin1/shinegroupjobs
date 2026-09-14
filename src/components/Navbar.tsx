import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Menu, 
  X, 
  User as UserIcon,
  LogOut,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types.js';

export type TabType = 'jobs' | 'posted-jobs' | 'applications' | 'admin' | 'about';

interface NavbarProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  onOpenAIMatcher: () => void;
  totalJobsCount: number;
  savedCount: number;
  applicationsCount: number;
  currentUser: User | null;
  onOpenLogin: (initialRole?: 'admin' | 'job_seeker') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onOpenAIMatcher,
  totalJobsCount,
  applicationsCount,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: TabType) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleTabClick('jobs')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            {/* Authentic Full Logo Badge for Desktop */}
            <div className="hidden sm:block">
              <div className="relative overflow-hidden rounded-xl shadow-md border border-red-700/40 hover:shadow-lg transition-all group-hover:scale-[1.02]">
                <img
                  src="/shine_group_logo.png"
                  alt="Shine Group Jobs - ISO 9001:2015 Certified"
                  referrerPolicy="no-referrer"
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </div>
            </div>

            {/* Compact Logo Emblem for Mobile Screens */}
            <div className="sm:hidden flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-red-700/40 bg-[#c40011] shrink-0">
                <img
                  src="/shine_emblem_icon.png"
                  alt="Shine Group Jobs"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-base font-extrabold text-slate-900 font-display">Shine</span>
                  <span className="text-base font-extrabold text-emerald-600 font-display">Group</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-slate-900 text-white">Jobs</span>
                </div>
                <span className="text-[9px] font-bold text-red-600 tracking-wider">ISO 9001:2015</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean public navigation - no admin clutter) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
            <button
              onClick={() => handleTabClick('jobs')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Home
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                {totalJobsCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('posted-jobs')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'posted-jobs'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Posted Jobs Board
            </button>

            <button
              onClick={() => handleTabClick('applications')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              My Applications
              {applicationsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  {applicationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('about')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              About & Office
            </button>

            {/* ONLY if already authenticated as Admin, show return to Admin Suite */}
            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-amber-100/70 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Suite</span>
              </button>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Resume Matcher */}
            <button
              onClick={onOpenAIMatcher}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 border border-purple-200 px-2.5 sm:px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Match your skills to jobs using Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">AI Match</span>
            </button>

            {/* Auth Button Area */}
            {isAdmin ? (
              /* If Logged in as Admin: Show quick admin indicator & logout */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTabClick('admin')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-900 px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Panel</span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : currentUser ? (
              /* Logged in as Job Seeker */
              <div className="flex items-center gap-1.5 bg-slate-100 pl-3 pr-1.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-800 max-w-[110px] truncate">
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Clean public Sign In (No admin button displayed on home screen) */
              <button
                onClick={() => onOpenLogin('job_seeker')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-2 animate-in slide-in-from-top duration-150">
            {/* Mobile Menu Logo Card */}
            <div className="p-2.5 mb-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <img
                src="/shine_emblem_icon.png"
                alt="Shine Group Jobs"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover shadow-xs border border-red-700/40 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 font-display">
                  <span>Shine Group Jobs</span>
                </div>
                <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase block">
                  ISO 9001 : 2015 CERTIFIED
                </span>
              </div>
            </div>

            <button
              onClick={() => handleTabClick('jobs')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === 'jobs' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Home</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-bold">
                {totalJobsCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('posted-jobs')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === 'posted-jobs' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Posted Jobs Board</span>
            </button>

            <button
              onClick={() => handleTabClick('applications')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === 'applications' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>My Applications</span>
              {applicationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
                  {applicationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('about')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === 'about' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>About & Jabalpur Placement Office</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className="w-full text-left px-3.5 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white flex items-center justify-between"
              >
                <span>Admin Suite Panel</span>
                <span className="text-xs bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-bold">Admin</span>
              </button>
            )}

            {/* Mobile Auth action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-700">
                    Logged in as <strong>{currentUser.name}</strong>
                  </span>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenLogin('job_seeker');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center"
                >
                  Candidate Sign In
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
