
import React, { useState, useEffect } from 'react';

// --- COUNT UP ANIMATION ---
export const CountUp = ({ value, prefix = '', className = '', masked = false }: { value: number, prefix?: string, className?: string, masked?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTime: number;
    const startValue = displayValue;
    const endValue = value;
    const duration = 1000; // 1 second animation

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = startValue + (endValue - startValue) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  if (masked) {
    return <span className={`${className} tracking-widest`}>****</span>;
  }

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};

// --- TYPEWRITER EFFECT ---
export const Typewriter = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const speed = 20; // ms per char

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

// --- CSS CONFETTI ---
export const Confetti = () => {
  // Generate random particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 0.5,
    backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 w-3 h-3 rounded-sm animate-fall opacity-0"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.backgroundColor,
            animationDelay: `${p.animationDelay}s`
          }}
        />
      ))}
    </div>
  );
};
