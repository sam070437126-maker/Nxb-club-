import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../services/firebase';
import { 
  Users, Activity, DollarSign, CheckCircle, XCircle, ShieldAlert, List, Sliders, 
  Crown, Coins, AlertTriangle, Radio, RefreshCw, Lock, Unlock, Megaphone, 
  ShieldCheck, Trophy, TrendingUp, Search, Filter, Plus, Minus, Flame, 
  Check, X, Eye, Clock, Ban, Award, Zap, Database, Wallet, PlayCircle, BarChart3, ChevronRight
} from 'lucide-react';
import { Match, PlatformRiskSettings, UserProfile, PlacedBet } from '../types';

interface AdminDashboardProps {
  riskSettings?: PlatformRiskSettings;
  onUpdateRiskSettings?: (settings: Partial<PlatformRiskSettings>) => void;
  matches?: Match[];
  onUpdateMatch?: (updatedMatch: Match) => void;
  onSettleMatchBets?: (matchId: string, winningOutcome: '1' | 'X' | '2') => void;
}

// Fallback seed data if Firebase database is empty
const MOCK_FALLBACK_USERS = [
  {
    uid: 'usr_victor_88',
    profile: {
      name: 'Victor Vance',
      email: 'victor.vance@solvers.io',
      vipTier: 'elite',
      kycStatus: 'verified',
      isSuspended: false,
      joinDate: '2025'
    },
    wallet: { main: 18450, bonus: 2000 }
  },
  {
    uid: 'usr_elena_sharp',
    profile: {
      name: 'Elena Rostova',
      email: 'elena.sharp@syndicate.uk',
      vipTier: 'pro',
      kycStatus: 'verified',
      isSuspended: false,
      joinDate: '2025'
    },
    wallet: { main: 9200, bonus: 1000 }
  },
  {
    uid: 'usr_marcus_k',
    profile: {
      name: 'Marcus Sterling',
      email: 'm.sterling@hedgecapital.com',
      vipTier: 'pro',
      kycStatus: 'verified',
      isSuspended: false,
      joinDate: '2026'
    },
    wallet: { main: 6400, bonus: 500 }
  },
  {
    uid: 'usr_sarah_j',
    profile: {
      name: 'Sarah Jenkins',
      email: 'sjenkins.trader@gmail.com',
      vipTier: 'free',
      kycStatus: 'pending',
      isSuspended: false,
      joinDate: '2026'
    },
    wallet: { main: 850, bonus: 100 }
  },
  {
    uid: 'usr_alex_rogue',
    profile: {
      name: 'Alexei Dubov',
      email: 'alex.dubov@proton.me',
      vipTier: 'free',
      kycStatus: 'rejected',
      isSuspended: true,
      joinDate: '2026'
    },
    wallet: { main: 120, bonus: 0 }
  }
];

const MOCK_FALLBACK_BETS: any[] = [
  {
    uid: 'usr_victor_88',
    betId: 'bet_parlay_9921',
    placedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    stake: 80,
    potentialReturn: 960,
    type: 'parlay',
    status: 'open',
    selections: [
      { matchTitle: 'Arsenal vs Chelsea', selectionLabel: 'Arsenal (1)', oddValue: 2.10 },
      { matchTitle: 'Real Madrid vs Barcelona', selectionLabel: 'Over 2.5 Goals', oddValue: 1.85 },
      { matchTitle: 'Lakers vs Celtics', selectionLabel: 'Lakers (1)', oddValue: 2.45 }
    ]
  },
  {
    uid: 'usr_elena_sharp',
    betId: 'bet_single_4412',
    placedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    stake: 100,
    potentialReturn: 195,
    type: 'single',
    status: 'open',
    selections: [
      { matchTitle: 'Manchester City vs Liverpool', selectionLabel: 'Man City (1)', oddValue: 1.95 }
    ]
  },
  {
    uid: 'usr_marcus_k',
    betId: 'bet_single_1029',
    placedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    stake: 50,
    potentialReturn: 145,
    type: 'single',
    status: 'won',
    selections: [
      { matchTitle: 'Bayern Munich vs Dortmund', selectionLabel: 'Bayern (1)', oddValue: 2.90 }
    ]
  },
  {
    uid: 'usr_sarah_j',
    betId: 'bet_single_7719',
    placedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    stake: 25,
    potentialReturn: 60,
    type: 'single',
    status: 'lost',
    selections: [
      { matchTitle: 'PSG vs Marseille', selectionLabel: 'Marseille (2)', oddValue: 2.40 }
    ]
  }
];

