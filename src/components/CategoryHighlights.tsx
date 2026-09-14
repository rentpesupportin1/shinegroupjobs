import React from 'react';
import { 
  Laptop, 
  Building, 
  Code, 
  Landmark, 
  Stethoscope, 
  Plane, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface CategoryHighlightsProps {
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
}

export const CategoryHighlights: React.FC<CategoryHighlightsProps> = ({
  onSelectCategory,
  selectedCategory = 'all'
}) => {
  const highlights = [
    {
      title: "Verified Work From Home",
      hindiTitle: "घर बैठे कार्य",
      categoryName: "Work From Home",
      count: "78+ Vacancies",
      badge: "₹0 Fee Verified",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Data entry, indexing, backend operations, customer support, and content verification. Authentic employers only with guaranteed timely monthly payouts.",
      icon: Laptop,
      iconBg: "bg-emerald-600",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-200 hover:border-emerald-500",
      roles: ["Data Entry & OCR", "Online Support", "Document Review", "Tele-calling"]
    },
    {
      title: "Government Outsourced Contracts",
      hindiTitle: "सरकारी आउटसोर्सिंग",
      categoryName: "Govt Outsourced",
      count: "42+ Active Roles",
      badge: "MP State Approved",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      description: "Official vendor staffing for MP State e-Governance, municipal corporations, public sector digital missions, and district administration offices.",
      icon: Building,
      iconBg: "bg-amber-600",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: "border-amber-200 hover:border-amber-500",
      roles: ["Samagra Portal Operator", "Municipal Clerk", "District Project Asst", "e-District Kiosk"]
    },
    {
      title: "IT, Tech & Software Development",
      hindiTitle: "सॉफ्टवेयर एवं आईटी",
      categoryName: "IT & Software",
      count: "95+ Tech Roles",
      badge: "High Growth CTC",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Full-stack web engineering, React/Node development, database administration, QA testing, and tech support for Tier 1 and startup clients.",
      icon: Code,
      iconBg: "bg-blue-600",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor: "border-blue-200 hover:border-blue-500",
      roles: ["Frontend React Dev", "Backend Node.js", "Python / ML Intern", "Technical Support"]
    },
    {
      title: "Banking, NBFC & Finance",
      hindiTitle: "बैंकिंग एवं वित्त",
      categoryName: "Banking & Finance",
      count: "64+ Openings",
      badge: "Private & PSU Banks",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      description: "Back office executive, KYC compliance, loan processing, retail banking relationship officers, and tally accounts specialists.",
      icon: Landmark,
      iconBg: "bg-indigo-600",
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      borderColor: "border-indigo-200 hover:border-indigo-500",
      roles: ["Branch Officer", "KYC Verification", "Tally Accountant", "Loan Executive"]
    },
    {
      title: "Healthcare, Nursing & Pharma",
      hindiTitle: "चिकित्सा एवं नर्सिंग",
      categoryName: "Healthcare",
      count: "38+ Openings",
      badge: "NABH Accredited",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      description: "Hospital staff nursing, clinic coordinators, lab technicians, pharma sales representatives, and patient billing specialists in MP.",
      icon: Stethoscope,
      iconBg: "bg-rose-600",
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      borderColor: "border-rose-200 hover:border-rose-500",
      roles: ["Staff Nurse (GNM/B.Sc)", "Lab Technician", "Medical Representative", "Billing Exec"]
    },
    {
      title: "Overseas Placements (Gulf & Dubai)",
      hindiTitle: "विदेश / गल्फ नौकरियां",
      categoryName: "Overseas Placement",
      count: "29+ International",
      badge: "Visa & Flight Support",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      description: "Authorized overseas manpower sourcing for hospitality, construction supervisors, MEP engineers, and retail executives in Dubai, Qatar & Saudi Arabia.",
      icon: Plane,
      iconBg: "bg-teal-600",
      gradient: "from-teal-500/10 via-teal-500/5 to-transparent",
      borderColor: "border-teal-200 hover:border-teal-500",
      roles: ["Hospitality & Hotel", "Facility Supervisor", "Store Manager", "MEP Technician"]
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Job Sectors & Verticals</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display mt-2">
            Signature Recruitment Categories
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
            Click any vertical to explore genuine vacancies verified by Shine Group's Jabalpur placement desk.
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline self-start md:self-auto cursor-pointer"
          >
            Show All Categories (Reset)
          </button>
        )}
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory.toLowerCase() === item.categoryName.toLowerCase();

          return (
            <div
              key={item.categoryName}
              onClick={() => onSelectCategory(item.categoryName)}
              className={`group relative bg-gradient-to-br ${item.gradient} bg-white rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                isSelected 
                  ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md' 
                  : item.borderColor
              }`}
            >
              <div>
                
                {/* Card Top: Icon & Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${item.iconBg} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {item.count}
                    </span>
                  </div>
                </div>

                {/* Title & Hindi Subhead */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-display">
                  {item.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                  {item.hindiTitle}
                </span>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Popular Roles Chips */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {item.roles.map((role, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded-md bg-slate-100/80 group-hover:bg-white text-slate-700 text-[11px] font-medium transition-colors border border-slate-200/50"
                    >
                      {role}
                    </span>
                  ))}
                </div>

              </div>

              {/* Bottom CTA Row */}
              <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>View {item.categoryName} Openings</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
