import React, { useState } from 'react';
import { 
  Trophy, Crown, Flame, TrendingUp, Award, Star, UserCheck, Shield, 
  Copy, Check, Sparkles, ExternalLink, ArrowRight, Zap, Target
} from 'lucide-react';
import { UserProfile, BetSelection } from '../types';

interface LeaderboardViewProps {
  currentUser: UserProfile;
  onOpenVipModal: () => void;
  onCopySlip?: (selections: BetSelection[]) => void;
}

interface TipsterProfile {
  rank: number;
  name: string;
  avatar: string;
  tier: 'elite' | 'pro' | 'free';
  coins: number;
  winRate: string;
  roi: string;
  streak: number;
  isMe?: boolean;
  activeSlip?: {
    title: string;
    totalOdds: number;
    legs: BetSelection[];
  };
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ 
  currentUser, 
  onOpenVipModal,
  onCopySlip 
}) => {
  const [period, setPeriod] = useState<'weekly' | 'allTime'>('weekly');
  const [activeTab, setActiveTab] = useState<'traders' | 'slips'>('traders');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isVip = currentUser.vipTier === 'pro' || currentUser.vipTier === 'elite';

  const LEADERBOARD_DATA: TipsterProfile[] = [
    { 
      rank: 1, 
      name: 'Sovereign_Alpha', 
      avatar: 'SA', 
      tier: 'elite', 
      coins: 148200, 
      winRate: '78.4%', 
      roi: '+142%', 
      streak: 9,
      activeSlip: {
        title: 'Institutional 3-Leg Bankroll Builder',
        totalOdds: 4.85,
        legs: [
          { matchId: 'm1', selectionId: 'm1_1', matchTitle: 'Arsenal vs Chelsea', selectionLabel: 'Arsenal (1)', oddValue: 1.85, marketType: '1x2' },
          { matchId: 'm2', selectionId: 'm2_ov', matchTitle: 'Real Madrid vs Barcelona', selectionLabel: 'Over 2.5 Goals', oddValue: 1.72, marketType: 'Over/Under' },
          { matchId: 'm3', selectionId: 'm3_1', matchTitle: 'Lakers vs Celtics', selectionLabel: 'Lakers (1)', oddValue: 1.52, marketType: 'Moneyline' },
        ]
      }
    },
    { 
      rank: 2, 
      name: 'London_Syndicate', 
      avatar: 'LS', 
      tier: 'pro', 
      coins: 92450, 
      winRate: '72.1%', 
      roi: '+98%', 
      streak: 6,
      activeSlip: {
        title: 'Premier High-Percentage Double',
        totalOdds: 3.10,
        legs: [
          { matchId: 'm4', selectionId: 'm4_1', matchTitle: 'Man City vs Liverpool', selectionLabel: 'Man City (1)', oddValue: 1.95, marketType: '1x2' },
          { matchId: 'm5', selectionId: 'm5_ov', matchTitle: 'Bayern Munich vs Dortmund', selectionLabel: 'Over 3.5 Goals', oddValue: 1.59, marketType: 'Over/Under' },
        ]
      }
    },
    { 
      rank: 3, 
      name: 'Nexus_Oracle', 
      avatar: 'NO', 
      tier: 'pro', 
      coins: 81200, 
      winRate: '69.5%', 
      roi: '+84%', 
      streak: 5,
      activeSlip: {
        title: 'European Underdog Scalper',
        totalOdds: 5.40,
        legs: [
          { matchId: 'm6', selectionId: 'm6_x', matchTitle: 'Juventus vs Inter Milan', selectionLabel: 'Draw (X)', oddValue: 3.10, marketType: '1x2' },
          { matchId: 'm7', selectionId: 'm7_1', matchTitle: 'PSG vs Marseille', selectionLabel: 'PSG (1)', oddValue: 1.74, marketType: '1x2' },
        ]
      }
    },
    { 
      rank: 4, 
      name: 'Apex_Tactician', 
      avatar: 'AT', 
      tier: 'pro', 
      coins: 64100, 
      winRate: '67.0%', 
      roi: '+65%', 
      streak: 4 
    },
    { 
      rank: 5, 
      name: 'Matador_Bets', 
      avatar: 'MB', 
      tier: 'free', 
      coins: 49800, 
      winRate: '63.2%', 
      roi: '+52%', 
      streak: 3 
    },
    { 
      rank: 6, 
      name: currentUser.name || 'Samuel_Emmanuel', 
      avatar: currentUser.avatar || 'SE', 
      tier: currentUser.vipTier || 'pro', 
      coins: currentUser.nxbCoins || 3500, 
      winRate: '65.0%', 
      roi: '+45%', 
      streak: currentUser.dailyStreak || 2, 
      isMe: true 
    },
    { 
      rank: 7, 
      name: 'Kip_Runner_254', 
      avatar: 'KR', 
      tier: 'free', 
      coins: 38200, 
      winRate: '61.8%', 
      roi: '+38%', 
      streak: 2 
    },
    { 
      rank: 8, 
      name: 'Crypto_Striker', 
      avatar: 'CS', 
      tier: 'pro', 
      coins: 34100, 
      winRate: '59.4%', 
      roi: '+31%', 
      streak: 1 
    },
  ];

  const handleCopySlip = (trader: TipsterProfile, index: number) => {
    if (!trader.activeSlip) return;

    if (!isVip) {
      // Prompt upgrade to VIP
      onOpenVipModal();
      return;
    }

    if (onCopySlip) {
      onCopySlip(trader.activeSlip.legs);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white relative shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-black uppercase tracking-wider mb-2 border border-amber-500/30">
              <Trophy size={14} /> Syndicate Copy-Trading Exchange
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Institutional Leaderboard
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg">
              Follow top-ranked verified traders. Pro and Elite members can 1-click replicate syndicate parlays directly into their live betslip.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
            {/* View switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('traders')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'traders' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Traders
              </button>
              <button
                onClick={() => setActiveTab('slips')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'slips' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap size={13} /> Active Slips
              </button>
            </div>

            {/* Time period switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === 'weekly' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('allTime')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === 'allTime' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'
                }`}
              >
                All-Time
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE SLIPS TAB (COPY-TRADING FOCUS) */}
      {activeTab === 'slips' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Target size={18} className="text-amber-400" />
              Live Syndicate Slips Ready to Copy
            </h3>
            <span className="text-xs text-slate-400">
              {isVip ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={14} /> VIP 1-Click Copy Unlocked
                </span>
              ) : (
                <button 
                  onClick={onOpenVipModal}
                  className="text-amber-400 hover:underline font-bold text-xs flex items-center gap-1"
                >
                  <Crown size={14} /> VIP Pro required to auto-copy
                </button>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LEADERBOARD_DATA.filter(t => t.activeSlip).map((trader, idx) => (
              <div 
                key={trader.name}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/50 flex items-center justify-center font-black text-xs text-amber-400">
                        {trader.avatar}
                      </div>
                      <div>
                        <div className="font-black text-xs text-white">{trader.name}</div>
                        <span className="text-[10px] text-emerald-400 font-bold">{trader.winRate} Win • ROI {trader.roi}</span>
                      </div>
                    </div>
                    <span className="bg-amber-500/15 text-amber-400 text-[10px] font-mono font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                      Odds: {trader.activeSlip?.totalOdds.toFixed(2)}x
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-200 mb-3">
                    {trader.activeSlip?.title}
                  </h4>

                  <div className="space-y-1.5 mb-4">
                    {trader.activeSlip?.legs.map((leg, lIdx) => (
                      <div key={lIdx} className="bg-slate-950/70 p-2 rounded-xl flex items-center justify-between text-xs border border-slate-800/80">
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-300 block truncate">{leg.selectionLabel}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{leg.matchTitle}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {leg.oddValue.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleCopySlip(trader, idx)}
                  className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    copiedIndex === idx
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : isVip
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={14} /> Slip Copied to Betslip!
                    </>
                  ) : isVip ? (
                    <>
                      <Copy size={14} /> Copy Slip ({trader.activeSlip?.legs.length} Legs)
                    </>
                  ) : (
                    <>
                      <Crown size={14} /> Unlock 1-Click Copy (VIP)
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Podium Top 3 */}
      {activeTab === 'traders' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rank 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center order-2 md:order-1 relative">
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-black text-slate-300 text-lg mb-3 shadow-md">
                2
              </div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                {LEADERBOARD_DATA[1].name}
                <Crown size={14} className="text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Silver Tier</span>
              <div className="text-lg font-black font-mono text-amber-400 mt-3">
                🪙 {LEADERBOARD_DATA[1].coins.toLocaleString()}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>Win: <b className="text-emerald-400">{LEADERBOARD_DATA[1].winRate}</b></span>
                <span>ROI: <b className="text-emerald-400">{LEADERBOARD_DATA[1].roi}</b></span>
              </div>
            </div>

            {/* Rank 1 */}
            <div className="bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500 rounded-2xl p-6 flex flex-col items-center text-center order-1 md:order-2 relative shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Flame size={12} fill="currentColor" /> Champion
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-300 flex items-center justify-center font-black text-slate-950 text-2xl mb-3 shadow-lg">
                👑
              </div>
              <div className="font-black text-base text-white flex items-center gap-1.5">
                {LEADERBOARD_DATA[0].name}
                <Award size={16} className="text-cyan-400" />
              </div>
              <span className="text-[10px] text-amber-400 uppercase tracking-widest mt-0.5">Institutional Elite</span>
              <div className="text-2xl font-black font-mono text-amber-400 mt-3">
                🪙 {LEADERBOARD_DATA[0].coins.toLocaleString()}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                <span>Win Rate: <b className="text-emerald-400">{LEADERBOARD_DATA[0].winRate}</b></span>
                <span>Streak: <b className="text-amber-400">{LEADERBOARD_DATA[0].streak}W</b></span>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center order-3 relative">
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center font-black text-amber-600 text-lg mb-3 shadow-md">
                3
              </div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                {LEADERBOARD_DATA[2].name}
                <Crown size={14} className="text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Bronze Master</span>
              <div className="text-lg font-black font-mono text-amber-400 mt-3">
                🪙 {LEADERBOARD_DATA[2].coins.toLocaleString()}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>Win: <b className="text-emerald-400">{LEADERBOARD_DATA[2].winRate}</b></span>
                <span>ROI: <b className="text-emerald-400">{LEADERBOARD_DATA[2].roi}</b></span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Trader</th>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-right">Win Rate</th>
                    <th className="px-4 py-3 text-right">Streak</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {LEADERBOARD_DATA.map((user, idx) => (
                    <tr 
                      key={user.rank}
                      className={`transition-colors ${
                        user.isMe 
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 font-bold text-white' 
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-black text-xs">
                        {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : `#${user.rank}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                            {user.avatar}
                          </div>
                          <span className="font-bold text-xs sm:text-sm">{user.name}</span>
                          {user.isMe && (
                            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">YOU</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.tier === 'elite' 
                            ? 'bg-cyan-500/20 text-cyan-400' 
                            : user.tier === 'pro' 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                        🪙 {user.coins.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                        {user.winRate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Flame size={12} fill="currentColor" /> {user.streak}W
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {user.activeSlip ? (
                          <button
                            onClick={() => handleCopySlip(user, idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs transition-all border border-amber-500/30"
                          >
                            <Copy size={12} /> Copy Slip
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default LeaderboardView;
