import React from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { WebsiteSettings } from '../types.js';

interface AboutContactSectionProps {
  websiteSettings?: WebsiteSettings;
}

export const AboutContactSection: React.FC<AboutContactSectionProps> = ({ websiteSettings }) => {
  const officeAddress = websiteSettings?.officeAddress || "2nd Floor, in front of Khalsa College, above Central Bank, Mahanadda, Jabalpur, Madhya Pradesh 482001";
  const helplinePhone = websiteSettings?.helplinePhone || "+91 9752661102";
  const supportEmail = websiteSettings?.supportEmail || "support@shinegroupjobs.com";

  const aboutParagraphs = websiteSettings?.aboutUsText
    ? websiteSettings.aboutUsText.split('\n\n').filter(Boolean)
    : [
        "Shine Group Jobs in Jabalpur is actively engaged in providing reliable placement services across multiple industries. With years of experience in the job market, we effectively match candidates with suitable job opportunities based on their skills and career goals. Our strong association with leading companies allows us to inform candidates promptly whenever new vacancies arise. We also assist candidates in getting their CVs noticed and shortlisted among a large pool of applicants, helping them stand out in today’s highly competitive job market.",
        "Our team of experienced and well-qualified professionals conducts detailed screenings to identify the true potential and strengths of each candidate. By carefully understanding the requirements of both job seekers and employers, we ensure the right match for long-term success. Through ethical practices, transparency, and consistent quality service, we have earned trust, credibility, and goodwill. Our aim is to set industry benchmarks while contributing towards a fully employed and empowered society."
      ];

  return (
    <section className="py-16 bg-slate-900 text-white px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Col: Credentials & Agency Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Reliable Placement Services • Jabalpur
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-bold">
              <span>ISO 9001:2015 Certified</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="rounded-2xl overflow-hidden border border-red-700/50 shadow-xl bg-[#c40011] shrink-0 w-fit hover:scale-105 transition-transform">
              <img
                src="/shine_group_logo.png"
                alt="Shine Group Jobs - ISO 9001:2015 Certified"
                referrerPolicy="no-referrer"
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight leading-tight">
                About Shine Group Jobs & Placement Services
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Authorized Placement Consultancy • ISO 9001:2015 Certified • Headquartered in Jabalpur
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            {aboutParagraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {idx === 0 && para.startsWith("Shine Group Jobs in Jabalpur") ? (
                  <>
                    <span className="text-white font-semibold">Shine Group Jobs in Jabalpur</span>
                    {para.slice("Shine Group Jobs in Jabalpur".length)}
                  </>
                ) : (
                  para
                )}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Candidate Fee Policy</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                We never demand upfront registration fees, security deposits, or advance payments from job seekers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Building className="w-4 h-4" />
                <span>Authorized Govt Vendor</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official staffing contractor for public sector missions, municipal corporations, and digital e-districts.
              </p>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Jabalpur Headquarters & Helpdesk
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Corporate Placement Office:</span>
                  <span className="text-slate-300 font-medium leading-snug">{officeAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Office Working Hours:</span>
                  <span className="text-slate-400">Monday - Saturday (10:00 AM - 7:00 PM)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Helpline Telephones:</span>
                  <a href="tel:+919752661102" className="text-slate-300 hover:text-white block">+91 9752661102</a>
                  <a href="tel:+919981661102" className="text-slate-300 hover:text-white block">+91 9981661102</a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Official Email Desk:</span>
                  <span className="text-slate-300 block">support@shinegroupjobs.com</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919752661102?text=Hello%20Shine%20Group%20Jobs,%20I%20would%20like%20to%20inquire%20about%20job%20vacancies"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Directly on WhatsApp (+91 9752661102)</span>
              </a>
            </div>
          </div>

        </div>

        {/* Right Col: Direct Placement Helpdesk & Verification Guidelines */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Candidate Trust & Guidelines
            </span>
            <h3 className="text-xl font-bold font-display text-slate-900 mt-1">
              Direct Placement Assistance
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              We provide direct interview scheduling and guidance for all candidate placements across Madhya Pradesh and Pan-India.
            </p>

            <div className="mt-6 space-y-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Upfront Fee Policy</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Shine Group Jobs never charges any registration fees, security deposits, or advance document fees.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Direct Recruiter Interview Support</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Interview preparation, resume formatting, and direct coordination with hiring HR teams.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Verified Remote & Govt Roles</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Every work-from-home and contractual post is vetted for legitimate company credentials.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <p className="text-xs font-semibold text-blue-900">
                Want immediate assistance with your job search?
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href="tel:+919752661102"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call +91 9752661102</span>
                </a>
                <a
                  href="https://wa.me/919752661102?text=Hello%20Shine%20Group%20Jobs,%20I%20am%20looking%20for%20a%20job%20placement"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Placement Desk</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 mt-4 text-center">
            ISO 9001:2015 Registered • Jabalpur Placement Desk • Established 2002
          </div>
        </div>

      </div>
    </section>
  );
};
