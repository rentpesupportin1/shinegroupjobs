import React, { useState, useEffect } from 'react';
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
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  setDoc, 
  doc,
  isAuthorizedAdminEmail,
  formatFirebaseAuthError,
  handleFirestoreError,
  OperationType
} from '../firebase.js';

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialRole);
      setError(null);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;
      const cleanEmail = (gUser.email || '').toLowerCase().trim();
      const isAllowedAdmin = isAuthorizedAdminEmail(cleanEmail) && gUser.emailVerified;

      if (activeTab === 'admin' && !isAllowedAdmin) {
        await signOut(auth).catch(() => {});
        setError(`Account "${cleanEmail}" is not authorized for Admin Desk. Please sign in with shinegroup565@gmail.com.`);
        setGoogleLoading(false);
        return;
      }

      const finalRole: UserRole = isAllowedAdmin ? 'admin' : 'job_seeker';

      const userData: User = {
        id: gUser.uid,
        name: gUser.displayName || (finalRole === 'admin' ? 'Shine Group Admin' : 'Job Seeker'),
        email: cleanEmail,
        role: finalRole,
        phone: gUser.phoneNumber || phone || '+91 9039881102',
        token: await gUser.getIdToken()
      };

      // Realtime Cloud Firestore persistence (works on Netlify)
      try {
        await setDoc(doc(db, 'users', gUser.uid), {
          id: userData.id,
          name: userData.name.slice(0, 120),
          email: userData.email.slice(0, 160),
          role: userData.role,
          phone: (userData.phone || '+91 9039881102').slice(0, 30),
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      } catch (fsErr) {
        try {
          handleFirestoreError(fsErr, OperationType.WRITE, `users/${gUser.uid}`);
        } catch (loggedErr) {
          console.warn('Firestore user profile sync notice:', loggedErr);
        }
      }

      // Also store locally for offline backup
      try {
        const stored = getStoredUsers();
        if (!stored.some(u => u.email.toLowerCase() === cleanEmail)) {
          const newRecord = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            password: 'google-oauth-managed',
            phone: userData.phone,
            role: userData.role
          };
          localStorage.setItem('shine_registered_users', JSON.stringify([...stored, newRecord]));
        }
      } catch (e) {
        console.error(e);
      }

      onLoginSuccess(userData);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(formatFirebaseAuthError(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { name, email, password, phone, role: activeTab, adminPasscode }
      : { email, password, role: activeTab };

    let authResponse: { success: boolean; user?: User; message?: string } | null = null;

    // 1. Try backend server if available
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
      console.warn('Backend server not reachable (Netlify static environment):', networkErr);
    }

    // 2. Static / Offline Fallback (Note: For persistent Cloud Firestore Admin writes on Netlify, Google Sign-In is required)
    if (!authResponse || (!authResponse.success && isRegister)) {
      if (isRegister) {
        authResponse = offlineAuthRegister(name, email, password, phone, activeTab, adminPasscode);
      } else {
        authResponse = offlineAuthLogin(email, password, activeTab);
      }
    }

    if (authResponse && authResponse.success && authResponse.user) {
      if (isRegister) {
        try {
          const stored = getStoredUsers();
          if (!stored.some(u => u.email.toLowerCase() === cleanEmail)) {
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
      setError(authResponse?.message || (isRegister ? 'Registration failed. Please check your inputs.' : 'Invalid email or password. Please register first or Continue with Google.'));
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
              ? 'Admin portal for posting vacancies & candidate placement control.'
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
                    placeholder="+91 9039881102"
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
                  placeholder="Enter admin passcode"
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

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[11px] text-slate-400 font-medium">OR</span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs ${
                activeTab === 'admin'
                  ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-slate-900'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-400'
              }`}
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {activeTab === 'admin'
                      ? 'Continue with Google (Cloud Admin Sync)'
                      : 'Continue with Google'}
                  </span>
                </>
              )}
            </button>

            {activeTab === 'admin' && (
              <p className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200 rounded-xl px-3 py-2 text-center leading-relaxed">
                For permanent Netlify Cloud saving, sign in with authorized Google Admin (<strong className="font-bold">shinegroup565@gmail.com</strong>).
              </p>
            )}
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
