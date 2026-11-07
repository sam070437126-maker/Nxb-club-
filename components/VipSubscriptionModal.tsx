import React, { useState } from 'react';
import { VipTier, UserProfile } from '../types';
import { Crown, Sparkles, Check, Zap, ShieldCheck, Flame, ChevronRight, Lock, Award, Star } from 'lucide-react';

interface VipSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpgradeTier: (tier: VipTier) => void;
}

export const VipSubscriptionModal: React.FC<VipSubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpgradeTier
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState<VipTier>('pro');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = (tier: VipTier) => {
    setProcessing(true);
    setTimeout(() => {
      onUpgradeTier(tier);
      setProcessing(false);
      onClose();
    }, 1200);
  };

  const currentTier = currentUser.vipTier || 'free';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 text-white relative shadow-2xl my-8">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
            <Crown size={14} /> Sovereign Syndicate Terminal
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Upgrade to <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">Nexus Pro</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Institutional sports intelligence, Gemini AI predictive models, sharp money flow, and enhanced daily platform rewards.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center bg-slate-800 p-1 rounded-xl mt-5 border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual <span className="bg-emerald-500 text-slate-950 text-[9px] px-1 rounded font-black">SAVE 25%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          
          {/* FREE PLAN */}
          <div className={`rounded-2xl p-6 border transition-all ${
            currentTier === 'free' 
              ? 'bg-slate-800/40 border-slate-700 ring-1 ring-slate-600' 
              : 'bg-slate-950/50 border-slate-800 opacity-80'
          }`}>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Standard Analyst</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-black text-white">$0</span>
              <span className="text-slate-500 text-xs font-bold">/ forever</span>
            </div>
            <p className="text-slate-400 text-xs mb-5">Basic live score tracking & social predictions.</p>

            <div className="space-y-3 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Live scores & standard odds</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> 250 Daily NXB Coins faucet</div>
              <div className="flex items-center gap-2 text-slate-500"><Lock size={14} /> Basic AI predictions only</div>
              <div className="flex items-center gap-2 text-slate-500"><Lock size={14} /> Max single stake: 100 Coins</div>
            </div>

            <button
              disabled={currentTier === 'free'}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 text-slate-400 cursor-default"
            >
              {currentTier === 'free' ? 'Current Plan' : 'Standard'}
            </button>
          </div>

          {/* PRO PLAN (RECOMMENDED) */}
          <div className="relative rounded-2xl p-6 border-2 border-amber-500 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 shadow-xl shadow-amber-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Flame size={12} fill="currentColor" /> Most Popular
            </div>

            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Crown size={14} /> Pro Syndicate
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black text-white">
                {billingCycle === 'monthly' ? '$19.99' : '$14.99'}
              </span>
              <span className="text-slate-400 text-xs font-bold">/ month</span>
            </div>
            <p className="text-slate-400 text-xs mb-5">High-confidence AI models & tactical analysis.</p>

            <div className="space-y-3 mb-6 text-xs text-slate-200">
              <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span className="font-bold text-amber-300">Gemini AI Value Bets</span> & Confidence %</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> 2D Tactical Pitch & Momentum Radar</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> 2,500 Bonus NXB Coins on signup</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> 500 Daily NXB Coins (2x Faucet)</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> Gold Verified Syndicate Crown Badge</div>
            </div>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={processing || currentTier === 'pro'}
              className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {processing ? 'Upgrading...' : currentTier === 'pro' ? 'Active Membership' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* ELITE WHALE PLAN */}
          <div className="rounded-2xl p-6 border border-slate-700 bg-slate-900/90 relative">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award size={14} /> Institutional Whale
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-black text-white">
                {billingCycle === 'monthly' ? '$49.99' : '$39.99'}
              </span>
              <span className="text-slate-400 text-xs font-bold">/ month</span>
            </div>
            <p className="text-slate-400 text-xs mb-5">Institutional terminal for high-volume leaders.</p>

            <div className="space-y-3 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> All Pro Syndicate Features</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> <span className="font-bold text-cyan-300">Sharp Money Flow</span> Indicators</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> Real-Time Telegram / Push Signals</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> 10,000 Bonus NXB Coins included</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> Dedicated Executive VIP Account Desk</div>
            </div>

            <button
              onClick={() => handleUpgrade('elite')}
              disabled={processing || currentTier === 'elite'}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 active:scale-95 transition-all disabled:opacity-50"
            >
              {processing ? 'Upgrading...' : currentTier === 'elite' ? 'Active Membership' : 'Join Elite Tier'}
            </button>
          </div>

        </div>

        {/* Trust Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800 text-slate-500 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> Bank-Grade 256-Bit SSL</span>
            <span className="flex items-center gap-1"><Zap size={14} className="text-amber-500" /> Instant Activation</span>
            <span className="flex items-center gap-1">✕ Cancel Anytime</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Institutional Sports Intelligence & Social Entertainment Platform.
          </div>
        </div>

      </div>
    </div>
  );
};

export default VipSubscriptionModal;
