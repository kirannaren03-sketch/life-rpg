import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Shield, Sparkles, ChevronRight, Zap, Check } from 'lucide-react';
import { getPlayerTitle } from '../utils/constants';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  level,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });

        const timer = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00f0ff', '#10b981'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#00f0ff', '#10b981'],
          });
        }, 250);

        return () => clearTimeout(timer);
      } catch {
        // Ignore if canvas is unsupported
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const title = getPlayerTitle(level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0e1730] to-[#060a16] border border-cyan-500/50 p-6 text-center text-slate-100 shadow-2xl shadow-cyan-500/20">
        
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-cyan-500/30 blur-3xl" />

        {/* Animated Badge */}
        <div className="relative mx-auto mb-4 w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-emerald-400 p-[3px] shadow-2xl shadow-cyan-500/40 glow-cyan">
          <div className="w-full h-full rounded-[21px] bg-[#070d1e] flex flex-col items-center justify-center">
            <Shield className="w-6 h-6 text-cyan-400 mb-0.5" />
            <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tabular-nums">
              LVL {level}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Level Up Accomplished!
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-1">
          Level {level} Reached
        </h3>
        
        <p className="text-sm font-semibold text-emerald-400 mb-5">
          New Rank: {title}
        </p>

        {/* Level Perks / Attributes boost summary */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2 mb-6">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Attributes Enhanced
          </span>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Discipline Capacity</span>
            <span className="font-mono font-bold text-emerald-400">+10 Max Focus</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Life Progression Tier</span>
            <span className="font-mono font-bold text-cyan-400">Tier {Math.min(5, Math.ceil(level / 2))}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Daily XP Multiplier Potential</span>
            <span className="font-mono font-bold text-purple-400">Unlocked</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 font-bold text-sm text-slate-950 shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <span>Claim Progress</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>

      </div>
    </div>
  );
};
