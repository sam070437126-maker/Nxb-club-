import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SPORTS } from './constants';
import { BetSelection, SportCategory, Match, PlacedBet, AppView, AppSettings, Transaction, UserProfile, PlatformRiskSettings, VipTier } from './types';
import Betslip from './components/Betslip';
import MyBets from './components/MyBets';
import MenuDrawer from './components/MenuDrawer';
import SportsView from './components/SportsView'; 
import AiConcierge from './components/AiConcierge';
import GlobalWinFeed from './components/GlobalWinFeed';
import { SecurityCenter } from './components/SecurityCenter';
import { Confetti, CountUp } from './components/UiEffects';
import { DepositView, WithdrawView, ProfileView, TransactionsView, HelpView, ResponsibleGamingView, SettingsView, VerificationView, BonusView, getCurrencySymbol } from './components/AccountViews';
import { AdminDashboard } from './components/AdminDashboard';
import VipSubscriptionModal from './components/VipSubscriptionModal';
import CoinStoreView from './components/CoinStoreView';
import LeaderboardView from './components/LeaderboardView';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import SocialFeedView from './components/SocialFeedView';
import { Menu, Sparkles, Home, PieChart, MenuSquare, RefreshCw, WifiOff, Trophy, Crown, Coins, ShieldAlert, ShieldCheck, Lock, Megaphone, Gift, MessageSquare } from 'lucide-react';
import JackpotGame from './components/JackpotGame';

// Firebase Imports
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, push, update } from 'firebase/database';

// API Service
import { fetchAllMatches, fetchBasketballMatches } from './services/footballApi';

interface WalletState {
  main: number;
  bonus: number;
}

const DEFAULT_USER = {
  uid: 'admin_samuel',
  email: 'samuelemma466@gmail.com',
  displayName: 'Samuel Emmanuel',
  emailVerified: true
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'admin_samuel',
  name: 'Samuel Emmanuel',
  email: 'samuelemma466@gmail.com',
  phone: '+1 (555) 234-5678',
  avatar: 'SE',
  level: 5,
  joinDate: new Date().getFullYear().toString(),
  kycStatus: 'verified',
  vipTier: 'pro',
  nxbCoins: 3500,
  dailyStreak: 3,
  lastDailyClaim: '',
  bettorProfile: 'recreational'
};

const DEFAULT_RISK_SETTINGS: PlatformRiskSettings = {
  oddsMultiplier: 0.88,
  maxStake: 100,
  minStake: 5,
  maxPayoutCap: 2500,
  cashOutFeePercent: 20,
  sgpMarginMultiplier: 0.82,
  emergencyFreeze: false,
  announcementBanner: 'Institutional Social Gaming Solvency Guarantee: Zero counterparty credit risk. 100% Capped wagers.'
};

