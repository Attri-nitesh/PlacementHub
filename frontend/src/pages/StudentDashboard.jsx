import React, { useEffect } from 'react';
import useDriveStore from '../store/useDriveStore';
import KanbanBoard from '../components/KanbanBoard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Briefcase, FileCheck, CheckCircle, Ban, Hourglass } from 'lucide-react';

const StudentDashboard = () => {
  const { 
    applications, 
    drives, 
    loading, 
    fetchStudentApplications, 
    fetchDrives, 
    updateApplicationStatus 
  } = useDriveStore();

  useEffect(() => {
    fetchStudentApplications();
    fetchDrives();
  }, [fetchStudentApplications, fetchDrives]);

  const activeDrivesCount = drives.filter(d => d.status === 'active').length;
  const appliedCount = applications.length;
  const shortlistedCount = applications.filter(a => ['Online Assessment', 'Interview'].includes(a.status)).length;
  const offersCount = applications.filter(a => a.status === 'Offer').length;

  if (loading && applications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-96 w-full animate-pulse rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-650 p-6 md:p-8 text-white shadow-lg shadow-blue-500/10">
        <h3 className="text-xl md:text-2xl font-bold">Your Career Launchpad</h3>
        <p className="mt-2 text-xs md:text-sm text-blue-100 max-w-xl leading-relaxed">
          Manage and track all your active campus placement drives and job applications. Drag and drop cards below to update your status.
        </p>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Drives */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Job Drives</span>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2 text-blue-600 dark:text-blue-450">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeDrivesCount}</h4>
            <p className="mt-1 text-[10px] text-slate-450">Open for applications</p>
          </div>
        </div>

        {/* Total Applied */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted Apps</span>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{appliedCount}</h4>
            <p className="mt-1 text-[10px] text-slate-450">Total job registrations</p>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shortlisted (OA/Int)</span>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2 text-amber-600 dark:text-amber-450">
              <Hourglass className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{shortlistedCount}</h4>
            <p className="mt-1 text-[10px] text-slate-450">In active assessment rounds</p>
          </div>
        </div>

        {/* Offers */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Offers Extended</span>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2 text-emerald-600 dark:text-emerald-450">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{offersCount}</h4>
            <p className="mt-1 text-[10px] text-slate-450">Verified select responses</p>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="space-y-4">
        <h3 className="text-md font-bold text-slate-800 dark:text-white">Your Applications Board</h3>
        <KanbanBoard 
          applications={applications} 
          onStatusUpdate={updateApplicationStatus} 
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
