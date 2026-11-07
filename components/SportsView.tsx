
import React, { useState, useMemo } from 'react';
import { Match, SportCategory, BetSelection } from '../types';
import { SPORTS } from '../constants';
import MatchCard, { MatchCardSkeleton } from './MatchCard';
import AdBanner from './AdBanner';
import { Trophy, Flame, Calendar, ChevronRight, TrendingUp, Clock, Filter, SlidersHorizontal, LayoutList, MonitorPlay, LayoutGrid, List, RefreshCw } from 'lucide-react';

interface SportsViewProps {
  matches: Match[];
  activeCategory: SportCategory;
  setActiveCategory: (cat: SportCategory) => void;
  filter: 'all' | 'live' | 'upcoming';
  setFilter: (f: 'all' | 'live' | 'upcoming') => void;
  onOddClick: (selection: BetSelection) => void;
  selectedOdds: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isPro?: boolean;
  onOpenVipModal?: () => void;
}

// --- CONSTANTS ---
const TIME_FILTERS = [
  { id: 'all', label: 'All' },
  { id: '1h', label: '1 Hr' },
  { id: '3h', label: '3 Hrs' },
  { id: 'today', label: 'Today' },
  { id: 'tmrw', label: 'Tomorrow' },
];

const MARKET_Types = [
  { id: 'main', label: 'Main (1x2)' },
  { id: 'secondary', label: 'Goals / Hdp' },
];

// --- HELPER COMPONENT: LEAGUE HEADER ---
const LeagueHeader = ({ league, count, sportIcon, isPopular }: { league: string, count: number, sportIcon: string, isPopular?: boolean }) => (
   <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 sticky top-[104px] z-10 backdrop-blur-md">
      <div className="flex items-center gap-2">
         <span className="text-lg">{sportIcon}</span>
         <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            {league}
            {isPopular && <span className="bg-amber-500 text-black text-[9px] px-1.5 py-0.5 rounded font-black flex items-center gap-1"><Flame size={8} fill="currentColor" /> HOT</span>}
         </h3>
      </div>
      <span className="text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
         {count}
      </span>
   </div>
);