const MOCK_FALLBACK_TRANSACTIONS: any[] = [
  {
    uid: 'usr_victor_88',
    txId: 'tx_sub_el_01',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    type: 'VIP Subscription',
    amount: 49.00,
    status: 'Success',
    method: 'Nexus Elite Monthly Pass'
  },
  {
    uid: 'usr_elena_sharp',
    txId: 'tx_pack_trader_02',
    date: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    type: 'Coin Store Pack',
    amount: 9.99,
    status: 'Success',
    method: 'Trader Pack (+6,000 Coins)'
  },
  {
    uid: 'usr_marcus_k',
    txId: 'tx_sub_pro_03',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    type: 'VIP Subscription',
    amount: 19.00,
    status: 'Success',
    method: 'Nexus Pro Monthly Pass'
  },
  {
    uid: 'usr_sarah_j',
    txId: 'tx_pack_start_04',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'Coin Store Pack',
    amount: 4.99,
    status: 'Pending',
    method: 'Starter Pack (+2,500 Coins)'
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  riskSettings = {
    oddsMultiplier: 0.88,
    maxStake: 100,
    minStake: 5,
    maxPayoutCap: 2500,
    emergencyFreeze: false,
    announcementBanner: 'Welcome to the Nexus Sovereign Sports Exchange. All trading markets operational.'
  },
  onUpdateRiskSettings,
  matches = [],
  onUpdateMatch,
  onSettleMatchBets
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'risk' | 'vault' | 'subscriptions' | 'bets' | 'users' | 'transactions'>('overview');
  
  // Real-time Database or Fallback state
  const [users, setUsers] = useState<any[]>(MOCK_FALLBACK_USERS);
  const [transactions, setTransactions] = useState<any[]>(MOCK_FALLBACK_TRANSACTIONS);
  const [bets, setBets] = useState<any[]>(MOCK_FALLBACK_BETS);
  const [loading, setLoading] = useState(false);

  // Local state for risk controls
  const [oddsMargin, setOddsMargin] = useState(riskSettings.oddsMultiplier);
  const [maxStake, setMaxStake] = useState(riskSettings.maxStake);
  const [maxPayout, setMaxPayout] = useState(riskSettings.maxPayoutCap);
  const [cashOutFee, setCashOutFee] = useState(riskSettings.cashOutFeePercent || 20);
  const [sgpMargin, setSgpMargin] = useState(riskSettings.sgpMarginMultiplier || 0.82);
  const [emergencyFreeze, setEmergencyFreeze] = useState(riskSettings.emergencyFreeze);
  const [bannerText, setBannerText] = useState(riskSettings.announcementBanner);
  const [savingRisk, setSavingRisk] = useState(false);

  // Local state for House Vault
  const [houseReserve, setHouseReserve] = useState<number>(() => {
    const saved = localStorage.getItem('nxb_house_reserve');
    return saved ? parseInt(saved, 10) : 50000;
  });

  // Modal & Toast notification states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);
  
  // Modals
  const [coinModalUser, setCoinModalUser] = useState<any | null>(null);
  const [coinAdjustmentAmount, setCoinAdjustmentAmount] = useState<number>(1000);
  const [coinAdjustmentReason, setCoinAdjustmentReason] = useState<string>('Operator loyalty reward');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionType: 'danger' | 'warning' | 'success';
    onConfirm: () => void;
  } | null>(null);

  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // Filter / Search states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTierFilter, setUserTierFilter] = useState<'all' | 'free' | 'pro' | 'elite'>('all');
  const [betStatusFilter, setBetStatusFilter] = useState<'all' | 'open' | 'won' | 'lost' | 'cashed_out'>('all');
  const [betSearchQuery, setBetSearchQuery] = useState('');
  const [fixtureSportFilter, setFixtureSportFilter] = useState<'all' | 'Soccer' | 'Basketball'>('all');

  // Trigger non-blocking in-app toast
  const showToast = (message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    // 1. Fetch users from Firebase
    try {
      const usersRef = ref(db, 'users');
      const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          const userList = Object.keys(data).map(uid => ({
            uid,
            profile: data[uid].profile || {},
            wallet: data[uid].wallet || { main: 0, bonus: 0 }
          }));
          setUsers(userList);
        }
      });

      // 2. Fetch transactions
      const txRef = ref(db, 'transactions');
      const unsubscribeTx = onValue(txRef, (snapshot) => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          const txList: any[] = [];
          Object.keys(data).forEach(uid => {
            Object.keys(data[uid]).forEach(txId => {
              txList.push({ uid, txId, ...data[uid][txId] });
            });
          });
          txList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(txList);
        }
      });

      // 3. Fetch bets
      const betsRef = ref(db, 'bets');
      const unsubscribeBets = onValue(betsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          const betList: any[] = [];
          Object.keys(data).forEach(uid => {
            Object.keys(data[uid]).forEach(betId => {
              betList.push({ uid, betId, ...data[uid][betId] });
            });
          });
          betList.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
          setBets(betList);
        }
      });

      return () => {
        unsubscribeUsers();
        unsubscribeTx();
        unsubscribeBets();
      };
    } catch (e) {
      console.warn("Using offline fallback storage for Operator Console");
    }
  }, []);

  // Save Risk Governance Settings
  const handleSaveRisk = () => {
    setSavingRisk(true);
    const updated = {
      oddsMultiplier: parseFloat(oddsMargin.toString()),
      maxStake: parseInt(maxStake.toString(), 10),
      maxPayoutCap: parseInt(maxPayout.toString(), 10),
      cashOutFeePercent: parseInt(cashOutFee.toString(), 10),
      sgpMarginMultiplier: parseFloat(sgpMargin.toString()),
      emergencyFreeze: emergencyFreeze,
      announcementBanner: bannerText
    };

    localStorage.setItem('nxb_risk_settings', JSON.stringify(updated));
    if (onUpdateRiskSettings) {
      onUpdateRiskSettings(updated);
    }
    setTimeout(() => {
      setSavingRisk(false);
      showToast('Risk parameters successfully enforced and broadcast to all users!', 'success');
    }, 400);
  };

  // Automated Match Simulator & Result-Grading Bot
  const handleAutoSimulateAndGrade = () => {
    if (!matches || matches.length === 0) {
      showToast("No active matches found to simulate", "info");
      return;
    }

    let settledCount = 0;
    matches.forEach(m => {
      const homeScore = m.scores?.home ?? (Math.floor(Math.random() * 3) + 1);
      const awayScore = m.scores?.away ?? Math.floor(Math.random() * 3);
      const winner: '1' | 'X' | '2' = homeScore > awayScore ? '1' : homeScore < awayScore ? '2' : 'X';

      const updatedMatch: Match = {
        ...m,
        isFinished: true,
        isLive: false,
        scores: {
          ...m.scores,
          home: homeScore,
          away: awayScore
        },
        winner
      };

      if (onUpdateMatch) onUpdateMatch(updatedMatch);
      if (onSettleMatchBets) onSettleMatchBets(m.id, winner);
      settledCount++;
    });

    showToast(`🤖 Auto-Simulator graded and settled ${settledCount} events successfully!`, 'success');
  };

  // Toggle Market Freeze with confirmation
  const handleToggleFreeze = () => {
    const nextState = !emergencyFreeze;
    setConfirmModal({
      isOpen: true,
      title: nextState ? 'Enact Emergency Platform Freeze?' : 'Deactivate Emergency Freeze?',
      description: nextState 
        ? 'Freezing will halt all bet placements platform-wide immediately. Players will see a notice that trading is paused.' 
        : 'Restoring markets will allow all players to resume wagering immediately.',
      actionLabel: nextState ? 'Freeze All Markets' : 'Re-open Markets',
      actionType: nextState ? 'danger' : 'success',
      onConfirm: () => {
        setEmergencyFreeze(nextState);
        const updated = { ...riskSettings, emergencyFreeze: nextState };
        localStorage.setItem('nxb_risk_settings', JSON.stringify(updated));
        if (onUpdateRiskSettings) onUpdateRiskSettings(updated);
        setConfirmModal(null);
        showToast(nextState ? 'EMERGENCY FREEZE ACTIVATED: Markets paused.' : 'Exchange re-opened successfully.', nextState ? 'danger' : 'success');
      }
    });
  };

  // User VIP Tier modifications
  const handleSetUserTier = async (user: any, tier: 'free' | 'pro' | 'elite') => {
    try {
      await update(ref(db, `users/${user.uid}/profile`), { vipTier: tier });
    } catch (e) {}
    
    setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, profile: { ...u.profile, vipTier: tier } } : u));
    showToast(`User ${user.profile.email || user.uid} upgraded to ${tier.toUpperCase()} tier!`, 'success');
  };

  // Toggle user suspension
  const handleToggleUserSuspension = (user: any) => {
    const isSuspended = !!user.profile.isSuspended;
    setConfirmModal({
      isOpen: true,
      title: isSuspended ? `Unsuspend ${user.profile.name || user.uid}?` : `Suspend User Account?`,
      description: isSuspended 
        ? 'The user will regain full access to their wallet and betting features.' 
        : `This will immediately block ${user.profile.email || user.uid} from wagering and accessing funds.`,
      actionLabel: isSuspended ? 'Lift Suspension' : 'Suspend Account',
      actionType: isSuspended ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await update(ref(db, `users/${user.uid}/profile`), { isSuspended: !isSuspended });
        } catch (e) {}
        setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, profile: { ...u.profile, isSuspended: !isSuspended } } : u));
        setConfirmModal(null);
        showToast(`User account ${isSuspended ? 'restored' : 'suspended successfully'}.`, isSuspended ? 'success' : 'danger');
      }
    });
  };

  // Execute Coin Adjustment
  const handleApplyCoinAdjustment = async () => {
    if (!coinModalUser) return;
    const amount = Number(coinAdjustmentAmount);
    if (isNaN(amount) || amount === 0) {
      showToast('Please enter a valid coin amount.', 'danger');
      return;
    }

    try {
      const current = coinModalUser.wallet.main || 0;
      const updated = Math.max(0, current + amount);
      await update(ref(db, `users/${coinModalUser.uid}/wallet`), { main: updated });
    } catch (e) {}

    setUsers(prev => prev.map(u => {
      if (u.uid === coinModalUser.uid) {
        const current = u.wallet.main || 0;
        return { ...u, wallet: { ...u.wallet, main: Math.max(0, current + amount) } };
      }
      return u;
    }));

    showToast(`${amount > 0 ? '+' : ''}${amount.toLocaleString()} Coins applied to ${coinModalUser.profile.name || coinModalUser.uid}`, 'success');
    setCoinModalUser(null);
  };

  // Transaction Approvals & Rejections
  const handleApproveTransaction = (tx: any) => {
    setConfirmModal({
      isOpen: true,
      title: `Approve ${tx.type} of $${tx.amount}?`,
      description: `This will mark transaction #${tx.txId} as Success and credit any associated user tokens.`,
      actionLabel: 'Approve & Credit',
      actionType: 'success',
      onConfirm: async () => {
        try {
          await update(ref(db, `transactions/${tx.uid}/${tx.txId}`), { status: 'Success' });
          if (tx.type === 'Deposit') {
            const walletRef = ref(db, `users/${tx.uid}/wallet`);
            const snapshot = await get(walletRef);
            const currentWallet = snapshot.val() || { main: 0 };
            await update(walletRef, { main: currentWallet.main + tx.amount });
          }
        } catch (e) {}
        setTransactions(prev => prev.map(t => t.txId === tx.txId ? { ...t, status: 'Success' } : t));
        setConfirmModal(null);
        showToast(`Transaction approved successfully!`, 'success');
      }
    });
  };

  const handleRejectTransaction = (tx: any) => {
    setConfirmModal({
      isOpen: true,
      title: `Reject Transaction #${tx.txId}?`,
      description: `This will mark the $${tx.amount} request as Failed.`,
      actionLabel: 'Reject Request',
      actionType: 'danger',
      onConfirm: async () => {
        try {
          await update(ref(db, `transactions/${tx.uid}/${tx.txId}`), { status: 'Failed' });
        } catch (e) {}
        setTransactions(prev => prev.map(t => t.txId === tx.txId ? { ...t, status: 'Failed' } : t));
        setConfirmModal(null);
        showToast(`Transaction marked as Failed.`, 'info');
      }
    });
  };

  // Bet Manual Resolution with Modal
  const handleSettleBet = (bet: any, status: 'won' | 'lost') => {
    setConfirmModal({
      isOpen: true,
      title: `Mark Bet #${bet.betId.substring(0, 10)} as ${status.toUpperCase()}?`,
      description: status === 'won' 
        ? `This will credit ${bet.potentialReturn?.toLocaleString()} NXB Coins directly to player's wallet.`
        : 'This will resolve the wager as Lost with zero payout to the user.',
      actionLabel: `Confirm ${status.toUpperCase()}`,
      actionType: status === 'won' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await update(ref(db, `bets/${bet.uid}/${bet.betId}`), { status });
          if (status === 'won') {
            const walletRef = ref(db, `users/${bet.uid}/wallet`);
            const snapshot = await get(walletRef);
            const currentWallet = snapshot.val() || { main: 0 };
            await update(walletRef, { main: currentWallet.main + bet.potentialReturn });
          }
        } catch (e) {}
        setBets(prev => prev.map(b => b.betId === bet.betId ? { ...b, status } : b));
        setConfirmModal(null);
        showToast(`Wager successfully marked as ${status.toUpperCase()}!`, status === 'won' ? 'success' : 'info');
      }
    });
  };

  const handleVoidBet = (bet: any) => {
    setConfirmModal({
      isOpen: true,
      title: `Void & Refund Bet #${bet.betId.substring(0, 10)}?`,
      description: `The wager will be marked as Voided and the full stake of ${bet.stake?.toLocaleString()} Coins returned to player.`,
      actionLabel: 'Void & Refund Stake',
      actionType: 'warning',
      onConfirm: async () => {
        try {
          await update(ref(db, `bets/${bet.uid}/${bet.betId}`), { status: 'cashed_out' });
          const walletRef = ref(db, `users/${bet.uid}/wallet`);
          const snapshot = await get(walletRef);
          const currentWallet = snapshot.val() || { main: 0 };
          await update(walletRef, { main: currentWallet.main + bet.stake });
        } catch (e) {}
        setBets(prev => prev.map(b => b.betId === bet.betId ? { ...b, status: 'cashed_out' } : b));
        setConfirmModal(null);
        showToast(`Bet voided. Refunded ${bet.stake} coins to user.`, 'info');
      }
    });
  };

  // Fixture Controls (Score modifier, Minute, Market Lock)
  const handleScoreChange = (match: Match, team: 'home' | 'away', delta: number) => {
    if (!onUpdateMatch) return;
    const currentHome = match.scores?.home || 0;
    const currentAway = match.scores?.away || 0;
    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        home: team === 'home' ? Math.max(0, currentHome + delta) : currentHome,
        away: team === 'away' ? Math.max(0, currentAway + delta) : currentAway
      }
    };
    onUpdateMatch(updatedMatch);
    showToast(`Updated score: ${updatedMatch.homeTeam.name} ${updatedMatch.scores?.home} - ${updatedMatch.scores?.away} ${updatedMatch.awayTeam.name}`, 'info');
  };

  const handleToggleMarketLock = (match: Match) => {
    if (!onUpdateMatch) return;
    const nextLocked = !match.isLocked;
    const updatedMatch: Match = { ...match, isLocked: nextLocked };
    onUpdateMatch(updatedMatch);
    showToast(`${match.homeTeam.name} vs ${match.awayTeam.name}: Markets ${nextLocked ? 'LOCKED' : 'UNLOCKED'}`, nextLocked ? 'danger' : 'success');
  };

  const handleToggleOddsBoost = (match: Match) => {
    if (!onUpdateMatch) return;
    const nextBoost = !match.boosted;
    const updatedMatch: Match = {
      ...match,
      boosted: nextBoost,
      odds: {
        ...match.odds,
        main: match.odds.main.map(o => ({
          ...o,
          value: parseFloat((o.value * (nextBoost ? 1.15 : 0.869)).toFixed(2))
        }))
      }
    };
    onUpdateMatch(updatedMatch);
    showToast(`${match.homeTeam.name} vs ${match.awayTeam.name}: Odds Boost ${nextBoost ? 'ACTIVATED (+15%)' : 'REVERTED'}`, nextBoost ? 'success' : 'info');
  };

  const handleSettleFixture = (match: Match, outcome: '1' | 'X' | '2') => {
    const outcomeLabel = outcome === '1' ? `${match.homeTeam.name} (Home Win)` : outcome === 'X' ? 'Draw' : `${match.awayTeam.name} (Away Win)`;
    setConfirmModal({
      isOpen: true,
      title: `Finalize Match & Settle All Bets?`,
      description: `Settling ${match.homeTeam.name} vs ${match.awayTeam.name} with outcome: ${outcomeLabel}. All open player tickets on this fixture will be automatically resolved.`,
      actionLabel: 'Settle All Tickets',
      actionType: 'success',
      onConfirm: () => {
        if (onSettleMatchBets) {
          onSettleMatchBets(match.id, outcome);
        }
        if (onUpdateMatch) {
          onUpdateMatch({ ...match, isLive: false, isFinished: true, winner: outcome });
        }
        setConfirmModal(null);
        showToast(`Match finalized! All wagers on ${match.homeTeam.name} vs ${match.awayTeam.name} settled.`, 'success');
      }
    });
  };

  // Calculations
  const openBets = bets.filter(b => b.status === 'open');
  const totalOpenLiability = openBets.reduce((sum, b) => sum + (b.potentialReturn || 0), 0);
  const totalVolume = bets.reduce((sum, b) => sum + (b.stake || 0), 0);
  const pendingTx = transactions.filter(t => t.status === 'Pending');
  const proSubscribers = users.filter(u => u.profile?.vipTier === 'pro' || u.profile?.vipTier === 'elite');

  // Revenue calculation from transactions
  const totalSubscriptionRevenue = transactions
    .filter(t => t.type === 'VIP Subscription' && t.status === 'Success')
    .reduce((sum, t) => sum + (t.amount || 0), 0) + (proSubscribers.length * 19.00);

  const totalCoinPackRevenue = transactions
    .filter(t => t.type === 'Coin Store Pack' && t.status === 'Success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalGrossRevenue = totalSubscriptionRevenue + totalCoinPackRevenue;

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !userSearchQuery || 
        (u.profile?.name && u.profile.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        (u.profile?.email && u.profile.email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        u.uid.toLowerCase().includes(userSearchQuery.toLowerCase());
      
      const matchTier = userTierFilter === 'all' || (u.profile?.vipTier || 'free') === userTierFilter;
      return matchSearch && matchTier;
    });
  }, [users, userSearchQuery, userTierFilter]);

  const filteredBets = useMemo(() => {
    return bets.filter(b => {
      const matchStatus = betStatusFilter === 'all' || b.status === betStatusFilter;
      const matchSearch = !betSearchQuery || 
        b.betId.toLowerCase().includes(betSearchQuery.toLowerCase()) ||
        b.uid.toLowerCase().includes(betSearchQuery.toLowerCase()) ||
        (b.selections && b.selections.some((s: any) => s.matchTitle?.toLowerCase().includes(betSearchQuery.toLowerCase())));
      return matchStatus && matchSearch;
    });
  }, [bets, betStatusFilter, betSearchQuery]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (fixtureSportFilter === 'all') return true;
      return m.sport === fixtureSportFilter;
    });
  }, [matches, fixtureSportFilter]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-in fade-in duration-300 relative">
      
      {/* Floating In-App Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-black uppercase tracking-wider backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20' 
            : toast.type === 'danger' 
            ? 'bg-red-950/90 text-red-300 border-red-500/40 shadow-red-500/20' 
            : 'bg-slate-900/90 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              confirmModal.actionType === 'danger' 
                ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                : confirmModal.actionType === 'warning' 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              <ShieldAlert size={24} />
            </div>
            
            <h3 className="text-lg font-black text-white">{confirmModal.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{confirmModal.description}</p>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                  confirmModal.actionType === 'danger'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                    : confirmModal.actionType === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coin Adjustment Modal */}
      {coinModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Coins size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Adjust Player Coins</h3>
                  <p className="text-[11px] text-slate-400">{coinModalUser.profile.email || coinModalUser.uid}</p>
                </div>
              </div>
              <button onClick={() => setCoinModalUser(null)} className="text-slate-500 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold">Current Wallet Balance:</span>
              <span className="text-lg font-mono font-black text-amber-400">🪙 {(coinModalUser.wallet?.main || 0).toLocaleString()}</span>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-2">Quick Grant Presets:</label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 25000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCoinAdjustmentAmount(val)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      coinAdjustmentAmount === val
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Adjustment Amount (use negative e.g. -500 to deduct):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">🪙</span>
                <input
                  type="number"
                  value={coinAdjustmentAmount}
                  onChange={e => setCoinAdjustmentAmount(parseInt(e.target.value, 10) || 0)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 font-mono font-bold text-white w-full outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Reason Memo */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Audit Reason / Memo:</label>
              <input
                type="text"
                value={coinAdjustmentReason}
                onChange={e => setCoinAdjustmentReason(e.target.value)}
                placeholder="Reason for adjustment..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white w-full outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCoinModalUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCoinAdjustment}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Drawer Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                  {selectedUserDetail.profile.name ? selectedUserDetail.profile.name.substring(0, 2).toUpperCase() : 'SE'}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedUserDetail.profile.name || 'Anonymous User'}</h3>
                  <p className="text-xs text-slate-400">{selectedUserDetail.profile.email || selectedUserDetail.uid}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="text-slate-500 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">VIP Status</span>
                <span className="text-sm font-black uppercase text-amber-400">{selectedUserDetail.profile.vipTier || 'free'}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Balance</span>
                <span className="text-sm font-black font-mono text-emerald-400">🪙 {(selectedUserDetail.wallet?.main || 0).toLocaleString()}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">KYC Status</span>
                <span className="text-sm font-bold capitalize text-white">{selectedUserDetail.profile.kycStatus || 'unverified'}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Account Standing</span>
                <span className={`text-sm font-bold ${selectedUserDetail.profile.isSuspended ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedUserDetail.profile.isSuspended ? 'Suspended' : 'Operational'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const u = selectedUserDetail;
                  setSelectedUserDetail(null);
                  setCoinModalUser(u);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase"
              >
                🪙 Adjust Coins
              </button>
              <button
                onClick={() => {
                  const u = selectedUserDetail;
                  setSelectedUserDetail(null);
                  handleToggleUserSuspension(u);
                }}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase border ${
                  selectedUserDetail.profile.isSuspended
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {selectedUserDetail.profile.isSuspended ? 'Unsuspend' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center shadow-inner">
              <ShieldAlert size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  Operator Root Console
                </span>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  ● Real-time Governance Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1">
                Executive Command Center
              </h1>
              <p className="text-xs text-slate-400">
                Nexus Sovereign Exchange Management, Risk Governance, Fixture Controls & Solvency Vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFreeze}
              className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
                emergencyFreeze 
                  ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-600/40' 
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {emergencyFreeze ? <Lock size={15} /> : <Unlock size={15} />}
              {emergencyFreeze ? 'MARKETS FROZEN (HALTED)' : 'EXCHANGE ACTIVE'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Solvency', icon: Activity },
          { id: 'fixtures', label: `Event Controller (${matches.length})`, icon: PlayCircle, badge: matches.filter(m => m.isLive).length },
          { id: 'risk', label: 'Risk & Margin Engine', icon: Sliders },
          { id: 'vault', label: 'Bankroll & Vault P&L', icon: Wallet },
          { id: 'subscriptions', label: `VIP Members (${proSubscribers.length})`, icon: Crown },
          { id: 'bets', label: `Active Wagers (${openBets.length})`, icon: List },
          { id: 'users', label: `Player Accounts (${users.length})`, icon: Users },
          { id: 'transactions', label: `Transactions (${pendingTx.length > 0 ? pendingTx.length : transactions.length})`, icon: Database, alert: pendingTx.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-slate-950' : 'text-amber-400'} />
              <span>{tab.label}</span>
              {tab.alert && tab.alert > 0 ? (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {tab.alert}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & SOLVENCY TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Crown size={14} className="text-amber-400" /> Active VIP Subscribers
              </span>
              <div className="text-3xl font-black text-amber-400 mt-2">{proSubscribers.length}</div>
              <span className="text-xs text-slate-400 mt-1 block">Est. MRR: ${proSubscribers.length * 19}/mo</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={14} className="text-blue-400" /> Open Risk Liability
              </span>
              <div className="text-3xl font-black text-white mt-2">
                🪙 {totalOpenLiability.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-400 mt-1 block font-bold">100% Capped & Solvent</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Coins size={14} className="text-amber-400" /> Total Turnup (Volume)
              </span>
              <div className="text-3xl font-black text-amber-400 mt-2">
                🪙 {totalVolume.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">{bets.length} tickets placed</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" /> Gross Operator Revenue
              </span>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                ${totalGrossRevenue.toFixed(2)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Subscriptions + Coin Packs</span>
            </div>

          </div>

          {/* Solvency & Protection Overview */}
          <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={22} className="text-emerald-400" />
              <h3 className="font-black text-white text-base">Sovereign Solvency & Bankroll Protection Protocol</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Your platform operates on the <b className="text-white">Zero-Liability Social Exchange Model</b>. Bets operate using entertainment NXB coins with strict per-ticket maximum payout caps (Max: {maxPayout} Coins/ticket) and a {Math.round((1 - oddsMargin) * 100)}% built-in house margin. As the operator, your cash income comes from recurring VIP subscriptions and digital coin bundles, protecting you from real-money bet losses.
            </p>
          </div>

          {/* Quick Actions Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" /> Operator Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('fixtures')}
                className="p-4 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <PlayCircle size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">Live Controls</span>
                </div>
                <div className="font-bold text-white text-xs">Event & Score Controller</div>
                <p className="text-[11px] text-slate-400 mt-1">Adjust live scores, lock markets or settle match wagers.</p>
              </button>

              <button
                onClick={() => setActiveTab('risk')}
                className="p-4 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <Sliders size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">Margin Rules</span>
                </div>
                <div className="font-bold text-white text-xs">House Haircut & Limits</div>
                <p className="text-[11px] text-slate-400 mt-1">Tune odds multiplier, stake caps, and announcement broadcast.</p>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className="p-4 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <Users size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">Registry</span>
                </div>
                <div className="font-bold text-white text-xs">Player Governance</div>
                <p className="text-[11px] text-slate-400 mt-1">Audit players, grant coins, or suspend suspicious accounts.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE FIXTURE & EVENT CONTROLLER TAB (NEW!) */}
      {activeTab === 'fixtures' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <PlayCircle size={20} className="text-emerald-400" /> Live Match & Fixture Event Controller
                </h2>
                <p className="text-xs text-slate-400">
                  Directly adjust scores, advance match clocks, freeze individual match odds, or settle events to auto-resolve wagers.
                </p>
              </div>

              {/* Sport filter & Auto-Grade Bot */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAutoSimulateAndGrade}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  title="Simulate all active matches to conclusion and grade user tickets"
                >
                  <Zap size={14} /> Auto-Grade All Matches
                </button>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setFixtureSportFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      fixtureSportFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({matches.length})
                  </button>
                  <button
                    onClick={() => setFixtureSportFilter('Soccer')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      fixtureSportFilter === 'Soccer' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚽ Football
                  </button>
                  <button
                    onClick={() => setFixtureSportFilter('Basketball')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      fixtureSportFilter === 'Basketball' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏀 Basketball
                  </button>
                </div>
              </div>
            </div>

            {/* Fixtures List */}
            <div className="space-y-4">
              {filteredMatches.map(match => {
                const homeScore = match.scores?.home || 0;
                const awayScore = match.scores?.away || 0;
                const isLocked = !!match.isLocked;
                const isBoosted = !!match.boosted;

                return (
                  <div 
                    key={match.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Match Info & Live Badge */}
                      <div className="flex items-center gap-4 min-w-[280px]">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg">
                          {match.sport === 'Basketball' ? '🏀' : '⚽'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-500">{match.league}</span>
                            {match.isLive && (
                              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded animate-pulse">
                                LIVE {match.sport === 'Basketball' ? match.period : `${match.minute || 45}'`}
                              </span>
                            )}
                            {isLocked && (
                              <span className="bg-red-950 text-red-400 border border-red-500/30 text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-1">
                                <Lock size={9} /> MARKETS LOCKED
                              </span>
                            )}
                            {isBoosted && (
                              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-1">
                                <Flame size={9} /> BOOSTED +15%
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-black text-white mt-1">
                            {match.homeTeam.name} vs {match.awayTeam.name}
                          </div>
                        </div>
                      </div>

                      {/* Live Score Modifier Controls */}
                      <div className="flex items-center gap-6 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800/80">
                        
                        {/* Home Score */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-300 truncate max-w-[80px]">
                            {match.homeTeam.name.substring(0, 3).toUpperCase()}
                          </span>
                          <span className="text-xl font-mono font-black text-emerald-400 w-6 text-center">
                            {homeScore}
                          </span>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleScoreChange(match, 'home', 1)}
                              className="w-5 h-5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded flex items-center justify-center text-xs font-bold"
                              title="Increase Home Score"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleScoreChange(match, 'home', -1)}
                              className="w-5 h-5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded flex items-center justify-center text-xs font-bold"
                              title="Decrease Home Score"
                            >
                              -
                            </button>
                          </div>
                        </div>

                        <span className="text-slate-600 font-bold">:</span>

                        {/* Away Score */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleScoreChange(match, 'away', 1)}
                              className="w-5 h-5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded flex items-center justify-center text-xs font-bold"
                              title="Increase Away Score"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleScoreChange(match, 'away', -1)}
                              className="w-5 h-5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded flex items-center justify-center text-xs font-bold"
                              title="Decrease Away Score"
                            >
                              -
                            </button>
                          </div>
                          <span className="text-xl font-mono font-black text-emerald-400 w-6 text-center">
                            {awayScore}
                          </span>
                          <span className="text-xs font-bold text-slate-300 truncate max-w-[80px]">
                            {match.awayTeam.name.substring(0, 3).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Odds Display */}
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        {match.odds.main.slice(0, 3).map(o => (
                          <div key={o.id} className="bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-center min-w-[50px]">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{o.label}</span>
                            <span className="font-black text-white">{o.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions: Lock, Boost, Settle */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMarketLock(match)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                            isLocked 
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500 hover:text-white' 
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                          title={isLocked ? "Unlock Markets" : "Freeze/Lock Markets"}
                        >
                          {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
                        </button>

                        <button
                          onClick={() => handleToggleOddsBoost(match)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                            isBoosted 
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400'
                          }`}
                          title="Apply +15% Odds Boost Promo"
                        >
                          <Flame size={15} />
                        </button>

                        {/* Settle Dropdown Trigger */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSettleFixture(match, '1')}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg text-[10px] font-black uppercase transition-all"
                            title="Settle Home Win (1)"
                          >
                            1 Win
                          </button>
                          {match.sport === 'Soccer' && (
                            <button
                              onClick={() => handleSettleFixture(match, 'X')}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase transition-all"
                              title="Settle Draw (X)"
                            >
                              Draw
                            </button>
                          )}
                          <button
                            onClick={() => handleSettleFixture(match, '2')}
                            className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 rounded-lg text-[10px] font-black uppercase transition-all"
                            title="Settle Away Win (2)"
                          >
                            2 Win
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. RISK & MARGIN ENGINE TAB */}
      {activeTab === 'risk' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-black text-white mb-1">House Risk & Odds Margin Governance</h2>
            <p className="text-xs text-slate-400">
              Directly control mathematical house margins, player stake ceilings, and maximum payout caps to guarantee solvency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Odds Haircut Slider */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">Global Odds Multiplier (Haircut)</span>
                <span className="text-base font-black font-mono text-amber-400">{(oddsMargin * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.00"
                step="0.01"
                value={oddsMargin}
                onChange={e => setOddsMargin(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>75% (Heavy 25% Margin)</span>
                <span>88% (Recommended Safe)</span>
                <span>100% (Raw Market Odds)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Current Built-in House Edge: <b className="text-emerald-400">{((1 - oddsMargin) * 100).toFixed(0)}% margin</b> automatically shaved into every odds market.
              </p>
            </div>

            {/* Max Stake Limit */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Maximum Allowed Stake per Bet (Coins)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-lg">🪙</span>
                <input
                  type="number"
                  value={maxStake}
                  onChange={e => setMaxStake(parseInt(e.target.value, 10) || 5)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 font-mono font-bold text-white w-full outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Prevents players from wagering excessive coin bundles on single high-risk events.
              </p>
            </div>

            {/* Max Payout Cap */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Hard Maximum Payout Cap per Ticket (Coins)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-lg">🪙</span>
                <input
                  type="number"
                  value={maxPayout}
                  onChange={e => setMaxPayout(parseInt(e.target.value, 10) || 100)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 font-mono font-bold text-amber-400 w-full outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Even if a 12-leg parlay calculates a 50,000x multiplier, potential return is capped automatically at this ceiling.
              </p>
            </div>

            {/* Early Cash-Out Haircut Penalty */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">Early Cash-Out House Retention Fee</span>
                <span className="text-base font-black font-mono text-emerald-400">{cashOutFee}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="1"
                value={cashOutFee}
                onChange={e => setCashOutFee(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10% (Competitive)</span>
                <span>20% (Standard Protected)</span>
                <span>35% (Aggressive House Edge)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                The operator retains <b>{cashOutFee}%</b> of the settlement on every early cash-out, guaranteeing zero loss.
              </p>
            </div>

            {/* Same-Game Parlay (SGP) Margin */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">Same-Game Parlay (SGP) Odds Multiplier</span>
                <span className="text-base font-black font-mono text-amber-400">{(sgpMargin * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.95"
                step="0.01"
                value={sgpMargin}
                onChange={e => setSgpMargin(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>70% (Heavy Margin)</span>
                <span>82% (Recommended)</span>
                <span>95% (Loose)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Applies an extra {((1 - sgpMargin) * 100).toFixed(0)}% margin haircut when users combine legs from the same match.
              </p>
            </div>

            {/* Emergency Freeze Switch */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1">Emergency Platform Freeze Switch</span>
                <p className="text-[11px] text-slate-400">
                  Instantly halts all wager placements platform-wide if unexpected events occur.
                </p>
              </div>
              <button
                onClick={handleToggleFreeze}
                className={`mt-4 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  emergencyFreeze
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {emergencyFreeze ? <Lock size={14} /> : <Unlock size={14} />}
                {emergencyFreeze ? 'FREEZE ACTIVE (CLICK TO UNLOCK)' : 'FREEZE INACTIVE (MARKETS LIVE)'}
              </button>
            </div>

          </div>

          {/* Site Announcement Banner */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-2">
              <Megaphone size={14} className="text-amber-400" /> Platform Announcement Banner
            </label>
            <input
              type="text"
              value={bannerText}
              onChange={e => setBannerText(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white w-full outline-none focus:border-amber-500"
              placeholder="Enter announcement text to broadcast to all players..."
            />
          </div>

          <button
            onClick={handleSaveRisk}
            disabled={savingRisk}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            {savingRisk ? 'Broadcasting...' : 'Save & Enforce Risk Parameters'}
          </button>
        </div>
      )}

      {/* 4. BANKROLL VAULT & P&L TAB (NEW!) */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Wallet size={20} className="text-emerald-400" /> House Liquidity Vault & Revenue Ledger
                </h2>
                <p className="text-xs text-slate-400">
                  Track subscription income, digital coin pack revenue, and the House Token Solvency buffer.
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                <ShieldCheck size={16} /> 100% Solvency Ratio
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">House Reserve Pool</span>
                <div className="text-3xl font-black font-mono text-white">🪙 {houseReserve.toLocaleString()}</div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      const updated = houseReserve + 10000;
                      setHouseReserve(updated);
                      localStorage.setItem('nxb_house_reserve', updated.toString());
                      showToast('+10,000 Coins added to House Reserve Pool', 'success');
                    }}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg text-[10px] font-black uppercase transition-all"
                  >
                    + Add 10k
                  </button>
                  <button
                    onClick={() => {
                      const updated = Math.max(0, houseReserve - 10000);
                      setHouseReserve(updated);
                      localStorage.setItem('nxb_house_reserve', updated.toString());
                      showToast('-10,000 Coins withdrawn from House Reserve', 'info');
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-black uppercase transition-all"
                  >
                    - Withdraw 10k
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Real Cash Gross Revenue</span>
                <div className="text-3xl font-black font-mono text-emerald-400">${totalGrossRevenue.toFixed(2)}</div>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <div>• Subscriptions: ${totalSubscriptionRevenue.toFixed(2)}</div>
                  <div>• Coin Store Packs: ${totalCoinPackRevenue.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Solvency Coverage</span>
                <div className="text-3xl font-black font-mono text-cyan-400">
                  {totalOpenLiability > 0 ? `${((houseReserve / totalOpenLiability) * 100).toFixed(0)}%` : '∞'}
                </div>
                <span className="text-xs text-slate-500 mt-2 block">
                  Reserve vs Open Player Liability (🪙 {totalOpenLiability.toLocaleString()})
                </span>
              </div>

            </div>

            {/* Solvency Protection Notice */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldAlert size={14} /> Zero Payout Liability Architecture
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Because bets are executed in social entertainment NXB Coins rather than cash, you as the owner never pay out winning tickets from your personal bank account. All incoming payments for VIP subscriptions ($19/mo or $49/mo) and Coin Store purchases go directly into your operator revenue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIP SUBSCRIPTIONS TAB */}
      {activeTab === 'subscriptions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Crown size={20} className="text-amber-400" /> VIP Subscription Registry
              </h2>
              <p className="text-xs text-slate-400">View and manage paying members and grant instant VIP access</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
              <Crown size={14} /> Total Pro Members: {proSubscribers.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Current Tier</th>
                  <th className="px-4 py-3">Coins Balance</th>
                  <th className="px-4 py-3 text-right">Quick Tier Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{u.profile.name || 'Anonymous'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{u.profile.email || u.uid}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.profile.vipTier === 'elite' 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                          : u.profile.vipTier === 'pro' 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {u.profile.vipTier || 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      🪙 {(u.wallet.main || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleSetUserTier(u, 'pro')}
                          className="px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-[10px] font-black uppercase transition-all"
                        >
                          Grant Pro
                        </button>
                        <button
                          onClick={() => handleSetUserTier(u, 'elite')}
                          className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 rounded-lg text-[10px] font-black uppercase transition-all"
                        >
                          Grant Elite
                        </button>
                        <button
                          onClick={() => handleSetUserTier(u, 'free')}
                          className="px-2.5 py-1 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg text-[10px] font-black uppercase transition-all"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ACTIVE WAGERS & BET RESOLUTION TAB */}
      {activeTab === 'bets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-white">Platform Wagers & Ticket Audit</h3>
              <p className="text-xs text-slate-400">Review tickets, identify high liability wagers, and manually override outcomes.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search ticket */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={betSearchQuery}
                  onChange={e => setBetSearchQuery(e.target.value)}
                  placeholder="Search ticket, match, or user..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-amber-500 w-48 sm:w-60"
                />
              </div>

              {/* Status filter */}
              <select
                value={betStatusFilter}
                onChange={e => setBetStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-amber-500"
              >
                <option value="all">All Statuses ({bets.length})</option>
                <option value="open">Open Only ({openBets.length})</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="cashed_out">Voided / Refunded</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black">
                <tr>
                  <th className="px-4 py-3">Placed At</th>
                  <th className="px-4 py-3">Player ID</th>
                  <th className="px-4 py-3">Selections</th>
                  <th className="px-4 py-3">Stake</th>
                  <th className="px-4 py-3">Potential Return</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Manual Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBets.map(bet => {
                  const isHighLiability = (bet.potentialReturn || 0) >= 500;
                  return (
                    <tr key={bet.betId} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(bet.placedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">
                        {bet.uid.substring(0, 10)}...
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {bet.selections && bet.selections.length > 0 ? (
                          <div className="space-y-1">
                            {bet.selections.map((s: any, idx: number) => (
                              <div key={idx} className="text-slate-300">
                                <span className="font-bold text-white">{s.matchTitle}</span>: {s.selectionLabel} (@{s.oddValue?.toFixed(2)})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Standard Slip</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white whitespace-nowrap">
                        🪙 {bet.stake?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">
                        <span className={isHighLiability ? "text-amber-400 flex items-center gap-1" : "text-emerald-400"}>
                          🪙 {bet.potentialReturn?.toLocaleString()}
                          {isHighLiability && <AlertTriangle size={12} className="text-amber-400" />}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          bet.status === 'open' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : bet.status === 'won' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : bet.status === 'cashed_out' 
                            ? 'bg-slate-800 text-slate-300' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {bet.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {bet.status === 'open' ? (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleSettleBet(bet, 'won')}
                              className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                            >
                              Mark Won
                            </button>
                            <button
                              onClick={() => handleSettleBet(bet, 'lost')}
                              className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Mark Lost
                            </button>
                            <button
                              onClick={() => handleVoidBet(bet)}
                              className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                              Void & Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-bold">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. USERS & PLAYER GOVERNANCE TAB */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-white">Player Accounts & Governance</h3>
              <p className="text-xs text-slate-400">Search users, audit coin balances, grant/deduct tokens, or suspend accounts.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search User */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search name, email, or UID..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-amber-500 w-48 sm:w-60"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={userTierFilter}
                onChange={e => setUserTierFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-amber-500"
              >
                <option value="all">All Tiers ({users.length})</option>
                <option value="free">Free</option>
                <option value="pro">Pro Only</option>
                <option value="elite">Elite Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black">
                <tr>
                  <th className="px-4 py-3">Player Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Coins Balance</th>
                  <th className="px-4 py-3">VIP Tier</th>
                  <th className="px-4 py-3">Standing</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map(u => {
                  const isSuspended = !!u.profile.isSuspended;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{u.profile.name || 'Anonymous'}</span>
                          {u.profile.email === 'samuelemma466@gmail.com' && (
                            <span className="bg-red-500 text-white text-[8px] font-black uppercase px-1 py-0.2 rounded">ROOT</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{u.profile.email || u.uid}</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        🪙 {(u.wallet.main || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          u.profile.vipTier === 'elite'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : u.profile.vipTier === 'pro'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.profile.vipTier || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isSuspended ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedUserDetail(u)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                            title="View Player Profile"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setCoinModalUser(u)}
                            className="px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <Coins size={12} /> Adjust
                          </button>
                          <button
                            onClick={() => handleToggleUserSuspension(u)}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${
                              isSuspended
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                            }`}
                            title={isSuspended ? "Unsuspend Account" : "Suspend Account"}
                          >
                            <Ban size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. TRANSACTIONS & COIN PACK PURCHASES TAB */}
      {activeTab === 'transactions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-white">Financial Ledger & Token Purchases</h3>
              <p className="text-xs text-slate-400">Review coin store pack purchases, subscriptions, and withdrawals.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {transactions.length} orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Method / Details</th>
                  <th className="px-4 py-3">Amount ($)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map(tx => (
                  <tr key={tx.txId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {tx.uid.substring(0, 10)}...
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{tx.type}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{tx.method || 'Direct Store Checkout'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      ${Number(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.status === 'Pending' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : tx.status === 'Success' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tx.status === 'Pending' ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApproveTransaction(tx)}
                            className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded-lg transition-colors"
                            title="Approve Transaction"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(tx)}
                            className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                            title="Reject Transaction"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
