
import React, { useState, useEffect, memo, useMemo } from 'react';
import { Match, Odd, BetSelection, StatItem } from '../types';
import { Tv, BarChart3, ChevronDown, ChevronUp, Zap, Clock, PlayCircle, TrendingUp, Lock, Percent, Activity, X, Flame, ShieldAlert, Goal, Crown, Layers, Plus, Check } from 'lucide-react';
import { getMatchPrediction } from '../services/geminiService';
import { Typewriter } from './UiEffects';

interface OddButtonProps {
  odd: Odd;
  match: Match;
  isSelected: boolean;
  onClick: (selection: BetSelection) => void;
  expanded?: boolean;
  compact?: boolean;
}

const OddButton: React.FC<OddButtonProps> = ({ odd, match, isSelected, onClick, expanded = false, compact = false }) => {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (odd.prevValue) {
      if (odd.value > odd.prevValue) setDirection('up');
      else if (odd.value < odd.prevValue) setDirection('down');
      const timer = setTimeout(() => setDirection(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [odd.value, odd.prevValue]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Micro-interaction: Haptic Feedback
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10); // Short tick
    }
    onClick({ 
        matchId: match.id, 
        selectionId: odd.id, 
        matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`, 
        selectionLabel: odd.label, 
        oddValue: odd.value, 
        marketType: odd.marketType 
    });
  };

  if (compact) {
     return (
        <button
          onClick={handleClick}
          className={`relative flex items-center justify-center h-full rounded transition-all duration-200 border group px-1 active:scale-95 ${isSelected ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-400'}`}
        >
           <span className={`font-mono text-xs font-bold tracking-tighter ${direction === 'up' ? 'text-emerald-500' : direction === 'down' ? 'text-red-500' : ''} ${isSelected ? 'text-white' : ''}`}>{odd.value.toFixed(2)}</span>
           {direction && <div className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full ${direction === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} />}
        </button>
     );
  }

  return (
    <button
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center rounded-lg transition-all duration-200 font-medium overflow-hidden border group active:scale-95 ${expanded ? 'py-3' : 'py-2.5'} ${isSelected ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-1 ring-emerald-400 scale-[1.02] z-10' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50 hover:border-slate-400'}`}
    >
      {direction && <div className={`absolute inset-0 opacity-20 pointer-events-none ${direction === 'up' ? 'bg-emerald-500' : 'bg-red-500'} transition-opacity`} />}
      <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-500'}`}>{odd.label}</span>
      <div className="flex items-center gap-1 z-10 relative">
        <span className={`font-black tracking-tight transition-all ${isSelected ? 'text-xl text-white' : direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : direction === 'down' ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'} ${expanded ? 'text-lg' : 'text-sm'}`}>{odd.value.toFixed(2)}</span>
        {direction && <TrendingUp size={10} className={direction === 'up' ? "text-emerald-500" : "text-red-500 rotate-180"} />}
      </div>
    </button>
  );
};

// --- PULSE MOMENTUM VISUALIZER (Upgraded with Narrative) ---
const MomentumBar = ({ match }: { match: Match }) => {
  const hasStats = match.stats && match.stats.length > 0;
  const [pulse, setPulse] = useState(50);
  const [narrative, setNarrative] = useState("Midfield Battle");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
      if (hasStats) return;

      const timer = setInterval(() => {
          let base = 50;
          const homeScore = match.scores?.home || 0;
          const awayScore = match.scores?.away || 0;
          const homeOdds = match.odds.main.find(o => o.label === '1')?.value || 2.0;
          const awayOdds = match.odds.main.find(o => o.label === '2')?.value || 2.0;

          if (homeScore > awayScore) base = 65 + (homeScore - awayScore) * 5;
          else if (awayScore > homeScore) base = 35 - (awayScore - homeScore) * 5;
          else {
              if (homeOdds < awayOdds) base = 55;
              else if (awayOdds < homeOdds) base = 45;
          }

          const noise = Math.random() * 20 - 10; 
          const newValue = Math.min(95, Math.max(5, base + noise));
          setPulse(newValue);

          // Generate AI Narrative based on momentum shift
          if (newValue > 75) {
              setNarrative("Home Team: Dangerous Attack!");
              setFlash(true);
          } else if (newValue < 25) {
              setNarrative("Away Team: Dangerous Attack!");
              setFlash(true);
          } else if (newValue > 60) {
              setNarrative("Home Pressure Building...");
              setFlash(false);
          } else if (newValue < 40) {
              setNarrative("Away Counter-Attack Possible");
              setFlash(false);
          } else {
              setNarrative(["Possession Battle", "Defensive Shape", "Slow Build-up", "Midfield Gridlock"][Math.floor(Math.random() * 4)]);
              setFlash(false);
          }

          setTimeout(() => setFlash(false), 500);

      }, 3000);

      return () => clearInterval(timer);
  }, [match, hasStats]);

  const value = hasStats ? (match.stats?.find(s => s.label === 'Possession')?.home || 50) : pulse;

  return (
      <div className={`mb-4 bg-slate-900 rounded-lg p-3 border transition-colors duration-300 ${flash ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                  <Activity size={12} className={flash ? "text-red-500 animate-pulse" : "text-emerald-500"} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${flash ? "text-red-400" : "text-slate-500"}`}>
                      {narrative}
                  </span>
              </div>
          </div>
          
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
              {/* Center Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10"></div>
              
              {/* Dynamic Bar */}
              <div 
                  className={`h-full transition-all duration-1000 ease-out flex items-center justify-end pr-1 ${value > 50 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-slate-700'}`} 
                  style={{ width: `${value}%` }}
              >
              </div>
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-slate-600 font-mono">
              <span className={value > 60 ? "text-emerald-500 font-bold" : ""}>{value.toFixed(0)}%</span>
              <span className={value < 40 ? "text-emerald-500 font-bold" : ""}>{(100 - value).toFixed(0)}%</span>
          </div>
      </div>
  );
};