const SportsView: React.FC<SportsViewProps> = ({ 
  matches, 
  activeCategory, 
  setActiveCategory, 
  filter, 
  setFilter, 
  onOddClick, 
  selectedOdds,
  isLoading = false,
  onRefresh,
  isPro,
  onOpenVipModal
}) => {
  
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [globalMarket, setGlobalMarket] = useState<'main' | 'secondary'>('main');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  // --- FILTERING LOGIC ---
  const filteredMatches = useMemo(() => {
     return matches.filter(m => {
        // 1. Sport Category
        if (activeCategory && m.sport !== activeCategory) return false;

        // 2. Main Status Filter
        if (filter === 'live' && !m.isLive) return false;
        if (filter === 'upcoming' && m.isLive) return false;

        // 3. Popular Filter
        if (showPopularOnly && !m.isPopular) return false;

        // 4. Time Filter
        if (timeFilter !== 'all' && !m.isLive) {
           const now = new Date();
           const matchTime = new Date(m.startTime);
           const diffHrs = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);
           
           if (timeFilter === '1h' && diffHrs > 1) return false;
           if (timeFilter === '3h' && diffHrs > 3) return false;
           if (timeFilter === 'today' && matchTime.getDate() !== now.getDate()) return false;
           if (timeFilter === 'tmrw') {
              const tmrw = new Date(now);
              tmrw.setDate(tmrw.getDate() + 1);
              if (matchTime.getDate() !== tmrw.getDate()) return false;
           }
        }
        return true;
     });
  }, [matches, activeCategory, filter, timeFilter, showPopularOnly]);

  // --- GROUP BY LEAGUE ---
  const matchesByLeague = useMemo(() => {
     const groups: Record<string, Match[]> = {};
     filteredMatches.forEach(match => {
        if (!groups[match.league]) groups[match.league] = [];
        groups[match.league].push(match);
     });
     return groups;
  }, [filteredMatches]);

  // Sort leagues so Popular ones come first
  const sortedLeagueKeys = Object.keys(matchesByLeague).sort((a, b) => {
     const isAPopular = matchesByLeague[a][0].isPopular;
     const isBPopular = matchesByLeague[b][0].isPopular;
     if (isAPopular && !isBPopular) return -1;
     if (!isAPopular && isBPopular) return 1;
     return a.localeCompare(b);
  });

  return (
    <div className="space-y-0">
      
      {/* 1. HERO & PROMOS (Only on 'All' View) */}
      {filter === 'all' && !showPopularOnly && (
        <div className="px-4 sm:px-0 pt-2 pb-6 animate-in fade-in slide-in-from-top-4 duration-500">
           <AdBanner />
        </div>
      )}

      {/* 2. STICKY NAV RAIL (Sports + View Toggles) */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 pb-1">
         
         {/* Top Row: Sports Icons */}
         <div className="flex gap-1 overflow-x-auto px-4 py-2 no-scrollbar items-center">
            {SPORTS.map(sport => {
               const liveCount = matches.filter(m => m.sport === sport.id && m.isLive).length;
               const isActive = activeCategory === sport.id;
               return (
                  <button
                     key={sport.id}
                     onClick={() => setActiveCategory(sport.id)}
                     className={`
                        relative flex flex-col items-center justify-center min-w-[64px] py-2 rounded-xl transition-all border
                        ${isActive 
                           ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md scale-105' 
                           : 'bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}
                     `}
                  >
                     <span className="text-xl mb-1">{sport.icon}</span>
                     <span className="text-[9px] font-black uppercase tracking-wider">{sport.name}</span>
                     {liveCount > 0 && (
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></div>
                     )}
                  </button>
               );
            })}
         </div>

         {/* Bottom Row: View Filters & Time */}
         <div className="flex items-center justify-between px-4 py-2 gap-4">
             {/* Status Toggles (Pill) */}
             <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto">
                <button 
                   onClick={() => { setFilter('all'); setShowPopularOnly(false); }}
                   className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'all' && !showPopularOnly ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                   All
                </button>
                <button 
                   onClick={() => { setFilter('all'); setShowPopularOnly(true); }}
                   className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${showPopularOnly ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-500'}`}
                >
                   <Flame size={10} fill={showPopularOnly ? "black" : "none"} /> Top Leagues
                </button>
                <button 
                   onClick={() => { setFilter('live'); setShowPopularOnly(false); }}
                   className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${filter === 'live' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}
                >
                   <div className={`w-1.5 h-1.5 rounded-full ${filter === 'live' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></div> Live
                </button>
             </div>

             {/* Time Filters (Scrollable) */}
             <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar justify-end items-center">
                {TIME_FILTERS.map(tf => (
                   <button
                      key={tf.id}
                      onClick={() => setTimeFilter(tf.id)}
                      className={`
                         whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors
                         ${timeFilter === tf.id 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}
                      `}
                   >
                      {tf.label}
                   </button>
                ))}
                
                {onRefresh && (
                    <button 
                        onClick={onRefresh} 
                        disabled={isLoading}
                        className="ml-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    </button>
                )}
             </div>
         </div>
      </div>

      {/* 3. MARKET CONTROL RAIL & VIEW TOGGLE */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
         <div className="flex items-center gap-2 text-slate-500">
            <SlidersHorizontal size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Market Display</span>
         </div>
         
         <div className="flex items-center gap-4">
             {/* Market Type Switch */}
             <div className="flex gap-1">
                 {MARKET_Types.map(mt => (
                    <button 
                       key={mt.id}
                       onClick={() => setGlobalMarket(mt.id as any)}
                       className={`
                          px-3 py-1 rounded-md text-[10px] font-bold transition-all border
                          ${globalMarket === mt.id 
                             ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-900 dark:border-slate-200' 
                             : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700'}
                       `}
                    >
                       {mt.label}
                    </button>
                 ))}
             </div>

             {/* Vertical Separator */}
             <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>

             {/* View Mode Toggle (Card vs Compact) */}
             <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                   onClick={() => setViewMode('card')}
                   className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                   title="Card View"
                >
                   <LayoutGrid size={14} />
                </button>
                <button
                   onClick={() => setViewMode('compact')}
                   className={`p-1.5 rounded-md transition-all ${viewMode === 'compact' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                   title="Compact List View"
                >
                   <List size={14} />
                </button>
             </div>
         </div>
      </div>

      {/* 4. MATCH LISTING (Grouped) */}
      <div className="pb-20 min-h-[50vh] bg-slate-100 dark:bg-black">
         {isLoading ? (
             <div className="p-4 space-y-4">
                 {[...Array(6)].map((_, i) => (
                     <MatchCardSkeleton key={i} variant={viewMode} />
                 ))}
             </div>
         ) : sortedLeagueKeys.length > 0 ? (
            <div className="space-y-2 animate-in fade-in duration-300">
               {sortedLeagueKeys.map(league => (
                  <div key={league} className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                     <LeagueHeader 
                        league={league} 
                        count={matchesByLeague[league].length}
                        sportIcon={SPORTS.find(s => s.id === activeCategory)?.icon || '🏆'}
                        isPopular={matchesByLeague[league][0].isPopular} 
                     />
                     <div className={`p-2 ${viewMode === 'card' ? 'space-y-2' : 'space-y-0.5'}`}>
                        {matchesByLeague[league].map(match => (
                           <MatchCard 
                              key={match.id} 
                              match={match} 
                              onOddClick={onOddClick}
                              selectedOdds={selectedOdds}
                              displayMarket={globalMarket}
                              variant={viewMode}
                              isPro={isPro}
                              onOpenVipModal={onOpenVipModal}
                           />
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
               <div className="bg-slate-200 dark:bg-slate-900 p-6 rounded-full mb-4">
                  <LayoutList size={40} className="opacity-40" />
               </div>
               <p className="font-bold text-sm uppercase tracking-widest">No Events Found</p>
               <p className="text-xs mt-2">Adjust your time filters or category.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default SportsView;
