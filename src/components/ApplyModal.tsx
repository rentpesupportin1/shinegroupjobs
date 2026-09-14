import React, { useState, useRef } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  FileText,
  Phone,
  Mail,
  User,
  UploadCloud,
  FileArchive,
  Image as ImageIcon,
  Trash2,
  Paperclip,
  Check
} from 'lucide-react';
import { Job, JobApplication, User as UserType, UploadedResumeFile } from '../types.js';

interface ApplyModalProps {
  job: Job | null;
  currentUser?: UserType | null;
  onClose: () => void;
  onApplicationSuccess: (application: JobApplication) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  currentUser,
  onClose,
  onApplicationSuccess
}) => {
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    currentCity: '',
    totalExperience: 'Fresher (0-1 yr)',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: 'Immediate Joiner',
    resumeUrlOrSummary: ''
  });

  const [resumeFile, setResumeFile] = useState<UploadedResumeFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);

  React.useEffect(() => {
    if (job) {
      setSubmittedApp(null);
      setErrorMsg('');
      setFileError(null);
      setResumeFile(null);
      setFormData(prev => ({
        ...prev,
        fullName: currentUser?.name || prev.fullName || '',
        email: currentUser?.email || prev.email || '',
        phone: currentUser?.phone || prev.phone || ''
      }));
    }
  }, [job, currentUser]);

  if (!job) return null;

  const handleProcessFile = (file: File) => {
    setFileError(null);

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    // Validate extension
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const validExts = ['.pdf', '.zip', '.jpeg', '.jpg', '.png'];
    if (!validExts.includes(ext)) {
      setFileError('Unsupported file format. Please upload your resume in ZIP, PDF, JPEG, or PNG format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setResumeFile({
        name: file.name,
        size: file.size,
        type: file.type || ext.replace('.', ''),
        dataUrl
      });
      // If summary is empty, set a helpful prompt
      if (!formData.resumeUrlOrSummary) {
        setFormData(prev => ({
          ...prev,
          resumeUrlOrSummary: `Resume attached: ${file.name} (${formatFileSize(file.size)})`
        }));
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read the file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input so user can re-select same file if needed
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setFileError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Full Name, Email, and Phone Number are required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        resumeFile: resumeFile || undefined
      };

      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.application) {
        setSubmittedApp(data.application);
        onApplicationSuccess(data.application);
      } else {
        setErrorMsg(data.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setErrorMsg('Network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative overflow-hidden rounded-xl shadow-md border border-red-700/40 bg-[#c40011] shrink-0 p-1 flex items-center justify-center">
              <img
                src="/shine_group_logo.png"
                alt="Shine Group Jobs - ISO 9001:2015 Certified"
                referrerPolicy="no-referrer"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Shine Direct Candidate Application
                </span>
                <span className="text-[10px] font-bold text-red-600 border border-red-200 px-1.5 py-0.5 rounded bg-red-50">
                  ISO 9001:2015
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                Apply for {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{job.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <IndianRupee className="w-3.5 h-3.5" />
                  ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()} / mo
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {submittedApp ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-display">
              Application Successfully Submitted!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your profile for <span className="font-semibold text-slate-900">{job.title}</span> has been routed to the Shine Group placement desk.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div><span className="text-slate-500">Application Reference ID:</span> <span className="font-mono font-bold text-slate-800">{submittedApp.id}</span></div>
              <div><span className="text-slate-500">Applicant:</span> <span className="font-semibold text-slate-800">{submittedApp.fullName}</span></div>
              <div><span className="text-slate-500">Initial Status:</span> <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{submittedApp.status}</span></div>
              {submittedApp.resumeFile && (
                <div>
                  <span className="text-slate-500">Uploaded Resume:</span>{' '}
                  <span className="font-bold text-emerald-700">✓ {submittedApp.resumeFile.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Our placement coordinator will contact you via WhatsApp or phone call for the initial interview round.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Done & Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm max-h-[75vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current City / Town
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Jabalpur, Katni, Bhopal"
                    value={formData.currentCity}
                    onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Experience
                </label>
                <select
                  value={formData.totalExperience}
                  onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Fresher (0-1 yr)">Fresher (0-1 yr)</option>
                  <option value="1 - 2 Years">1 - 2 Years</option>
                  <option value="2 - 4 Years">2 - 4 Years</option>
                  <option value="4 - 7 Years">4 - 7 Years</option>
                  <option value="7+ Years">7+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Monthly Salary
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹25,000 / mo"
                  value={formData.expectedCTC}
                  onChange={(e) => setFormData({ ...formData, expectedCTC: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Period
                </label>
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Immediate Joiner">Immediate Joiner</option>
                  <option value="7 - 15 Days">7 - 15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="Currently Studying">Currently Studying</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resume Summary / Skills / Portfolio Link
              </label>
              <textarea
                rows={3}
                placeholder="Mention your key education (e.g. B.Com / BCA / 12th pass), top skills, and any Google Drive or LinkedIn profile link..."
                value={formData.resumeUrlOrSummary}
                onChange={(e) => setFormData({ ...formData, resumeUrlOrSummary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Upload Resume (ZIP, PDF, JPEG, PNG) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Upload Resume / CV <span className="text-blue-600 font-medium">(ZIP, PDF, JPEG, PNG)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Max 10 MB
                </span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip,.jpg,.jpeg,.png,application/pdf,application/zip,application/x-zip-compressed,image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
                id="resume-file-input"
              />

              {!resumeFile ? (
                /* Drag & Drop / Click to Upload Box */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                    <UploadCloud className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    <span className="text-blue-600 hover:underline">Click to browse file</span> or drag & drop here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports <strong>PDF</strong>, <strong>ZIP</strong>, <strong>JPEG</strong>, and <strong>PNG</strong> formats
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-2.5">
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold">PDF</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold">ZIP</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold">JPEG</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold">PNG</span>
                  </div>
                </div>
              ) : (
                /* File Selected Preview Card */
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail or Icon */}
                    {resumeFile.type.includes('image') ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs">
                        <img 
                          src={resumeFile.dataUrl} 
                          alt="Resume Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : resumeFile.name.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileArchive className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[200px] sm:max-w-[280px]" title={resumeFile.name}>
                          {resumeFile.name}
                        </p>
                        <span className="px-1.5 py-0.2 rounded bg-blue-200 text-blue-900 text-[10px] font-extrabold uppercase shrink-0">
                          {resumeFile.name.split('.').pop() || 'FILE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span>{formatFileSize(resumeFile.size)}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Attached
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <div className="mt-2 text-rose-600 text-xs flex items-center gap-1.5 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>100% Genuine Candidate Policy: Shine Group Jobs never charges any upfront registration fee or security deposit from applicants.</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
