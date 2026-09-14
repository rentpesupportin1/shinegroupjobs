import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  Save, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Building2,
  Clock
} from 'lucide-react';
import { Job } from '../types.js';
import { updateLocalCustomJob } from '../utils/localPersistence.js';

interface EditJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: (updatedJob: Job) => void;
}

export const EditJobModal: React.FC<EditJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdated
}) => {
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company,
        category: job.category,
        jobType: job.jobType,
        workMode: job.workMode,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryPeriod: job.salaryPeriod,
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        description: job.description,
        contactEmail: job.contactEmail,
        contactPhone: job.contactPhone,
        status: job.status,
        isUrgent: job.isUrgent,
        isGovtOutsourced: job.isGovtOutsourced,
        isVerifiedWFH: job.isVerifiedWFH
      });
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let updatedJob: Job = {
        ...job,
        ...formData
      };

      try {
        const res = await fetch(`/api/jobs/${job.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'admin',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify(formData)
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.job) {
            updatedJob = data.job;
          }
        }
      } catch (netErr) {
        console.warn('Backend server not reachable for job update, saving locally:', netErr);
      }

      updateLocalCustomJob(updatedJob);
      setSuccessMsg('Job opening updated successfully!');
      onJobUpdated(updatedJob);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      const fallbackJob: Job = { ...job, ...formData };
      updateLocalCustomJob(fallbackJob);
      setSuccessMsg('Job opening updated successfully (saved locally)!');
      onJobUpdated(fallbackJob);
      setTimeout(() => {
        onClose();
      }, 900);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                <h3 className="text-lg font-bold font-display text-white">
                  Edit Job Opening: {job.title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  Admin Edit
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-200 border border-red-700/40">
                  ISO 9001:2015
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Update vacancy requirements, salary package, status, and job description
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Company / Organization *</label>
              <input
                type="text"
                required
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Category</label>
              <select
                value={formData.category || 'IT & Software'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white cursor-pointer"
              >
                <option value="IT & Software">IT & Software</option>
                <option value="Govt Outsourced">Govt Outsourced</option>
                <option value="Work From Home">Work From Home</option>
                <option value="Banking & Finance">Banking & Finance</option>
                <option value="Healthcare">Healthcare & Nursing</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Engineering">Engineering & Core</option>
                <option value="Hospitality">Hospitality & Front Desk</option>
                <option value="Overseas Placement">Overseas Placement</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Work Mode</label>
              <select
                value={formData.workMode || 'On-site'}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white cursor-pointer"
              >
                <option value="On-site">On-site (Jabalpur / MP)</option>
                <option value="Remote / WFH">Remote / WFH</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Overseas / Gulf">Overseas / Gulf</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Status</label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white cursor-pointer font-bold"
              >
                <option value="Active">🟢 Active (Open for Applications)</option>
                <option value="Closed">⚪ Closed (Position Filled)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Salary Min (₹)</label>
              <input
                type="number"
                value={formData.salaryMin || 0}
                onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Salary Max (₹)</label>
              <input
                type="number"
                value={formData.salaryMax || 0}
                onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Job Description & Responsibilities *</label>
            <textarea
              rows={4}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isUrgent || false}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="font-semibold text-rose-700">Urgent Immediate Hiring</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isGovtOutsourced || false}
                onChange={(e) => setFormData({ ...formData, isGovtOutsourced: e.target.checked })}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold text-amber-800">Govt Outsourced Role</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isVerifiedWFH || false}
                onChange={(e) => setFormData({ ...formData, isVerifiedWFH: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-700">Verified Work From Home</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Changes...' : 'Save Job Updates'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
