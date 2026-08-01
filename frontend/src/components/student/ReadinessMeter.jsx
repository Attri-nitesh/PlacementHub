import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lightbulb, Zap } from 'lucide-react';

const ReadinessMeter = ({ metrics }) => {
  if (!metrics) return null;

  const { readinessScore, weakAreas, strongAreas, recommendations } = metrics;

  // Determine score color theme
  let scoreColor = 'from-emerald-500 to-teal-400';
  let badgeText = 'Recruiter Ready';
  if (readinessScore < 50) {
    scoreColor = 'from-red-500 to-amber-500';
    badgeText = 'Needs Preparation';
  } else if (readinessScore < 75) {
    scoreColor = 'from-amber-500 to-yellow-400';
    badgeText = 'Moderate Readiness';
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-slate-900/60 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Readiness Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Placement Readiness Score</h2>
          <p className="text-xs text-slate-400">
            Calculated in real-time from academic CGPA, resume ATS status, project portfolio & coding handles.
          </p>
        </div>

        {/* Score Radial Indicator */}
        <div className="flex items-center space-x-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
          <div className="text-right">
            <div className="text-3xl font-extrabold text-white font-mono">{readinessScore}<span className="text-lg text-slate-400">/100</span></div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{badgeText}</span>
          </div>
          <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-white/10 to-white/5 relative flex items-center justify-center">
            <div className={`w-full h-full rounded-full bg-gradient-to-tr ${scoreColor} flex items-center justify-center font-black text-white text-sm shadow-glow-emerald`}>
              {readinessScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress Gauge Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Preparedness Gauge</span>
          <span className="text-white font-mono">{readinessScore}%</span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${readinessScore}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${scoreColor}`}
          />
        </div>
      </div>

      {/* Strong & Weak Areas Breakdown */}
      <div className="grid md:grid-cols-2 gap-4 pt-2">
        {/* Strong Areas */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strong Portfolio Pillars ({strongAreas?.length || 0})</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {strongAreas?.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weak Areas & Recommendations */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Areas For Improvement ({weakAreas?.length || 0})</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {weakAreas?.length > 0 ? (
              weakAreas.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No major weak areas detected! Keep up the momentum.</li>
            )}
          </ul>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations?.length > 0 && (
        <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-start space-x-3 text-xs text-slate-300">
          <Lightbulb className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-violet-300">AI Placement Advisor Suggestion:</span>
            <p>{recommendations[0]}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadinessMeter;
