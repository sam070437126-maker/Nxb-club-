
export interface Team {
  name: string;
  logo: string;
}

export type MarketType = '1x2' | 'OverUnder' | 'DoubleChance' | 'Moneyline' | 'Handicap' | 'Total' | 'Winner';

export interface Odd {
  id: string;
  label: string;
  value: number;
  marketType: MarketType;
  prevValue?: number;
  isBoosted?: boolean;
  originalValue?: number;
}

export interface StatItem {
  label: string;
  home: number;
  away: number;
  type: 'percent' | 'count';
}

export type SportCategory = 'Soccer' | 'Basketball';

export interface Match {
  id: string;
  fixtureId?: number; // Internal ID for settlement
  sport: SportCategory;
  league: string;
  startTime: Date;
  isLive: boolean;
  isFinished?: boolean; // New field for settlement
  isPopular?: boolean; 
  hasStream?: boolean;
  streamUrl?: string;
  minute?: number;
  period?: string; 
  homeTeam: Team;
  awayTeam: Team;
  scores?: {
    home: number;
    away: number;
    q1?: { home: number, away: number };
    q2?: { home: number, away: number };
    q3?: { home: number, away: number };
    q4?: { home: number, away: number };
  };
  odds: {
    main: Odd[];
    secondary: Odd[];
  };
  stats?: StatItem[];
  winner?: '1' | 'X' | '2'; // Calculated on server
  isLocked?: boolean;
  boosted?: boolean;
}

export interface BetSelection {
  matchId: string;
  selectionId: string;
  matchTitle: string;
  selectionLabel: string;
  oddValue: number;
  marketType: string;
}

export interface PlacedBet {
  id: string;
  selections: BetSelection[];
  stake: number;
  totalOdds: number;
  potentialReturn: number;
  status: 'open' | 'won' | 'lost' | 'cashed_out';
  placedAt: string;
  cashOutOffer?: number;
}

export type VipTier = 'free' | 'pro' | 'elite';

export type AppView = 
  | 'sports' 
  | 'jackpot'
  | 'my-bets' 
  | 'social-feed'
  | 'deposit' 
  | 'coin-store'
  | 'vip-subscription'
  | 'leaderboard'
  | 'withdraw' 
  | 'profile' 
  | 'transactions' 
  | 'notifications' 
  | 'settings' 
  | 'security'
  | 'verification' 
  | 'bonuses'
  | 'help' 
  | 'responsible-gaming'
  | 'admin';

export interface SocialComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTier: VipTier;
  content: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
}

export interface SocialPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface SocialPoll {
  question: string;
  options: SocialPollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export type SocialReactionType = 'fire' | 'rocket' | 'brain' | 'skull' | 'bullseye';

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTier: VipTier;
  isVerified?: boolean;
  content: string;
  category: 'slip' | 'take' | 'vip' | 'win' | 'poll' | 'debate';
  tags?: string[];
  confidence?: number; // 1 - 5 stars
  reactions?: Record<SocialReactionType, number>;
  userReaction?: SocialReactionType;
  poll?: SocialPoll;
  attachedSlip?: {
    matchTitle: string;
    selectionLabel: string;
    oddValue: number;
    marketType: string;
    legs?: BetSelection[];
    totalOdds: number;
    stake?: number;
    potentialReturn?: number;
  };
  tipsterStats?: {
    winRate: number;
    streak: number;
    roi: number;
  };
  likesCount: number;
  likedByMe?: boolean;
  bookmarkedByMe?: boolean;
  commentsCount: number;
  comments: SocialComment[];
  sharesCount: number;
  createdAt: string;
  pinned?: boolean;
}

export type OddsFormat = 'decimal' | 'fractional' | 'american';

// --- PLATFORM RISK & OPERATOR GOVERNANCE ---
export interface PlatformRiskSettings {
  oddsMultiplier: number; // e.g. 0.88 (12% bookmaker house margin)
  maxStake: number;       // e.g. 100 NXB Coins
  minStake: number;       // e.g. 5 NXB Coins
  maxPayoutCap: number;   // e.g. 2500 NXB Coins
  cashOutFeePercent?: number; // e.g. 20 (20% operator retention margin on cash-out)
  sgpMarginMultiplier?: number; // e.g. 0.82 (extra margin on Same Game Parlays)
  emergencyFreeze: boolean;
  announcementBanner: string;
}

export interface SubscriptionPlan {
  id: string;
  tier: VipTier;
  name: string;
  tagline: string;
  priceUsd: number;
  period: string;
  coinsBonus: number;
  badge: string;
  features: string[];
  isPopular?: boolean;
}

// --- LOCALIZATION TYPES ---
export type Language = 'en-US' | 'en-UK' | 'fr' | 'es' | 'de';
export type Country = 'US' | 'UK' | 'NG' | 'KE' | 'ZA' | 'CA' | 'EU';
export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'NGN' | 'KES' | 'CAD';

export interface AppSettings {
  theme: 'light' | 'dark';
  oddsFormat: OddsFormat;
  defaultStake: number;
  autoAcceptOdds: boolean;
  privacyMode: boolean;
  language: Language;
  country: Country;
  currency: CurrencyCode;
  notifications: {
    marketing: boolean;
    matchEvents: boolean;
    betSettled: boolean;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  id: string;
  level: number;
  joinDate: string;
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  vipTier?: VipTier;
  vipExpiry?: string;
  nxbCoins?: number;
  lastDailyClaim?: string;
  dailyStreak?: number;
  bettorProfile?: 'recreational' | 'sharp';
}

export interface LoginSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityState {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  kycLevel: 1 | 2 | 3;
  lastPasswordChange: string;
}

export interface Bonus {
  id: string;
  title: string;
  amount: number;
  type: 'deposit_match' | 'free_bet' | 'cashback';
  status: 'active' | 'pending' | 'completed';
  expiry: string;
  wagerReq: number;
  wagerProgress: number;
}

export type TransactionStatus = 'Success' | 'Pending' | 'Failed' | 'Processing';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Bet Placement' | 'Bet Win' | 'Bonus';

export interface Transaction {
  id: string;
  type: TransactionType;
  method: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  reference?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'crypto' | 'wallet' | 'bank';
  icon: any;
  detail?: string;
  fee?: string;
  minLimit: number;
  maxLimit: number;
}
