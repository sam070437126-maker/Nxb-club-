
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Power } from 'lucide-react';

export const WelcomeModal = ({ onComplete }: { onComplete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('nxb_onboarded');
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleInitialize = () => {
    setIsInitializing(true);
    
    // Simulate engine startup sequence
    setTimeout(() => {
      localStorage.setItem('nxb_onboarded', 'true');
      setIsOpen(false);
      onComplete(); // Callback to trigger initial app sounds/anims
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-md w-full mx-4 bg-slate-900 border border-slate-700/50 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          <div className="mb-6 p-4 bg-slate-800 rounded-full border border-slate-700 shadow-inner">
             {isInitializing ? (
                <Cpu size={48} className="text-emerald-400 animate-pulse" />
             ) : (
                <ShieldCheck size={48} className="text-white" />
             )}
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isInitializing ? "Initializing Engine..." : "Welcome to the Simulation"}
          </h2>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            You are entering a <span className="text-white font-bold">risk-free, high-fidelity sports trading environment</span>. 
            You have been granted <span className="text-emerald-400 font-bold font-mono">$1,000</span> Virtual Credits. 
            <br/><br/>
            This is a simulation engine powered by Google Gemini AI. No real money is involved.
          </p>

          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className={`
              w-full py-4 rounded-xl font-bold text-lg tracking-wider flex items-center justify-center gap-2 transition-all duration-300
              ${isInitializing 
                ? 'bg-slate-800 text-slate-500 cursor-wait' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transform hover:-translate-y-1'}
            `}
          >
             {isInitializing ? (
                <>Loading Assets...</>
             ) : (
                <><Power size={20} /> INITIALIZE ENGINE</>
             )}
          </button>
          
          <div className="mt-4 text-[10px] text-slate-600 uppercase font-bold tracking-widest">
             Secure Sandbox Environment v2.4
          </div>
        </div>
      </div>
    </div>
  );
};
