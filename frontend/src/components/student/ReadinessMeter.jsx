import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertCircle, Lightbulb, Zap, ArrowUpRight } from 'lucide-react';

const ReadinessMeter = ({ metrics }) => {
  const readinessScore = metrics?.readinessScore || 72;

  const pillars = [
    { name: 'Resume (ATS Score)', score: 85, status: 'Optimal' },
    { name: 'Technical Skills', score: 75, status: 'Good' },
    { name: 'Coding Practice', score: 80, status: 'Strong' },
    { name: 'Project Portfolio', score: 70, status: 'Moderate' },
    { name: 'Interview Prep', score: 65, status: 'Needs Review' },
  ];

  // SVG Circle parameters for radial gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="bg-[#111622] rounded-3xl border border-[#1E2E4A] p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2E4A] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#2E5AF0]/10 border border-[#2E5AF0]/20 text-[#2E5AF0] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#2E5AF0]" />
            <span>Placement Readiness Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Placement Readiness Index
          </h2>
          <p className="text-xs text-slate-400 font-['Inter']">
            Comprehensive evaluation across academic CGPA, resume ATS status, project portfolio & coding profiles.
          </p>
        </div>

        {/* Circular Radial Gauge */}
        <div className="flex items-center space-x-4 bg-[#162032] border border-[#1E2E4A] px-5 py-3 rounded-2xl shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[#2E5AF0]"
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-white font-['Plus_Jakarta_Sans'] leading-none">
                {readinessScore}%
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-['Plus_Jakarta_Sans'] font-mono">
              {readinessScore}<span className="text-sm text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-bold text-[#2E5AF0] uppercase tracking-wider block mt-0.5">
              Recruiter Ready
            </span>
          </div>
        </div>
      </div>

      {/* 5 Pillars Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {pillars.map((pillar, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-[#162032] border border-[#1E2E4A] space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 font-['Inter'] truncate">
                {pillar.name}
              </span>
              <span className="text-xs font-mono font-bold text-white ml-1">
                {pillar.score}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pillar.score}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="h-full bg-gradient-to-r from-[#2E5AF0] to-[#3B82F6] rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Status:</span>
              <span className="font-semibold text-slate-200">{pillar.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadinessMeter;
