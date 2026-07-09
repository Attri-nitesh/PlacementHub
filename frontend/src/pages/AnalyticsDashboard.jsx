import React, { useEffect } from 'react';
import useDriveStore from '../store/useDriveStore';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { 
  FileText, 
  CheckSquare, 
  UserCheck, 
  Percent, 
  Coins, 
  TrendingUp 
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsDashboard = () => {
  const { analytics, loading, fetchAnalytics } = useDriveStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 animate-pulse rounded-xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800"></div>
          <div className="h-80 animate-pulse rounded-xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Applications',
      value: analytics?.totalApps ?? 0,
      subtext: 'Submitted registrations',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      name: 'Offer Select Rate',
      value: `${analytics?.offerRate ?? 0}%`,
      subtext: 'Offers / Applications',
      icon: <UserCheck className="h-5 w-5 text-emerald-500" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      name: 'Interview Rate',
      value: `${analytics?.interviewRate ?? 0}%`,
      subtext: 'Shortlists / Applications',
      icon: <CheckSquare className="h-5 w-5 text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      name: 'Average Package',
      value: `${analytics?.averagePackage ?? 0} LPA`,
      subtext: 'CTC package standard',
      icon: <Coins className="h-5 w-5 text-amber-500" />,
      bg: 'bg-amber-50 dark:bg-amber-950/20'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.name} className="rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{s.name}</span>
              <div className={`rounded-lg p-2 ${s.bg}`}>
                {s.icon}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</h4>
              <p className="mt-1 text-[10px] text-slate-450">{s.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          <h4 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-blue-500" /> Monthly Application Trends
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="month" className="text-[10px] fill-slate-500" tickLine={false} />
                <YAxis className="text-[10px] fill-slate-500" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" name="Submissions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Applied Companies Bar Chart */}
        <div className="rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          <h4 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">
            Most Applied Placement Drives
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.mostAppliedCompanies || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="companyName" className="text-[10px] fill-slate-500" tickLine={false} />
                <YAxis className="text-[10px] fill-slate-500" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Applications count">
                  {(analytics?.mostAppliedCompanies || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom platform summary table */}
      <div className="rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
        <h4 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">
          Platform Distribution Performance
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-250 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Source Platform</th>
                <th className="px-5 py-3">Total Submissions</th>
                <th className="px-5 py-3">Offer Count</th>
                <th className="px-5 py-3 text-right">Success Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350 text-xs">
              {(analytics?.platformStats || []).map((stat) => (
                <tr key={stat.platform} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{stat.platform}</td>
                  <td className="px-5 py-3.5">{stat.total}</td>
                  <td className="px-5 py-3.5">{stat.offers}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {stat.successRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
