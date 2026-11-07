import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageSquare, Share2, Flame, Crown, CheckCircle2, 
  Send, Sparkles, Pin, Trophy, Plus, Layers, Copy, Check,
  AlertCircle, ShieldCheck, Zap, TrendingUp, ChevronDown, ChevronUp,
  Bookmark, BarChart2, Star, ThumbsUp, Radio, RefreshCw, Eye
} from 'lucide-react';
import { SocialPost, SocialComment, SocialReactionType, UserProfile, BetSelection, PlacedBet } from '../types';

interface SocialFeedViewProps {
  currentUser: UserProfile;
  openBets: PlacedBet[];
  onCopySlip: (selections: BetSelection[]) => void;
  onOpenVipModal: () => void;
  onShowToast: (message: string, type: 'info' | 'error' | 'success') => void;
}

const QUICK_COMMENT_PILLS = [
  'Tailed! 🚀',
  'Lock it in 🔒',
  'BOL! 🍀',
  'Fade this! ❌',
  'Cash it out 💰',
  'Sharp play 🧠',
];

const POPULAR_TAGS = [
  '#NapOfTheDay',
  '#ValuePlay',
  '#PremierLeague',
  '#SGPBuilder',
  '#CashOutKing',
  '#NBAUnderdog',
];

const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post_banker_1',
    authorId: 'usr_victor_88',
    authorName: 'Victor Vance',
    authorAvatar: 'VV',
    authorTier: 'elite',
    isVerified: true,
    pinned: true,
    category: 'vip',
    tags: ['#NapOfTheDay', '#PremierLeague', '#SharpPlay'],
    confidence: 5,
    tipsterStats: { winRate: 84, streak: 7, roi: 38.5 },
    content: '🚨 SYNDICATE BANKER OF THE DAY: Arsenal vs Chelsea\nArsenal’s home xG is 2.45 over their last 6 matches, while Chelsea is playing on a 3-day turnaround. We are locking in Arsenal to Win + Over 2.5 Total Goals in a 2.85x high-conviction slip. Tail with discipline!',
    attachedSlip: {
      matchTitle: 'Arsenal vs Chelsea',
      selectionLabel: 'Arsenal to Win & Over 2.5 Goals',
      oddValue: 2.85,
      marketType: 'Same-Game Parlay',
      totalOdds: 2.85,
      stake: 150,
      potentialReturn: 427.5,
      legs: [
        { matchId: 'm1', selectionId: 'm1_1', matchTitle: 'Arsenal vs Chelsea', selectionLabel: 'Arsenal (1)', oddValue: 1.85, marketType: '1x2' },
        { matchId: 'm1', selectionId: 'm1_ov', matchTitle: 'Arsenal vs Chelsea', selectionLabel: 'Over 2.5 Goals', oddValue: 1.54, marketType: 'Over/Under' }
      ]
    },
    reactions: { fire: 184, rocket: 92, brain: 65, bullseye: 110, skull: 3 },
    userReaction: 'fire',
    likesCount: 184,
    likedByMe: true,
    bookmarkedByMe: true,
    commentsCount: 32,
    sharesCount: 24,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    comments: [
      {
        id: 'c_1',
        authorName: 'London_Syndicate',
        authorAvatar: 'LS',
        authorTier: 'pro',
        content: 'Tailed for 100 coins! Arteta’s tactical press at the Emirates is unstoppable right now.',
        createdAt: '18m ago',
        likes: 15,
        likedByMe: true
      },
      {
        id: 'c_2',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'SJ',
        authorTier: 'free',
        content: 'Lock it in 🔒 Victor has won 7 slips in a row!',
        createdAt: '10m ago',
        likes: 6,
        likedByMe: false
      }
    ]
  },
  {
    id: 'post_poll_1',
    authorId: 'usr_syndicate_bot',
    authorName: 'Nexus Community Pulse',
    authorAvatar: 'NX',
    authorTier: 'elite',
    isVerified: true,
    category: 'poll',
    tags: ['#CommunityPoll', '#EPL', '#WeekendClash'],
    content: '📊 WEEKEND COMMUNITY DEBATE: Real Madrid vs FC Barcelona in El Clásico. With both clubs firing on all cylinders, which market offers the highest mathematical expected value (+EV)? Vote below to reveal syndicate consensus!',
    poll: {
      question: 'Which El Clásico market holds the most value?',
      totalVotes: 342,
      userVotedOptionId: 'opt_1',
      options: [
        { id: 'opt_1', text: 'Real Madrid to Win (2.15x)', votes: 148 },
        { id: 'opt_2', text: 'Over 3.5 Total Goals (2.35x)', votes: 124 },
        { id: 'opt_3', text: 'FC Barcelona or Draw (1.75x)', votes: 70 }
      ]
    },
    reactions: { fire: 75, rocket: 41, brain: 88, bullseye: 53, skull: 4 },
    likesCount: 96,
    likedByMe: false,
    commentsCount: 19,
    sharesCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    comments: [
      {
        id: 'c_poll_1',
        authorName: 'Apex_Tactician',
        authorAvatar: 'AT',
        authorTier: 'pro',
        content: 'Over 3.5 is the only play. Both backlines are vulnerable on early counter-attacks.',
        createdAt: '35m ago',
        likes: 8
      }
    ]
  },
  {
    id: 'post_win_1',
    authorId: 'usr_marcus_k',
    authorName: 'Marcus Sterling',
    authorAvatar: 'MS',
    authorTier: 'pro',
    isVerified: true,
    category: 'win',
    tags: ['#CashOutKing', '#BigWin', '#BankrollBoost'],
    tipsterStats: { winRate: 76, streak: 4, roi: 52.0 },
    content: 'BOOOM! 🔥 Cashed out early on the 4-leg European accumulator in the 83rd minute for a clean 🪙 1,840 NXB Coins profit! The platform’s early cash-out feature locked in the payout right before Dortmund equalized. Discipline > Greed!',
    attachedSlip: {
      matchTitle: '4-Leg Continental Parlay',
      selectionLabel: 'Bayern + Real Madrid + PSG + Man City',
      oddValue: 6.40,
      marketType: 'Multi-Leg Parlay',
      totalOdds: 6.40,
      stake: 300,
      potentialReturn: 1920,
      legs: [
        { matchId: 'm_bm', selectionId: 'bm_1', matchTitle: 'Bayern vs Dortmund', selectionLabel: 'Bayern (1)', oddValue: 1.80, marketType: '1x2' },
        { matchId: 'm_rm', selectionId: 'rm_1', matchTitle: 'Real Madrid vs Barca', selectionLabel: 'Real Madrid (1)', oddValue: 1.95, marketType: '1x2' },
        { matchId: 'm_psg', selectionId: 'psg_1', matchTitle: 'PSG vs Marseille', selectionLabel: 'PSG (1)', oddValue: 1.52, marketType: '1x2' }
      ]
    },
    reactions: { fire: 215, rocket: 138, brain: 42, bullseye: 89, skull: 1 },
    likesCount: 215,
    likedByMe: true,
    commentsCount: 22,
    sharesCount: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    comments: [
      {
        id: 'c_win_1',
        authorName: 'Elena Rostova',
        authorAvatar: 'ER',
        authorTier: 'elite',
        content: 'Insane timing Marcus. Taking profits off the table is what separates sharps from amateurs.',
        createdAt: '50m ago',
        likes: 11
      }
    ]
  },
  {
    id: 'post_take_1',
    authorId: 'usr_elena_sharp',
    authorName: 'Elena Rostova',
    authorAvatar: 'ER',
    authorTier: 'elite',
    isVerified: true,
    category: 'take',
    tags: ['#NBA', '#SharpPlay', '#UnderGang'],
    confidence: 4,
    tipsterStats: { winRate: 81, streak: 5, roi: 29.4 },
    content: 'Sharp Analysis: People are heavily sleeping on the Under in the Lakers vs Celtics clash tonight. Half-court defensive efficiency spikes by 18% in Sunday primetime games, and both head coaches slow pace in the 4th quarter. Under 224.5 is prime expected value.',
    reactions: { fire: 94, rocket: 33, brain: 112, bullseye: 67, skull: 5 },
    likesCount: 112,
    likedByMe: false,
    commentsCount: 14,
    sharesCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    comments: [
      {
        id: 'c_take_1',
        authorName: 'Crypto_Striker',
        authorAvatar: 'CS',
        authorTier: 'pro',
        content: 'AD and Porzingis protect the rim too well for a high-scoring shootout. Fully agree.',
        createdAt: '1h ago',
        likes: 5
      }
    ]
  }
];

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  currentUser,
  openBets,
  onCopySlip,
  onOpenVipModal,
  onShowToast
}) => {
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('nxb_social_posts_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_POSTS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'slips' | 'polls' | 'vip' | 'wins'>('all');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({ post_banker_1: true });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Post Creator Mode
  const [creatorTab, setCreatorTab] = useState<'take' | 'slip' | 'poll'>('take');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [confidenceScore, setConfidenceScore] = useState<number>(4);
  const [selectedBetToAttach, setSelectedBetToAttach] = useState<PlacedBet | null>(null);
  
  // Poll Creator State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);
  
  const [isPosting, setIsPosting] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nxb_social_posts_v2', JSON.stringify(posts));
  }, [posts]);

  // Handle Multi-Reactions (🔥 🚀 🧠 🎯 💀)
  const handleReaction = (postId: string, reactionType: SocialReactionType) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const currentReaction = p.userReaction;
      const reactions = { ...(p.reactions || { fire: 0, rocket: 0, brain: 0, skull: 0, bullseye: 0 }) };

      if (currentReaction === reactionType) {
        // Toggle off
        reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
        return {
          ...p,
          userReaction: undefined,
          reactions,
          likedByMe: false,
          likesCount: Math.max(0, p.likesCount - 1)
        };
      } else {
        // Switch reaction
        if (currentReaction) {
          reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 1) - 1);
        } else {
          p.likesCount += 1;
        }
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        return {
          ...p,
          userReaction: reactionType,
          reactions,
          likedByMe: true,
          likesCount: p.likesCount
        };
      }
    }));
  };

  // Handle Poll Voting
  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.poll) return p;
      if (p.poll.userVotedOptionId === optionId) return p; // already voted this option

      const prevVoteId = p.poll.userVotedOptionId;
      const updatedOptions = p.poll.options.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        if (opt.id === prevVoteId) {
          return { ...opt, votes: Math.max(0, opt.votes - 1) };
        }
        return opt;
      });

      const updatedTotal = prevVoteId ? p.poll.totalVotes : p.poll.totalVotes + 1;

      return {
        ...p,
        poll: {
          ...p.poll,
          options: updatedOptions,
          totalVotes: updatedTotal,
          userVotedOptionId: optionId
        }
      };
    }));

    onShowToast('Syndicate poll vote recorded!', 'success');
  };

  // Toggle Bookmark
  const handleToggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const next = !p.bookmarkedByMe;
        onShowToast(next ? 'Slip saved to bookmarks' : 'Removed from bookmarks', 'info');
        return { ...p, bookmarkedByMe: next };
      }
      return p;
    }));
  };

  // Toggle Comment Like
  const handleToggleCommentLike = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const updated = p.comments.map(c => {
        if (c.id === commentId) {
          const nextLiked = !c.likedByMe;
          return {
            ...c,
            likedByMe: nextLiked,
            likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
          };
        }
        return c;
      });
      return { ...p, comments: updated };
    }));
  };

  // Handle Comment Submission
  const handleAddComment = (postId: string, customText?: string) => {
    const text = (customText || commentInputs[postId] || '').trim();
    if (!text) return;

    const newComment: SocialComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorName: currentUser.name || 'Anonymous Bettor',
      authorAvatar: currentUser.avatar || 'ME',
      authorTier: currentUser.vipTier || 'free',
      content: text,
      createdAt: 'Just now',
      likes: 0,
      likedByMe: false
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [newComment, ...(p.comments || [])]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    onShowToast('Comment posted to Syndicate Lounge!', 'success');
  };

  // Toggle Tag selection in creator
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Handle New Post Submission
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (creatorTab === 'poll') {
      if (!pollQuestion.trim()) {
        onShowToast('Please provide a debate or poll question.', 'error');
        return;
      }
      const validOptions = pollOptions.filter(o => o.trim().length > 0);
      if (validOptions.length < 2) {
        onShowToast('Poll requires at least 2 distinct voting options.', 'error');
        return;
      }
    } else {
      if (!newPostContent.trim()) {
        onShowToast('Please type a take, insight, or reason for your wager.', 'error');
        return;
      }
    }

    setIsPosting(true);

    setTimeout(() => {
      let attached: any = undefined;
      if (creatorTab === 'slip' && selectedBetToAttach && selectedBetToAttach.selections.length > 0) {
        attached = {
          matchTitle: selectedBetToAttach.selections[0].matchTitle,
          selectionLabel: selectedBetToAttach.selections.length > 1 
            ? `${selectedBetToAttach.selections.length}-Leg Syndicate Parlay` 
            : selectedBetToAttach.selections[0].selectionLabel,
          oddValue: selectedBetToAttach.totalOdds || selectedBetToAttach.selections[0].oddValue,
          marketType: selectedBetToAttach.selections.length > 1 ? 'Accumulator' : selectedBetToAttach.selections[0].marketType,
          totalOdds: selectedBetToAttach.totalOdds || selectedBetToAttach.selections[0].oddValue,
          stake: selectedBetToAttach.stake,
          potentialReturn: selectedBetToAttach.potentialReturn,
          legs: selectedBetToAttach.selections
        };
      }

      let pollData: any = undefined;
      if (creatorTab === 'poll') {
        const validOptions = pollOptions.filter(o => o.trim().length > 0);
        pollData = {
          question: pollQuestion.trim(),
          totalVotes: 1,
          userVotedOptionId: 'opt_0',
          options: validOptions.map((text, idx) => ({
            id: `opt_${idx}`,
            text: text.trim(),
            votes: idx === 0 ? 1 : 0
          }))
        };
      }

      const category: any = creatorTab === 'poll' 
        ? 'poll' 
        : creatorTab === 'slip' 
        ? 'slip' 
        : currentUser.vipTier === 'elite' || currentUser.vipTier === 'pro' 
        ? 'vip' 
        : 'take';

      const created: SocialPost = {
        id: `post_${Date.now()}`,
        authorId: currentUser.id || 'usr_me',
        authorName: currentUser.name || 'Samuel Emmanuel',
        authorAvatar: currentUser.avatar || 'SE',
        authorTier: currentUser.vipTier || 'pro',
        isVerified: true,
        content: creatorTab === 'poll' ? pollQuestion.trim() : newPostContent.trim(),
        category,
        tags: selectedTags.length > 0 ? selectedTags : ['#SyndicateTalk'],
        confidence: creatorTab === 'slip' ? confidenceScore : undefined,
        attachedSlip: attached,
        poll: pollData,
        tipsterStats: {
          winRate: 80,
          streak: 3,
          roi: 32.0
        },
        reactions: { fire: 1, rocket: 0, brain: 0, bullseye: 1, skull: 0 },
        userReaction: 'fire',
        likesCount: 1,
        likedByMe: true,
        commentsCount: 0,
        comments: [],
        sharesCount: 0,
        createdAt: new Date().toISOString()
      };

      setPosts(prev => [created, ...prev]);
      setNewPostContent('');
      setPollQuestion('');
      setSelectedBetToAttach(null);
      setSelectedTags([]);
      setIsPosting(false);
      onShowToast('Take broadcasted to the Syndicate Lounge!', 'success');
    }, 350);
  };

  // Handle Tail Slip
  const handleCopyPostSlip = (post: SocialPost) => {
    if (!post.attachedSlip || !post.attachedSlip.legs || post.attachedSlip.legs.length === 0) {
      onShowToast('This slip does not contain tail-able market selections.', 'info');
      return;
    }

    const isVip = currentUser.vipTier === 'pro' || currentUser.vipTier === 'elite';
    if (!isVip) {
      onOpenVipModal();
      return;
    }

    onCopySlip(post.attachedSlip.legs);
    setCopiedPostId(post.id);
    onShowToast(`Tailed ${post.authorName}'s ${post.attachedSlip.legs.length}-Leg Slip!`, 'success');
    setTimeout(() => setCopiedPostId(null), 3000);
  };

  // Filtered posts
  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'slips') return !!p.attachedSlip;
    if (activeFilter === 'polls') return !!p.poll;
    if (activeFilter === 'vip') return p.authorTier === 'elite' || p.authorTier === 'pro' || p.category === 'vip';
    if (activeFilter === 'wins') return p.category === 'win';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6 animate-in fade-in duration-300">
      
      {/* GLOWING HERO BANNER WITH LIVE TICKER */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-8 text-white relative shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-amber-500/40">
              <Flame size={12} fill="currentColor" className="text-amber-400 animate-pulse" />
              Institutional Bettors Lounge & Social Feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              Syndicate Social Lounge
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl font-medium leading-relaxed">
              Real-time match debates, sharp expected-value (+EV) takes, verified win flexes, and 1-tap parlay tailing.
            </p>
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/40 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
              {currentUser.avatar || 'SE'}
            </div>
            <div className="pr-2">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                {currentUser.name || 'Sharp Trader'}
                <CheckCircle2 size={12} className="text-amber-400" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  {currentUser.vipTier || 'pro'} Syndicate
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  🪙 {currentUser.nxbCoins || 1250}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Social Ticker */}
        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center gap-3 text-xs overflow-hidden relative">
          <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0">
            <Radio size={11} className="animate-pulse" /> Live Pulse
          </div>
          <div className="text-[11px] text-slate-300 font-medium truncate flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="text-amber-400 font-bold">@Victor Vance</span> dropped Banker of the Day (2.85x)
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">@Marcus</span> cashed out early for <span className="font-mono text-white">🪙 1,840</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <span className="text-cyan-400 font-bold">342 Bettors</span> voting in Clásico Debate
            </span>
          </div>
        </div>
      </div>

      {/* QUICK POST COMPOSER */}
      <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all">
        {/* Composer Tabs */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCreatorTab('take')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                creatorTab === 'take'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Flame size={13} /> Drop Take
            </button>

            <button
              type="button"
              onClick={() => setCreatorTab('slip')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                creatorTab === 'slip'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers size={13} /> Attach Slip
            </button>

            <button
              type="button"
              onClick={() => setCreatorTab('poll')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                creatorTab === 'poll'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BarChart2 size={13} /> Community Poll
            </button>
          </div>

          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">
            Verified Broadcaster
          </span>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-4">
          {/* Main Input Area */}
          {creatorTab === 'poll' ? (
            <div className="space-y-3">
              <input
                type="text"
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                placeholder="Ask the syndicate a debate question (e.g. Who wins El Clásico?)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/60 transition-colors font-medium"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-mono text-xs font-bold w-5 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const copy = [...pollOptions];
                        copy[idx] = e.target.value;
                        setPollOptions(copy);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="bg-transparent text-xs text-white outline-none w-full placeholder-slate-600 font-medium"
                    />
                  </div>
                ))}
              </div>

              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions(prev => [...prev, `Option ${prev.length + 1}`])}
                  className="text-amber-400 text-[11px] font-bold flex items-center gap-1 hover:underline pt-1"
                >
                  <Plus size={13} /> Add another option
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5">
                {currentUser.avatar || 'SE'}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder={
                    creatorTab === 'slip'
                      ? "Explain your conviction on this slip (e.g. Why these legs have value)..."
                      : "Share your sharp match insight, expected value breakdown, or live reaction..."
                  }
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/60 transition-colors resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Slip Attachment Select if in 'slip' mode */}
          {creatorTab === 'slip' && (
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} /> Select Open Ticket to Share
                </span>
                <span className="text-[10px] text-slate-500">
                  {openBets.length} Active Wager{openBets.length !== 1 ? 's' : ''}
                </span>
              </div>

              {openBets.length === 0 ? (
                <div className="text-center py-3 text-slate-500 text-xs">
                  No active open bets available right now. Place a wager in the Sports Exchange to attach here!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {openBets.map(bet => {
                    const isSelected = selectedBetToAttach?.id === bet.id;
                    return (
                      <div
                        key={bet.id}
                        onClick={() => setSelectedBetToAttach(bet)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span>{bet.selections.length}-Leg Ticket</span>
                          <span className="text-amber-400 font-mono font-black">{bet.totalOdds.toFixed(2)}x Odds</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-1">
                          {bet.selections.map(s => s.selectionLabel).join(' + ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Confidence Rating Picker */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] font-bold">Confidence Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setConfidenceScore(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={15}
                        className={star <= confidenceScore ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
                      />
                    </button>
                  ))}
                  <span className="text-amber-400 font-bold ml-1 text-xs">{confidenceScore}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">Trending Tags:</span>
            {POPULAR_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Composer Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              <span>Syndicate Verified Feed</span>
            </div>

            <button
              type="submit"
              disabled={isPosting || (creatorTab !== 'poll' && !newPostContent.trim())}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Send size={13} />
              {isPosting ? 'Broadcasting...' : 'Publish to Lounge'}
            </button>
          </div>
        </form>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: '🔥 All Trending', count: posts.length },
            { id: 'slips', label: '🎯 Tailable Slips', count: posts.filter(p => !!p.attachedSlip).length },
            { id: 'polls', label: '📊 Community Polls', count: posts.filter(p => !!p.poll).length },
            { id: 'vip', label: '👑 Pro Syndicate', count: posts.filter(p => p.authorTier === 'elite' || p.authorTier === 'pro').length },
            { id: 'wins', label: '🏆 Big Win Flexes', count: posts.filter(p => p.category === 'win').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeFilter === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            setPosts(INITIAL_POSTS);
            onShowToast('Social Feed synced with live data', 'info');
          }}
          className="text-slate-500 hover:text-amber-400 p-1.5 rounded-lg transition-colors hidden sm:block" 
          title="Reset and Sync Feed"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* POSTS LIST */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
            <MessageSquare size={36} className="mx-auto opacity-30 text-amber-400" />
            <h3 className="text-white font-black text-base">No posts in this lounge channel</h3>
            <p className="text-xs max-w-sm mx-auto">
              Be the first sharp trader to publish match analysis, post a community poll, or drop a hot slip!
            </p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isCommentsOpen = !!expandedComments[post.id];
            const isVipAuthor = post.authorTier === 'elite' || post.authorTier === 'pro';

            return (
              <div 
                key={post.id}
                className={`bg-slate-900/90 border rounded-3xl p-5 sm:p-6 shadow-2xl transition-all space-y-4 backdrop-blur-md relative overflow-hidden ${
                  post.pinned 
                    ? 'border-amber-500/50 shadow-amber-500/10 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20' 
                    : 'border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Author Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md border ${
                        post.authorTier === 'elite'
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-700 border-cyan-400/50 shadow-cyan-500/20'
                          : post.authorTier === 'pro'
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-600 border-amber-400/50 shadow-amber-500/20 text-slate-950 font-black'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {post.authorAvatar}
                      </div>
                      {post.authorTier === 'elite' && (
                        <div className="absolute -top-1.5 -right-1.5 bg-cyan-400 text-slate-950 rounded-full p-0.5 shadow-md">
                          <Crown size={11} fill="currentColor" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white tracking-tight">{post.authorName}</span>
                        {post.isVerified && (
                          <CheckCircle2 size={13} className="text-cyan-400" fill="currentColor" stroke="black" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          post.authorTier === 'elite'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : post.authorTier === 'pro'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {post.authorTier}
                        </span>
                      </div>

                      {/* Author Metrics / Tipster Stats */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                        {post.tipsterStats && (
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {post.tipsterStats.winRate}% Win Rate ({post.tipsterStats.streak} Streak)
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.pinned && (
                      <div className="flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                        <Pin size={11} fill="currentColor" /> Banker
                      </div>
                    )}
                    <button
                      onClick={() => handleToggleBookmark(post.id)}
                      className={`p-1.5 rounded-xl border transition-all ${
                        post.bookmarkedByMe
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-slate-950/80 border-slate-800 text-slate-500 hover:text-white'
                      }`}
                      title="Bookmark Slip"
                    >
                      <Bookmark size={14} className={post.bookmarkedByMe ? 'fill-amber-400' : ''} />
                    </button>
                  </div>
                </div>

                {/* Tags Bar */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {post.tags.map(t => (
                      <span key={t} className="text-[10px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {t}
                      </span>
                    ))}
                    {post.confidence && (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        <span>Conviction:</span>
                        <span className="text-amber-400 font-bold">{'★'.repeat(post.confidence)}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {post.content}
                </p>

                {/* INTERACTIVE POLL CARD */}
                {post.poll && (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-amber-400 flex items-center gap-1.5">
                        <BarChart2 size={14} /> {post.poll.question}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {post.poll.totalVotes} votes cast
                      </span>
                    </div>

                    <div className="space-y-2">
                      {post.poll.options.map(opt => {
                        const isVoted = post.poll?.userVotedOptionId === opt.id;
                        const pct = post.poll && post.poll.totalVotes > 0 
                          ? Math.round((opt.votes / post.poll.totalVotes) * 100) 
                          : 0;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVotePoll(post.id, opt.id)}
                            className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all group ${
                              isVoted
                                ? 'border-amber-400/80 bg-amber-500/15'
                                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                            }`}
                          >
                            {/* Animated Background Progress Bar */}
                            <div 
                              className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                isVoted ? 'bg-amber-500/25' : 'bg-slate-800/50'
                              }`} 
                              style={{ width: `${pct}%` }}
                            />

                            <div className="relative z-10 flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-2 text-white">
                                {isVoted && <Check size={14} className="text-amber-400 stroke-[3]" />}
                                {opt.text}
                              </span>
                              <span className="font-mono text-slate-300">
                                {pct}% <span className="text-[10px] text-slate-500 font-normal">({opt.votes})</span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ATTACHED BET SLIP CARD WITH 1-CLICK TAIL */}
                {post.attachedSlip && (
                  <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all shadow-inner group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md shadow-sm">
                            {post.attachedSlip.marketType}
                          </span>
                          <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Combined: {post.attachedSlip.totalOdds.toFixed(2)}x
                          </span>
                          {post.attachedSlip.potentialReturn && (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">
                              Potential: 🪙 {post.attachedSlip.potentialReturn} Coins
                            </span>
                          )}
                        </div>

                        <h4 className="font-black text-sm text-white tracking-tight">
                          {post.attachedSlip.selectionLabel}
                        </h4>
                        <span className="text-xs text-slate-400 block font-medium">
                          {post.attachedSlip.matchTitle}
                        </span>

                        {/* Breakdown of legs if multi */}
                        {post.attachedSlip.legs && post.attachedSlip.legs.length > 1 && (
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {post.attachedSlip.legs.map((leg, i) => (
                              <span key={i} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                                • {leg.selectionLabel} ({leg.oddValue.toFixed(2)}x)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {post.attachedSlip.legs && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyPostSlip(post)}
                            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                              copiedPostId === post.id
                                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
                            }`}
                          >
                            {copiedPostId === post.id ? (
                              <>
                                <Check size={14} className="stroke-[3]" /> Tailed to Betslip!
                              </>
                            ) : (
                              <>
                                <Copy size={14} /> Tail This Slip
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MULTI-REACTIONS & SOCIAL ACTIONS BAR */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Reaction Pill Buttons */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {[
                        { type: 'fire' as SocialReactionType, emoji: '🔥', label: 'Hot' },
                        { type: 'rocket' as SocialReactionType, emoji: '🚀', label: 'To Moon' },
                        { type: 'brain' as SocialReactionType, emoji: '🧠', label: 'Big Brain' },
                        { type: 'bullseye' as SocialReactionType, emoji: '🎯', label: 'Lock' },
                        { type: 'skull' as SocialReactionType, emoji: '💀', label: 'Bad Beat' },
                      ].map(rx => {
                        const count = post.reactions ? post.reactions[rx.type] || 0 : 0;
                        const isSelected = post.userReaction === rx.type;

                        return (
                          <button
                            key={rx.type}
                            type="button"
                            onClick={() => handleReaction(post.id, rx.type)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 scale-105 shadow-sm'
                                : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title={rx.label}
                          >
                            <span>{rx.emoji}</span>
                            <span className="font-mono text-[11px]">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Comment & Share Controls */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:text-white hover:border-slate-700 transition-all font-bold"
                      >
                        <MessageSquare size={14} className="text-amber-400" />
                        <span>{post.commentsCount} Comments</span>
                        {isCommentsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            onShowToast('Post link copied to clipboard!', 'info');
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:text-white hover:border-slate-700 transition-all"
                        title="Share Post"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>

                  </div>
                </div>

                {/* EXPANDED COMMENTS SECTION */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
                    
                    {/* Quick Reaction Comment Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">Quick Banter:</span>
                      {QUICK_COMMENT_PILLS.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAddComment(post.id, chip)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                        {currentUser.avatar || 'SE'}
                      </div>
                      <div className="flex-1 flex items-center bg-slate-950 rounded-xl border border-slate-800 px-3 py-1.5 focus-within:border-amber-500/60 transition-colors">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Drop match banter or reply to this take..."
                          className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="text-amber-400 hover:text-amber-300 p-1.5 hover:bg-slate-900 rounded-lg transition-colors"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Comments Thread List */}
                    <div className="space-y-2 pl-3 sm:pl-4 border-l-2 border-slate-800/80 pt-1">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map(comm => (
                          <div 
                            key={comm.id} 
                            className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70 text-xs space-y-1.5 hover:border-slate-700/80 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-white">
                                  {comm.authorAvatar || 'P'}
                                </div>
                                <span className="font-black text-white">{comm.authorName}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-black ${
                                  comm.authorTier === 'elite' 
                                    ? 'bg-cyan-500/20 text-cyan-400' 
                                    : comm.authorTier === 'pro' 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {comm.authorTier}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-500 font-mono">{comm.createdAt}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCommentLike(post.id, comm.id)}
                                  className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
                                    comm.likedByMe ? 'text-rose-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  <Heart size={12} className={comm.likedByMe ? 'fill-rose-400' : ''} />
                                  <span>{comm.likes}</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-200 text-xs font-medium pl-8 leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500 italic py-1 pl-2">
                          No comments yet. Be the first to spark the conversation!
                        </p>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default SocialFeedView;
