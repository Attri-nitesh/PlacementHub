import React, { useState, useEffect } from 'react';
import { getStudentAnalytics } from '../../services/studentApi';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, XCircle, CheckCircle2, Target } from 'lucide-react';

const StudentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getStudentAnalytics();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!analytics) return null;

  const { totalApplied, totalOffers, totalRejected, totalInterviews, successRate, stageBreakdown } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applied</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalApplied}</div>
          <p className="text-[11px] text-slate-400">Submissions to campus drives</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Offers Received</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalOffers}</div>
          <p className="text-[11px] text-emerald-300">Final job offers secured</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-amber-500/10 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Interviews Shortlist</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalInterviews}</div>
          <p className="text-[11px] text-amber-300">Active interview rounds</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-violet-500/30 bg-violet-500/10 space-y-2">
          <div className="flex items-center justify-between text-violet-400">
            <span className="text-xs font-bold uppercase tracking-wider">Success Conversion</span>
            <BarChart3 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{successRate}%</div>
          <p className="text-[11px] text-violet-300">Offer ratio per application</p>
        </div>
      </div>

      {/* Stage Breakdown Progress Bars */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 space-y-6">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <span>Recruitment Pipeline Stage Breakdown</span>
        </h3>

        <div className="space-y-4">
          {stageBreakdown &&
            Object.entries(stageBreakdown).map(([stage, count]) => {
              const percentage = totalApplied > 0 ? Math.round((count / totalApplied) * 100) : 0;
              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{stage}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        stage === 'Offer'
                          ? 'bg-emerald-400'
                          : stage === 'Rejected'
                          ? 'bg-red-400'
                          : 'bg-violet-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