// --- BASKETBALL QUARTER SCORES ---
const BasketballScoreboard = ({ match }: { match: Match }) => (
    <div className="flex justify-between text-xs text-slate-400 font-mono mb-2 bg-slate-900 p-2 rounded border border-slate-800">
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between border-b border-slate-800 pb-1 mb-1">
                <span>Team</span><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span><span className="text-white">T</span>
            </div>
            <div className="flex justify-between">
                <span className="truncate w-12">{match.homeTeam.name.substring(0,3).toUpperCase()}</span>
                <span>{match.scores?.q1?.home || '-'}</span>
                <span>{match.scores?.q2?.home || '-'}</span>
                <span>{match.scores?.q3?.home || '-'}</span>
                <span>{match.scores?.q4?.home || '-'}</span>
                <span className="font-bold text-white">{match.scores?.home}</span>
            </div>
            <div className="flex justify-between">
                <span className="truncate w-12">{match.awayTeam.name.substring(0,3).toUpperCase()}</span>
                <span>{match.scores?.q1?.away || '-'}</span>
                <span>{match.scores?.q2?.away || '-'}</span>
                <span>{match.scores?.q3?.away || '-'}</span>
                <span>{match.scores?.q4?.away || '-'}</span>
                <span className="font-bold text-white">{match.scores?.away}</span>
            </div>
        </div>
    </div>
);

