import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Printer, 
  Send, 
  Info, 
  Building2, 
  User as UserIcon,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react';
import { CandidateCertificate, CertificateType, User } from '../types.js';
import { 
  getStoredCertificates, 
  saveCertificateRequest, 
  findCertificateByNumber 
} from '../utils/localPersistence.js';
import { CertificateModal } from './CertificateModal.js';

interface CertificateGeneratorViewProps {
  currentUser: User | null;
  onOpenLogin: (role?: 'admin' | 'job_seeker') => void;
  onSwitchToApplicationsTab?: () => void;
}

export const CertificateGeneratorView: React.FC<CertificateGeneratorViewProps> = ({
  currentUser,
  onOpenLogin,
  onSwitchToApplicationsTab
}) => {
  const [certificates, setCertificates] = useState<CandidateCertificate[]>(() => getStoredCertificates());
  const [selectedCertForModal, setSelectedCertForModal] = useState<CandidateCertificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: currentUser?.name || '',
    fatherName: '',
    candidateEmail: currentUser?.email || '',
    candidatePhone: currentUser?.phone || '',
    certificateType: 'Training & Skill Completion' as CertificateType,
    courseOrRole: 'Advanced Office Operations & Data Management',
    duration: '3 Months (June 2026 - August 2026)',
    remarks: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<CandidateCertificate | null>(null);

  // Search by Unique Certificate Number State
  const [searchNumber, setSearchNumber] = useState('');
  const [searchResult, setSearchResult] = useState<CandidateCertificate | null | 'not_found'>(null);

  // Filter certificates for current user
  const userCertificates = React.useMemo(() => {
    if (!currentUser) {
      // If not logged in, show sample or public certificates
      return certificates;
    }
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userPhone = (currentUser.phone || '').trim();

    return certificates.filter(c => {
      const cEmail = (c.candidateEmail || '').toLowerCase().trim();
      const cPhone = (c.candidatePhone || '').trim();
      return (userEmail && cEmail === userEmail) || (userPhone && cPhone === userPhone);
    });
  }, [certificates, currentUser]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName.trim() || !formData.candidateEmail.trim() || !formData.courseOrRole.trim()) {
      alert('Please fill candidate name, email, and course/role.');
      return;
    }

    setSubmitting(true);

    try {
      // Netlify / local storage first for resilience
      const newCert = saveCertificateRequest({
        candidateName: formData.candidateName,
        fatherName: formData.fatherName,
        candidateEmail: formData.candidateEmail,
        candidatePhone: formData.candidatePhone,
        certificateType: formData.certificateType,
        courseOrRole: formData.courseOrRole,
        duration: formData.duration,
        remarks: formData.remarks
      });

      // Try sending to server if online
      try {
        await fetch('/api/certificates/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCert)
        });
      } catch (err) {
        console.warn('Backend server not reachable, saved certificate request locally:', err);
      }

      setCertificates(getStoredCertificates());
      setSubmissionSuccess(newCert);
      setShowRequestForm(false);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        fatherName: '',
        remarks: ''
      }));
    } catch (err) {
      console.error('Error submitting certificate request:', err);
      alert('Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNumber.trim()) return;

    const found = findCertificateByNumber(searchNumber.trim());
    if (found) {
      setSearchResult(found);
    } else {
      setSearchResult('not_found');
    }
  };

  const openCertificate = (cert: CandidateCertificate) => {
    setSelectedCertForModal(cert);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Banner for Certificate Desk */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>ISO 9001:2015 Accredited Certification Desk</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              Certificate Generator & Verification
            </h2>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Generate authentic training, internship, and experience verification certificates. Every certificate is issued with a <strong className="text-amber-300 font-semibold">Unique Certificate Number</strong>, ISO 9001:2015 seal, and requires <strong className="text-white font-semibold">Shine Group Admin Approval</strong> before final issuance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => {
                setShowRequestForm(true);
                setSubmissionSuccess(null);
                const el = document.getElementById('cert-form-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Request New Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner after submitting request */}
      {submissionSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm text-slate-900 animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 grow">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold text-emerald-950 text-base">
                  Certificate Request Submitted Successfully!
                </h4>
                <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md border border-emerald-300">
                  Ref No: {submissionSuccess.certificateNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Aapka certificate request generate ho gaya hai. Status abhi <strong className="font-bold text-amber-700 bg-amber-50 px-1 rounded">Pending Admin Approval</strong> hai. Shine Group Jabalpur Admin team aapke records verify karegi aur approve karegi. Approval hote hi certificate ready ho jayega aur aap yahan se print/download kar payenge!
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => openCertificate(submissionSuccess)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Preview Certificate Draft</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSubmissionSuccess(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Number Verification & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span>Find & Verify Certificate by Unique Number</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Har certificate ka ek unique number hota hai (e.g. <span className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">SGJ-CERT-2026-10492</span>). Yahan number daalkar koi bhi certificate find aur verify kar sakta hai.
          </p>

          <form onSubmit={handleSearchCertificate} className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative grow">
              <input
                type="text"
                value={searchNumber}
                onChange={(e) => {
                  setSearchNumber(e.target.value);
                  setSearchResult(null);
                }}
                placeholder="e.g. SGJ-CERT-2026-10492"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0"
            >
              Verify & Find
            </button>
          </form>
        </div>

        {/* Search Result Display */}
        {searchResult && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {searchResult === 'not_found' ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>No certificate found with number "{searchNumber}". Please check the spelling or format (SGJ-CERT-2026-XXXXX).</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {searchResult.certificateNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      searchResult.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : searchResult.status === 'Pending Approval'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {searchResult.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{searchResult.candidateName}</h4>
                  <p className="text-xs text-slate-600">
                    {searchResult.certificateType} • <span className="font-semibold">{searchResult.courseOrRole}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Duration: {searchResult.duration} {searchResult.grade ? `• Grade: ${searchResult.grade}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openCertificate(searchResult)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>View & Download Certificate</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Certificate Form Modal / Expandable Card */}
      {showRequestForm && (
        <div id="cert-form-anchor" className="bg-white rounded-2xl border-2 border-amber-300 p-6 sm:p-8 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                <Award className="w-3.5 h-3.5" />
                <span>Step 1 of 2: Candidate Submission</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">
                Request Certificate Generation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Form submit karne ke baad ye request Shine Group Admin ke paas approval ke liye jayegi. Admin approve karega tab certificate ready hoga.
              </p>
            </div>
            <button
              onClick={() => setShowRequestForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold p-1.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRequestSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Candidate Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Candidate Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="candidateName"
                    required
                    value={formData.candidateName}
                    onChange={handleFormChange}
                    placeholder="e.g. Rahul Shrivastava"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Father / Guardian Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Father's / Guardian's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleFormChange}
                  placeholder="e.g. Shri Ramesh Shrivastava"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Candidate Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="candidateEmail"
                    required
                    value={formData.candidateEmail}
                    onChange={handleFormChange}
                    placeholder="candidate@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="candidatePhone"
                    value={formData.candidatePhone}
                    onChange={handleFormChange}
                    placeholder="+91 9039881102"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Certificate Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate Category / Type *
                </label>
                <select
                  name="certificateType"
                  value={formData.certificateType}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Training & Skill Completion">Training & Skill Completion Certificate</option>
                  <option value="Internship Completion">Internship Completion Certificate</option>
                  <option value="Job Placement & Experience Verification">Job Placement & Experience Verification</option>
                  <option value="Job Offer & Appointment Verification">Job Offer & Appointment Verification</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration / Period *
                </label>
                <input
                  type="text"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleFormChange}
                  placeholder="e.g. 3 Months (June 2026 - August 2026)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* Course or Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course / Training / Role Title *
              </label>
              <input
                type="text"
                name="courseOrRole"
                required
                value={formData.courseOrRole}
                onChange={handleFormChange}
                placeholder="e.g. Advanced Office Operations, e-Governance & Mangal Typing"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Yahi role title aapke certificate par prominently print hoga.
              </p>
            </div>

            {/* Remarks / Additional Info */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Candidate Purpose / Remarks for Admin
              </label>
              <textarea
                name="remarks"
                rows={2}
                value={formData.remarks}
                onChange={handleFormChange}
                placeholder="e.g. Completed training under outsourced partner. Need certificate for government kiosk submission."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> Request submit karne par certificate ko ek Unique Certificate Number mil jayega aur ye request Admin panel mein verify hone ke liye chali jayegi. Admin ke approval ke bina watermark rahega.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Request...' : 'Submit for Admin Approval'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certificates Tracker List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Certificates Status & Records</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of certificate requests. Approved certificates can be viewed, downloaded, or printed anytime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {userCertificates.length} Certificates Logged
            </span>
          </div>
        </div>

        {userCertificates.length === 0 ? (
          <div className="py-12 text-center max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Certificates Found Yet</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Aapne abhi tak koi certificate request nahi bheja hai. "Request New Certificate" button par click karke naya certificate generate karne ke liye request bhej sakte hain.
            </p>
            <button
              onClick={() => {
                setShowRequestForm(true);
                const el = document.getElementById('cert-form-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Request Certificate Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {userCertificates.map((cert) => {
              const isApproved = cert.status === 'Approved';
              const isPending = cert.status === 'Pending Approval';
              const isRejected = cert.status === 'Rejected';

              return (
                <div 
                  key={cert.id}
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-all shadow-xs ${
                    isApproved 
                      ? 'bg-gradient-to-br from-white to-amber-50/30 border-amber-200/80 hover:border-amber-400' 
                      : isPending
                      ? 'bg-gradient-to-br from-white to-amber-50/20 border-slate-200'
                      : 'bg-white border-rose-200'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Top Row: Unique Cert No & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {cert.certificateNumber}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved & Issued</span>
                          </>
                        ) : isPending ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Admin Approval</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejected</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Candidate & Role Info */}
                    <div>
                      <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                        {cert.certificateType}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {cert.courseOrRole}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Candidate: <strong className="text-slate-900">{cert.candidateName}</strong>
                        {cert.fatherName && ` (S/D of ${cert.fatherName})`}
                      </p>
                    </div>

                    {/* Metadata details */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Duration:</span>
                        <span className="font-medium text-slate-800">{cert.duration}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">
                          {isApproved ? 'Issued Date:' : 'Requested Date:'}
                        </span>
                        <span className="font-medium text-slate-800">
                          {cert.issueDate || cert.requestedDate}
                        </span>
                      </div>
                    </div>

                    {/* Grade if approved */}
                    {cert.grade && (
                      <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Performance: {cert.grade}</span>
                      </div>
                    )}

                    {/* Rejection notice if rejected */}
                    {isRejected && cert.rejectionReason && (
                      <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <strong>Reason:</strong> {cert.rejectionReason}
                      </div>
                    )}

                    {/* Pending alert explanation */}
                    {isPending && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200 leading-tight">
                        ⏳ <strong>Awaiting Admin Review:</strong> Shine Group Jabalpur Administration is verifying candidate records.
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {cert.id}
                    </span>

                    <button
                      onClick={() => openCertificate(cert)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isApproved
                          ? 'bg-slate-900 hover:bg-slate-800 text-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isApproved ? 'View & Download Certificate' : 'Preview Certificate Draft'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal for High-Resolution View & Print */}
      <CertificateModal
        certificate={selectedCertForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};
