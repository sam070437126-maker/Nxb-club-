
import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Lock, Globe, AlertTriangle, CheckCircle2, ChevronRight, Fingerprint, History, Laptop, QrCode, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LoginSession, SecurityState } from '../types';

export const SecurityCenter: React.FC = () => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    twoFactorEnabled: false,
    biometricEnabled: true,
    kycLevel: 2,
    lastPasswordChange: '2023-10-15',
  });

  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Initialize with real current session
  useEffect(() => {
    const ua = navigator.userAgent;
    let deviceType = 'Unknown Device';
    if (ua.match(/mobile/i)) deviceType = 'Mobile Device';
    else if (ua.match(/iPad|Android/i)) deviceType = 'Tablet';
    else deviceType = 'Desktop PC';

    if (ua.match(/Chrome/i)) deviceType += ' (Chrome)';
    else if (ua.match(/Safari/i)) deviceType += ' (Safari)';
    else if (ua.match(/Firefox/i)) deviceType += ' (Firefox)';

    const currentSession: LoginSession = {
        id: 'current-session',
        device: deviceType,
        location: 'Unknown Location', // Requires geo-ip service, default for privacy
        ip: 'Current IP',
        lastActive: 'Active Now',
        isCurrent: true
    };
    setSessions([currentSession]);
  }, []);

  // Toggle 2FA Simulation
  const handleToggle2FA = () => {
    if (securityState.twoFactorEnabled) {
      if (window.confirm("Are you sure you want to disable 2FA? This will lower your account security.")) {
        setSecurityState(prev => ({ ...prev, twoFactorEnabled: false }));
      }
    } else {
      setShow2FASetup(true);
    }
  };

  const confirm2FA = () => {
    setShow2FASetup(false);
    setSecurityState(prev => ({ ...prev, twoFactorEnabled: true }));
  };

  const handleRevoke = (id: string) => {
      setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      setIsChangingPwd(true);
      setTimeout(() => {
          setIsChangingPwd(false);
          setPwdSuccess(true);
          setSecurityState(prev => ({ ...prev, lastPasswordChange: 'Just now' }));
          setTimeout(() => {
              setPwdSuccess(false);
              setShowPwdForm(false);
          }, 2000);
      }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="bg-blue-500/10 p-3 rounded-xl text-blue-600 dark:text-blue-500 shadow-sm border border-blue-500/20">
          <Shield size={28} />
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Security Center</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage account protection and active sessions</p>
        </div>
      </div>

      {/* Security Score Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl border border-slate-700 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="flex items-center gap-4 relative z-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-4 ${securityState.twoFactorEnabled ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-amber-500 text-amber-400 bg-amber-500/10'}`}>
               {securityState.twoFactorEnabled ? '90' : '40'}
            </div>
            <div>
               <h3 className="font-bold text-lg">Security Score: {securityState.twoFactorEnabled ? 'Excellent' : 'Weak'}</h3>
               <p className="text-xs text-slate-400 max-w-xs mt-1">
                  {securityState.twoFactorEnabled 
                    ? 'Your account is well protected.' 
                    : 'Enable 2FA to significantly improve your account security.'}
               </p>
            </div>
         </div>
      </div>

      {/* 1. Authentication */}
      <section className="mb-8">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Authentication</h3>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            
            <div className="p-5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-400">
                     <Smartphone size={20} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                     <p className="text-xs text-slate-500 mt-0.5">Google Authenticator / Authy</p>
                  </div>
               </div>
               <button 
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${securityState.twoFactorEnabled ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
               >
                  {securityState.twoFactorEnabled ? 'Disable' : 'Enable'}
               </button>
            </div>

            {/* 2FA Setup View */}
            {show2FASetup && (
               <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                  <div className="text-center mb-6">
                     <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-slate-200 mx-auto mb-4">
                        <QrCode size={120} className="text-slate-900" />
                     </div>
                     <p className="text-sm font-medium text-slate-900 dark:text-white">Scan this QR code</p>
                     <p className="text-xs text-slate-500 mb-4">Open your authenticator app and scan the code above.</p>
                     
                     <div className="flex gap-2 max-w-xs mx-auto">
                        <input type="text" placeholder="Enter 6-digit code" className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-center font-mono text-sm focus:border-emerald-500 outline-none" maxLength={6} />
                        <button onClick={confirm2FA} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-500">Verify</button>
                     </div>
                  </div>
               </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-400">
                     <Fingerprint size={20} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Biometric Login</h4>
                     <p className="text-xs text-slate-500 mt-0.5">Use FaceID / TouchID for quick access</p>
                  </div>
               </div>
               <div 
                  onClick={() => setSecurityState(prev => ({ ...prev, biometricEnabled: !prev.biometricEnabled }))}
                  className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${securityState.biometricEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
               >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${securityState.biometricEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
               </div>
            </div>

            <div onClick={() => setShowPwdForm(!showPwdForm)} className="border-t border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-400">
                     <Lock size={20} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Change Password</h4>
                     <p className="text-xs text-slate-500 mt-0.5">Last changed: {securityState.lastPasswordChange}</p>
                  </div>
               </div>
               <ChevronRight size={16} className={`text-slate-400 transition-transform ${showPwdForm ? 'rotate-90' : ''}`} />
            </div>

            {/* Password Change Form */}
            {showPwdForm && (
                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                    {pwdSuccess ? (
                        <div className="text-center text-emerald-500 font-bold flex flex-col items-center gap-2">
                            <CheckCircle2 size={32} />
                            Password Updated Successfully
                        </div>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <input type="password" placeholder="Current Password" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm" required />
                            <input type="password" placeholder="New Password" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm" required />
                            <div className="flex justify-end pt-2">
                                <button disabled={isChangingPwd} type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2">
                                    {isChangingPwd && <Loader2 className="animate-spin" size={12} />} Update Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
         </div>
      </section>

      {/* 2. Device Management */}
      <section className="mb-8">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Active Sessions</h3>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {sessions.map((session, idx) => (
               <div key={session.id} className={`p-5 flex items-center justify-between ${idx !== sessions.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
                  <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-xl ${session.isCurrent ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {session.device.includes('iPhone') || session.device.includes('Android') ? <Smartphone size={20} /> : <Laptop size={20} />}
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                           {session.device}
                           {session.isCurrent && <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">CURRENT</span>}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                           <p className="text-xs text-slate-500 flex items-center gap-1"><Globe size={10} /> {session.location}</p>
                           <p className="text-xs text-slate-500 flex items-center gap-1"><History size={10} /> {session.lastActive}</p>
                        </div>
                     </div>
                  </div>
                  {!session.isCurrent && (
                     <button 
                        onClick={() => handleRevoke(session.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                     >
                        Revoke
                     </button>
                  )}
               </div>
            ))}
         </div>
      </section>

      {/* 3. Account Activity Info */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-3">
         <AlertTriangle className="text-amber-500 shrink-0" size={20} />
         <div>
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">Suspicious Activity?</h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
               If you notice any unknown devices or transactions, please change your password immediately and contact support.
            </p>
            <button className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-2 hover:underline">Contact Support</button>
         </div>
      </div>
    </div>
  );
};
