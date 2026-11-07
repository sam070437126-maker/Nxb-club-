
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Check, RefreshCw, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  User,
  AuthError,
  signOut
} from "firebase/auth";
import { auth } from "../services/firebase";

interface AuthScreenProps {
  onAuthenticated: (user: any) => void;
  initialPendingUser?: User | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, initialPendingUser = null }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState('');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const host = window.location.hostname || window.location.host || "unknown-domain";
    setCurrentDomain(host);
  }, []);

  useEffect(() => {
    if (initialPendingUser) {
        setPendingUser(initialPendingUser);
        setNeedsVerification(true);
        setEmail(initialPendingUser.email || '');
    }
  }, [initialPendingUser]);

  useEffect(() => {
    let interval: any;
    if (needsVerification && pendingUser) {
        interval = setInterval(async () => {
            try {
                await pendingUser.reload();
                if (pendingUser.emailVerified) {
                    onAuthenticated(pendingUser);
                    setNeedsVerification(false);
                }
            } catch (e) {}
        }, 3000);
    }
    return () => interval && clearInterval(interval);
  }, [needsVerification, pendingUser, onAuthenticated]);

  useEffect(() => {
      if (resendCooldown > 0) {
          const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
          return () => clearTimeout(timer);
      }
  }, [resendCooldown]);

  const mapAuthError = (err: AuthError) => {
      switch (err.code) {
          case 'auth/unauthorized-domain':
              return `CRITICAL: The domain '${currentDomain}' is not authorized in Firebase.`;
          case 'auth/network-request-failed':
              return "Network error. Check your internet connection.";
          case 'auth/email-already-in-use':
              return "Email already registered. Please login.";
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
              return "Invalid email or password.";
          default:
              return err.message || "An authentication error occurred.";
      }
  };

  const handleBackToLogin = async () => {
      await signOut(auth);
      setNeedsVerification(false);
      setPendingUser(null);
      setError(null);
      setMode('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setPendingUser(user);
        setNeedsVerification(true);
        try {
            await sendEmailVerification(user, { url: window.location.origin, handleCodeInApp: true });
            setResendCooldown(60);
        } catch (emailErr: any) {
            setError(mapAuthError(emailErr));
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.emailVerified) {
            onAuthenticated(userCredential.user);
        } else {
            setPendingUser(userCredential.user);
            setNeedsVerification(true);
            // Trigger a resend immediately if logging in unverified
            try {
                await sendEmailVerification(userCredential.user, { url: window.location.origin, handleCodeInApp: true });
            } catch (e) {} 
        }
      }
    } catch (err: any) { setError(mapAuthError(err)); }
    finally { setIsLoading(false); }
  };

  const resendVerification = async () => {
      if (!pendingUser || resendCooldown > 0) return;
      try {
          await sendEmailVerification(pendingUser, { url: window.location.origin, handleCodeInApp: true });
          setSuccessMsg("New link sent! Check your spam folder.");
          setResendCooldown(60);
          setError(null);
      } catch (e: any) { setError(mapAuthError(e)); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col md:flex-row font-sans">
      {/* Left Branding Panel */}
      <div className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center border-r border-slate-800">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950"></div>
         <div className="relative z-10 text-center px-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl mb-8 mx-auto rotate-3">
               <span className="font-black text-white text-4xl italic">N</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">NXB</h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">AI-Powered Betting Simulation Engine.</p>
         </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 bg-white dark:bg-slate-950 flex items-center justify-center p-6 md:p-12 overflow-y-auto pt-16">
         <div className="w-full max-w-md">
            {needsVerification ? (
                <div className="text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <Mail size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Verify Your Identity</h2>
                        <p className="text-slate-500 text-sm">Sent to <span className="font-bold text-slate-900 dark:text-white">{email}</span></p>
                    </div>

                    {successMsg && <div className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 p-3 rounded-xl text-xs font-bold border border-emerald-200">{successMsg}</div>}
                    {error && <div className="bg-red-100 dark:bg-red-900/20 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-200 text-left flex gap-2"><AlertCircle size={16} className="shrink-0"/>{error}</div>}

                    <div className="space-y-3">
                        <button onClick={() => pendingUser?.reload().then(() => pendingUser.emailVerified && onAuthenticated(pendingUser))} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                           <Check size={18} /> I HAVE VERIFIED
                        </button>
                        <button onClick={resendVerification} disabled={resendCooldown > 0} className="w-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-50">
                           {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                        </button>
                    </div>

                    {/* Troubleshooting Section */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <button onClick={() => setShowTroubleshoot(!showTroubleshoot)} className="w-full p-4 flex justify-between items-center text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <span className="flex items-center gap-2"><HelpCircle size={14}/> Not receiving the mail?</span>
                            {showTroubleshoot ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </button>
                        {showTroubleshoot && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 text-left text-[11px] space-y-3 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex gap-2 text-slate-600 dark:text-slate-400">
                                    <Check size={12} className="shrink-0 text-emerald-500"/>
                                    <span>Check **Spam** or **Junk** folders.</span>
                                </div>
                                <div className="flex gap-2 text-slate-600 dark:text-slate-400">
                                    <Check size={12} className="shrink-0 text-emerald-500"/>
                                    <span>Ensure **{currentDomain}** is added to Firebase Authorized Domains.</span>
                                </div>
                                <div className="flex gap-2 text-slate-600 dark:text-slate-400">
                                    <Check size={12} className="shrink-0 text-emerald-500"/>
                                    <span>In Firebase Console, go to **Authentication &gt; Settings &gt; Domains** and paste the code from the top bar.</span>
                                </div>
                                <a href="https://console.firebase.google.com/project/betplusai/authentication/settings" target="_blank" className="block text-emerald-600 font-bold hover:underline flex items-center gap-1 mt-2">
                                    Open Firebase Console <ExternalLink size={10}/>
                                </a>
                            </div>
                        )}
                    </div>
                    
                    <button onClick={handleBackToLogin} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Back to Login</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join NXB' : 'Reset Security'}
                        </h2>
                        <p className="text-slate-500 text-sm">Access the world's most advanced betting engine.</p>
                    </div>

                    {error && <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 p-4 rounded-xl text-xs font-bold flex gap-3"><AlertCircle size={16} className="shrink-0"/>{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-3.5 pl-11 pr-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="name@domain.com" required/>
                            </div>
                        </div>

                        {mode !== 'forgot' && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-3.5 pl-11 pr-11 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="••••••••" required/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Eye size={18}/></button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                        {isLoading ? <RefreshCw className="animate-spin" size={18}/> : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight size={18}/>
                    </button>

                    <div className="text-center mt-6">
                        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-slate-500 text-sm font-medium">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <span className="text-emerald-600 font-black">{mode === 'login' ? 'Sign up' : 'Login'}</span>
                        </button>
                    </div>
                </form>
            )}
         </div>
      </div>
    </div>
  );
};
