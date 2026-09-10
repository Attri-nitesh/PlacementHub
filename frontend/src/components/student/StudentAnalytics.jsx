import React, { useState, useEffect } from 'react';
import { getApplications } from '../../services/studentApi';
import { useSocket } from '../../context/SocketContext';
import {
  BarChart3,
  Target,
  Filter,
  Calendar,
} from 'lucide-react';

const StudentAnalytics = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications for analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchAnalyticsData();
    socket.on('application_updated', handleUpdate);
    socket.on('application_created', handleUpdate);
    socket.on('application_deleted', handleUpdate);
    return () => {
      socket.off('application_updated', handleUpdate);
      socket.off('application_created', handleUpdate);
      socket.off('application_deleted', handleUpdate);
    };
  }, [socket]);

  const totalApplied = applications.length;

  // 1. Status Breakdown directly derived from Application Kanban stages
  const stageCounts = {
    Applied: 0,
    Shortlisted: 0,
    OA: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };

  applications.forEach((app) => {
    const st = app.stage || 'Applied';
    if (st === 'Applied') stageCounts.Applied++;
    else if (st === 'Resume Shortlisted') stageCounts.Shortlisted++;
    else if (st === 'OA') stageCounts.OA++;
    else if (st === 'Interview') stageCounts.Interview++;
    else if (st === 'Offer Released' || st === 'Selected' || st === 'Offer') stageCounts.Offer++;
    else if (st === 'Rejected') stageCounts.Rejected++;
    else stageCounts.Applied++;
  });

  const breakdown = [
    { label: 'Applied', count: stageCounts.Applied, color: '#2E5AF0' },
    { label: 'Shortlisted', count: stageCounts.Shortlisted, color: '#8B5CF6' },
    { label: 'Online Assessment (OA)', count: stageCounts.OA, color: '#06B6D4' },
    { label: 'Interview', count: stageCounts.Interview, color: '#F59E0B' },
    { label: 'Offer Received', count: stageCounts.Offer, color: '#10B981' },
    { label: 'Rejected', count: stageCounts.Rejected, color: '#EF4444' },
  ].map((item) => ({
    ...item,
    percentage: totalApplied > 0 ? `${((item.count / totalApplied) * 100).toFixed(1)}%` : '0.0%',
  }));

  // 2. Funnel Conversions calculated from actual Application Kanban data
  const reachedOA = applications.filter((a) =>
    ['OA', 'Interview', 'Offer Released', 'Selected', 'Offer'].includes(a.stage)
  ).length;

  const reachedInterview = applications.filter((a) =>
    ['Interview', 'Offer Released', 'Selected', 'Offer'].includes(a.stage)
  ).length;

  const reachedOffer = applications.filter((a) =>
    ['Offer Released', 'Selected', 'Offer'].includes(a.stage)
  ).length;

  const appToOA = totalApplied > 0 ? Math.round((reachedOA / totalApplied) * 100) : 0;
  const oaToInterview = reachedOA > 0 ? Math.round((reachedInterview / reachedOA) * 100) : 0;
  const interviewToOffer = reachedInterview > 0 ? Math.round((reachedOffer / reachedInterview) * 100) : 0;

  const conversionStats = [
    {
      metric: totalApplied > 0 ? `${appToOA}%` : '0%',
      label: 'Application → Online Assessment',
      sub: totalApplied > 0 ? 'Resume & ATS shortlist rate' : 'No application data yet',
      badge: totalApplied > 0 ? `${reachedOA} shortlisted` : '0 applications',
      trendColor: appToOA > 50 ? 'text-emerald-400' : 'text-blue-400',
    },
    {
      metric: reachedOA > 0 ? `${oaToInterview}%` : '0%',
      label: 'Online Assessment → Interview',
      sub: reachedOA > 0 ? 'Technical test pass ratio' : 'No OA data yet',
      badge: reachedOA > 0 ? `${reachedInterview} interviewed` : '0 tests',
      trendColor: oaToInterview > 30 ? 'text-emerald-400' : 'text-cyan-400',
    },
    {
      metric: reachedInterview > 0 ? `${interviewToOffer}%` : '0%',
      label: 'Interview → Offer',
      sub: reachedInterview > 0 ? 'Final interview conversion' : 'No interview data yet',
      badge: reachedOffer > 0 ? `${reachedOffer} offers` : '0 offers',
      trendColor: interviewToOffer > 50 ? 'text-emerald-400' : 'text-amber-400',
    },
  ];

  // 3. Applications Per Month dynamically computed from real application submission dates
  const months = ['March', 'April', 'May', 'June', 'July', 'August'];
  const monthCounts = { March: 0, April: 0, May: 0, June: 0, July: 0, August: 0 };

  applications.forEach((app) => {
    const d = new Date(app.appliedDate || app.createdAt);
    if (!isNaN(d.getTime())) {
      const monthName = d.toLocaleString('en-US', { month: 'long' });
      if (monthCounts[monthName] !== undefined) {
        monthCounts[monthName]++;
      }
    }
  });

  const maxMonthCount = Math.max(...Object.values(monthCounts), 1);

  const monthlyData = months.map((m) => {
    const cnt = monthCounts[m] || 0;
    const pct = totalApplied > 0 && maxMonthCount > 0 ? (cnt / maxMonthCount) * 100 : 0;
    return {
      month: m,
      count: cnt,
      height: cnt > 0 ? `${Math.max(pct, 12)}%` : '4px',
    };
  });

  // SVG Donut Chart Calculation
  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedOffset = 0;
  const donutSegments = breakdown.map((item) => {
    const strokeDasharray = totalApplied > 0
      ? `${(item.count / totalApplied) * donutCircumference} ${donutCircumference}`
      : `0 ${donutCircumference}`;
    const strokeDashoffset = -accumulatedOffset;
    if (totalApplied > 0) {
      accumulatedOffset += (item.count / totalApplied) * donutCircumference;
    }
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Analytics Page Header */}
      <div className="bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#2E5AF0]/10 border border-[#2E5AF0]/20 text-[#2E5AF0] text-[11px] font-mono font-bold">
            <BarChart3 className="w-3 h-3 text-[#2E5AF0]" />
            <span>Performance Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] truncate">
            Application Analytics
          </h1>
          <p className="text-xs text-slate-400 font-['Inter'] truncate">
            A deeper look at your application activity and conversion.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#162032] border border-[#1E2E4A] px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-slate-300 shrink-0">
          <Calendar className="w-4 h-4 text-[#2E5AF0]" />
          <span>Placement Season 2026</span>
        </div>
      </div>

      {/* 2. Conversion Statistics (3 Funnel Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {conversionStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-['Inter']">
                Funnel Conversion
              </span>
              <span className={`text-[10px] font-mono font-bold ${stat.trendColor} bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10`}>
                {stat.badge}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
              {loading ? '...' : stat.metric}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 font-['Plus_Jakarta_Sans'] truncate">
                {stat.label}
              </h4>
              <p className="text-[10px] text-slate-400 font-['Inter'] truncate mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Grid: Applications Per Month & Status Breakdown */}
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        {/* Applications Per Month (Bar Chart) - 8 columns on desktop */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#2E5AF0]" />
                <span>Applications Per Month</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-['Inter']">
                Total job applications submitted per month from March to August
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#2E5AF0] bg-[#2E5AF0]/10 px-2.5 py-1 rounded-md border border-[#2E5AF0]/20 shrink-0">
              {loading ? '...' : `${totalApplied} Cumulative`}
            </span>
          </div>

          {/* Compact Bar Chart Visualization */}
          <div className="pt-1">
            <div className="flex items-end justify-between h-36 sm:h-40 px-3 pt-4 pb-1 border-b border-slate-800/80 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
                <div className="border-b border-slate-500 w-full" />
                <div className="border-b border-slate-500 w-full" />
                <div className="border-b border-slate-500 w-full" />
              </div>

              {monthlyData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1.5 h-full justify-end group z-10">
                  <span className="text-[10px] font-mono font-bold text-[#2E5AF0] opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    style={{ height: d.height }}
                    className={`w-8 sm:w-11 rounded-t-lg transition-all duration-300 shadow-sm ${
                      d.count > 0 ? 'bg-[#2E5AF0] hover:bg-[#3B82F6]' : 'bg-slate-800/50'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-300 font-['Inter']">
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Breakdown (Donut Chart) - 4 columns on desktop */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
            <h3 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#2E5AF0]" />
              <span>Status Breakdown</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-400">Distribution</span>
          </div>

          <div className="flex items-center justify-between gap-3 my-auto">
            {/* SVG Donut */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring when total is 0 */}
                {totalApplied === 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    stroke="#1E2E4A"
                    strokeWidth="11"
                    fill="transparent"
                  />
                )}
                {donutSegments.map((segment, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    stroke={segment.color}
                    strokeWidth="11"
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    fill="transparent"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-white font-['Plus_Jakarta_Sans'] leading-none">
                  {loading ? '...' : totalApplied}
                </span>
                <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase font-['Inter'] mt-0.5">
                  TOTAL
                </span>
              </div>
            </div>

            {/* Breakdown Legend List */}
            <div className="space-y-1 flex-1 min-w-0">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5 min-w-0 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-['Inter'] truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-mono shrink-0 ml-1">
                    <span className="font-bold text-white">{item.count}</span>
                    <span className="text-slate-400 text-[10px]">({item.percentage})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
