import React from 'react';
import { X, User, Wallet, CreditCard, History, Settings, HelpCircle, LogOut, ChevronRight, Shield, Bell, Moon, Smartphone, Sun, Lock, FileCheck, Gift, Trophy, ArrowUpRight, ArrowDownLeft, ShieldCheck, Banknote, ShieldAlert, RefreshCw, MessageSquare } from 'lucide-react';
import { AppView, AppSettings, UserProfile } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  settings?: AppSettings;
  onSettingsUpdate?: (s: AppSettings) => void;
  user?: UserProfile;
  balance?: number;
  bonus?: number;
  currencySymbol?: string;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({ 
  isOpen, onClose, onNavigate, onLogout, settings, onSettingsUpdate, user, balance = 0, bonus = 0, currencySymbol = '$'
}) => {
  const handleNav = (view: AppView) => onNavigate(view);

  const toggleTheme = () => {
    if (settings && onSettingsUpdate) onSettingsUpdate({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      <div className={`fixed inset-y-0 right-0 w-[85%] max-w-sm bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Premium Header */}
        <div className="p-6 pb-4 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <div onClick={() => handleNav('profile')} className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/30 cursor-pointer ring-2 ring-emerald-500/20">
                    {user?.avatar || 'JD'}
                 </div>
                 <div onClick={() => handleNav('profile')} className="cursor-pointer">
                    <h2 className="text-slate-900 dark:text-white font-black text-lg leading-tight">{user?.name || 'Player'}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-slate-500 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ID: {user?.id?.slice(0,8) || '88239102'}</span>
                       <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">VIP {user?.level || 1}</span>
                    </div>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"><X size={18} /></button>
           </div>

           {/* Wallet Card */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-xl relative overflow-hidden border border-slate-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Balance</p>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">{currencySymbol}{(balance + bonus).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              
              <div className="flex gap-4 mb-5">
                 <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Main</p>
                    <p className="text-emerald-400 font-mono font-bold text-sm">{currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                 </div>
                 <div className="w-px bg-slate-700"></div>
                 <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Bonus</p>
                    <p className="text-amber-400 font-mono font-bold text-sm">{currencySymbol}{bonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                 </div>
              </div>

              <div className="flex gap-2">
                 <button onClick={() => handleNav('deposit')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20">
                    <ArrowDownLeft size={16} /> DEPOSIT
                 </button>
                 <button onClick={() => handleNav('withdraw')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                    <ArrowUpRight size={16} /> WITHDRAW
                 </button>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           {user?.email === 'samuelemma466@gmail.com' && (
               <div>
                  <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 px-2">Operator Governance</h3>
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden shadow-sm">
                     <MenuItem icon={<ShieldAlert size={18} className="text-red-500" />} label="Executive Command Center" badge="ADMIN" onClick={() => handleNav('admin')} />
                  </div>
               </div>
           )}

           <div>
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 px-2">Syndicate & Membership</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                 <MenuItem icon={<MessageSquare size={18} className="text-amber-400" />} label="Bettors Social Feed" badge="LOUNGE" onClick={() => handleNav('social-feed')} />
                 <MenuItem icon={<Gift size={18} className="text-amber-500" />} label="Nexus Pro Syndicate" badge={user?.vipTier === 'pro' ? 'ACTIVE' : 'UPGRADE'} onClick={() => handleNav('vip-subscription')} />
                 <MenuItem icon={<Banknote size={18} className="text-amber-400" />} label="Digital Coin Store" badge="GET COINS" onClick={() => handleNav('coin-store')} />
                 <MenuItem icon={<Trophy size={18} className="text-amber-400" />} label="Global Leaderboard" badge="RANKINGS" onClick={() => handleNav('leaderboard')} />
                 <MenuItem icon={<Gift size={18} className="text-emerald-400" />} label="Refer & Earn Rewards" badge="FREE COINS" onClick={() => handleNav('bonuses')} />
              </div>
           </div>

           <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">My Account</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                 <MenuItem icon={<User size={18} />} label="Player Profile" onClick={() => handleNav('profile')} />
                 <MenuItem icon={<History size={18} />} label="Bet History" onClick={() => handleNav('my-bets')} />
                 <MenuItem icon={<CreditCard size={18} />} label="Ledger & Transactions" onClick={() => handleNav('transactions')} />
              </div>
           </div>

           <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Settings & Security</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                 <MenuItem icon={<Settings size={18} />} label="Preferences" onClick={() => handleNav('settings')} />
                 <MenuItem icon={<ShieldCheck size={18} />} label="Security Center" onClick={() => handleNav('security')} />
                 <MenuItem icon={<FileCheck size={18} />} label="Verification" badge={`Lvl ${user?.level || 1}`} onClick={() => handleNav('verification')} />
                 <div onClick={toggleTheme} className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                       {settings?.theme === 'dark' ? <Moon size={18} className="text-slate-400" /> : <Sun size={18} className="text-slate-400" />}
                       <span className="text-sm font-bold">Dark Mode</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings?.theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </div>
              </div>
           </div>

           <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Support</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                 <MenuItem icon={<HelpCircle size={18} />} label="Help Center" onClick={() => handleNav('help')} />
                 <MenuItem icon={<Shield size={18} />} label="Responsible Gaming" onClick={() => handleNav('responsible-gaming')} />
              </div>
           </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 shrink-0">
           <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 font-black p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors text-xs tracking-wider">
              <RefreshCw size={16} /> RESET WALLET & DEMO FUNDS
           </button>
        </div>
      </div>
    </>
  );
};

const MenuItem: React.FC<{ icon: any; label: string; badge?: string; onClick: () => void }> = ({ icon, label, badge, onClick }) => (
   <div onClick={onClick} className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
         {React.cloneElement(icon, { className: 'text-slate-400 group-hover:text-emerald-500 transition-colors' })}
         <span className="text-sm font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-3">
         {badge && <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">{badge}</span>}
         <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
      </div>
   </div>
);

export default MenuDrawer;
