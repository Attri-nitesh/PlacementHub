import React, { useEffect, useState } from 'react';
import useDriveStore from '../store/useDriveStore';
import useAuthStore from '../store/useAuthStore';
import useNotifStore from '../store/useNotifStore';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ClipboardList, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';

const Drives = () => {
  const { user, profile } = useAuthStore();
  const { 
    drives, 
    applications, 
    loading, 
    fetchDrives, 
    fetchStudentApplications, 
    applyToDrive 
  } = useDriveStore();
  const { showToast } = useNotifStore();

  useEffect(() => {
    fetchDrives();
    if (user?.role === 'student') {
      fetchStudentApplications();
    }
  }, [fetchDrives, fetchStudentApplications, user]);

  const handleApply = async (driveId, companyName) => {
    if (!profile) {
      showToast('Error', 'Please build your student profile before applying', 'error');
      return;
    }
    const res = await applyToDrive(driveId);
    if (res.success) {
      showToast('Applied Successfully!', `Your application for ${companyName} has been submitted.`, 'success');
      fetchStudentApplications(); // reload applications status
    } else {
      showToast('Application Failed', res.error || 'Failed to submit application', 'error');
    }
  };

  const getApplicationStatus = (driveId) => {
    const app = applications.find(a => (a.drive?._id || a.drive) === driveId);
    return app ? app.status : null;
  };

  const checkEligibility = (drive) => {
    if (user?.role !== 'student') return { eligible: true };
    if (!profile) return { eligible: false, reason: 'Profile incomplete' };
    
    // Check CGPA
    if (profile.cgpa < drive.eligibilityCgpa) {
      return { eligible: false, reason: `Ineligible: CGPA ${profile.cgpa} < Required ${drive.eligibilityCgpa}` };
    }

    // Check deadline
    if (new Date() > new Date(drive.deadline)) {
      return { eligible: false, reason: 'Deadline passed' };
    }

    return { eligible: true };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Campus Placement Drives
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse through active corporate visits and explore career opportunities.
          </p>
        </div>
      </div>

      {loading && drives.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : drives.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-slate-400">
          <Building2 className="h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm font-semibold">No placement drives published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map((drive) => {
            const appStatus = getApplicationStatus(drive._id);
            const { eligible, reason } = checkEligibility(drive);
            const isClosed = new Date() > new Date(drive.deadline) || drive.status !== 'active';

            return (
              <div
                key={drive._id}
                className="rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Company and title details */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-slate-950 dark:text-white text-lg block leading-snug">
                        {drive.companyName}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold block mt-1">
                        {drive.jobRole}
                      </span>
                    </div>
                    
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      drive.status === 'active' && !isClosed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {isClosed ? 'Closed' : drive.status}
                    </span>
                  </div>

                  {/* Drive details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{drive.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span className="font-bold">{drive.package} LPA</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>Closes: {new Date(drive.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <ClipboardList className="h-4 w-4" />
                      <span className="font-bold">Min CGPA: {drive.eligibilityCgpa}</span>
                    </div>
                  </div>

                  {/* Job description summary */}
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-450 line-clamp-3 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {drive.description}
                  </p>
                </div>

                {/* Status action buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  {user?.role === 'student' ? (
                    appStatus ? (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle className="h-4 w-4" />
                        Applied (Status: {appStatus})
                      </div>
                    ) : !eligible ? (
                      <div className="flex items-center gap-1 text-rose-600 dark:text-rose-450 text-xs font-bold bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                        <AlertCircle className="h-4 w-4" />
                        {reason}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(drive._id, drive.companyName)}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs font-bold text-white px-5 py-2 shadow-sm transition-all"
                      >
                        Apply Now
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">
                      Posted by recruiter ID: {drive.createdByUser?.name || 'Recruiter'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Drives;
