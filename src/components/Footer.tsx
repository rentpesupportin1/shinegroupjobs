import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Heart,
  Award
} from 'lucide-react';

interface FooterProps {
  onCategorySelect: (cat: string) => void;
  onNavigateTab: (tab: 'jobs' | 'posted-jobs' | 'applications' | 'admin' | 'about') => void;
  onOpenPostJob?: () => void;
  websiteSettings?: {
    helplinePhone?: string;
    officeAddress?: string;
    supportEmail?: string;
  };
}

export const Footer: React.FC<FooterProps> = ({
  onCategorySelect,
  onNavigateTab,
  websiteSettings
}) => {
  const helpline = websiteSettings?.helplinePhone || "+91 9752661102";
  const address = websiteSettings?.officeAddress || "2nd Floor, in front of Khalsa College, above Central Bank, Mahanadda, Jabalpur, Madhya Pradesh 482001";
  const email = websiteSettings?.supportEmail || "support@shinegroupjobs.com";
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative overflow-hidden rounded-xl shadow-lg border border-red-700/50 bg-[#c40011] hover:scale-[1.02] transition-transform">
                <img
                  src="/shine_group_logo.png"
                  alt="Shine Group Jobs - ISO 9001:2015 Certified"
                  referrerPolicy="no-referrer"
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Madhya Pradesh's trusted recruitment consultancy and authorized placement partner. Connecting verified candidates with government outsourced contracts, genuine work-from-home employers, and premier corporate enterprises.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified under ISO 9001:2015 Quality Management Standards</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 font-display">
              Popular Job Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onCategorySelect('Govt Outsourced')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Govt Outsourced Contracts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('Work From Home')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Verified Work From Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('IT & Software')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  IT & Software Development
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('Banking & Finance')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Banking & Financial Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('Healthcare')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Healthcare & Nursing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('Overseas Placement')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Gulf & Overseas Placements
                </button>
              </li>
            </ul>
          </div>

          {/* For Employers & Portals */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 font-display">
              Portals & Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('admin')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer font-semibold text-slate-300 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin & Recruiter Command Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('posted-jobs')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Browse Posted Jobs Board
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('applications')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Track Submitted Applications
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('applications')}
                  className="hover:text-amber-400 text-amber-300 font-semibold transition-colors text-left cursor-pointer flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Certificate Generator & Verification</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  Jabalpur Head Office Info
                </button>
              </li>
            </ul>
          </div>

          {/* Office Helpline */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3 font-display">
              Placement Desk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`tel:${helpline.replace(/[^0-9+]/g, '')}`} className="hover:text-white">{helpline}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  Mon-Sat: 10:00 AM - 7:00 PM
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <p>
            © {new Date().getFullYear()} Shine Group Jobs & Placement Services. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>No Upfront Candidate Fees</span>
            <span>•</span>
            <span>Genuine MP Employment Verification</span>
            <span>•</span>
            <span>Fair Opportunity Desk</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
