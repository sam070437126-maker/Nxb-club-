import React, { useState } from 'react';
import { Gift, Calendar, CheckCircle, Sparkles, X, Flame, Crown, Coins, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onClaimReward: (day: number, coins: number) => void;
}

const REWARDS_SCHEDULE = [
  { day: 1, coins: 50, label: 'Starter Dividend' },
  { day: 2, coins: 100, label: 'Double Boost' },
  { day: 3, coins: 150, label: 'Midweek Reserve' },
  { day: 4, coins: 200, label: 'Tactician Coin' },
  { day: 5, coins: 250, label: 'Syndicate Stash' },
  { day: 6, coins: 300, label: 'High Roller Bonus' },
  { day: 7, coins: 500, label: 'VIP Grand Jackpot', isGrand: true },
];

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onClaimReward
}) => {
  if (!isOpen) return null;

  const currentStreak = currentUser.dailyStreak || 1;
  const lastClaimStr = currentUser.lastDailyClaim;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const alreadyClaimedToday = lastClaimStr === todayStr;

  const [claimedJustNow, setClaimedJustNow] = useState(false);

  const handleClaim = () => {
    if (alreadyClaimedToday) return;
    const currentDay = Math.min(currentStreak, 7);
    const reward = REWARDS_SCHEDULE[currentDay - 1] || REWARDS_SCHEDULE[0];
    onClaimReward(currentDay, reward.coins);
    setClaimedJustNow(true);
    setTimeout(() => {
      setClaimedJustNow(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 p-6 sm:p-7 border-b border-slate-800 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Gift size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Daily Player Dividend
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  <Flame size={12} fill="currentColor" /> {currentStreak} Day Streak
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Institutional Daily Stash
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Log in daily to claim your free coin allocation. Reach Day 7 to unlock the Grand 500 Coin Stash and 24h VIP privilege.
          </p>
        </div>

        {/* 7 Days Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {REWARDS_SCHEDULE.map((item) => {
              const isPast = item.day < currentStreak;
              const isToday = item.day === currentStreak;
              const isFuture = item.day > currentStreak;

              return (
                <div 
                  key={item.day}
                  className={`relative p-2.5 rounded-2xl flex flex-col items-center justify-between text-center border transition-all ${
                    isToday
                      ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                      : isPast
                      ? 'bg-slate-950/60 border-emerald-500/30 opacity-75'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Day {item.day}
                  </span>

                  <div className="my-1.5">
                    {item.isGrand ? (
                      <Crown size={20} className="text-amber-400 animate-bounce" />
                    ) : isPast ? (
                      <CheckCircle size={18} className="text-emerald-400" />
                    ) : (
                      <Coins size={18} className={isToday ? "text-amber-400" : "text-slate-500"} />
                    )}
                  </div>

                  <span className={`text-xs font-mono font-black ${isToday ? 'text-amber-400' : 'text-slate-200'}`}>
                    +{item.coins}
                  </span>

                  {isToday && (
                    <div className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {claimedJustNow ? (
              <div className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 animate-in zoom-in-95">
                <Sparkles size={18} /> Dividend Claimed Successfully!
              </div>
            ) : alreadyClaimedToday ? (
              <div className="w-full py-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 text-center font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                Claimed for Today — Come back in 24 hours for Day {Math.min(currentStreak + 1, 7)}!
              </div>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={18} />
                Claim Day {currentStreak} Dividend (+{REWARDS_SCHEDULE[currentStreak - 1]?.coins || 50} NXB Coins)
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-950/80 p-3.5 px-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Streak resets if 48 hours pass without check-in.</span>
          <span className="font-bold text-amber-500/80">Zero Loss House Model</span>
        </div>
      </div>
    </div>
  );
};
