
import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Zap, ShieldCheck, Trophy, Flame } from 'lucide-react';

const ADS = [
  {
    id: 1,
    title: "Champions League Night",
    subtitle: "Boosted odds on Manchester City vs Real Madrid",
    bg: "from-blue-900 via-blue-800 to-slate-900",
    icon: <Trophy className="text-yellow-400 fill-yellow-400" size={24} />,
    action: "Bet Now",
    image: "https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "200% Welcome Bonus",
    subtitle: "Double your first deposit up to $500",
    bg: "from-emerald-900 via-emerald-800 to-slate-900",
    icon: <Star className="text-emerald-400 fill-emerald-400" size={24} />,
    action: "Claim Now",
    image: null
  },
  {
    id: 3,
    title: "NBA Finals Heat Up",
    subtitle: "Watch live and bet in-play with zero latency",
    bg: "from-orange-900 via-red-900 to-slate-900",
    icon: <Flame className="text-orange-500 fill-orange-500" size={24} />,
    action: "View Markets",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ee2?q=80&w=1000&auto=format&fit=crop"
  }
];

const AdBanner: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ADS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 shadow-xl group bg-slate-900 border border-slate-800">
      {ADS.map((ad, index) => (
        <div 
          key={ad.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Background Image/Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${ad.bg}`}></div>
          {ad.image && (
             <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img src={ad.image} alt="Background" className="w-full h-full object-cover" />
             </div>
          )}
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 z-20">
             <div className="max-w-[80%] sm:max-w-[60%] space-y-2 translate-y-0 transition-transform duration-700">
                <div className="flex items-center gap-2 opacity-90 animate-[fadeIn_0.5s_0.2s_both]">
                   <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                      {ad.icon}
                   </div>
                   <span className="text-xs font-bold uppercase tracking-wider text-white/80 bg-black/20 px-2 py-1 rounded">Featured</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg animate-[slideInUp_0.5s_0.3s_both]">
                   {ad.title}
                </h3>
                
                <p className="text-white/80 text-sm font-medium line-clamp-2 animate-[slideInUp_0.5s_0.4s_both]">
                   {ad.subtitle}
                </p>
                
                <div className="pt-2 animate-[slideInUp_0.5s_0.5s_both]">
                   <button className="bg-white hover:bg-emerald-50 text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                      {ad.action} <ArrowRight size={16} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      ))}

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-6 sm:left-10 flex gap-2 z-30">
         {ADS.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-white w-6' : 'bg-white/30 w-1.5 hover:bg-white/50'}`}
            />
         ))}
      </div>
    </div>
  );
};

export default AdBanner;
