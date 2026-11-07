
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Flame, Search, Zap, X, RotateCw, Trophy, History, ShieldCheck, 
  Info, Bomb, Gem, Coins, ChevronRight, Volume2, Settings2, Sparkles, 
  TrendingUp, Users, MessageSquare, Send, Crown, Ghost, LayoutGrid, 
  Gamepad2, Star, Timer, Heart, MonitorPlay, Dice6, BarChart3, Loader2, ArrowLeft, Maximize2, Minimize2, Tv
} from 'lucide-react';
import { db } from '../services/firebase';
import { ref, onValue, get } from 'firebase/database';

interface CasinoGameData {
  id: string;
  name: string;
  provider: string;
  category: string;
  image: string;
  color: string;
  hot: boolean;
  minBet?: number;
  rtp: string;
  isLive: boolean;
  dealer?: string;
  players?: number;
  status: 'online' | 'maintenance' | 'offline';
}

const CATEGORIES = [
  { id: 'All', label: "Lobby", icon: LayoutGrid },
  { id: 'Live Casino', label: "Live Casino", icon: MonitorPlay },
  { id: 'Game Shows', label: "Game Shows", icon: Tv },
  { id: 'Crash', label: "Crash", icon: TrendingUp },
  { id: 'Slots', label: "Slots", icon: Gamepad2 },
  { id: 'Arcade', label: "Arcade", icon: Dice6 },
  { id: 'Table Games', label: "Table Games", icon: BarChart3 },
];

