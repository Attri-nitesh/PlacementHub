import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import {
  Users,
  UserCheck,
  Building2,
  Calendar,
  Activity,
  ShieldCheck,
  Cpu,
  Sliders,
  CheckCircle2,
  Lock,
  GraduationCap,
  FileCheck,
  Bell,
  BarChart3,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  KeyRound,
  Database,
  RefreshCw,
  Award,
} from 'lucide-react';
import NotificationsCenter from '../components/NotificationsCenter';
import ActivityLogsDashboard from '../components/placement/ActivityLogsDashboard';
import SuperAdminAnalytics from '../components/admin/SuperAdminAnalytics';
import SuperAdminSettings from '../components/admin/SuperAdminSettings';
import SuperAdminCompanies from '../components/admin/SuperAdminCompanies';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [stats, setStats] = useState({
    totalStudents: 1420,
    placementOfficers: 8,
    partnerCompanies: 46,
    globalDrives: 12,
    systemHealth: '99.98%',
    apiLatency: '42ms',
    databaseSize: '1.24 GB',
    activeSessions: 342,
  });

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* System Overview Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs tracking-wider uppercase">
                      Super Admin Console
                    </span>
                    <span className="text-xs text-slate-400 font-mono">v5.0 Enterprise</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                    System Control &amp; Infrastructure Operations
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                    Global system management, role permissions, university tenant policies, and security audit telemetry.
                  </p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SYSTEM ONLINE</span>
                  </span>
                </div>
              </div>
            </div>

            {/* System Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white font-mono">{stats.totalStudents}</div>
                <p className="text-[11px] text-emerald-400 font-medium">↑ 14% this semester</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Officers</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white font-mono">{stats.placementOfficers}</div>
                <p className="text-[11px] text-slate-400 font-medium">Full RBAC Authority</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partner Companies</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white font-mono">{stats.partnerCompanies}</div>
                <p className="text-[11px] text-indigo-400 font-medium">Tier-1 Corporate Partners</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global Drives</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white font-mono">{stats.globalDrives}</div>
                <p className="text-[11px] text-emerald-400 font-medium">Active &amp; Published</p>
              </div>
            </div>

            {/* Infrastructure & Telemetry Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Health Meter */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-rose-400" />
                    <span>System Health</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    HEALTHY
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-400">Server CPU Load</span>
                      <span className="text-slate-200 font-mono">18.4%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full w-[18%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-400">RAM Memory Allocation</span>
                      <span className="text-slate-200 font-mono">4.2 GB / 16 GB</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[26%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-400">MongoDB Storage Utilization</span>
                      <span className="text-slate-200 font-mono">{stats.databaseSize}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[12%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* API Status Monitor */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span>API Gateway Status</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {stats.apiLatency} Avg
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300 font-mono">GET /api/student/drives</span>
                    <span className="text-emerald-400 font-bold">200 OK (18ms)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300 font-mono">POST /api/student/verify-phone-otp</span>
                    <span className="text-emerald-400 font-bold">200 OK (45ms)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300 font-mono">POST /api/placement/drives</span>
                    <span className="text-emerald-400 font-bold">201 Created (62ms)</span>
                  </div>
                </div>
              </div>

              {/* Recent Audit Events */}
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Audit Events</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Live Telemetry</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 font-medium">RBAC Policy Enforced</p>
                      <span className="text-[10px] text-slate-400">Admin session verified</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/5">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 font-medium">Cross-Navigation Guard Active</p>
                      <span className="text-[10px] text-slate-400">Unauthorized portal attempt blocked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'colleges':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <GraduationCap className="w-6 h-6 text-rose-400" />
                  <span>University Tenant &amp; College Management</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Manage university departments, campus policies, and student intake capacities.</p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-glow-rose flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>+ Add Department</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: 'Computer Science & Engineering', students: 480, code: 'CSE-MAIN', status: 'Active' },
                { name: 'Information Technology', students: 320, code: 'IT-DEPT', status: 'Active' },
                { name: 'Electronics & Communication', students: 290, code: 'ECE-DEPT', status: 'Active' },
              ].map((dep, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px]">
                      {dep.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">● {dep.status}</span>
                  </div>
                  <h3 className="font-extrabold text-white text-base">{dep.name}</h3>
                  <div className="text-xs text-slate-400">Enrolled Students: <strong className="text-slate-200 font-mono">{dep.students}</strong></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'officers':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <UserCheck className="w-6 h-6 text-amber-400" />
                  <span>Placement Officer RBAC Directory</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Manage recruiters, placement cell staff, and permission overrides.</p>
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-glow-rose flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>+ Add Placement Officer</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Officer Name</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Role Scope</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-white">Head of Placement Cell</td>
                    <td className="py-3.5 px-5 font-mono text-slate-300">officer@placement.edu</td>
                    <td className="py-3.5 px-5"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">Lead Officer</span></td>
                    <td className="py-3.5 px-5 text-emerald-400 font-bold">Active</td>
                    <td className="py-3.5 px-5 text-slate-400"><button className="text-rose-400 hover:underline">Manage Scope</button></td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-white">Dada Attri</td>
                    <td className="py-3.5 px-5 font-mono text-slate-300">dada.attri@placementhub.edu</td>
                    <td className="py-3.5 px-5"><span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px]">Senior Officer</span></td>
                    <td className="py-3.5 px-5 text-emerald-400 font-bold">Active</td>
                    <td className="py-3.5 px-5 text-slate-400"><button className="text-rose-400 hover:underline">Manage Scope</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'students':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <span>Global University Student Directory</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Supervise student profiles, eligibility cutoffs, and verification statuses.</p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total Registered Students: 1,420</span>
                <span className="text-xs font-bold text-emerald-400">1,210 Placement Eligible</span>
              </div>
              <p className="text-xs text-slate-300">Full administrative record matching database state.</p>
            </div>
          </div>
        );

      case 'companies':
        return <SuperAdminCompanies />;

      case 'analytics':
        return <SuperAdminAnalytics />;

      case 'logs':
        return <ActivityLogsDashboard />;

      case 'settings':
        return <SuperAdminSettings />;

      case 'notifications':
        return <NotificationsCenter onNavigateTab={(tab) => handleTabChange(tab)} />;

      default:
        return (
          <div className="p-12 text-center text-slate-400 text-xs italic glass-panel rounded-3xl border border-white/10">
            Select a menu item from the Super Admin sidebar.
          </div>
        );
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
