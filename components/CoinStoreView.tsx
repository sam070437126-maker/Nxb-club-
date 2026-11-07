import React, { useState } from 'react';
import { Coins, Sparkles, Zap, ShieldCheck, Flame, Gift, Check, Clock, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface CoinStoreViewProps {
  currentCoins: number;
  user: UserProfile;
  onPurchaseCoins: (coins: number, priceUsd: number, packName: string) => void;
  onClaimDailyFaucet: (coins: number) => void;
  onOpenVipModal: () => void;
}

export const CoinStoreView: React.FC<CoinStoreViewProps> = ({
  currentCoins,
  user,
  onPurchaseCoins,
  onClaimDailyFaucet,
  onOpenVipModal
}) => {
  const [faucetClaimed, setFaucetClaimed] = useState(() => {
    const lastClaim = localStorage.getItem('nxb_last_faucet');
    if (!lastClaim) return false;
    const diffHours = (Date.now() - parseInt(lastClaim)) / (1000 * 60 * 60);
    return diffHours < 24;
  });

  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);

  const isPro = user.vipTier === 'pro' || user.vipTier === 'elite';
  const faucetAmount = isPro ? 500 : 250;

  const handleClaim = () => {
    if (faucetClaimed) return;
    localStorage.setItem('nxb_last_faucet', Date.now().toString());
    setFaucetClaimed(true);
    onClaimDailyFaucet(faucetAmount);
  };

  const PACKS = [
    {
      id: 'pack_starter',
      name: 'Starter Pack',
      coins: 2500,
      bonusCoins: 0,
      priceUsd: 4.99,
      icon: '🪙',
      tagline: 'Great for casual bets',
    },
    {
      id: 'pack_trader',
      name: 'Syndicate Trader',
      coins: 6000,
      bonusCoins: 1000,
      priceUsd: 9.99,
      icon: '🔥',
      isPopular: true,
      tagline: 'Most chosen bundle',
    },
    {
      id: 'pack_vault',
      name: 'High Roller Vault',
      coins: 18000,
      bonusCoins: 5000,
      priceUsd: 24.99,
      icon: '💎',
      isBestValue: true,
      tagline: 'Huge stack for leaderboards',
    },
    {
      id: 'pack_whale',
      name: 'Treasury Reserve',
      coins: 50000,
      bonusCoins: 15000,
      priceUsd: 49.99,
      icon: '👑',
      tagline: 'Maximum VIP dominance',
    }
  ];

  const handleBuy = (pack: typeof PACKS[0]) => {
    setPurchasingPack(pack.id);
    setTimeout(() => {
      onPurchaseCoins(pack.coins + pack.bonusCoins, pack.priceUsd, pack.name);
      setPurchasingPack(null);
      alert(`Success! ${pack.coins + pack.bonusCoins} NXB Coins added to your account.`);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
              <Coins size={14} /> Official NXB Coin Treasury
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Coins & Digital Reloads
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              NXB Coins are the official social wagering chips of the exchange. Compete on the leaderboard, unlock bragging rights, and test tactical sports predictions with zero cash loss risk.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center shrink-0 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Balance</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">🪙</span>
              <span className="text-3xl font-black font-mono text-amber-400">
                {currentCoins.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">NXB Credits</span>
          </div>
        </div>
      </div>

      {/* Daily Free Faucet Widget */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Gift size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white">Daily Community Coin Faucet</h3>
              {isPro && (
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                  2x Pro Boost Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Claim <span className="text-amber-400 font-bold">+{faucetAmount} free NXB coins</span> every 24 hours to stay active in the game.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isPro && (
            <button 
              onClick={onOpenVipModal}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Get 2x as Pro
            </button>
          )}
          <button
            onClick={handleClaim}
            disabled={faucetClaimed}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              faucetClaimed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {faucetClaimed ? (
              <>
                <Clock size={14} /> Claimed (Come back tomorrow)
              </>
            ) : (
              <>
                <Zap size={14} /> Claim +{faucetAmount} Coins
              </>
            )}
          </button>
        </div>
      </div>

      {/* Packs Grid */}
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
        Select Coin Package
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {PACKS.map(pack => (
          <div
            key={pack.id}
            className={`relative bg-slate-900 rounded-2xl p-6 border transition-all flex flex-col justify-between ${
              pack.isPopular 
                ? 'border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500' 
                : pack.isBestValue 
                ? 'border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {pack.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Flame size={10} fill="currentColor" /> Popular
              </div>
            )}
            {pack.isBestValue && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles size={10} /> Best Value
              </div>
            )}

            <div>
              <div className="text-3xl mb-3">{pack.icon}</div>
              <h3 className="font-black text-base text-white">{pack.name}</h3>
              <p className="text-[11px] text-slate-400 mb-4">{pack.tagline}</p>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-4">
                <div className="text-xl font-black font-mono text-amber-400">
                  {(pack.coins + pack.bonusCoins).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                  <span>Base: {pack.coins.toLocaleString()}</span>
                  {pack.bonusCoins > 0 && (
                    <span className="text-emerald-400 font-bold">+{pack.bonusCoins.toLocaleString()} FREE</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="text-center mb-3">
                <span className="text-2xl font-black text-white">${pack.priceUsd.toFixed(2)}</span>
                <span className="text-slate-500 text-xs ml-1 font-bold">USD</span>
              </div>

              <button
                onClick={() => handleBuy(pack)}
                disabled={purchasingPack === pack.id}
                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  pack.isPopular
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95'
                }`}
              >
                {purchasingPack === pack.id ? 'Processing...' : 'Purchase Pack'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Legal & Compliance Notice */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-slate-400 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Institutional Social Gaming Solvency Guarantee</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          NXB Coins are digital entertainment tokens utilized exclusively for social wagering simulations, community tournaments, and statistical predictions. Coins cannot be converted to fiat currency, eliminating counterparty credit risk and maintaining 100% platform solvency.
        </p>
      </div>

    </div>
  );
};

export default CoinStoreView;
