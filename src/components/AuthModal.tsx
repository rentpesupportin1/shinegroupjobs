import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  Shield
} from 'lucide-react';
import { User, UserRole } from '../types.js';
import { offlineAuthLogin, offlineAuthRegister, getStoredUsers } from '../utils/localPersistence.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'job_seeker'
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { name, email, password, phone, role: activeTab, adminPasscode }
      : { email, password, role: activeTab };

    let authResponse: { success: boolean; user?: User; message?: string } | null = null;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        authResponse = data;
      }
    } catch (networkErr) {
      console.warn('Backend server not reachable, switching to client auth fallback:', networkErr);
    }

    // If server was not reachable or returned 401 on login, verify with local registered storage
    if (!authResponse || (!authResponse.success && !isRegister)) {
      const localCheck = offlineAuthLogin(email, password, activeTab);
      if (localCheck.success && localCheck.user) {
        authResponse = localCheck;
        // Re-sync registered user to backend in background if missing
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: localCheck.user.name,
            email: localCheck.user.email,
            password: password,
            phone: localCheck.user.phone,
            role: localCheck.user.role
          })
        }).catch(() => {});
      } else if (!authResponse) {
        authResponse = localCheck;
      }
    } else if (!authResponse && isRegister) {
      authResponse = offlineAuthRegister(name, email, password, phone, activeTab, adminPasscode);
    }

    if (authResponse && authResponse.success && authResponse.user) {
      if (isRegister) {
        try {
          const stored = getStoredUsers();
          if (!stored.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
            const newRecord = {
              id: authResponse.user.id,
              name: authResponse.user.name,
              email: authResponse.user.email,
              password: password,
              phone: authResponse.user.phone || phone,
              role: authResponse.user.role
            };
            localStorage.setItem('shine_registered_users', JSON.stringify([...stored, newRecord]));
          }
        } catch (e) {
          console.error(e);
        }
      }

      onLoginSuccess(authResponse.user);
      onClose();
    } else {
      setError(authResponse?.message || (isRegister ? 'Registration failed. Please check your inputs.' : 'Invalid email or password. Please register first if you do not have an account.'));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 text-white relative ${
          activeTab === 'admin' 
            ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900' 
            : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600'
        }`}>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between mb-3 pr-8">
            <div className="rounded-xl overflow-hidden shadow-md border border-red-700/40 bg-[#c40011]">
              <img
                src="/shine_group_logo.png"
                alt="Shine Group Jobs - ISO 9001:2015 Certified"
                referrerPolicy="no-referrer"
                className="h-10 w-auto object-contain"
              />
            </div>

            {activeTab === 'admin' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 uppercase tracking-wider">
                <Shield className="w-3 h-3 text-amber-400" /> Admin Restricted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                <Briefcase className="w-3 h-3" /> Candidate Portal
              </span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold font-display">
            {activeTab === 'admin' 
              ? (isRegister ? 'Register Admin Staff' : 'Admin & Recruiter Login')
              : (isRegister ? 'Create Candidate Account' : 'Job Seeker Sign In')}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            {activeTab === 'admin'
              ? 'Authorized portal for posting vacancies & candidate placement control.'
              : 'Track your submitted applications and interview call updates.'}
          </p>

          {/* Role Tabs */}
          <div className="flex rounded-xl bg-black/25 p-1 mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('job_seeker');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'job_seeker'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Job Seeker</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Desk</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Dubey"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder={activeTab === 'admin' ? 'admin@shinegroupjobs.com' : 'candidate@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder={activeTab === 'admin' ? 'Enter admin password' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 9752661102"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {isRegister && activeTab === 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">
                  Admin Passcode Key *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter authorized admin passcode"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-amber-300 bg-amber-50/40 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                activeTab === 'admin'
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isRegister ? 'Complete Registration' : (activeTab === 'admin' ? 'Sign In as Admin' : 'Sign In to Account')}</span>
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              {isRegister 
                ? 'Already have an account? Sign In' 
                : "Don't have an account yet? Register Here"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
