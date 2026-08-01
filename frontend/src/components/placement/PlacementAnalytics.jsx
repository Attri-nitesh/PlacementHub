import React, { useState, useEffect } from 'react';
import { getPlacementAnalytics, getExportReportUrl } from '../../services/placementApi';
import { motion } from 'framer-motion';
import { BarChart3, Download, Building2, TrendingUp, Award, DollarSign } from 'lucide-react';

const PlacementAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getPlacementAnalytics();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Failed to fetch placement analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!analytics) return null;

  const { companyStats, totalApplications, totalOffers, totalRejections } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Banner & CSV Exporter Action */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-violet-400" />
            <span>Placement Intelligence & Report Exporter</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time analytics for corporate partner recruitment stats and candidate conversion rates.
          </p>
        </div>

        <a
          href={getExportReportUrl()}
          download
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-glow-emerald transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export 1-Click CSV Report</span>
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-slate-900/60 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
          <div className="text-3xl font-extrabold text-white font-mono">{totalApplications}</div>
          <p className="text-[11px] text-slate-400">Applications received across drives</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Offers Released</span>
          <div className="text-3xl font-extrabold text-white font-mono">{totalOffers}</div>
          <p className="text-[11px] text-emerald-300">Offers handed to candidates</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-red-500/30 bg-red-500/10 space-y-1">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Total Rejections</span>
          <div className="text-3xl font-extrabold text-white font-mono">{totalRejections}</div>
          <p className="text-[11px] text-red-300">Candidates unselected</p>
        </div>
      </div>

      {/* Company Wise Breakdown */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 space-y-6">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <span>Company-Wise Recruitment Breakdown</span>
        </h3>

        <div className="space-y-4">
          {companyStats &&
            Object.entries(companyStats).map(([compName, data]) => {
              const conversion = data.total > 0 ? Math.round((data.offers / data.total) * 100) : 0;
              return (
                <div key={compName} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white text-sm">{compName}</span>
                    <span className="text-emerald-400 font-mono">
                      {data.offers} Offers / {data.total} Apps ({conversion}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      style={{ width: `${Math.max(10, conversion)}%` }}
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
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

export default PlacementAnalytics;
