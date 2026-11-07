
import React, { useState, useEffect } from 'react';
import { BetSelection, PlacedBet } from '../types';
import { Trash2, ChevronDown, Ticket, Wallet, Loader2, CheckCircle2 } from 'lucide-react';

interface BetslipItemProps {
  selection: BetSelection;
  onRemove: (id: string) => void;
}

const BetslipItem: React.FC<BetslipItemProps> = ({ selection, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    // Wait for animation to finish (300ms matches transition duration)
    setTimeout(() => {
      onRemove(selection.selectionId);
    }, 300);
  };

  return (
    <div 
      className={`
        bg-slate-800 rounded-lg border border-slate-700 relative group overflow-hidden
        transition-all duration-300 ease-in-out origin-right
        ${isExiting 
          ? 'opacity-0 translate-x-12 max-h-0 py-0 mb-0 border-transparent' 
          : 'opacity-100 translate-x-0 max-h-[200px] p-3 mb-3 animate-slideInRight'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{selection.selectionLabel}</span>
        <button 
          onClick={handleRemove}
          className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-slate-700/50 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="text-sm text-slate-200 font-medium line-clamp-1 mb-2">{selection.matchTitle}</div>
      <div className="flex justify-between items-center bg-slate-900/50 rounded px-2 py-1">
        <span className="text-xs text-slate-400">{selection.marketType}</span>
        <span className="font-bold text-emerald-400">{selection.oddValue.toFixed(2)}</span>
      </div>
    </div>
  );
};

interface BetslipProps {
  selections: BetSelection[];
  onRemove: (id: string) => void;
  onClear: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (val: boolean) => void;
  onPlaceBet: (bet: PlacedBet) => void;
  defaultStake?: number;
  currencySymbol?: string;
  maxStake?: number;
  maxPayoutCap?: number;
  emergencyFreeze?: boolean;
}

const Betslip: React.FC<BetslipProps> = ({ 
  selections, 
  onRemove, 
  onClear, 
  isOpenMobile, 
  setIsOpenMobile, 
  onPlaceBet, 
  defaultStake = 25, 
  currencySymbol = '🪙 ',
  maxStake = 100,
  maxPayoutCap = 2500,
  emergencyFreeze = false
}) => {
  const [stake, setStake] = useState<string>(defaultStake.toString());
  const [placed, setPlaced] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Update local stake when defaultStake prop changes
  useEffect(() => {
    setStake(defaultStake.toString());
  }, [defaultStake]);

  const totalOdds = selections.reduce((acc, curr) => acc * curr.oddValue, 1);
  const numericStake = parseFloat(stake || '0');
  const rawWin = numericStake * totalOdds;
  const isCapped = rawWin > maxPayoutCap;
  const potentialWin = Math.min(rawWin, maxPayoutCap).toFixed(2);
  const count = selections.length;
  const isOverMaxStake = numericStake > maxStake;

  const handlePlaceBet = () => {
    if (count === 0 || emergencyFreeze || isOverMaxStake || numericStake <= 0) return;
    setPlaced(true);
    
    // Create ticket object
    const newBet: PlacedBet = {
        id: `bet-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        selections: [...selections],
        stake: numericStake,
        totalOdds: totalOdds,
        potentialReturn: parseFloat(potentialWin),
        status: 'open',
        placedAt: new Date().toISOString(),
        cashOutOffer: numericStake // Start offer at stake amount
    };

    // Simulate API Network Request
    setTimeout(() => {
      setPlaced(false);
      setIsSuccess(true);
      onPlaceBet(newBet);
      
      // Clear after showing success message
      setTimeout(() => {
        setIsSuccess(false);
        onClear();
        // Close mobile betslip automatically on success
        if (window.innerWidth < 768) {
             setIsOpenMobile(false);
        }
      }, 1500);
    }, 1200);
  };

  // Quick stake buttons for micro-wagering
  const stakes = ['10', '25', '50', '100'];

  return (
    <>
      {/* Mobile Toggle Button (Fixed Bottom Right) */}
      <div className={`fixed bottom-20 right-4 z-40 md:hidden transition-all duration-300 ${count === 0 ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <button 
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="bg-emerald-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-emerald-500/40 relative animate-bounceShort"
        >
          <Ticket size={24} />
          <span 
            key={count} 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-[ping_0.5s_ease-out]"
          >
            {count}
          </span>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 right-0 w-full md:w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:static md:block
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500"></div>
            <div className="relative z-10 flex items-center gap-2">
               <span className="bg-white/20 p-1.5 rounded-full"><Ticket size={18} /></span>
               <h2 className="font-bold text-lg tracking-wide">BETSLIP</h2>
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <span className="bg-emerald-800/50 px-2 py-1 rounded text-xs font-mono transition-all key={count}">{count} Items</span>
              <button onClick={() => setIsOpenMobile(false)} className="md:hidden hover:bg-white/20 rounded p-1">
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Selections List */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-900 scroll-smooth">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60 animate-[fadeIn_0.5s]">
                <Ticket size={48} className="mb-4" />
                <p className="font-medium">Your betslip is empty</p>
                <p className="text-xs text-center mt-2 max-w-[200px]">Select odds from any match to start building your bet.</p>
              </div>
            ) : (
              // Note: We don't map with index as key to ensure stable identity for removal animations
              selections.map((sel) => (
                <BetslipItem 
                  key={sel.selectionId} 
                  selection={sel} 
                  onRemove={onRemove} 
                />
              ))
            )}
          </div>

          {/* Footer / Calculation */}
          {count > 0 && (
            <div className="bg-slate-800 p-4 border-t border-slate-700 animate-[slideInUp_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-4 text-slate-300">
                <span className="text-sm">Total Odds</span>
                <span className="font-bold text-emerald-400 text-lg">{totalOdds.toFixed(2)}</span>
              </div>
              
              <div className="mb-4">
                 <div className="flex justify-between text-xs text-slate-400 mb-1">
                   <span>Stake Amount</span>
                   <span className="text-amber-400 font-bold">Max Limit: {maxStake} Coins</span>
                 </div>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                     {currencySymbol}
                   </div>
                   <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className={`w-full bg-slate-900 text-white pl-8 pr-4 py-3 rounded-lg border outline-none font-bold transition-all ${
                      isOverMaxStake ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-600 focus:border-amber-500'
                    }`}
                   />
                 </div>
                 {isOverMaxStake && (
                   <div className="text-[10px] text-red-400 font-bold mt-1">
                     ⚠️ Stake exceeds the maximum platform limit of {maxStake} Coins.
                   </div>
                 )}
                 <div className="flex gap-2 mt-2">
                    {stakes.map(s => (
                      <button 
                        key={s} 
                        onClick={() => setStake(s)}
                        className={`flex-1 text-xs py-1.5 rounded transition-all transform active:scale-95 ${stake === s ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">Potential Return</span>
                  <span className="font-bold text-amber-400 text-xl font-mono">{currencySymbol}{potentialWin}</span>
                </div>
                {isCapped && (
                  <span className="text-[9px] text-amber-300 mt-1">
                    ⚡ Maximum Ticket Payout Capped at {maxPayoutCap} Coins (Solvency Guarantee Protocol)
                  </span>
                )}
              </div>

              {emergencyFreeze && (
                <div className="p-2 mb-3 rounded bg-red-950/60 border border-red-500/40 text-red-400 text-[11px] font-bold text-center">
                  🔒 Markets are temporarily frozen by the operator.
                </div>
              )}

              <button
                onClick={handlePlaceBet}
                disabled={placed || isSuccess || isOverMaxStake || emergencyFreeze || numericStake <= 0}
                className={`
                  w-full py-3.5 rounded-lg font-bold text-white text-lg shadow-lg transform transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50
                  ${isSuccess 
                    ? 'bg-green-500 shadow-green-500/30' 
                    : placed 
                      ? 'bg-slate-600 cursor-not-allowed' 
                      : emergencyFreeze || isOverMaxStake
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-amber-500/30 hover:brightness-110'}
                `}
              >
                 {isSuccess ? (
                    <div className="flex items-center gap-2 animate-[slideInUp_0.3s]">
                      <CheckCircle2 size={24} />
                      <span>Bet Placed!</span>
                    </div>
                  ) : placed ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={24} className="animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>PLACE BET</span>
                  )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Betslip;