interface MatchCardProps {
  match: Match;
  onOddClick: (selection: BetSelection) => void;
  selectedOdds: string[];
  displayMarket: 'main' | 'secondary';
  variant?: 'card' | 'compact';
  isPro?: boolean;
  onOpenVipModal?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = memo(({ 
  match, 
  onOddClick, 
  selectedOdds, 
  displayMarket, 
  variant = 'card',
  isPro = false,
  onOpenVipModal 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Same-Game Parlay (SGP) Bet Builder State
  const [centerTab, setCenterTab] = useState<'standard' | 'sgp'>('standard');
  const [sgpSelections, setSgpSelections] = useState<{ id: string; label: string; odd: number }[]>([]);
  const [sgpAddedSuccess, setSgpAddedSuccess] = useState(false);

  const toggleSgpLeg = (leg: { id: string; label: string; odd: number }) => {
    setSgpSelections(prev => {
      const exists = prev.some(s => s.id === leg.id);
      if (exists) return prev.filter(s => s.id !== leg.id);
      return [...prev, leg];
    });
  };

  const calculatedSgpOdds = useMemo(() => {
    if (sgpSelections.length === 0) return 1.0;
    const rawMultiplier = sgpSelections.reduce((acc, s) => acc * s.odd, 1);
    const withMargin = rawMultiplier * (sgpSelections.length > 1 ? 0.82 : 1.0);
    return parseFloat(Math.max(1.10, withMargin).toFixed(2));
  }, [sgpSelections]);

  const handleAddSgpToSlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sgpSelections.length === 0) return;
    onOddClick({
      matchId: match.id,
      selectionId: `sgp_${match.id}_${Date.now()}`,
      matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      selectionLabel: `SGP (${sgpSelections.length} Legs): ${sgpSelections.map(s => s.label).join(' + ')}`,
      oddValue: calculatedSgpOdds,
      marketType: 'Same-Game Parlay (SGP)'
    });
    setSgpAddedSuccess(true);
    setSgpSelections([]);
    setTimeout(() => setSgpAddedSuccess(false), 2500);
  };
  
  const rawOdds = displayMarket === 'main' ? match.odds.main : (match.odds.secondary.length ? match.odds.secondary : match.odds.main);
  const hasOdds = !match.isLocked && rawOdds && rawOdds.length > 0;
  const odds = rawOdds;

  const handleAiClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPro) {
      if (onOpenVipModal) onOpenVipModal();
      return;
    }
    if (aiTip) { setAiTip(null); return; }
    setLoadingAi(true);
    try {
      const tip = await getMatchPrediction(match);
      setAiTip(tip);
    } catch {
      setAiTip("AI insights temporarily unavailable.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className={`transition-all duration-300 group ${variant === 'card' ? 'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-white dark:bg-slate-950/30 border-b border-slate-800 hover:bg-slate-900'}`}>
      <div onClick={() => setIsOpen(!isOpen)} className={`flex cursor-pointer relative ${variant === 'card' ? 'flex-col sm:flex-row items-stretch' : 'flex-row items-center py-2 px-3 gap-3'}`}>
        
        {variant === 'card' && (
           <>
              <div className="flex-1 p-4 flex items-center justify-between sm:border-r border-slate-800/50 gap-4">
                 <div className="flex flex-col items-center justify-center w-14 shrink-0 gap-1">
                    {match.isLive ? (
                       <div className="text-xs font-black text-red-500 animate-pulse flex flex-col items-center leading-none">
                            <span className="uppercase tracking-tighter font-bold">{match.sport === 'Basketball' ? match.period : `${match.minute}'`}</span>
                       </div>
                    ) : (
                       <span className="text-xs font-bold text-slate-500">{match.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    )}
                 </div>
                 <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <img src={match.homeTeam.logo} alt="" className="w-6 h-6 object-contain" />
                          <span className="text-sm font-bold dark:text-white truncate">{match.homeTeam.name}</span>
                       </div>
                       {match.isLive && <span className="text-emerald-400 font-black font-mono text-xl">{match.scores?.home}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <img src={match.awayTeam.logo} alt="" className="w-6 h-6 object-contain" />
                          <span className="text-sm font-bold dark:text-white truncate">{match.awayTeam.name}</span>
                       </div>
                       {match.isLive && <span className="text-emerald-400 font-black font-mono text-xl">{match.scores?.away}</span>}
                    </div>
                 </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/30 sm:w-64 shrink-0 flex items-center justify-center">
                 {hasOdds ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {odds.slice(0, 3).map(odd => (
                        <OddButton key={odd.id} odd={odd} match={match} isSelected={selectedOdds.includes(odd.id)} onClick={onOddClick} />
                        ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                        <Lock size={16} />
                        <span className="text-[10px] font-bold uppercase">Markets Locked</span>
                    </div>
                 )}
              </div>
           </>
        )}
        
        {variant === 'compact' && (
           <>
             <div className="w-10 text-[10px] text-slate-500 font-bold">{match.isLive ? <span className="text-red-500">{match.sport === 'Basketball' ? match.period : `${match.minute}'`}</span> : match.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center"><span className="text-xs font-bold dark:text-white truncate">{match.homeTeam.name}</span>{match.isLive && <span className="text-emerald-400 font-bold text-xs">{match.scores?.home}</span>}</div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold dark:text-white truncate">{match.awayTeam.name}</span>{match.isLive && <span className="text-emerald-400 font-bold text-xs">{match.scores?.away}</span>}</div>
             </div>
             <div className="flex gap-1 h-8 shrink-0">
                {hasOdds ? (
                    odds.slice(0, 3).map(odd => <div key={odd.id} className="w-12 h-full"><OddButton odd={odd} match={match} isSelected={selectedOdds.includes(odd.id)} onClick={onOddClick} compact /></div>)
                ) : (
                    <div className="w-36 h-full flex items-center justify-center bg-slate-800 rounded text-[9px] text-slate-500 font-bold">LOCKED</div>
                )}
             </div>
           </>
        )}
      </div>

      {isOpen && (
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-800 p-4 animate-in slide-in-from-top-1">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setCenterTab('standard'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    centerTab === 'standard' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Standard Markets
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCenterTab('sgp'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    centerTab === 'sgp' 
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                      : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  <Layers size={13} /> SGP Bet Builder
                </button>
              </div>

              {isPro ? (
                <button onClick={handleAiClick} disabled={loadingAi} className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
                  <Zap size={10} className={loadingAi ? "animate-spin text-amber-300" : "text-amber-300"} /> 
                  {loadingAi ? "Analyzing..." : "Pro AI Insight"}
                </button>
              ) : (
                <button onClick={handleAiClick} className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black rounded-full text-[10px] shadow-sm uppercase tracking-wider active:scale-95 transition-all self-start sm:self-auto">
                  <Crown size={11} /> 
                  Unlock Pro AI Intel
                </button>
              )}
           </div>
           
           {aiTip && (
             <div className="mb-4 p-3.5 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-xl text-xs text-purple-200">
               <div className="flex items-center gap-2 mb-1.5 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                 <Crown size={12} /> Gemini Sports Oracle • Pro Intel
               </div>
               <Typewriter text={aiTip} />
             </div>
           )}
           
           {match.sport === 'Soccer' && match.isLive && <MomentumBar match={match} />}
           {match.sport === 'Basketball' && match.isLive && <BasketballScoreboard match={match} />}

           {/* SGP BET BUILDER MODE */}
           {centerTab === 'sgp' ? (
             <div className="space-y-4 animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
               <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <div>
                   <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
                     <Layers size={14} /> Same-Game Parlay Engine
                   </div>
                   <p className="text-[11px] text-slate-400 mt-0.5">
                     Combine multiple outcomes from this fixture into one slip with enhanced accumulative pricing.
                   </p>
                 </div>

                 <div className="flex items-center gap-3 self-end sm:self-center">
                   <div className="text-right">
                     <span className="text-[10px] uppercase font-bold text-slate-400 block">SGP Odds</span>
                     <span className="text-base font-black font-mono text-amber-400">
                       {calculatedSgpOdds.toFixed(2)}x
                     </span>
                   </div>

                   <button
                     onClick={handleAddSgpToSlip}
                     disabled={sgpSelections.length === 0}
                     className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                   >
                     {sgpAddedSuccess ? <Check size={14} /> : <Plus size={14} />}
                     {sgpAddedSuccess ? 'Added to Betslip!' : `Add SGP (${sgpSelections.length})`}
                   </button>
                 </div>
               </div>

               {/* SGP Category Pickers */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 {/* Market Winner */}
                 <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                   <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Match Winner</span>
                   <div className="space-y-1.5">
                     {[
                       { id: `sgp_m_1_${match.id}`, label: `${match.homeTeam.name} to Win`, odd: match.odds.main.find(o => o.label === '1')?.value || 1.85 },
                       { id: `sgp_m_x_${match.id}`, label: 'Full Time Draw', odd: match.odds.main.find(o => o.label === 'X')?.value || 3.10 },
                       { id: `sgp_m_2_${match.id}`, label: `${match.awayTeam.name} to Win`, odd: match.odds.main.find(o => o.label === '2')?.value || 2.40 },
                     ].map(leg => {
                       const isChosen = sgpSelections.some(s => s.id === leg.id);
                       return (
                         <button
                           key={leg.id}
                           onClick={() => toggleSgpLeg(leg)}
                           className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                             isChosen 
                               ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm' 
                               : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                           }`}
                         >
                           <span className="truncate mr-2">{leg.label}</span>
                           <span className="font-mono">{leg.odd.toFixed(2)}</span>
                         </button>
                       );
                     })}
                   </div>
                 </div>

                 {/* Total Goals */}
                 <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                   <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Total Score / Goals</span>
                   <div className="space-y-1.5">
                     {[
                       { id: `sgp_g_ov_${match.id}`, label: 'Over 2.5 Total Goals', odd: 1.76 },
                       { id: `sgp_g_un_${match.id}`, label: 'Under 2.5 Total Goals', odd: 1.95 },
                       { id: `sgp_g_ov3_${match.id}`, label: 'Over 3.5 Total Goals', odd: 2.55 },
                     ].map(leg => {
                       const isChosen = sgpSelections.some(s => s.id === leg.id);
                       return (
                         <button
                           key={leg.id}
                           onClick={() => toggleSgpLeg(leg)}
                           className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                             isChosen 
                               ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm' 
                               : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                           }`}
                         >
                           <span className="truncate mr-2">{leg.label}</span>
                           <span className="font-mono">{leg.odd.toFixed(2)}</span>
                         </button>
                       );
                     })}
                   </div>
                 </div>

                 {/* Both Teams To Score / Props */}
                 <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                   <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Special Propositions</span>
                   <div className="space-y-1.5">
                     {[
                       { id: `sgp_btts_y_${match.id}`, label: 'Both Teams to Score: Yes', odd: 1.72 },
                       { id: `sgp_btts_n_${match.id}`, label: 'Both Teams to Score: No', odd: 2.05 },
                       { id: `sgp_ht_lead_${match.id}`, label: `${match.homeTeam.name} Lead at Half`, odd: 2.40 },
                     ].map(leg => {
                       const isChosen = sgpSelections.some(s => s.id === leg.id);
                       return (
                         <button
                           key={leg.id}
                           onClick={() => toggleSgpLeg(leg)}
                           className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                             isChosen 
                               ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm' 
                               : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                           }`}
                         >
                           <span className="truncate mr-2">{leg.label}</span>
                           <span className="font-mono">{leg.odd.toFixed(2)}</span>
                         </button>
                       );
                     })}
                   </div>
                 </div>
               </div>
             </div>
           ) : hasOdds ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Main Market</h4>
                    <div className="grid grid-cols-3 gap-2">{match.odds.main.map(o => <OddButton key={o.id} odd={o} match={match} isSelected={selectedOdds.includes(o.id)} onClick={onOddClick} expanded />)}</div>
                </div>
                {match.odds.secondary.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Alternative</h4>
                        <div className="grid grid-cols-2 gap-2">{match.odds.secondary.map(o => <OddButton key={o.id} odd={o} match={match} isSelected={selectedOdds.includes(o.id)} onClick={onOddClick} expanded />)}</div>
                    </div>
                )}
               </div>
           ) : (
               <div className="text-center py-6 text-slate-500">
                   <Lock size={24} className="mx-auto mb-2 opacity-50" />
                   <p className="text-xs font-bold">Odds are currently unavailable for this event.</p>
               </div>
           )}
        </div>
      )}
    </div>
  );
});

export const MatchCardSkeleton = ({ variant = 'card' }: { variant?: 'card' | 'compact' }) => (
    <div className={`bg-slate-900 rounded-xl animate-pulse ${variant === 'card' ? 'h-24' : 'h-12'}`}></div>
);
export default MatchCard;
