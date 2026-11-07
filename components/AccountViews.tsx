
import React, { useState } from 'react';
import { CreditCard, Wallet, ArrowRight, User, Mail, Phone, Shield, Calendar, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Lock, Settings, ToggleLeft, ToggleRight, Smartphone, BellRing, MousePointer2, Copy, QrCode, Building2, History, ArrowUpRight, ArrowDownLeft, Loader2, XCircle, Globe, MapPin, Coins, Check, Clock, Trophy, Upload, FileCheck, Gift, Percent, BarChart, Eye, EyeOff, Info, HelpCircle, PhoneCall, MessageSquare, ShieldCheck, Filter, Ban, Hourglass, Edit2, Camera, ChevronDown, ChevronUp, AlertTriangle, KeyRound, Banknote, Search, Landmark, RefreshCw, Share2, Sparkles, Send, Flame, Crown, Zap } from 'lucide-react';
import { AppSettings, Transaction, UserProfile, CurrencyCode } from '../types';

// Helper to get currency symbol
export const getCurrencySymbol = (code: CurrencyCode) => {
  switch (code) {
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'NGN': return '₦';
    case 'KES': return 'KSh';
    case 'CAD': return 'C$';
    default: return '$';
  }
};

// --- 1. DEPOSIT VIEW ---
export const DepositView: React.FC<{ onDeposit: (amount: number, method: string) => void, currencySymbol: string }> = ({ onDeposit, currencySymbol }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [step, setStep] = useState<1 | 2>(1);
  const [processing, setProcessing] = useState(false);

  // Mock Payment Details State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleNext = () => {
    if (!amount || parseFloat(amount) <= 0) return alert('Enter a valid amount');
    setStep(2);
  };

  const handleDeposit = () => {
    setProcessing(true);
    setTimeout(() => {
      onDeposit(parseFloat(amount), method);
      setProcessing(false);
      setAmount('');
      setStep(1);
      alert('Deposit Successful!');
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8 pt-4">
         <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ArrowDownLeft size={32} />
         </div>
         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Add Funds</h2>
         <p className="text-slate-500 text-sm mt-1">Instantly top up your wallet</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 mb-6 relative overflow-hidden">
         
         {step === 1 ? (
           <div className="animate-in fade-in slide-in-from-left-4 duration-300">
             <div className="flex justify-center items-center mb-8 bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <span className="text-4xl font-black text-slate-400 mr-2">{currencySymbol}</span>
                <input 
                   type="number" 
                   value={amount} 
                   onChange={e => setAmount(e.target.value)}
                   className="w-full max-w-[200px] bg-transparent text-5xl font-black text-slate-900 dark:text-white outline-none placeholder-slate-300 dark:placeholder-slate-800"
                   placeholder="0"
                />
             </div>
             
             <div className="grid grid-cols-4 gap-2 mb-8">
                {['50', '100', '250', '500'].map(amt => (
                   <button key={amt} onClick={() => setAmount(amt)} className={`py-3 rounded-xl font-black text-sm transition-all ${amount === amt ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                      +{currencySymbol}{amt}
                   </button>
                ))}
             </div>

             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Method</h3>
             <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                   { id: 'card', icon: <CreditCard size={24} />, label: 'Card' },
                   { id: 'bank', icon: <Landmark size={24} />, label: 'Bank' },
                   { id: 'crypto', icon: <Coins size={24} />, label: 'Crypto' }
                ].map(m => (
                   <button 
                     key={m.id}
                     onClick={() => setMethod(m.id)}
                     className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${method === m.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                   >
                      {m.icon}
                      <span className="font-bold text-xs">{m.label}</span>
                   </button>
                ))}
             </div>

             <button 
                onClick={handleNext} 
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
             >
                CONTINUE <ArrowRight size={20} />
             </button>
           </div>
         ) : (
           <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-6">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-sm font-bold flex items-center gap-1">
                   <ChevronLeft size={16} /> Back
                </button>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                   Pay {currencySymbol}{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
             </div>

             {/* Dynamic Payment Forms */}
             {method === 'card' && (
                <div className="space-y-4 mb-8">
                   <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                      <CreditCard size={28} className="text-slate-400 mb-6" />
                      <div className="font-mono text-xl tracking-widest mb-2 opacity-80">
                         {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between text-xs font-mono opacity-60">
                         <span>{expiry || 'MM/YY'}</span>
                         <span>{cvc ? '•••' : 'CVC'}</span>
                      </div>
                   </div>
                   
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Expiry</label>
                         <input type="text" placeholder="MM/YY" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">CVC</label>
                         <input type="text" placeholder="123" maxLength={3} value={cvc} onChange={e => setCvc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500" />
                      </div>
                   </div>
                </div>
             )}

             {method === 'bank' && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center mb-8">
                   <Building2 size={40} className="mx-auto text-emerald-500 mb-4" />
                   <h3 className="font-bold text-slate-900 dark:text-white mb-1">Bank Transfer</h3>
                   <p className="text-xs text-slate-500 mb-6">Transfer exactly <strong className="text-slate-900 dark:text-white">{currencySymbol}{parseFloat(amount).toLocaleString()}</strong> to the account below.</p>
                   
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</span>
                         <span className="text-sm font-bold text-slate-900 dark:text-white">Providus Bank</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Account Number</span>
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-emerald-500">9901234567</span>
                            <Copy size={14} className="text-slate-400 cursor-pointer hover:text-emerald-500" />
                         </div>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Account Name</span>
                         <span className="text-sm font-bold text-slate-900 dark:text-white">NXB Gaming Ltd</span>
                      </div>
                   </div>
                </div>
             )}

             {method === 'crypto' && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center mb-8">
                   <div className="bg-white p-4 rounded-xl inline-block mb-4 border border-slate-200">
                      <QrCode size={120} className="text-slate-900" />
                   </div>
                   <h3 className="font-bold text-slate-900 dark:text-white mb-1">Send USDT (TRC20)</h3>
                   <p className="text-xs text-slate-500 mb-4">Send only USDT on the Tron network to this address.</p>
                   
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">T9yD14Nj9j7xAB4dbBiW1...</span>
                      <button className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors">
                         <Copy size={16} />
                      </button>
                   </div>
                </div>
             )}

             <button 
                onClick={handleDeposit} 
                disabled={processing || (method === 'card' && (!cardNumber || !expiry || !cvc))}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
             >
                {processing ? <Loader2 className="animate-spin" /> : 'COMPLETE PAYMENT'}
             </button>
           </div>
         )}
      </div>
      
      <p className="text-center text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
         <ShieldCheck size={12} /> SECURE 256-BIT ENCRYPTION
      </p>
    </div>
  );
};

// --- 2. WITHDRAW VIEW ---
export const WithdrawView: React.FC<{ balance: number, onWithdraw: (amount: number) => void, currencySymbol: string }> = ({ balance, onWithdraw, currencySymbol }) => {
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) return alert('Enter a valid amount');
    if (parseFloat(amount) > balance) return alert('Insufficient funds');
    setProcessing(true);
    setTimeout(() => {
      onWithdraw(parseFloat(amount));
      setProcessing(false);
      setAmount('');
      alert('Withdrawal request initiated.');
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8 pt-4">
         <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ArrowUpRight size={32} />
         </div>
         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cash Out</h2>
         <p className="text-slate-500 text-sm mt-1">Withdraw funds to your account</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 mb-6">
         
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 mb-6 text-center border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Available to Withdraw</p>
            <h3 className="text-3xl font-black text-white">{currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
         </div>

         <div className="flex justify-center items-center mb-8 bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <span className="text-4xl font-black text-slate-400 mr-2">{currencySymbol}</span>
            <input 
               type="number" 
               value={amount} 
               onChange={e => setAmount(e.target.value)}
               className="w-full max-w-[200px] bg-transparent text-5xl font-black text-slate-900 dark:text-white outline-none placeholder-slate-300 dark:placeholder-slate-800"
               placeholder="0"
            />
         </div>

         <button 
            onClick={handleWithdraw} 
            disabled={processing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
         >
            {processing ? <Loader2 className="animate-spin" /> : 'CONFIRM WITHDRAWAL'}
         </button>
      </div>
    </div>
  );
};

// --- 3. PROFILE VIEW (UPDATED WITH REAL STATS) ---
interface ProfileProps {
  user: UserProfile;
  onNavigate: (view: any) => void;
  settings: AppSettings;
  onUpdateUser?: (u: UserProfile) => void;
  stats?: { bets: number; wins: number };
}

export const ProfileView: React.FC<ProfileProps> = ({ user, onNavigate, settings, onUpdateUser, stats }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);

  const handleSave = () => {
    if (onUpdateUser) onUpdateUser({ ...user, name: editName });
    setIsEditing(false);
  };

  // Real Stats or Defaults
  const totalBets = stats?.bets || 0;
  const totalWins = stats?.wins || 0;
  const winRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Profile Card */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl mb-6 border border-slate-800">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-xl ring-4 ring-slate-800 shrink-0">
               {user.avatar}
            </div>
            
            <div className="text-center md:text-left flex-1 w-full">
               {isEditing ? (
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                     <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500 font-bold" />
                     <button onClick={handleSave} className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg text-sm font-black">SAVE</button>
                  </div>
               ) : (
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                     <h2 className="text-3xl font-black text-white tracking-tight">{user.name}</h2>
                     <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-emerald-400 transition-colors"><Edit2 size={16} /></button>
                  </div>
               )}
               <p className="text-slate-400 text-sm mb-4 flex items-center justify-center md:justify-start gap-2"><Mail size={14} /> {user.email}</p>
               
               {/* VIP Progress */}
               <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 w-full max-w-md mx-auto md:mx-0">
                  <div className="flex justify-between items-end mb-2">
                     <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-amber-400" />
                        <span className="text-amber-400 font-black italic tracking-wider">VIP TIER {user.level}</span>
                     </div>
                     <span className="text-slate-400 text-[10px] font-bold uppercase">2,450 / 5,000 XP</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 w-[49%] rounded-full"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Stats Bento Box */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
         <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mb-3"><History size={18} /></div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Bets</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalBets}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-3"><Trophy size={18} /></div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Wins</p>
            <p className="text-2xl font-black text-emerald-500">{totalWins}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-3"><BarChart size={18} /></div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Win Rate</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{winRate}%</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 text-purple-500 rounded-full flex items-center justify-center mb-3"><Calendar size={18} /></div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Member Since</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{user.joinDate}</p>
         </div>
      </div>

      {/* Menu Grid */}
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Account Management</h3>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
         <ProfileMenuItem icon={<History />} label="Bet History" onClick={() => onNavigate('my-bets')} />
         <ProfileMenuItem icon={<Banknote />} label="Transactions" onClick={() => onNavigate('transactions')} />
         <ProfileMenuItem icon={<Settings />} label="Preferences" onClick={() => onNavigate('settings')} />
         <ProfileMenuItem icon={<ShieldCheck />} label="Security" onClick={() => onNavigate('security')} />
         <ProfileMenuItem icon={<FileCheck />} label="Verification" onClick={() => onNavigate('verification')} />
      </div>
    </div>
  );
};

const ProfileMenuItem = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
     <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">{icon}</div>
        <span className="font-bold text-slate-700 dark:text-slate-200">{label}</span>
     </div>
     <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
  </button>
);

// --- 4. TRANSACTIONS VIEW ---
export const TransactionsView: React.FC<{ transactions: Transaction[], currencySymbol: string }> = ({ transactions, currencySymbol }) => (
  <div className="max-w-3xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500">
    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2"><ArrowUpRight className="text-emerald-500"/> Transactions</h2>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {transactions.length === 0 ? (
        <div className="p-12 text-center text-slate-500">No transactions found.</div>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id} className="p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${tx.type === 'Deposit' || tx.type === 'Bet Win' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                   {tx.type === 'Deposit' ? <ArrowDownLeft size={18} /> : tx.type === 'Withdrawal' ? <ArrowUpRight size={18} /> : <Coins size={18} />}
                </div>
                <div>
                   <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tx.type}</h4>
                   <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()} • {tx.method}</p>
                </div>
             </div>
             <div className={`font-mono font-bold ${tx.type === 'Deposit' || tx.type === 'Bet Win' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                {tx.type === 'Deposit' || tx.type === 'Bet Win' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
             </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// --- 5. SETTINGS VIEW ---
export const SettingsView: React.FC<{ settings: AppSettings, onUpdate: (s: AppSettings) => void }> = ({ settings, onUpdate }) => (
  <div className="max-w-2xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500">
     <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Preferences</h2>
     
     <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Dark Mode</h4>
              <p className="text-xs text-slate-500">Toggle app theme</p>
           </div>
           <button onClick={() => onUpdate({...settings, theme: settings.theme === 'dark' ? 'light' : 'dark'})} className={`w-12 h-7 rounded-full transition-colors relative ${settings.theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}></div>
           </button>
        </div>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Privacy Mode</h4>
              <p className="text-xs text-slate-500">Hide balance in header</p>
           </div>
           <button onClick={() => onUpdate({...settings, privacyMode: !settings.privacyMode})} className={`w-12 h-7 rounded-full transition-colors relative ${settings.privacyMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.privacyMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
           </button>
        </div>
        <div className="p-4 flex items-center justify-between">
           <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Odds Format</h4>
              <p className="text-xs text-slate-500">Decimal / Fractional / American</p>
           </div>
           <select 
             value={settings.oddsFormat} 
             onChange={(e) => onUpdate({...settings, oddsFormat: e.target.value as any})}
             className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1 text-sm font-bold"
           >
              <option value="decimal">Decimal (2.50)</option>
              <option value="fractional">Fractional (3/2)</option>
              <option value="american">American (+150)</option>
           </select>
        </div>
     </div>
  </div>
);

// --- 6. VERIFICATION VIEW ---
export const VerificationView: React.FC<{ user: any, onVerify: () => void }> = ({ user, onVerify }) => {
  const isPending = user?.kycStatus === 'pending';
  const isVerified = user?.kycStatus === 'verified';

  return (
    <div className="max-w-2xl mx-auto p-4 text-center py-12">
       <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isVerified ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500' : isPending ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          <ShieldCheck size={40} />
       </div>
       <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {isVerified ? 'Account Verified' : isPending ? 'Verification Pending' : 'Verify Identity'}
       </h2>
       <p className="text-slate-500 max-w-sm mx-auto mb-6">
          {isVerified 
            ? 'Your identity has been confirmed. You have full access to all withdrawal methods and higher limits.' 
            : isPending 
            ? 'Your documents are currently being reviewed by our team. This usually takes 24-48 hours.'
            : 'Please verify your identity to unlock withdrawals and higher betting limits.'}
       </p>
       
       {!isVerified && !isPending && (
           <button onClick={onVerify} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-3 px-8 rounded-xl shadow-lg transition-colors">
               Submit Documents
           </button>
       )}
    </div>
  );
};

// --- 7. BONUS & REFERRAL GROWTH HUB ---
export const BonusView: React.FC<{ user?: UserProfile; onBonusClaimed?: (amount: number) => void }> = ({ user, onBonusClaimed }) => {
  const [copied, setCopied] = useState(false);
  const [claimedWelcome, setClaimedWelcome] = useState(() => localStorage.getItem('nxb_claimed_welcome') === 'true');
  const [bonusToast, setBonusToast] = useState<string | null>(null);

  const referralCode = user?.email 
    ? `NEXUS-${user.email.split('@')[0].toUpperCase().slice(0, 6)}`
    : 'NEXUS-VIP77';
  
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nexus-exchange.io';
  const referralUrl = `${origin}/?ref=${referralCode}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setBonusToast('Referral link copied to clipboard!');
      setTimeout(() => setBonusToast(null), 3000);
    }
  };

  const handleClaimWelcome = () => {
    if (claimedWelcome) return;
    setClaimedWelcome(true);
    localStorage.setItem('nxb_claimed_welcome', 'true');
    if (onBonusClaimed) onBonusClaimed(1000);
    setBonusToast('🎉 +1,000 NXB Starter Bonus credited to your wallet!');
    setTimeout(() => setBonusToast(null), 3500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🔥 Join me on Nexus Sports Exchange! Use my referral code ${referralCode} to claim +1,000 Free NXB Coins and copy my winning slips: ${referralUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`🔥 Join me on Nexus Sports Exchange! Use code ${referralCode} for +1,000 Free NXB Coins:`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`🚀 I'm locking in winning parlays on Nexus Syndicate Exchange! Join with code ${referralCode} for +1,000 NXB Coins and tail my plays 🏆`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Toast Alert */}
      {bonusToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-black text-xs px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-300">
          <CheckCircle2 size={16} /> {bonusToast}
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 p-6 sm:p-8 text-slate-950 shadow-xl">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-slate-950/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-slate-950 mb-3 border border-slate-950/20">
            <Sparkles size={14} /> Viral Growth & Syndicate Rewards
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            Invite Friends, Earn <span className="underline decoration-slate-950/40">Lifetime</span> NXB Coins
          </h2>
          <p className="text-slate-950/80 text-xs sm:text-sm font-medium leading-relaxed">
            Every friend you bring receives +1,000 Welcome Coins. You receive +500 Coins upon their first bet plus a 15% lifetime cut on their coin & VIP upgrades.
          </p>
        </div>

        {/* Decorative Coins Icon */}
        <Coins size={140} className="absolute -bottom-8 -right-6 text-slate-950/15 pointer-events-none" />
      </div>

      {/* Your Unique Referral Code & Direct Share Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Your Official Referral Link</div>
            <div className="text-sm font-mono text-slate-700 dark:text-slate-300 font-bold truncate max-w-md mt-1">
              {referralUrl}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* 1-Tap Social Share Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">Broadcast Directly to Social Networks:</div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-colors"
            >
              <Send size={14} /> WhatsApp
            </button>
            <button
              onClick={shareTelegram}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/30 transition-colors"
            >
              <Send size={14} /> Telegram
            </button>
            <button
              onClick={shareTwitter}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <Share2 size={14} /> X / Twitter
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <Gift size={20} />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase">Step 1</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">They Get 1,000 NXB</div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your friend signs up using your link and instantly gets 1,000 coins to try the platform risk-free.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <Coins size={20} />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase">Step 2</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">You Get 500 NXB</div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            As soon as they place their first parlay or copy a syndicate slip, 500 NXB coins drop into your balance.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
            <Crown size={20} />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase">Step 3</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">15% Lifetime Rev-Share</div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Earn 15% revenue share whenever any of your referred members subscribe to Nexus Pro or purchase coin bundles.
          </p>
        </div>
      </div>

      {/* Instant Claim Bonus Quest */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <h4 className="font-black text-white text-sm flex items-center gap-2">
              New Member Onboarding Bounty
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full">+1,000 NXB</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Claim your 1-time syndicate welcome bounty to start wagering.</p>
          </div>
        </div>

        <button
          onClick={handleClaimWelcome}
          disabled={claimedWelcome}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
            claimedWelcome
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95'
          }`}
        >
          {claimedWelcome ? 'Claimed ✓' : 'Claim 1,000 NXB'}
        </button>
      </div>

    </div>
  );
};

// --- 8. HELP VIEW ---
export const HelpView: React.FC = () => (
   <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Help Center</h2>
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:border-emerald-500 transition-colors cursor-pointer">
            <MessageSquare className="mx-auto mb-3 text-emerald-500" />
            <h3 className="font-bold text-sm">Live Chat</h3>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:border-emerald-500 transition-colors cursor-pointer">
            <Mail className="mx-auto mb-3 text-blue-500" />
            <h3 className="font-bold text-sm">Email Support</h3>
         </div>
      </div>
   </div>
);

// --- 9. RESPONSIBLE GAMING VIEW ---
export const ResponsibleGamingView: React.FC = () => (
   <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Responsible Gaming</h2>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full"><Ban size={24} /></div>
            <div>
               <h3 className="font-bold text-slate-900 dark:text-white">Self Exclusion</h3>
               <p className="text-xs text-slate-500">Temporarily lock your account</p>
            </div>
            <button className="ml-auto bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">Setup</button>
         </div>
         <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-full"><Hourglass size={24} /></div>
            <div>
               <h3 className="font-bold text-slate-900 dark:text-white">Deposit Limits</h3>
               <p className="text-xs text-slate-500">Cap your daily spending</p>
            </div>
            <button className="ml-auto bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-colors">Setup</button>
         </div>
      </div>
   </div>
);
