import React, { useState, useEffect } from 'react';
import useDriveStore from '../store/useDriveStore';
import useAuthStore from '../store/useAuthStore';
import { TableSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  Download, 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  DollarSign,
  ClipboardList
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { profile } = useAuthStore();
  const { 
    drives, 
    applications, 
    loading, 
    fetchDrives, 
    createDrive, 
    fetchRecruiterApplicants, 
    updateApplicationStatus 
  } = useDriveStore();

  const [activeTab, setActiveTab] = useState('postings'); // 'postings' or 'new-drive'
  const [selectedDrive, setSelectedDrive] = useState(null); // drive details for applicant viewer
  
  // New Job form states
  const [jobRole, setJobRole] = useState('');
  const [pack, setPack] = useState('');
  const [location, setLocation] = useState('');
  const [eligibilityCgpa, setEligibilityCgpa] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Status update states
  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [statusVal, setStatusVal] = useState('');
  const [feedbackVal, setFeedbackVal] = useState('');

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  // Load applicants if a drive is selected
  useEffect(() => {
    if (selectedDrive) {
      fetchRecruiterApplicants(selectedDrive._id);
    }
  }, [selectedDrive, fetchRecruiterApplicants]);

  // Filter drives to only show the ones created by this Recruiter
  const myDrives = drives.filter(d => d.createdByUser === profile?.user?.id || d.createdByUser?._id === profile?.user?.id);

  const handleCreateDriveSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!jobRole || !pack || !location || !eligibilityCgpa || !deadline || !description) {
      setFormError('All fields are required');
      return;
    }

    const driveData = {
      companyName: profile?.companyName || 'Corporate Partner',
      jobRole,
      package: parseFloat(pack),
      location,
      eligibilityCgpa: parseFloat(eligibilityCgpa),
      deadline,
      description
    };

    const res = await createDrive(driveData);
    if (res.success) {
      setFormSuccess('Job drive successfully created and broadcasted to students!');
      // Reset form
      setJobRole('');
      setPack('');
      setLocation('');
      setEligibilityCgpa('');
      setDeadline('');
      setDescription('');
      fetchDrives();
      setTimeout(() => setActiveTab('postings'), 2000);
    } else {
      setFormError(res.error || 'Failed to create drive.');
    }
  };

  const handleStatusUpdateSubmit = async (appId) => {
    if (!statusVal) return;
    const res = await updateApplicationStatus(appId, statusVal, feedbackVal);
    if (res.success) {
      setUpdatingAppId(null);
      setStatusVal('');
      setFeedbackVal('');
      if (selectedDrive) {
        fetchRecruiterApplicants(selectedDrive._id);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Recruiter Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-lg shadow-emerald-500/10">
        <h3 className="text-xl md:text-2xl font-bold">Recruiter Command Center</h3>
        <p className="mt-2 text-xs md:text-sm text-emerald-100 max-w-xl">
          Publish jobs, manage student CVs, and move shortlisted applicants along the pipeline. Company: <strong>{profile?.companyName || 'Unassigned'}</strong>
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('postings'); setSelectedDrive(null); }}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'postings' && !selectedDrive
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-450'
              : 'border-transparent text-slate-550 hover:text-slate-700'
          }`}
        >
          Active Job Postings ({myDrives.length})
        </button>
        <button
          onClick={() => { setActiveTab('new-drive'); setSelectedDrive(null); }}
          className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'new-drive'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-450'
              : 'border-transparent text-slate-550 hover:text-slate-700'
          }`}
        >
          <PlusCircle className="h-4 w-4" /> Publish New Drive
        </button>
        {selectedDrive && (
          <span className="px-5 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-t-lg">
            Applicants: {selectedDrive.companyName} ({selectedDrive.jobRole})
          </span>
        )}
      </div>

      {/* Main tab Canvas */}
      {selectedDrive ? (
        /* Candidates Table Viewer */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Student Applicants List ({applications.length})
            </h4>
            <button
              onClick={() => setSelectedDrive(null)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
            >
              Back to job list
            </button>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-slate-400">
              <Users className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No applications submitted for this job yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Student Details</th>
                    <th className="px-6 py-4">Branch & CGPA</th>
                    <th className="px-6 py-4">Skills</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300 text-xs">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-950 dark:text-white">{app.student?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{app.student?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{app.branch}</p>
                        <p className="text-[10px] text-blue-500 font-bold mt-0.5">CGPA: {app.cgpa}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.skills?.map(s => (
                            <span key={s} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-650 dark:text-slate-400">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          app.status === 'Offer' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          app.status === 'Rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
                          app.status === 'Interview' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' :
                          app.status === 'Online Assessment' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          {/* Resume Download */}
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                              title="Download CV"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No CV</span>
                          )}

                          {/* Quick Status Setter trigger */}
                          {updatingAppId === app._id ? (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-left">
                              <div className="space-y-1">
                                <select
                                  value={statusVal}
                                  onChange={(e) => setStatusVal(e.target.value)}
                                  className="text-[10px] bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-1.5 py-0.5 focus:outline-none"
                                >
                                  <option value="">Set Status</option>
                                  <option value="Online Assessment">OA Phase</option>
                                  <option value="Interview">Interview</option>
                                  <option value="Offer">Extend Offer</option>
                                  <option value="Rejected">Reject</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Feedback notes..."
                                  value={feedbackVal}
                                  onChange={(e) => setFeedbackVal(e.target.value)}
                                  className="text-[10px] bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-1.5 py-0.5 focus:outline-none w-28 block"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleStatusUpdateSubmit(app._id)}
                                  className="rounded bg-emerald-500 p-1 text-white hover:bg-emerald-600"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setUpdatingAppId(null)}
                                  className="rounded bg-slate-350 p-1 text-white hover:bg-slate-400 dark:bg-slate-700"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setUpdatingAppId(app._id); setStatusVal(app.status); setFeedbackVal(app.feedback || ''); }}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-650 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm"
                            >
                              Update Status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'postings' ? (
        /* Drives List */
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Your Placement Drives List ({myDrives.length})
          </h4>
          {myDrives.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-slate-400">
              <Briefcase className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">You haven't posted any placement drives yet.</p>
              <button
                onClick={() => setActiveTab('new-drive')}
                className="mt-4 rounded-lg bg-emerald-600 text-xs font-bold text-white px-4 py-2 hover:bg-emerald-700"
              >
                Create Job Posting
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myDrives.map((drive) => (
                <div
                  key={drive._id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-950 dark:text-white text-lg">{drive.jobRole}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        drive.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {drive.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{drive.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-350">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-bold">{drive.package} LPA</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-500">
                        <ClipboardList className="h-3.5 w-3.5" />
                        <span className="font-bold">Min CGPA Eligibility: {drive.eligibilityCgpa}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-150 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-150 dark:bg-blue-950/20 dark:hover:bg-blue-950/45 px-3.5 py-2 text-xs font-bold text-blue-600 dark:text-blue-400"
                    >
                      <Users className="h-4 w-4" />
                      View Applicants
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Create Drive Form */
        <div className="max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm transition-colors">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
            Publish New Placement Drive
          </h4>
          
          <form onSubmit={handleCreateDriveSubmit} className="space-y-5">
            {formError && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-450">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-450">
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Job Role / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. SDE-1"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Package (LPA)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  value={pack}
                  onChange={(e) => setPack(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Job Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, India (or Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Minimum CGPA Eligible (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="e.g. 7.5"
                  value={eligibilityCgpa}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      if (val < 0) setEligibilityCgpa('0');
                      else if (val > 10) setEligibilityCgpa('10');
                      else setEligibilityCgpa(e.target.value);
                    } else {
                      setEligibilityCgpa(e.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Application Deadline Date
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Job Description
              </label>
              <textarea
                placeholder="Detail the roles, responsibilities, requirements, and hiring process rounds..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-650 py-3 text-sm font-semibold text-white shadow-lg active:scale-98 transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Create and Broadcast Drive'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