const PROMO_BANNERS = [
    { id: 1, title: "Aviator Rain", sub: "Free Bets Every Hour", bg: "from-red-900 via-red-800 to-black", img: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=800&auto=format&fit=crop" },
    { id: 2, title: "Live Casino", sub: "10% Cashback on Losses", bg: "from-purple-900 via-indigo-900 to-black", img: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=800&auto=format&fit=crop" },
    { id: 3, title: "Drops & Wins", sub: "₦500,000,000 Pool", bg: "from-emerald-900 via-teal-900 to-black", img: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=800&auto=format&fit=crop" }
];

// --- MINES ENGINE (Logic Retained, UI Polished) ---
const MinesGame = ({ onWin }: { onWin: (amt: number) => void }) => {
  const [grid, setGrid] = useState<number[]>(Array(25).fill(0));
  const [revealed, setRevealed] = useState<boolean[]>(Array(25).fill(false));
  const [mineCount, setMineCount] = useState(3);
  const [bet, setBet] = useState(100);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'cashed_out' | 'exploded'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [nextMultiplier, setNextMultiplier] = useState(1.0);

  const calculateNextMultiplier = (currentRevealedCount: number) => {
     const totalTiles = 25;
     const remainingTiles = totalTiles - currentRevealedCount;
     const safeRemaining = remainingTiles - mineCount;
     if (safeRemaining <= 0) return 0;
     return 1 / (safeRemaining / remainingTiles); 
  };

  const startGame = () => {
    const newGrid = Array(25).fill(1);
    let bombsPlaced = 0;
    while (bombsPlaced < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (newGrid[idx] !== 2) { newGrid[idx] = 2; bombsPlaced++; }
    }
    setGrid(newGrid);
    setRevealed(Array(25).fill(false));
    setGameState('playing');
    setCurrentMultiplier(1.0);
    setNextMultiplier(calculateNextMultiplier(0));
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || revealed[index]) return;
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index] === 2) {
      setGameState('exploded');
      setRevealed(newRevealed.map((r, i) => grid[i] === 2 ? true : r));
    } else {
      const gemsFound = newRevealed.filter((r, i) => r && grid[i] === 1).length;
      const multIncrease = calculateNextMultiplier(gemsFound - 1);
      const newMult = currentMultiplier * multIncrease;
      setCurrentMultiplier(newMult);
      setNextMultiplier(newMult * calculateNextMultiplier(gemsFound));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full max-w-6xl mx-auto">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 bg-slate-900 p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 z-10">
          <div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                  <span>Bet Amount (₦)</span>
                  <span className="text-slate-400">Balance: ₦50,203</span>
              </div>
              <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 focus-within:border-emerald-500 transition-colors px-4 py-3 shadow-inner">
                  <Coins size={16} className="text-emerald-500 mr-2" />
                  <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} disabled={gameState === 'playing'} className="bg-transparent text-white font-bold w-full outline-none text-sm"/>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                  {[100, 500, 1000, 5000].map(amt => (
                      <button key={amt} onClick={() => setBet(amt)} disabled={gameState === 'playing'} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-400 py-1 rounded">
                          {amt}
                      </button>
                  ))}
              </div>
          </div>
          <div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                  <span>Mines</span>
                  <span className="text-emerald-400">{mineCount}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                  {[1, 3, 5, 10, 24].map(cnt => (
                    <button key={cnt} onClick={() => setMineCount(cnt)} disabled={gameState === 'playing'} className={`py-2 rounded-lg font-bold text-xs transition-all ${mineCount === cnt ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{cnt}</button>
                  ))}
              </div>
          </div>
          <div className="mt-auto">
             <div className="flex justify-between items-center mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Next Tile</span>
                <span className="text-emerald-400 font-black font-mono text-lg">x{nextMultiplier.toFixed(2)}</span>
             </div>
             {gameState === 'playing' ? (
                <button onClick={() => { onWin(bet * currentMultiplier); setGameState('cashed_out'); setRevealed(Array(25).fill(true)); }} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-xl shadow-[0_4px_0_0_#9a3412] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center leading-none gap-1">
                   <span>CASH OUT</span>
                   <span className="text-sm font-mono opacity-90">₦{(bet * currentMultiplier).toFixed(2)}</span>
                </button>
             ) : (
                <button onClick={startGame} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-xl shadow-[0_4px_0_0_#065f46] active:translate-y-[2px] active:shadow-none transition-all">START GAME</button>
             )}
          </div>
        </div>
        
        {/* Game Board */}
        <div className="flex-1 p-4 md:p-12 flex items-center justify-center bg-slate-950 relative overflow-hidden">
           {/* Background Deco */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950 to-slate-950"></div>
           
           <div className="grid grid-cols-5 gap-3 w-full max-w-[450px] aspect-square relative z-10">
              {grid.map((val, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => handleTileClick(idx)} 
                    disabled={gameState !== 'playing' && !revealed[idx]} 
                    className={`
                        relative rounded-xl transition-all duration-200 transform
                        ${!revealed[idx] 
                            ? 'bg-slate-800 hover:bg-slate-700 shadow-[0_4px_0_0_#0f172a] hover:-translate-y-0.5' 
                            : val === 2 
                                ? 'bg-red-500/20 border-2 border-red-500' 
                                : 'bg-emerald-500/20 border-2 border-emerald-500'}
                    `}
                 >
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${revealed[idx] ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                       {val === 2 ? <Bomb size={32} className="text-red-500 animate-pulse" /> : <Gem size={32} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />}
                    </div>
                 </button>
              ))}
           </div>
           
           {/* Result Overlay */}
           {gameState === 'cashed_out' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
                  <div className="bg-slate-900 p-8 rounded-3xl border border-emerald-500/30 shadow-2xl text-center transform scale-110">
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500">
                          <Trophy size={40} className="text-emerald-400 animate-bounce" />
                      </div>
                      <h3 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">Big Win!</h3>
                      <p className="text-3xl font-mono font-bold text-emerald-400 tracking-tighter mb-6">₦{(bet * currentMultiplier).toFixed(2)}</p>
                      <button onClick={() => setGameState('idle')} className="px-8 py-3 bg-white hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest rounded-xl shadow-lg transition-colors">Play Again</button>
                  </div>
              </div>
           )}
           {gameState === 'exploded' && (
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
                   <div className="bg-slate-900 p-8 rounded-3xl border border-red-500/30 shadow-2xl text-center">
                       <Bomb size={64} className="text-red-500 mx-auto mb-4" />
                       <h3 className="text-3xl font-black text-white mb-2 uppercase italic">Busted!</h3>
                       <p className="text-slate-400 mb-6">Better luck next time.</p>
                       <button onClick={() => setGameState('idle')} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-colors">Try Again</button>
                   </div>
               </div>
           )}
        </div>
    </div>
  );
};

// --- AVIATOR ENGINE (Logic Retained, UI Polished) ---
const AviatorGame = ({ onWin }: { onWin: (amt: number) => void }) => {
    const [multiplier, setMultiplier] = useState(1.0);
    const [state, setState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
    const [bet, setBet] = useState(100);
    const [hasCashed, setHasCashed] = useState(false);
    const [history, setHistory] = useState<number[]>([1.20, 2.55, 1.10, 15.40, 3.22]);

    useEffect(() => {
        let interval: any;
        const runCycle = () => {
            setState('waiting');
            setMultiplier(1.0);
            setHasCashed(false);
            
            setTimeout(() => {
                setState('flying');
                const startTime = Date.now();
                const crashPoint = Math.random() < 0.1 ? 1.0 : 1.0 + Math.random() * 5 + (Math.random() < 0.2 ? 10 : 0);
                
                interval = setInterval(() => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const current = 1 + (0.1 * elapsed) + (0.05 * Math.pow(elapsed, 2));
                    if (current >= crashPoint) {
                        setMultiplier(crashPoint);
                        setState('crashed');
                        setHistory(prev => [crashPoint, ...prev].slice(0, 10));
                        clearInterval(interval);
                        setTimeout(runCycle, 4000);
                    } else {
                        setMultiplier(current);
                    }
                }, 50);
            }, 4000);
        };
        runCycle();
        return () => clearInterval(interval);
    }, []);

    const handleCashout = () => {
        if (state === 'flying' && !hasCashed) {
            onWin(bet * multiplier);
            setHasCashed(true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 font-sans max-w-6xl mx-auto border-x border-slate-800">
            {/* History Bar */}
            <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2 overflow-hidden">
                <History size={14} className="text-slate-500 shrink-0" />
                {history.map((h, i) => (
                    <span key={i} className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${h >= 10 ? 'bg-purple-500/20 text-purple-400' : h >= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {h.toFixed(2)}x
                    </span>
                ))}
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                
                {/* Plane Graphic (CSS Animation) */}
                {state === 'flying' && (
                    <div className="absolute bottom-10 left-10 w-20 h-20 bg-red-500 rounded-full blur-[100px] animate-pulse"></div>
                )}

                <div className="text-center z-10 relative">
                    {state === 'crashed' ? (
                        <div className="animate-in zoom-in duration-300">
                           <h2 className="text-6xl md:text-8xl font-black text-red-500 italic tracking-tighter drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">FLEW AWAY!</h2>
                           <p className="text-3xl font-mono text-red-400/60 font-bold mt-2">{multiplier.toFixed(2)}x</p>
                        </div>
                    ) : state === 'waiting' ? (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-6"></div>
                            <h2 className="text-2xl font-black text-white italic tracking-widest uppercase">Waiting for next round</h2>
                            <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-red-500 animate-[progress_4s_linear]"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-7xl md:text-9xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                            {multiplier.toFixed(2)}x
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900 p-4 md:p-8 border-t border-slate-800">
                <div className="max-w-xl mx-auto flex gap-4 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-xl">
                    <div className="flex-1 flex flex-col justify-center px-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bet (₦)</label>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setBet(Math.max(10, bet - 10))} className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 font-bold">-</button>
                             <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-full bg-transparent text-white font-bold text-xl outline-none text-center"/>
                             <button onClick={() => setBet(bet + 10)} className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 font-bold">+</button>
                        </div>
                    </div>
                    {state === 'flying' ? (
                        <button onClick={handleCashout} disabled={hasCashed} className={`flex-[1.5] h-20 rounded-xl font-black text-2xl shadow-lg transition-all flex flex-col items-center justify-center leading-none gap-1 ${hasCashed ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-orange-500 text-white shadow-orange-500/20 active:scale-95 border-b-4 border-orange-700'}`}>
                            <span>{hasCashed ? "CASHED" : "CASH OUT"}</span>
                            {!hasCashed && <span className="text-sm font-mono opacity-80">₦{(bet * multiplier).toFixed(0)}</span>}
                        </button>
                    ) : (
                        <button disabled={state === 'crashed'} className={`flex-[1.5] h-20 rounded-xl text-white font-black text-2xl shadow-lg border-b-4 transition-all ${state === 'crashed' ? 'bg-slate-800 border-slate-700 opacity-50' : 'bg-emerald-600 border-emerald-800 hover:bg-emerald-500'}`}>
                            {state === 'waiting' ? 'BET PLACED' : 'BET'}
                        </button>
                    )}
                </div>
            </div>
            <style>{`@keyframes progress { 0% { width: 0% } 100% { width: 100% } }`}</style>
        </div>
    );
};

// --- SIMULATED LIVE VIDEO INTERFACE (HLS/WebRTC Mock) ---
const LiveVideoGame = ({ game, onWin }: { game: CasinoGameData, onWin: (amt: number) => void }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChip, setSelectedChip] = useState(500);
    const [placedBet, setPlacedBet] = useState(false);
    
    // Simulate Video Load
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    const handlePlaceBet = () => {
        setPlacedBet(true);
        setTimeout(() => {
            setPlacedBet(false);
            // Simulate 50% chance of win for demo purposes
            if (Math.random() > 0.5) {
                onWin(selectedChip * 2);
            }
        }, 3000);
    }

    return (
        <div className="relative w-full h-full flex flex-col bg-slate-900">
            {/* Main Video Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
                {/* Background Image simulating Video Feed */}
                <div 
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isLoading ? 'opacity-0 blur-xl' : 'opacity-100'}`}
                    style={{ backgroundImage: `url(${game.image})` }}
                ></div>
                
                {/* Connecting Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                         <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                         <p className="text-emerald-500 font-mono text-sm animate-pulse">ESTABLISHING SECURE FEED...</p>
                         <p className="text-slate-500 text-xs mt-2">Server: LDN-04 • Protocol: WebRTC • <span className="text-yellow-500">Latency: 12ms</span></p>
                    </div>
                )}

                {/* Live Badge & UI Overlay */}
                {!isLoading && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Top Left: Dealer Info */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                             <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]"></span>
                                <span className="font-bold text-xs">LIVE</span>
                             </div>
                             <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                                <Users size={12} className="text-emerald-400" />
                                <span className="font-mono text-xs font-bold">{game.players?.toLocaleString()}</span>
                             </div>
                        </div>

                         {/* Table Name */}
                         <div className="absolute top-4 right-4 text-right">
                             <h2 className="text-white font-black text-xl drop-shadow-lg uppercase italic">{game.name}</h2>
                             <p className="text-emerald-400 text-xs font-bold drop-shadow-md">Dealer: {game.dealer}</p>
                         </div>
                    </div>
                )}
            </div>

            {/* Betting Interface (Bottom) */}
            <div className="h-auto bg-slate-900 border-t border-slate-800 p-4 relative z-20">
                <div className="max-w-3xl mx-auto flex items-end justify-between gap-4">
                     {/* Chip Selector */}
                     <div className="flex-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 ml-1">Select Chip Amount</div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {[100, 500, 1000, 5000, 10000].map(amt => (
                                <button 
                                   key={amt}
                                   onClick={() => setSelectedChip(amt)}
                                   className={`
                                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border-2 shadow-lg transition-transform active:scale-95
                                      ${selectedChip === amt 
                                          ? 'border-white -translate-y-2 shadow-emerald-500/20 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white' 
                                          : 'border-transparent bg-slate-800 text-slate-400 hover:bg-slate-700'}
                                   `}
                                >
                                   {amt >= 1000 ? `${amt/1000}k` : amt}
                                </button>
                            ))}
                        </div>
                     </div>

                     {/* Action Button */}
                     <div className="flex-1 max-w-[200px]">
                         <div className="text-right text-[10px] text-slate-500 font-bold uppercase mb-2">Total Bet: ₦{selectedChip}</div>
                         <button 
                            onClick={handlePlaceBet}
                            disabled={isLoading || placedBet}
                            className={`
                                w-full h-14 rounded-xl font-black text-lg shadow-xl transition-all flex flex-col items-center justify-center leading-none
                                ${placedBet ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1'}
                            `}
                         >
                            {placedBet ? 'ACCEPTED' : 'PLACE BET'}
                         </button>
                     </div>
                </div>
                
                {/* Recent Results Strip (Fake OCR) */}
                <div className="flex justify-center gap-1 mt-4 opacity-50">
                    {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${Math.random() > 0.5 ? 'bg-red-600 text-white' : 'bg-black text-white border border-slate-700'}`}>
                           {Math.floor(Math.random() * 36)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN CASINO MODULE ---
const CasinoGame: React.FC<{ onWin: (amt: number) => void }> = ({ onWin }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Dynamic Game State from Firebase
  const [gamesList, setGamesList] = useState<CasinoGameData[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const casinoRef = ref(db, 'casino/games');
    const unsubscribe = onValue(casinoRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setGamesList(Object.values(data));
        }
        setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredGames = useMemo(() => {
    let result = activeTab === 'All' ? gamesList : gamesList.filter(g => g.category === activeTab);
    if (searchQuery) {
        result = result.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.provider.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [activeTab, searchQuery, gamesList]);

  const hotGames = useMemo(() => gamesList.filter(g => g.hot), [gamesList]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (isInitializing) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-4 text-emerald-500" size={32} />
            <p className="font-black text-xs uppercase tracking-widest">Connecting to Vegas Cluster...</p>
        </div>
    );
  }

  // --- EXPERT GAME PLAY INTERFACE (Overlay) ---
  if (activeGame) {
     const gameData = gamesList.find(g => g.id === activeGame);
     // Determine which engine to use
     const isLiveStreamGame = gameData?.category === 'Live Casino' || gameData?.category === 'Game Shows';
     const isMines = activeGame === 'mines';
     const isAviator = activeGame === 'aviator';

     return (
        <div className={`fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 ${isFullscreen ? 'p-0' : ''}`}>
           {/* Game Header */}
           <div className={`bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 h-16 shrink-0 z-50`}>
              <div className="flex items-center gap-4">
                 <button onClick={() => setActiveGame(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                 </button>
                 <div className="flex flex-col leading-none">
                    <span className="text-sm font-black text-white uppercase italic tracking-wide">{gameData?.name}</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1">
                       <ShieldCheck size={10} /> {gameData?.provider}
                    </span>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex flex-col items-end leading-none">
                     <span className="text-[9px] text-slate-500 uppercase font-bold">Real Balance</span>
                     <span className="text-emerald-400 font-mono font-bold">₦50,203.00</span>
                 </div>
                 <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                     {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                 </button>
              </div>
           </div>

           {/* Game Viewport */}
           <div className="flex-1 bg-slate-950 relative overflow-y-auto">
              {isMines ? (
                 <MinesGame onWin={onWin} />
              ) : isAviator ? (
                 <AviatorGame onWin={onWin} />
              ) : isLiveStreamGame && gameData ? (
                 <LiveVideoGame game={gameData} onWin={onWin} />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="relative z-10 bg-slate-900/80 backdrop-blur-md p-10 rounded-3xl border border-slate-800 shadow-2xl max-w-md">
                        <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 mx-auto border-4 border-slate-700 shadow-xl">
                             <Gamepad2 size={48} className="text-emerald-500" />
                        </div>
                        <h3 className="text-white font-black text-2xl mb-2 italic uppercase">{gameData?.name}</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            This game is simulated. In a real integration, the provider's iframe (Evolution, Pragmatic, etc.) would load here securely.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-left bg-slate-950 p-4 rounded-xl border border-slate-800 mb-8">
                             <div>
                                 <div className="text-[10px] text-slate-500 uppercase font-bold">RTP</div>
                                 <div className="text-emerald-400 font-bold">{gameData?.rtp}</div>
                             </div>
                             <div>
                                 <div className="text-[10px] text-slate-500 uppercase font-bold">Provider</div>
                                 <div className="text-white font-bold">{gameData?.provider}</div>
                             </div>
                        </div>
                        <button onClick={() => setActiveGame(null)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Return to Lobby</button>
                    </div>
                 </div>
              )}
           </div>
        </div>
     );
  }

  // --- EXPERT LOBBY VIEW ---
  return (
    <div className="min-h-screen bg-slate-950 font-sans pb-24">
      {/* 1. Sticky Header & Search */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 pt-3 pb-1">
        <div className="px-4 mb-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search games, providers (e.g. Evolution)..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all shadow-inner"
              />
           </div>
        </div>

        {/* Categories (Horizontal Scroll) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2">
           <button
             onClick={() => setActiveTab('All')}
             className={`shrink-0 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border ${activeTab === 'All' ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'}`}
           >
             ALL GAMES
           </button>
           {CATEGORIES.filter(c => c.id !== 'All').map(cat => (
              <button
                 key={cat.id}
                 onClick={() => setActiveTab(cat.id)}
                 className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${activeTab === cat.id ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white hover:border-slate-700'}`}
              >
                 <cat.icon size={12} /> {cat.label}
              </button>
           ))}
        </div>
      </div>

      <div className="p-4 space-y-8 max-w-7xl mx-auto">
         
         {/* 2. Promotional Carousel (Only on All) */}
         {activeTab === 'All' && !searchQuery && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
                {PROMO_BANNERS.map(promo => (
                    <div key={promo.id} className={`snap-center shrink-0 w-[85%] sm:w-[400px] h-48 rounded-2xl relative overflow-hidden bg-gradient-to-br ${promo.bg} border border-white/10 group`}>
                        <div className="absolute inset-0 mix-blend-overlay opacity-60">
                            <img src={promo.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        </div>
                        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black via-transparent to-transparent">
                            <h3 className="text-2xl font-black text-white uppercase italic">{promo.title}</h3>
                            <p className="text-white/80 text-sm font-medium mb-3">{promo.sub}</p>
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest w-fit transition-colors">Play Now</button>
                        </div>
                    </div>
                ))}
            </div>
         )}

         {/* 3. Hot Games Rail */}
         {activeTab === 'All' && !searchQuery && (
             <section>
                 <div className="flex items-center gap-2 mb-4">
                     <Flame className="text-orange-500" size={18} fill="currentColor" />
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Trending Now</h3>
                 </div>
                 <div className="flex gap-3 overflow-x-auto no-scrollbar">
                     {hotGames.map(game => (
                         <div key={game.id} className="w-[120px] shrink-0">
                            <GameCard game={game} onClick={setActiveGame} onFavorite={toggleFavorite} isFavorite={favorites.includes(game.id)} compact />
                         </div>
                     ))}
                 </div>
             </section>
         )}

         {/* 4. Main Grid */}
         <section>
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <LayoutGrid className="text-emerald-500" size={18} />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{activeTab === 'All' ? 'All Games' : activeTab}</h3>
               </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
               {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} onClick={setActiveGame} onFavorite={toggleFavorite} isFavorite={favorites.includes(game.id)} />
               ))}
            </div>
            {filteredGames.length === 0 && (
                <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                    <Ghost size={48} className="mx-auto mb-4 text-slate-800" />
                    <p className="text-slate-500 font-bold text-sm">No games found.</p>
                </div>
            )}
         </section>
      </div>
    </div>
  );
};

// --- COVER FUNCTION CARD DESIGN (ILOT Style) ---
const GameCard: React.FC<{ 
  game: CasinoGameData; 
  onClick: (id: string) => void; 
  onFavorite: (e: React.MouseEvent, id: string) => void; 
  isFavorite: boolean;
  compact?: boolean;
}> = ({ game, onClick, onFavorite, isFavorite, compact }) => (
    <div 
        onClick={() => onClick(game.id)}
        className={`group relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer shadow-lg border border-transparent hover:border-emerald-500/50 transition-all duration-300 ${game.status !== 'online' ? 'opacity-50 grayscale' : ''}`}
    >
        {/* Main Cover Image */}
        <div className={`relative ${compact ? 'aspect-[3/4]' : 'aspect-[3/4]'} bg-slate-800`}>
            <img 
                src={game.image} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={game.name} 
                loading="lazy"
            />
            
            {/* Live Badge */}
            {game.isLive && (
               <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm animate-pulse z-10">
                   <div className="w-1 h-1 bg-white rounded-full"></div> LIVE
               </div>
            )}
            
            {/* Overlay Gradient (Always visible but stronger on hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 transform scale-50 group-hover:scale-100 transition-transform">
                    <Play size={16} fill="currentColor" />
                </div>
            </div>

            {/* Content (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-xs font-black text-white leading-tight mb-0.5 drop-shadow-md truncate">{game.name}</h4>
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 truncate max-w-[70%]">{game.provider}</span>
                    {/* Favorite Toggle */}
                    <button 
                       onClick={(e) => onFavorite(e, game.id)}
                       className={`transition-colors ${isFavorite ? 'text-red-500' : 'text-slate-600 hover:text-white'}`}
                    >
                        <Heart size={12} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
        
        {/* RTP Strip (Expert Detail) */}
        {!compact && (
            <div className="bg-slate-900 px-2 py-1 flex items-center justify-between border-t border-slate-800">
                <span className="text-[8px] font-mono text-slate-500">{game.rtp}</span>
                {game.players && (
                    <span className="text-[8px] font-bold text-emerald-500 flex items-center gap-0.5">
                        <Users size={8} /> {game.players}
                    </span>
                )}
            </div>
        )}
    </div>
);

export default CasinoGame;
