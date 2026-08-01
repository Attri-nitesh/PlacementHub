import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Layers, Sparkles, Rocket } from 'lucide-react';

const ComingSoon = ({ title, description, icon: HeaderIcon, phase = 'Phase 2' }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 min-h-[460px] glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
      {/* Background Animated Gradient Orb */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Main Card Content */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md space-y-5 relative z-10"
      >
        {/* Floating Hero Visual Badge */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600/20 via-purple-500/20 to-emerald-500/20 border border-white/15 flex items-center justify-center shadow-glass mx-auto">
            {HeaderIcon ? (
              <HeaderIcon className="w-10 h-10 text-violet-400" />
            ) : (
              <Layers className="w-10 h-10 text-violet-400" />
            )}
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </motion.div>
        </div>

        {/* Phase Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wider uppercase">
          <Rocket className="w-3.5 h-3.5 text-violet-400" />
          <span>Scheduled for {phase}</span>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {description || `The ${title} module is currently under active engineering design. Check back in Phase 2 for full interactive features.`}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>Architecture & Database Contracts Prepared</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
