import React from 'react';
import {
  GraduationCap,
  UserCheck,
  Users,
  Building2,
  Calendar,
  FileText,
  Award,
  TrendingUp,
  Activity,
  Server,
  Database,
  Wifi,
  Mail,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

const SuperAdminAnalytics = () => {
  // Mock Metric Cards Data
  const metricCards = [
    { label: 'Total Colleges', value: '8', icon: GraduationCap, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', sub: 'Active Tenants' },
    { label: 'Placement Officers', value: '12', icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', sub: 'Full Access' },
    { label: 'Total Students', value: '1,420', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', sub: 'Enrolled Registry' },
    { label: 'Partner Companies', value: '46', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', sub: 'Corporate Tier-1' },
    { label: 'Active Drives', value: '12', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', sub: 'Published Drives' },
    { label: 'Total Applications', value: '3,840', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', sub: 'Submitted ATS' },
    { label: 'Successful Placements', value: '1,120', icon: Award, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', sub: 'Offers Accepted' },
    { label: 'Placement Rate %', value: '78.8%', icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', sub: '+5.2% vs last batch' },
  ];

  // Top Recruiting Companies
  const topCompanies = [
    { name: 'Uber Technologies', tier: 'Tier-1 FAANG+', roles: 'Software Engineer (SWE)', package: '₹44.0 - ₹52.0 LPA', offers: 18 },
    { name: 'Amazon India', tier: 'Tier-1 FAANG+', roles: 'SDE Intern & FTE Hybrid', package: '₹32.0 - ₹45.0 LPA', offers: 26 },
    { name: 'Microsoft Azure', tier: 'Tier-1 FAANG+', roles: 'Cloud SWE - Level 59', package: '₹42.0 - ₹48.0 LPA', offers: 14 },
    { name: 'Google Cloud', tier: 'Tier-1 FAANG+', roles: 'Software Engineer (SDE-1)', package: '₹48.0 - ₹58.0 LPA', offers: 12 },
    { name: 'Atlassian', tier: 'Product Unicorn', roles: 'Backend Engineer', package: '₹55.0 - ₹62.0 LPA', offers: 8 },
  ];

  // Highest Packages
  const highestPackages = [
    { student: 'Rahul Sharma', dept: 'Computer Science (CSE)', package: '₹58.0 LPA', role: 'Software Engineer', company: 'Google Cloud' },
    { student: 'Ananya Verma', dept: 'Information Tech (IT)', package: '₹55.0 LPA', role: 'Backend Engineer', company: 'Atlassian' },
    { student: 'Siddharth Patel', dept: 'Computer Science (CSE)', package: '₹52.0 LPA', role: 'SWE - Mobile', company: 'Uber' },
    { student: 'Priya Sundaram', dept: 'Electronics (ECE)', package: '₹48.0 LPA', role: 'Cloud Software Engineer', company: 'Microsoft' },
  ];

  // Top Colleges / Departments
  const topColleges = [
    { name: 'Computer Science & Engineering', code: 'CSE-MAIN', enrolled: 480, placed: 420, rate: '87.5%' },
    { name: 'Information Technology', code: 'IT-DEPT', enrolled: 320, placed: 272, rate: '85.0%' },
    { name: 'Electronics & Communication', code: 'ECE-DEPT', enrolled: 290, placed: 218, rate: '75.1%' },
    { name: 'Electrical Engineering', code: 'EEE-DEPT', enrolled: 180, placed: 122, rate: '67.7%' },
  ];

  // System Health Monitoring Components
  const systemHealth = [
    { name: 'Backend API Gateway', status: 'Online', latency: '18ms', uptime: '99.99%', icon: Server, color: 'text-emerald-400' },
    { name: 'Frontend React Client', status: 'Healthy', latency: '12ms', uptime: '100%', icon: Zap, color: 'text-emerald-400' },
    { name: 'MongoDB Database', status: 'Connected', latency: '4ms', uptime: '1.24 GB', icon: Database, color: 'text-emerald-400' },
    { name: 'Socket.IO Realtime Engine', status: 'Active', latency: '342 sockets', uptime: 'Connected', icon: Wifi, color: 'text-emerald-400' },
    { name: 'Google OAuth 2.0 Service', status: 'Operational', latency: 'Active', uptime: '100%', icon: ShieldCheck, color: 'text-emerald-400' },
    { name: 'Email Delivery (SMTP)', status: 'Ready', latency: '0 queue', uptime: 'Connected', icon: Mail, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs tracking-wider uppercase">
                System Telemetry &amp; Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Platform-Wide Placement Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Real-time recruitment conversion metrics, campus department rankings, compensation statistics, and system health status.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Dashboard Metric Cards (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">{card.value}</div>
              <p className="text-[11px] text-slate-400 font-medium">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 2. Visual Charts & Trend Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Growth Chart (Visual Line/Bar representation) */}
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Student Growth Trend</span>
            </h3>
            <span className="text-[10px] font-mono text-rose-300 font-bold bg-rose-500/10 px-2 py-0.5 rounded">2026 Batch</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { month: 'Jan', count: 850, pct: '60%' },
              { month: 'Mar', count: 1050, pct: '74%' },
              { month: 'May', count: 1240, pct: '87%' },
              { month: 'Jul', count: 1380, pct: '97%' },
              { month: 'Aug', count: 1420, pct: '100%' },
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{d.month}</span>
                  <span className="text-white font-bold">{d.count} Students</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full" style={{ width: d.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Applications Volume (Bar Chart Representation) */}
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Monthly Applications Volume</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">3,840 Total</span>
          </div>

          <div className="flex items-end justify-between h-44 pt-4 px-2">
            {[
              { m: 'May', v: '480', h: '40%' },
              { m: 'Jun', v: '720', h: '60%' },
              { m: 'Jul', v: '1,120', h: '88%' },
              { m: 'Aug', v: '1,520', h: '100%' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-cyan-300 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">{bar.v}</span>
                <div className="w-10 bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t-xl transition-all hover:brightness-125" style={{ height: bar.h }} />
                <span className="text-xs text-slate-400 font-mono">{bar.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Status Distribution (Pie/Donut Breakdown) */}
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-violet-400" />
              <span>Placement Status Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-violet-300 font-bold bg-violet-500/10 px-2 py-0.5 rounded">1,420 Cohort</span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">Placed &amp; Accepted</span>
              <span className="font-mono font-black text-emerald-400 text-sm">78.8% (1,120)</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300">Active Interviews</span>
              <span className="font-mono font-black text-amber-400 text-sm">14.2% (202)</span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-blue-300">Screening Pipeline</span>
              <span className="font-mono font-black text-blue-400 text-sm">4.5% (64)</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-rose-300">Seeking Placement</span>
              <span className="font-mono font-black text-rose-400 text-sm">2.5% (34)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recruiting Companies */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-rose-400" />
              <span>Top Recruiting Companies</span>
            </h3>
            <span className="text-xs text-slate-400">By Offer Volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Company</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Package Range</th>
                  <th className="p-3">Offers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                {topCompanies.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-white">{c.name}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">{c.tier}</span></td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{c.package}</td>
                    <td className="p-3 font-mono font-bold text-white">{c.offers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highest Salary Packages */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Highest CTC Packages Offered</span>
            </h3>
            <span className="text-xs text-amber-400 font-bold">2026 Batch</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Package (CTC)</th>
                  <th className="p-3">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                {highestPackages.map((p, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-white">{p.student}</td>
                    <td className="p-3 text-slate-400">{p.dept}</td>
                    <td className="p-3 font-mono font-extrabold text-amber-400">{p.package}</td>
                    <td className="p-3 font-bold text-slate-200">{p.company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Colleges / Departments Table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span>Campus Department Placement Performance</span>
          </h3>
          <span className="text-xs text-slate-400">Academic Year 2025-2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Department Name</th>
                <th className="p-3.5">Dept Code</th>
                <th className="p-3.5">Total Enrolled</th>
                <th className="p-3.5">Placed Students</th>
                <th className="p-3.5">Placement %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-200">
              {topColleges.map((col, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="p-3.5 font-bold text-white">{col.name}</td>
                  <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">{col.code}</span></td>
                  <td className="p-3.5 font-mono text-slate-300">{col.enrolled}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">{col.placed}</td>
                  <td className="p-3.5 font-mono font-black text-rose-400 text-sm">{col.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. System Health Status Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Infrastructure &amp; Service Health Monitoring</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {systemHealth.map((sys, idx) => {
            const Icon = sys.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{sys.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{sys.uptime}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] block">
                    {sys.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{sys.latency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