const App: React.FC = () => {
  // --- AUTH STATE (Direct Operator Access) ---
  const [currentUser, setCurrentUser] = useState<any>(DEFAULT_USER);
  const [isAuthenticated] = useState(true);
  
  // --- APP STATE ---
  const [activeCategory, setActiveCategory] = useState<SportCategory>(() => 
    (localStorage.getItem('nxb_activeCategory') as SportCategory) || 'Soccer'
  );
  
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [currentView, setCurrentView] = useState<AppView>('sports');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [isMobileBetslipOpen, setIsMobileBetslipOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isDailyRewardsOpen, setIsDailyRewardsOpen] = useState(false);

  // Platform Risk Settings (Operator Governed)
  const [riskSettings, setRiskSettings] = useState<PlatformRiskSettings>(() => {
    const saved = localStorage.getItem('nxb_risk_settings');
    if (saved) {
      try { return { ...DEFAULT_RISK_SETTINGS, ...JSON.parse(saved) }; } catch (e) {}
    }
    return DEFAULT_RISK_SETTINGS;
  });

  const [myBets, setMyBets] = useState<PlacedBet[]>(() => {
    const saved = localStorage.getItem('nxb_bets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('nxb_wallet');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { main: 3500, bonus: 500 };
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nxb_profile');
    if (saved) {
      try { return { ...DEFAULT_PROFILE, ...JSON.parse(saved) }; } catch (e) {}
    }
    return DEFAULT_PROFILE;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nxb_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'tx_init',
        type: 'Deposit',
        method: 'Welcome Faucet',
        amount: 3500,
        date: new Date().toISOString(),
        status: 'Success'
      }
    ];
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [appToast, setAppToast] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);

  const showAppToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setAppToast({ message, type });
    setTimeout(() => setAppToast(null), 3500);
  };

  // Sync state to localStorage for offline / persistence
  useEffect(() => {
    localStorage.setItem('nxb_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('nxb_bets', JSON.stringify(myBets));
  }, [myBets]);

  useEffect(() => {
    localStorage.setItem('nxb_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nxb_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('nxb_risk_settings', JSON.stringify(riskSettings));
  }, [riskSettings]);
  
  // Data State
  const [rawMatches, setRawMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    oddsFormat: 'decimal',
    defaultStake: 25,
    autoAcceptOdds: false,
    privacyMode: false,
    language: 'en-US',
    country: 'US',
    currency: 'USD',
    notifications: { marketing: true, matchEvents: true, betSettled: true }
  });

  // Ref to track refreshing state across intervals
  const isRefreshingRef = useRef(false);
  const retryCountRef = useRef(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const activeCategoryRef = useRef(activeCategory);

  const currencySymbol = '🪙 ';

  useEffect(() => { 
    localStorage.setItem('nxb_activeCategory', activeCategory); 
    activeCategoryRef.current = activeCategory;
    
    if (!isRefreshingRef.current) {
       setMatchesLoading(true);
       loadSportsData();
    }
  }, [activeCategory]);
  
  useEffect(() => {
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.theme]);

  const scheduleNextFetch = (hasError: boolean) => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      
      let nextDelay = 900000; // Base delay: 15 minutes to preserve API quota
      if (hasError) {
          retryCountRef.current += 1;
          nextDelay = Math.min(900000 * Math.pow(2, retryCountRef.current), 1800000);
      } else {
          retryCountRef.current = 0;
      }
      
      timeoutIdRef.current = setTimeout(() => {
          loadSportsData();
      }, nextDelay);
  };

  // --- DATA FETCHING ---
  const loadSportsData = async (forceRefresh = false) => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      
      setIsRefreshing(true);
      setFetchError(false);
      let hasError = false;

      try {
          const cat = activeCategoryRef.current;
          const data = cat === 'Basketball' ? await fetchBasketballMatches(forceRefresh) : await fetchAllMatches(cat as any, forceRefresh);
          if (data && data.length > 0) {
              setRawMatches(data);
          } else {
              hasError = true;
              setFetchError(true);
              setRawMatches([]);
          }
      } catch (e) {
          hasError = true;
          setFetchError(true);
          setRawMatches([]);
      }
      
      setMatchesLoading(false);
      setIsRefreshing(false);
      isRefreshingRef.current = false;

      scheduleNextFetch(hasError);
  };

  // Apply House Odds Haircut from Platform Risk Settings
  const matches = useMemo(() => {
    const mult = riskSettings.oddsMultiplier || 0.88;
    return rawMatches.map(m => ({
      ...m,
      odds: {
        main: m.odds.main.map(o => ({
          ...o,
          value: parseFloat(Math.max(1.05, o.value * mult).toFixed(2))
        })),
        secondary: m.odds.secondary.map(o => ({
          ...o,
          value: parseFloat(Math.max(1.05, o.value * mult).toFixed(2))
        }))
      }
    }));
  }, [rawMatches, riskSettings.oddsMultiplier]);

  // --- AUTH & DATA INIT ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        initUserData(user).catch(console.error);
      } else {
        setCurrentUser(DEFAULT_USER);
        initUserData(DEFAULT_USER as any).catch(console.error);
      }
    });

    loadSportsData();

    return () => {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        unsubscribeAuth();
    };
  }, []);

  const initUserData = async (user: any) => {
      const uid = user.uid || 'admin_samuel';
      try {
        onValue(ref(db, `users/${uid}/profile`), (snapshot) => {
            const val = snapshot.val();
            if (val) setUserProfile(prev => ({ ...prev, ...val }));
        });
        onValue(ref(db, `users/${uid}/wallet`), (s) => {
            const v = s.val();
            if (v && v.main !== undefined) setWallet({ main: Number(v.main), bonus: Number(v.bonus || 0) });
        });
        onValue(ref(db, `bets/${uid}`), (s) => {
            if (s.exists()) setMyBets(Object.keys(s.val()).map(k => ({ ...s.val()[k], id: k })).sort((a,b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));
        });
        onValue(ref(db, `transactions/${uid}`), (s) => {
            if (s.exists()) setTransactions(Object.keys(s.val()).map(k => ({ ...s.val()[k], id: k })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        });
      } catch (e) {
        console.warn("RTDB subscription note:", e);
      }
  };

  const handleLogout = () => {
    setWallet({ main: 3500, bonus: 500 });
    setMyBets([]);
    setSelections([]);
    alert("Demo wallet refreshed to 3,500 NXB Coins!");
  };

  const triggerWin = async (amount: number, type: string) => {
    setShowConfetti(true);
    const updatedMain = wallet.main + amount;
    setWallet(prev => ({ ...prev, main: updatedMain }));
    const tx: Transaction = {
       id: `tx_${Date.now()}`,
       type: 'Bet Win',
       method: type,
       amount,
       date: new Date().toISOString(),
       status: 'Success'
    };
    setTransactions(prev => [tx, ...prev]);

    if (currentUser?.uid) {
       try {
          await update(ref(db, `users/${currentUser.uid}/wallet`), { main: updatedMain });
          const txRef = push(ref(db, `transactions/${currentUser.uid}`));
          await set(txRef, tx);
       } catch (e) {}
    }
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handlePlaceBet = async (bet: PlacedBet) => {
    if (riskSettings.emergencyFreeze) {
      showAppToast("Platform markets are temporarily frozen by the operator. Please try again shortly.", "error");
      return;
    }
    if (bet.stake > riskSettings.maxStake) {
      showAppToast(`Stake exceeds the maximum allowed limit of ${riskSettings.maxStake} Coins.`, "error");
      return;
    }
    if (wallet.main < bet.stake) {
      setIsVipModalOpen(false);
      setCurrentView('coin-store');
      showAppToast("Insufficient NXB Coins! Visit the Coin Store to reload your stack.", "error");
      return;
    }

    const updatedMain = wallet.main - bet.stake;
    setWallet(prev => ({ ...prev, main: updatedMain }));
    setMyBets(prev => [bet, ...prev]);
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'Bet Placement',
      amount: bet.stake,
      date: new Date().toISOString(),
      status: 'Success',
      method: 'NXB Sovereign Exchange'
    };
    setTransactions(prev => [tx, ...prev]);

    if (currentUser?.uid) {
       try {
          await update(ref(db, `users/${currentUser.uid}/wallet`), { main: updatedMain });
          await set(push(ref(db, `bets/${currentUser.uid}`)), bet);
          await set(push(ref(db, `transactions/${currentUser.uid}`)), tx);
       } catch (e) {}
    }
    showAppToast("Wager submitted successfully! Good luck.", "success");
  };

  const handleOddClick = (selection: BetSelection) => {
    setSelections(prev => prev.some(x => x.selectionId === selection.selectionId) ? prev.filter(x => x.selectionId !== selection.selectionId) : [...prev, selection]);
  };

  // Match Event & Fixture Handlers (Operator Governed)
  const handleUpdateMatch = (updatedMatch: Match) => {
    setRawMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  };

  const handleSettleMatchBets = (matchId: string, winningOutcome: '1' | 'X' | '2') => {
    setMyBets(prev => prev.map(bet => {
      if (bet.status !== 'open') return bet;
      const matchSelection = bet.selections.find(s => s.matchId === matchId);
      if (!matchSelection) return bet;

      const label = matchSelection.selectionLabel.trim();
      const isWinner = label === winningOutcome || label.startsWith(winningOutcome);
      
      if (isWinner) {
        const returnCoins = bet.potentialReturn || (bet.stake * matchSelection.oddValue);
        setWallet(w => ({ ...w, main: w.main + returnCoins }));
        triggerWin(returnCoins, `Won Bet on ${matchSelection.matchTitle}`);
        return { ...bet, status: 'won' };
      } else {
        return { ...bet, status: 'lost' };
      }
    }));
  };

  const handlePurchaseCoins = async (coins: number, priceUsd: number, packName: string) => {
    const updatedMain = wallet.main + coins;
    setWallet(prev => ({ ...prev, main: updatedMain }));
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'Deposit',
      method: `Store Pack (${packName})`,
      amount: coins,
      date: new Date().toISOString(),
      status: 'Success'
    };
    setTransactions(prev => [tx, ...prev]);
    setShowConfetti(true);

    if (currentUser?.uid) {
      try {
        await update(ref(db, `users/${currentUser.uid}/wallet`), { main: updatedMain });
        await set(push(ref(db, `transactions/${currentUser.uid}`)), tx);
      } catch (e) {}
    }
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleClaimDailyFaucet = async (coins: number) => {
    const updatedMain = wallet.main + coins;
    setWallet(prev => ({ ...prev, main: updatedMain }));
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'Bonus',
      method: 'Daily Coin Faucet',
      amount: coins,
      date: new Date().toISOString(),
      status: 'Success'
    };
    setTransactions(prev => [tx, ...prev]);
    setShowConfetti(true);

    if (currentUser?.uid) {
      try {
        await update(ref(db, `users/${currentUser.uid}/wallet`), { main: updatedMain });
        await set(push(ref(db, `transactions/${currentUser.uid}`)), tx);
      } catch (e) {}
    }
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleUpgradeTier = async (tier: VipTier) => {
    const bonusCoins = tier === 'elite' ? 10000 : 2500;
    const updatedMain = wallet.main + bonusCoins;
    const updatedProfile: UserProfile = {
      ...userProfile,
      vipTier: tier,
      vipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    setUserProfile(updatedProfile);
    setWallet(prev => ({ ...prev, main: updatedMain }));
    setShowConfetti(true);

    if (currentUser?.uid) {
      try {
        await update(ref(db, `users/${currentUser.uid}/profile`), { vipTier: tier });
        await update(ref(db, `users/${currentUser.uid}/wallet`), { main: updatedMain });
      } catch (e) {}
    }
    setTimeout(() => setShowConfetti(false), 3000);
    showAppToast(`Upgraded to ${tier.toUpperCase()} Syndicate! +${bonusCoins.toLocaleString()} bonus NXB coins credited!`, 'success');
  };

  const handleClaimDailyReward = (day: number, coins: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nextStreak = (userProfile.dailyStreak || 1) + 1;
    const upgradedTier = day === 7 ? 'pro' : userProfile.vipTier;

    setUserProfile(prev => ({
      ...prev,
      dailyStreak: nextStreak > 7 ? 1 : nextStreak,
      lastDailyClaim: todayStr,
      nxbCoins: (prev.nxbCoins || 0) + coins,
      vipTier: upgradedTier
    }));

    setWallet(prev => ({ ...prev, main: prev.main + coins }));

    const newTx: Transaction = {
      id: `tx_daily_${Date.now()}`,
      type: 'Bonus',
      method: `Daily Institutional Stash (Day ${day})`,
      amount: coins,
      date: new Date().toISOString(),
      status: 'Success'
    };
    setTransactions(prev => [newTx, ...prev]);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
    showAppToast(`Claimed Day ${day} Stash: +${coins} NXB Coins!`, 'success');
  };

  const handleCashOut = (betId: string, amount: number) => {
    setMyBets(prev => prev.map(b => b.id === betId ? { ...b, status: 'cashed_out' } : b));
    setWallet(prev => ({ ...prev, main: prev.main + amount }));

    const newTx: Transaction = {
      id: `tx_co_${Date.now()}`,
      type: 'Bet Win',
      method: 'Early Settlement Cash-Out',
      amount: amount,
      date: new Date().toISOString(),
      status: 'Success'
    };
    setTransactions(prev => [newTx, ...prev]);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    showAppToast(`Cashed out 🪙 ${amount.toFixed(2)} NXB Coins safely!`, 'success');
  };

  const profileStats = {
    bets: myBets.length,
    wins: myBets.filter(b => b.status === 'won').length
  };

  const isOperator = currentUser?.email === 'samuelemma466@gmail.com' || currentUser?.uid === 'admin_samuel';
  const isPro = userProfile?.vipTier === 'pro' || userProfile?.vipTier === 'elite';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans pb-20 md:pb-0">
      {showConfetti && <Confetti />}
      
      {/* VIP Subscription Modal */}
      <VipSubscriptionModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        currentUser={userProfile}
        onUpgradeTier={handleUpgradeTier}
      />

      {/* Daily Dividend Stash Modal */}
      <DailyRewardsModal
        isOpen={isDailyRewardsOpen}
        onClose={() => setIsDailyRewardsOpen(false)}
        currentUser={userProfile}
        onClaimReward={handleClaimDailyReward}
      />

      {/* AI Concierge */}
      <AiConcierge isOpen={isConciergeOpen} onClose={() => setIsConciergeOpen(false)} matches={matches} />
      
      {/* Menu Drawer */}
      <MenuDrawer 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          onNavigate={v => { setCurrentView(v); setIsMenuOpen(false); }} 
          onLogout={handleLogout} 
          settings={settings} 
          onSettingsUpdate={setSettings} 
          user={userProfile || { ...DEFAULT_PROFILE, email: currentUser?.email || '' }} 
          balance={wallet.main} 
          bonus={wallet.bonus} 
          currencySymbol={currencySymbol} 
      />

      {/* Top Bar Header Area */}
      <div className="sticky top-0 z-40">
        
        {/* Global Live Wins Feed */}
        <GlobalWinFeed />

        {/* Announcement / Solvency Banner */}
        {riskSettings.announcementBanner && (
          <div className="bg-slate-900 border-b border-amber-500/20 px-4 py-1 text-center text-[10px] text-amber-300 font-bold flex items-center justify-center gap-2">
            <Megaphone size={12} className="text-amber-400 shrink-0" />
            <span className="truncate">{riskSettings.announcementBanner}</span>
          </div>
        )}

        {/* Live Network Disconnect Warning */}
        {fetchError && (
          <div className="bg-red-500 text-white text-[10px] font-bold text-center py-1 flex items-center justify-center gap-2">
            <WifiOff size={12} /> Live Odds Stream Disconnected. Showing cached liquidity feeds.
          </div>
        )}

        {/* Platform Header */}
        <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-3 sm:px-6">
            
            {/* Left: Brand & Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-slate-500 p-1">
                <Menu size={22} />
              </button>
              
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('sports')}>
                 <div className="w-9 h-9 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
                   <Crown size={20} className="text-slate-950" />
                 </div>
                 <div>
                   <div className="flex items-center gap-1.5">
                     <span className="text-base sm:text-lg font-black tracking-tight dark:text-white">NEXUS</span>
                     <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                       SOVEREIGN
                     </span>
                   </div>
                   <span className="text-[9px] text-slate-400 uppercase tracking-widest hidden sm:block font-bold">
                     Institutional Sports Exchange
                   </span>
                 </div>
              </div>
            </div>
            
            {/* Center: Quick Sport & Lounge Toggle */}
            <div className="hidden md:flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl items-center gap-1 border border-slate-200 dark:border-slate-700/60">
                <button 
                  onClick={() => { setActiveCategory('Soccer'); setCurrentView('sports'); }} 
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    currentView === 'sports' && activeCategory === 'Soccer' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚽ Football
                </button>
                <button 
                  onClick={() => { setActiveCategory('Basketball'); setCurrentView('sports'); }} 
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    currentView === 'sports' && activeCategory === 'Basketball' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏀 Basketball
                </button>
                <button 
                  onClick={() => setCurrentView('social-feed')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                    currentView === 'social-feed' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Lounge</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                </button>
                <button 
                  onClick={() => loadSportsData(true)} 
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} 
                  title="Force Refresh Markets"
                >
                    <RefreshCw size={13} />
                </button>
            </div>

            {/* Right: Balance, VIP Trigger & Operator Console */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Operator Root Button */}
              {isOperator && (
                <button 
                  onClick={() => setCurrentView('admin')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                    currentView === 'admin' 
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30' 
                      : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  }`}
                  title="Operator Root Admin Console"
                >
                  <ShieldAlert size={14} />
                  <span className="hidden sm:inline">Operator</span> Room
                </button>
              )}

              {/* Daily Dividend Stash Trigger */}
              <button
                onClick={() => setIsDailyRewardsOpen(true)}
                className="relative px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Claim Institutional Daily Dividend"
              >
                <Gift size={13} className="text-amber-400" />
                <span className="hidden sm:inline">Daily Stash</span>
                {userProfile.lastDailyClaim !== new Date().toISOString().slice(0, 10) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
                )}
              </button>

              {/* VIP Syndicate Badge / Upgrade Trigger */}
              <button
                onClick={() => setIsVipModalOpen(true)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                  isPro 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110'
                }`}
              >
                <Crown size={13} />
                <span>{isPro ? 'Pro Active' : 'Upgrade Pro'}</span>
              </button>

              {/* Coins Counter */}
              <div 
                onClick={() => setCurrentView('coin-store')}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all"
              >
                <span className="text-sm">🪙</span>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] text-slate-500 uppercase font-black">NXB Coins</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-amber-400">
                    {wallet.main.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Quick Coin Store CTA */}
              <button 
                onClick={() => setCurrentView('coin-store')} 
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all hidden sm:flex items-center gap-1"
              >
                <Coins size={14} /> Store
              </button>

              {/* AI Concierge Trigger */}
              <button 
                onClick={() => setIsConciergeOpen(true)} 
                className="p-2 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                title="AI Sports Concierge"
              >
                <Sparkles size={16} />
              </button>

            </div>
        </header>

        {/* Institutional Trust Seals Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-1 flex items-center justify-between text-[9px] text-slate-400 font-bold overflow-x-auto gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck size={11} /> 256-Bit SSL Financial Vault</span>
            <span className="flex items-center gap-1 text-slate-400">🏛️ Audited Settlement Protocol</span>
            <span className="flex items-center gap-1 text-amber-400">⚖️ 100% Social Solvency</span>
          </div>
          <div className="text-[8px] text-slate-500 shrink-0 hidden md:block">
            Max Ticket Payout: {riskSettings.maxPayoutCap} Coins • House Margin: {Math.round((1 - riskSettings.oddsMultiplier) * 100)}%
          </div>
        </div>

      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row pt-4 px-2 sm:px-4 gap-6">
        
        {/* Left Sidebar Navigation */}
        <aside className="hidden md:block w-60 shrink-0 space-y-4 sticky top-36 h-[calc(100vh-10rem)]">
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
              <nav className="space-y-1">
                
                {/* Sports Navigation */}
                <div className="text-[9px] font-black uppercase text-slate-400 px-3 py-1">Markets</div>
                {SPORTS.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => { setActiveCategory(s.id); setCurrentView('sports'); }} 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      activeCategory === s.id && currentView === 'sports' 
                        ? `bg-gradient-to-r ${s.color} text-white shadow-md` 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="font-bold text-xs">{s.name}</span>
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentView('jackpot')} 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    currentView === 'jackpot' 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                    <span>🏆</span>
                    <span className="font-bold text-xs">Jackpot Arena</span>
                </button>

                {/* Platform Features */}
                <div className="text-[9px] font-black uppercase text-amber-500 px-3 pt-3 py-1">Syndicate Hub</div>
                
                <button 
                  onClick={() => setCurrentView('coin-store')} 
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    currentView === 'coin-store' 
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                      : 'text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                    <div className="flex items-center gap-2.5">
                      <Coins size={15} />
                      <span className="font-bold text-xs">Coin Store</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black">RELOAD</span>
                </button>

                <button 
                  onClick={() => setIsVipModalOpen(true)} 
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-all"
                >
                    <div className="flex items-center gap-2.5">
                      <Crown size={15} />
                      <span className="font-bold text-xs">Nexus Pro Pass</span>
                    </div>
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">VIP</span>
                </button>

                <button 
                  onClick={() => setCurrentView('leaderboard')} 
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    currentView === 'leaderboard' 
                      ? 'bg-slate-800 text-white font-black' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                    <Trophy size={15} className="text-amber-400" />
                    <span className="font-bold text-xs">Leaderboard</span>
                </button>

                <button 
                  onClick={() => setCurrentView('social-feed')} 
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    currentView === 'social-feed' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare size={15} className={currentView === 'social-feed' ? "text-slate-950" : "text-amber-400"} />
                      <span className="font-bold text-xs">Social Lounge</span>
                    </div>
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black">FEED</span>
                </button>

                <button 
                  onClick={() => setCurrentView('my-bets')} 
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    currentView === 'my-bets' 
                      ? 'bg-slate-800 text-white font-black' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                    <PieChart size={15} className="text-emerald-400" />
                    <span className="font-bold text-xs">My Placed Bets</span>
                </button>

                {isOperator && (
                  <>
                    <div className="text-[9px] font-black uppercase text-red-500 px-3 pt-3 py-1">Operator</div>
                    <button 
                      onClick={() => setCurrentView('admin')} 
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                        currentView === 'admin' 
                          ? 'bg-red-600 text-white font-black' 
                          : 'text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                        <ShieldAlert size={15} />
                        <span className="font-bold text-xs">Admin Console</span>
                    </button>
                  </>
                )}

              </nav>
           </div>
        </aside>

        {/* Center Main Views */}
        <main className="flex-1 min-w-0">
            {currentView === 'sports' && (
              <SportsView 
                matches={matches} 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
                filter={filter} 
                setFilter={setFilter} 
                onOddClick={handleOddClick} 
                selectedOdds={selections.map(s => s.selectionId)} 
                isLoading={matchesLoading} 
                onRefresh={() => loadSportsData(true)} 
                isPro={isPro}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
            )}

            {currentView === 'coin-store' && (
              <CoinStoreView
                currentCoins={wallet.main}
                user={userProfile}
                onPurchaseCoins={handlePurchaseCoins}
                onClaimDailyFaucet={handleClaimDailyFaucet}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
            )}

            {currentView === 'leaderboard' && (
              <LeaderboardView
                currentUser={userProfile}
                onOpenVipModal={() => setIsVipModalOpen(true)}
                onCopySlip={(newSelections) => {
                  setSelections(newSelections);
                  setIsMobileBetslipOpen(true);
                  showAppToast(`Copied ${newSelections.length}-Leg Syndicate Slip to Betslip!`, 'success');
                }}
              />
            )}

            {currentView === 'social-feed' && (
              <SocialFeedView
                currentUser={userProfile}
                openBets={myBets.filter(b => b.status === 'open')}
                onCopySlip={(newSelections) => {
                  setSelections(newSelections);
                  setIsMobileBetslipOpen(true);
                  showAppToast(`Copied ${newSelections.length}-Leg Syndicate Slip to Betslip!`, 'success');
                }}
                onOpenVipModal={() => setIsVipModalOpen(true)}
                onShowToast={showAppToast}
              />
            )}

            {currentView === 'jackpot' && <JackpotGame />}
            
            {currentView === 'my-bets' && (
              <MyBets 
                bets={myBets} 
                onCashOut={handleCashOut}
                cashOutFeePercent={riskSettings.cashOutFeePercent || 20}
              />
            )}

            {currentView === 'deposit' && (
              <CoinStoreView
                currentCoins={wallet.main}
                user={userProfile}
                onPurchaseCoins={handlePurchaseCoins}
                onClaimDailyFaucet={handleClaimDailyFaucet}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
            )}

            {currentView === 'withdraw' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-white">Social Solvency Model Notice</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Nexus Sovereign Exchange operates on social NXB tokens. In accordance with zero-liability gaming regulations, platform tokens represent entertainment & leaderboard prestige points.
                </p>
                <button 
                  onClick={() => setCurrentView('sports')}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase"
                >
                  Return to Sports Exchange
                </button>
              </div>
            )}
            
            {currentView === 'profile' && (
                <ProfileView 
                    onNavigate={(v) => setCurrentView(v)} 
                    settings={settings} 
                    user={userProfile || { ...DEFAULT_PROFILE, email: currentUser?.email || '' }} 
                    onUpdateUser={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
                    stats={profileStats} 
                />
            )}
            
            {currentView === 'transactions' && <TransactionsView transactions={transactions} currencySymbol={currencySymbol} />}
            {currentView === 'settings' && <SettingsView settings={settings} onUpdate={setSettings} />}
            {currentView === 'security' && <SecurityCenter />}
            {currentView === 'verification' && <VerificationView user={userProfile} onVerify={() => {
                if (currentUser) {
                    update(ref(db, `users/${currentUser.uid}/profile`), { kycStatus: 'pending' });
                    showAppToast('Documents submitted successfully! Waiting for operator review.', 'success');
                }
            }} />}
            {currentView === 'bonuses' && (
              <BonusView 
                user={userProfile} 
                onBonusClaimed={(amount) => {
                  setWallet(prev => ({ ...prev, main: prev.main + amount }));
                  showAppToast(`+${amount} NXB Welcome Bounty credited to your wallet!`, 'success');
                }}
              />
            )}
            {currentView === 'help' && <HelpView />}
            {currentView === 'responsible-gaming' && <ResponsibleGamingView />}
            
            {/* Operator Admin Command Center */}
            {currentView === 'admin' && (
              <AdminDashboard 
                riskSettings={riskSettings}
                onUpdateRiskSettings={(updated) => setRiskSettings(prev => ({ ...prev, ...updated }))}
                matches={matches}
                onUpdateMatch={handleUpdateMatch}
                onSettleMatchBets={handleSettleMatchBets}
              />
            )}
        </main>

        {/* Right Sticky Betslip */}
        {(currentView === 'sports' || currentView === 'jackpot' || currentView === 'leaderboard' || currentView === 'social-feed') && (
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-36">
              <Betslip 
                selections={selections} 
                onRemove={(id) => setSelections(s => s.filter(x => x.selectionId !== id))} 
                onClear={() => setSelections([])} 
                isOpenMobile={isMobileBetslipOpen} 
                setIsOpenMobile={setIsMobileBetslipOpen} 
                onPlaceBet={handlePlaceBet} 
                defaultStake={settings.defaultStake} 
                currencySymbol={currencySymbol}
                maxStake={riskSettings.maxStake}
                maxPayoutCap={riskSettings.maxPayoutCap}
                emergencyFreeze={riskSettings.emergencyFreeze}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around py-2.5 z-30 shadow-2xl safe-area-pb">
        <button 
          onClick={() => setCurrentView('sports')} 
          className={`flex flex-col items-center gap-1 ${currentView === 'sports' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Home size={18}/>
          <span className="text-[9px] font-bold">Exchange</span>
        </button>
        <button 
          onClick={() => setCurrentView('social-feed')} 
          className={`flex flex-col items-center gap-1 ${currentView === 'social-feed' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <MessageSquare size={18}/>
          <span className="text-[9px] font-bold">Lounge</span>
        </button>
        <button 
          onClick={() => setCurrentView('coin-store')} 
          className={`flex flex-col items-center gap-1 ${currentView === 'coin-store' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Coins size={18}/>
          <span className="text-[9px] font-bold">Store</span>
        </button>
        <button 
          onClick={() => setCurrentView('leaderboard')} 
          className={`flex flex-col items-center gap-1 ${currentView === 'leaderboard' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Trophy size={18}/>
          <span className="text-[9px] font-bold">Ranks</span>
        </button>
        <button 
          onClick={() => setCurrentView('my-bets')} 
          className={`flex flex-col items-center gap-1 ${currentView === 'my-bets' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <PieChart size={18}/>
          <span className="text-[9px] font-bold">Wagers</span>
        </button>
        <button 
          onClick={() => setIsMenuOpen(true)} 
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <MenuSquare size={18}/>
          <span className="text-[9px] font-bold">Menu</span>
        </button>
      </nav>

      {/* Floating App Notification Toast */}
      {appToast && (
        <div className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-black uppercase tracking-wider backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200 ${
          appToast.type === 'success'
            ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
            : appToast.type === 'error'
            ? 'bg-red-950/95 text-red-300 border-red-500/40 shadow-red-500/20'
            : 'bg-slate-900/95 text-amber-300 border-amber-500/40 shadow-amber-500/20'
        }`}>
          <span>{appToast.message}</span>
        </div>
      )}

    </div>
  );
};

export default App;
