import React, { useState } from 'react';
import { PlacedBet } from '../types';
import { Trophy, Clock, CheckCircle2, XCircle, AlertCircle, Coins, ArrowRight, History, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

interface MyBetsProps {
  bets: PlacedBet[];
  onCashOut: (betId: string, amount: number) => void;
  cashOutFeePercent?: number;
}

const MyBets: React.FC<MyBetsProps> = ({ bets, onCashOut, cashOutFeePercent = 20 }) => {
  const [activeTab, setActiveTab] = useState<'open' | 'settled'>('open');
  const [cashOutLoaders, setCashOutLoaders] = useState<Record<string, boolean>>({});
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const openBets = bets.filter(b => b.status === 'open');
  const settledBets = bets.filter(b => b.status !== 'open');
  const currentList = activeTab === 'open' ? openBets : settledBets;

  const calculateCashOut = (bet: PlacedBet) => {
    if (bet.cashOutOffer) return bet.cashOutOffer;
    // House retention haircut: (100 - cashOutFeePercent)%
    const retentionRate = Math.max(0.5, (100 - cashOutFeePercent) / 100);
    // Multiply stake by retention rate
    return parseFloat((bet.stake * retentionRate).toFixed(2));
  };

  const handleCashOutClick = (bet: PlacedBet) => {
    setCashOutLoaders(prev => ({ ...prev, [bet.id]: true }));
    
    // Simulate real-time exchange settlement
    setTimeout(() => {
      const amount = calculateCashOut(bet);
      onCashOut(bet.id, amount);
      setCashOutLoaders(prev => ({ ...prev, [bet.id]: false }));

      // Show Success Notification
      setSuccessNotification(`Cashed out 🪙 ${amount.toFixed(2)} NXB Coins successfully!`);
      setTimeout(() => setSuccessNotification(null), 3500);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Success Notification Toast */}
      {successNotification && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-emerald-500 text-slate-950 px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] animate-in fade-in slide-in-from-top-4 duration-300 border border-emerald-400/50 backdrop-blur-md">
            <div className="bg-slate-950 rounded-full p-1 text-emerald-400">
               <CheckCircle2 size={16} strokeWidth={3} />
            </div>
            <span className="font-black text-xs uppercase tracking-wide">{successNotification}</span>
         </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
         <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="text-amber-400" /> My Wagers & Tickets
         </h2>
         <div className="bg-slate-800 p-1 rounded-xl flex text-xs font-bold border border-slate-700">
            <button 
               onClick={() => setActiveTab('open')}
               className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'open' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
               Open Active ({openBets.length})
            </button>
            <button 
               onClick={() => setActiveTab('settled')}
               className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'settled' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
               Settled Archive ({settledBets.length})
            </button>
         </div>
      </div>

      {/* List */}
      <div className="space-y-4 px-4 md:px-0">
        {currentList.length === 0 ? (
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-4 text-slate-600">
                 <Trophy size={32} />
              </div>
              <p className="font-bold text-base text-slate-300">No {activeTab} tickets found</p>
              <p className="text-xs text-slate-500 mt-1">Browse live sports or build a parlay to view active wagers.</p>
           </div>
        ) : (
           currentList.map(bet => {
              const cashOffer = calculateCashOut(bet);
              return (
              <div key={bet.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
                 
                 {/* Ticket Header */}
                 <div className="bg-slate-950/60 p-3.5 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${bet.status === 'open' ? 'bg-emerald-400 animate-pulse' : bet.status === 'won' ? 'bg-green-400' : bet.status === 'lost' ? 'bg-red-400' : 'bg-slate-400'}`}></span>
                       <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                          {bet.selections.length > 1 ? `Multi-Leg Parlay (${bet.selections.length} Legs)` : 'Single Ticket'}
                       </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                       ID: {bet.id.slice(-8)} • {new Date(bet.placedAt).toLocaleDateString()}
                    </span>
                 </div>

                 {/* Selections */}
                 <div className="p-4 space-y-3">
                    {bet.selections.map((sel, idx) => (
                       <div key={idx} className="flex justify-between items-start group bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                          <div className="flex-1 mr-3">
                             <div className="text-xs font-black text-slate-200 group-hover:text-amber-400 transition-colors">{sel.selectionLabel}</div>
                             <div className="text-[10px] text-slate-500 uppercase">{sel.marketType}</div>
                             <div className="text-xs text-slate-400 mt-0.5">{sel.matchTitle}</div>
                          </div>
                          <div className="bg-slate-800 px-2.5 py-1 rounded-lg text-amber-400 font-mono font-bold text-xs border border-slate-700">
                             {sel.oddValue.toFixed(2)}x
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Footer & Actions */}
                 <div className="bg-slate-950/40 p-4 border-t border-slate-800/80">
                    <div className="flex justify-between items-end mb-4">
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black mb-0.5">Total Stake</div>
                          <div className="text-white font-mono font-black text-base flex items-center gap-1">
                            🪙 {bet.stake.toLocaleString()}
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-black mb-0.5">Potential Return</div>
                          <div className={`font-mono font-black text-lg flex items-center justify-end gap-1 ${bet.status === 'won' ? 'text-emerald-400' : 'text-amber-400'}`}>
                             🪙 {bet.potentialReturn.toLocaleString()}
                          </div>
                       </div>
                    </div>

                     {/* Cash Out & Share Action */}
                     <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                           <button
                              onClick={() => {
                                 const shareText = `🔥 Check out my Nexus Syndicate Slip (${bet.selections.length} legs @ ${bet.totalOdds.toFixed(2)}x)! Stake: 🪙${bet.stake} -> Potential Return: 🪙${bet.potentialReturn}`;
                                 if (navigator.clipboard) {
                                    navigator.clipboard.writeText(shareText);
                                 }
                                 setSuccessNotification(`Copied Ticket to clipboard! Share on X / Telegram / Lounge.`);
                                 setTimeout(() => setSuccessNotification(null), 3500);
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700/60"
                              title="Share slip"
                           >
                              <Sparkles size={13} className="text-amber-400" /> Share Slip
                           </button>
                           {bet.status === 'open' && (
                              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-amber-400/90 font-medium">
                                 <Clock size={12} className="animate-spin text-amber-400" /> Live Market Active
                              </span>
                           )}
                        </div>

                        {bet.status === 'open' && (
                           <button 
                              onClick={() => handleCashOutClick(bet)}
                              disabled={cashOutLoaders[bet.id]}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-amber-500/20 disabled:opacity-50"
                           >
                              {cashOutLoaders[bet.id] ? (
                                 <Loader2 size={14} className="animate-spin" />
                              ) : (
                                 <Coins size={14} />
                              )}
                              Cash Out 🪙 {cashOffer.toFixed(2)}
                           </button>
                        )}
                     </div>
                     
                     {/* Status Badges for Settled */}
                     {bet.status === 'won' && (
                        <div className="mt-3 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border border-emerald-500/20">
                           <CheckCircle2 size={16} /> Ticket Won & Settled (+🪙{bet.potentialReturn.toFixed(2)})
                        </div>
                     )}
                     {bet.status === 'lost' && (
                        <div className="mt-3 flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border border-rose-500/20">
                           <XCircle size={16} /> Ticket Settled (No Payout)
                        </div>
                     )}
                     {bet.status === 'cashed_out' && (
                         <div className="mt-3 flex items-center justify-center gap-2 bg-slate-800 text-slate-400 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-700">
                            <Coins size={15} /> Early Settlement Executed
                         </div>
                     )}
                  </div>
               </div>
            );})
        )}
      </div>
    </div>
  );
};

export default MyBets;