
import React, { useState, useEffect, useRef } from 'react';
import { Match } from '../types';
import { fetchJackpotMatches } from '../services/footballApi';
import { Trophy, Timer, Check, Loader2, Award, Zap, Lock, Unlock, Wand2, RefreshCw, Coins, ShieldCheck, Users, TrendingUp, MessageCircle } from 'lucide-react';

const SYNDICATE_NAMES = ["Viper Squad", "Neon Lions", "Delta Force", "The Whales", "Cyber Punks", "Crypto Kings"];
const RECENT_WINNERS = ["Alex K.", "Sarah J.", "Mike_88", "BigBen", "Dr.Disrespect"];

const SyndicateTicker = () => {
  const [entry, setEntry] = useState("Waiting for network...");

  useEffect(() => {
    const actions = [
      () => `${RECENT_WINNERS[Math.floor(Math.random()*RECENT_WINNERS.length)]} just joined the pool!`,
      () => `New Entry: +₦100 added to pot`,
      () => `Syndicate Pool grew by 1.5% in last minute`,
      () => `${SYNDICATE_NAMES[Math.floor(Math.random()*SYNDICATE_NAMES.length)]} is dominating selections`
    ];

    const interval = setInterval(() => {
      setEntry(actions[Math.floor(Math.random() * actions.length)]());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20 animate-in fade-in slide-in-from-right duration-500">
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
      {entry}
    </div>
  );
};

const JackpotGame: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, '1' | 'X' | '2'>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [poolAmount, setPoolAmount] = useState(50000000);
  const [participants, setParticipants] = useState(1243);

  // Live Pool Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        // Randomly increase pool and participants to simulate live activity
        if (Math.random() > 0.6) {
            setParticipants(p => p + 1);
            setPoolAmount(a => a + 100);
        }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Real Data on Mount
  useEffect(() => {
    const init = async () => {
        const data = await fetchJackpotMatches();
        setMatches(data);
        setLoading(false);
    };
    init();
  }, []);

  const totalMatches = matches.length;
  const selectedCount = Object.keys(selections).length;
  const isComplete = totalMatches > 0 && selectedCount === totalMatches;

  const handleSelect = (matchId: string, value: '1' | 'X' | '2') => {
    if (locked[matchId]) return;
    // Haptic Feedback
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
    setSelections(prev => ({ ...prev, [matchId]: value }));
  };

  const toggleLock = (matchId: string) => {
    if (!selections[matchId]) return;
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
    setLocked(prev => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const handleAutoPick = (mode: 'all' | 'remaining') => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(30);
    const newSelections = { ...selections };
    matches.forEach(match => {
      if (locked[match.id]) return; 
      if (mode === 'remaining' && newSelections[match.id]) return;
      const options: ('1' | 'X' | '2')[] = ['1', 'X', '2'];
      newSelections[match.id] = options[Math.floor(Math.random() * 3)];
    });
    setSelections(newSelections);
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }, 2000);
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="animate-spin mb-4 text-amber-500" size={48} />
              <p className="font-black uppercase tracking-widest text-xs">Connecting to Syndicate Network...</p>
          </div>
      );
  }

  if (matches.length === 0) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 pt-20">
              <Trophy className="mb-4 text-slate-800" size={64} />
              <h2 className="text-white font-bold text-xl">Syndicate Pool Closed</h2>
              <p className="text-xs mt-2">The network is generating new events. Stand by.</p>
          </div>
      );
  }

  return (
    <div className="bg-slate-950 pb-32 animate-in fade-in duration-700">
      
      {/* Immersive Header */}
      <div className="relative bg-slate-900 border-b border-slate-800 pb-12 pt-8 overflow-hidden">
         {/* Animated Background */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>

         <div className="relative z-10 px-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-3">
                     <Trophy className="text-black" size={24} />
                  </div>
                  <div>
                     <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Syndicate Clash</h1>
                     <p className="text-amber-500 text-xs font-bold tracking-widest uppercase">Weekly Mega Pool</p>
                  </div>
               </div>
               <SyndicateTicker />
            </div>

            <div className="bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Current Live Pot</p>
               <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-2xl">
                  ₦{poolAmount.toLocaleString()}
               </div>
               <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                     <Users size={14} className="text-emerald-500" />
                     <span className="text-white text-xs font-bold">{participants.toLocaleString()} Joined</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                     <Timer size={14} className="text-amber-500" />
                     <span className="text-white text-xs font-bold">Ends in 2d 14h</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Control Deck */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 py-4 px-4 shadow-2xl">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
               <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-500"
                    style={{ width: `${(selectedCount / totalMatches) * 100}%` }}
                  ></div>
               </div>
               <div className="flex justify-between mt-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Progress</span>
                  <span className={`text-[9px] font-bold ${isComplete ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedCount}/{totalMatches} Picks</span>
               </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => handleAutoPick('remaining')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-amber-500 transition-colors" title="Magic Fill">
                  <Wand2 size={18} />
               </button>
               <button onClick={() => handleAutoPick('all')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-emerald-500 transition-colors" title="Shuffle All">
                  <RefreshCw size={18} />
               </button>
            </div>
         </div>
      </div>

      {/* Match Grid */}
      <div className="px-4 max-w-4xl mx-auto mt-8 space-y-4">
        {matches.map((match, index) => {
          const isLocked = locked[match.id];
          const hasSelection = !!selections[match.id];
          return (
            <div 
               key={match.id} 
               className={`relative rounded-2xl p-4 md:p-6 border transition-all duration-300 group
                  ${isLocked ? 'bg-amber-950/10 border-amber-500/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
               `}
            >
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Match {index + 1}</span>
                  <button 
                     onClick={() => toggleLock(match.id)}
                     className={`transition-colors ${isLocked ? 'text-amber-500' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                     {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
               </div>

               <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex-1 flex items-center gap-3">
                     <img src={match.homeTeam.logo} alt="" className="w-8 h-8 object-contain" />
                     <span className="text-sm font-bold text-white leading-tight">{match.homeTeam.name}</span>
                  </div>
                  <div className="text-slate-700 font-black text-xs italic">VS</div>
                  <div className="flex-1 flex items-center justify-end gap-3 text-right">
                     <span className="text-sm font-bold text-white leading-tight">{match.awayTeam.name}</span>
                     <img src={match.awayTeam.logo} alt="" className="w-8 h-8 object-contain" />
                  </div>
               </div>

               {/* Selection Buttons */}
               <div className="grid grid-cols-3 gap-2">
                  {(['1', 'X', '2'] as const).map(option => {
                    const active = selections[match.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelect(match.id, option)}
                        className={`
                          py-3 rounded-lg font-black text-xs transition-all duration-200 active:scale-95
                          ${active 
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                            : 'bg-slate-950 text-slate-500 hover:bg-slate-800 hover:text-white'}
                        `}
                      >
                         {option === '1' ? 'HOME' : option === '2' ? 'AWAY' : 'DRAW'}
                      </button>
                    );
                  })}
               </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 p-4 pb-8 z-40">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
            <div className="hidden sm:block">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Cost</p>
               <p className="text-xl font-black text-white">₦100.00</p>
            </div>
            
            <button 
               onClick={handleSubmit}
               disabled={!isComplete || isSubmitting || success}
               className={`
                  flex-1 h-14 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3
                  ${success ? 'bg-emerald-500 text-white' : 
                    isComplete ? 'bg-white text-black hover:bg-slate-200' : 
                    'bg-slate-800 text-slate-600 cursor-not-allowed'}
               `}
            >
               {success ? (
                  <><Award className="animate-bounce" /> Joined!</>
               ) : isSubmitting ? (
                  <><Loader2 className="animate-spin" /> Minting Ticket...</>
               ) : (
                  <><Zap size={18} fill={isComplete ? "currentColor" : "none"} /> {isComplete ? "JOIN SYNDICATE" : `${totalMatches - selectedCount} PICKS LEFT`}</>
               )}
            </button>
         </div>
      </div>
    </div>
  );
};

export default JackpotGame;
