import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles, Cpu, Award, FileText, Check, RefreshCw } from 'lucide-react';

const AtsScoreGauge = ({ analysis, onReanalyze, reanalyzing }) => {
  if (!analysis) return null;

  const {
    overallScore = 0,
    scoreCategory = 'Moderate Match',
    technicalSkillsScore = 0,
    projectsExperienceScore = 0,
    resumeStructureScore = 0,
    matchedSkills = [],
    missingSkills = [],
    suggestions = [],
    analysisSource = 'LLM_Gemini',
    confidence = 0.9,
    cached = false,
  } = analysis;

  // Determine accent colors based on overall score
  const getCategoryColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', stroke: '#10B981' };
    if (score >= 60) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', stroke: '#F59E0B' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', stroke: '#EF4444' };
  };

  const theme = getCategoryColor(overallScore);
  const strokeDashoffset = 283 - (283 * overallScore) / 100;

  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Top Section: Radial Score Gauge & Primary Metric */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Radial SVG Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle cx="50" cy="50" r="45" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
            {/* Animated Score Progress */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke={theme.stroke}
              strokeWidth="8"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white font-mono">{overallScore}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">ATS Match</span>
          </div>
        </div>

        {/* Overall Match Summary */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${theme.bg} ${theme.text} ${theme.border}`}>
              {scoreCategory}
            </span>
            {cached && (
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">
                ⚡ Cached Result
              </span>
            )}
          </div>

          <h4 className="text-base font-extrabold text-white">AI Resume Compatibility Analysis</h4>
          <p className="text-slate-400 leading-relaxed text-xs">
            Calculated using weighted sub-scores: 50% Technical Skills, 35% Projects & Experience, and 15% Resume Structure.
          </p>

          {onReanalyze && (
            <button
              onClick={onReanalyze}
              disabled={reanalyzing}
              className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              <span>{reanalyzing ? 'Re-analyzing...' : 'Force Re-analyze'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Scores Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>Technical Skills</span>
            </span>
            <span className="font-mono font-bold text-violet-300">{technicalSkillsScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-violet-500 h-2 rounded-full transition-all duration-500" style={{ width: `${technicalSkillsScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 block">Weight: 50%</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Projects & Exp</span>
            </span>
            <span className="font-mono font-bold text-emerald-300">{projectsExperienceScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${projectsExperienceScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 block">Weight: 35%</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Structure & Format</span>
            </span>
            <span className="font-mono font-bold text-amber-300">{resumeStructureScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${resumeStructureScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 block">Weight: 15%</span>
        </div>
      </div>

      {/* Matched & Missing Skills Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Skills */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
          <h5 className="font-extrabold text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Matched Technical Keywords ({matchedSkills.length})</span>
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((sk, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[11px] font-semibold">
                ✓ {sk}
              </span>
            ))}
            {matchedSkills.length === 0 && (
              <span className="text-slate-400 italic text-xs">No explicit required skills matched yet.</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-500/10 space-y-3">
          <h5 className="font-extrabold text-red-300 text-xs flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Missing Keywords ({missingSkills.length})</span>
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((sk, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-[11px] font-semibold">
                ✗ {sk}
              </span>
            ))}
            {missingSkills.length === 0 && (
              <span className="text-emerald-400 font-semibold text-xs">🎉 Excellent! You have all required skills.</span>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Improvement Suggestions */}
      {suggestions.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-900/60 space-y-3">
          <h5 className="font-extrabold text-white text-xs flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Actionable Resume Enhancements</span>
          </h5>
          <ul className="space-y-2 text-xs text-slate-300">
            {suggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Telemetry Metadata Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
        <span>Source: {analysisSource === 'LLM_Gemini' ? '✨ Gemini 1.5 Flash LLM' : '⚙ Heuristic Rules Engine'}</span>
        <span>Confidence: {(confidence * 100).toFixed(0)}% &bull; Schema v1.0</span>
      </div>
    </div>
  );
};

export default AtsScoreGauge;
