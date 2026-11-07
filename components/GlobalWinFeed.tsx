
import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Zap, Users } from 'lucide-react';
import { db } from '../services/firebase';
import { ref, push, onValue, limitToLast, query } from 'firebase/database';

interface WinEvent {
  id: string;
  user: string;
  amount: number;
  game: string;
  timestamp: number;
}

const GlobalWinFeed: React.FC = () => {
  const [wins, setWins] = useState<WinEvent[]>([]);

  useEffect(() => {
    // Only listen to real database events
    const winsRef = query(ref(db, 'global_wins'), limitToLast(5));
    const unsubscribe = onValue(winsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data) as WinEvent[];
        setWins(list.reverse());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (wins.length === 0) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border-y border-slate-800 py-2 overflow-hidden whitespace-nowrap relative">
      <div className="flex items-center animate-scroll gap-8 px-4">
        <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest shrink-0">
          <Zap size={14} fill="currentColor" /> Live Wins
        </div>
        {wins.map(win => (
          <div key={win.id} className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 font-bold text-[10px]">{win.user}</span>
            <span className="text-slate-500 text-[10px] uppercase">won</span>
            <span className="text-emerald-400 font-mono font-black text-xs">₦{win.amount.toLocaleString()}</span>
            <span className="text-slate-500 text-[10px] uppercase">on {win.game}</span>
            <div className="w-1 h-1 bg-slate-700 rounded-full mx-2"></div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
          display: inline-flex;
        }
      `}</style>
    </div>
  );
};

export default GlobalWinFeed;
