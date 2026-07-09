import React, { useState, useEffect } from 'react';
import useDriveStore from '../store/useDriveStore';
import { TableSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import api from '../services/api';
import useNotifStore from '../store/useNotifStore';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  PlusCircle, 
  Users, 
  Megaphone, 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign,
  Download,
  ClipboardList
} from 'lucide-react';

const AdminDashboard = () => {
  const { 
    drives, 
    applications, 
    loading, 
    fetchDrives, 
    fetchAllApplicants, 
    createDrive, 
    updateDrive,
    approveOrRejectApplication 
  } = useDriveStore();
  const { showToast } = useNotifStore();

  const [activeTab, setActiveTab] = useState('review'); // 'review', 'manage-drives', 'new-drive', 'broadcast'
  
  // Announcement form state
  const [targetStudentId, setTargetStudentId] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [notifLoading, setNotifLoading] = useState(false);

  // New Drive form state
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [pack, setPack] = useState('');
  const [location, setLocation] = useState('');
  const [eligibilityCgpa, setEligibilityCgpa] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchDrives();
    fetchAllApplicants();
  }, [fetchDrives, fetchAllApplicants]);

  const handleCreateDriveSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!companyName || !jobRole || !pack || !location || !eligibilityCgpa || !deadline || !description) {
      setFormError('All fields are required');
      return;
    }

    const driveData = {
      companyName,
      jobRole,
      package: parseFloat(pack),
      location,
      eligibilityCgpa: parseFloat(eligibilityCgpa),
      deadline,
      description
    };

    const res = await createDrive(driveData);
    if (res.success) {
      setFormSuccess('Placement drive created and broadcast alert sent to students!');
      setCompanyName('');
      setJobRole('');
      setPack('');
      setLocation('');
      setEligibilityCgpa('');
      setDeadline('');
      setDescription('');
      fetchDrives();
      setTimeout(() => setActiveTab('manage-drives'), 2000);
    } else {
      setFormError(res.error || 'Failed to create drive.');
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      showToast('Error', 'Announcements require a title and message body', 'error');
      return;
    }
    setNotifLoading(true);
    try {
      const res = await api.post('/admin/notifications', {
        recipientId: targetStudentId || null,
        title: broadcastTitle,
        message: broadcastMessage
      });
      if (res.data.success) {
        showToast('Broadcast Sent', 'Announcement published and emitted in real-time!', 'success');
        setTargetStudentId('');
        setBroadcastTitle('');
        setBroadcastMessage('');
      }
    } catch (err) {
      showToast('Error', 'Failed to publish announcement', 'error');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleCancelDrive = async (id) => {
    if (window.confirm('Are you sure you want to cancel this drive? This sets status to cancelled.')) {
      const res = await updateDrive(id, { status: 'cancelled' });
      if (res.success) {
        showToast('Success', 'Placement drive successfully cancelled', 'success');
        fetchDrives();
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 md:p-8 text-white shadow-lg shadow-indigo-500/10">
        <h3 className="text-xl md:text-2xl font-bold">Placement Cell Officer Dashboard</h3>
        <p className="mt-2 text-xs md:text-sm text-indigo-100 max-w-xl">
          Approve candidate drives registrations, schedule company visits, edit requirements, and publish real-time notifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('review')}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'review'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-550 hover:text-slate-750'
          }`}
        >
          Review Registrations ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('manage-drives')}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'manage-drives'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-550 hover:text-slate-750'
          }`}
        >
          Active Job Drives ({drives.length})
        </button>
        <button
          onClick={() => setActiveTab('new-drive')}
          className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'new-drive'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-550 hover:text-slate-750'
          }`}
        >
          <PlusCircle className="h-4 w-4" /> Publish New Drive
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'broadcast'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-550 hover:text-slate-750'
          }`}
        >
          <Megaphone className="h-4 w-4" /> Announcements Hub
        </button>
      </div>

      {/* View Canvas */}
      {activeTab === 'review' ? (
        /* Applications Review list */
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Pending Student Registrations Review
          </h4>
          {loading ? (
            <TableSkeleton />
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-slate-400">
              <Users className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No applications to review currently.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-505">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Company & Role</th>
                    <th className="px-6 py-4">GPA Eligibility</th>
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
                        <p className="font-bold text-slate-950 dark:text-white">{app.drive?.companyName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{app.drive?.jobRole} ({app.drive?.package} LPA)</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-blue-500">CGPA: {app.cgpa || app.student?.cgpa || 'N/A'}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Required: {app.drive?.eligibilityCgpa}</p>
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
                        <div className="flex justify-end gap-2 items-center">
                          {/* Resume Link */}
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 mr-2"
                              title="Download CV"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          
                          {/* Approve/Reject controllers */}
                          <button
                            onClick={() => approveOrRejectApplication(app._id, 'approve')}
                            className="rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 p-1.5 text-emerald-700 dark:text-emerald-300"
                            title="Approve registration"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => approveOrRejectApplication(app._id, 'reject')}
                            className="rounded bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 p-1.5 text-rose-700 dark:text-rose-300"
                            title="Reject registration"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'manage-drives' ? (
        /* Manage drives grid */
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Campus Placement Drives List ({drives.length})
          </h4>
          {drives.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-slate-400">
              <Building2 className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No placement drives published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drives.map((drive) => (
                <div
                  key={drive._id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-950 dark:text-white text-lg">{drive.companyName}</span>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{drive.jobRole}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        drive.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-450'
                      }`}>
                        {drive.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5">
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
                        <span className="font-bold">Eligibility CGPA: {drive.eligibilityCgpa}</span>
                      </div>
                    </div>
                  </div>

                  {drive.status === 'active' && (
                    <div className="mt-5 pt-4 border-t border-slate-150 dark:border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => handleCancelDrive(drive._id)}
                        className="flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-455"
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancel Drive
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'new-drive' ? (
        /* Publish Drive Form */
        <div className="max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
            Create Placement Drive
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
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Job Role / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Package (LPA)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={pack}
                  onChange={(e) => setPack(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Job Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Noida, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Required CGPA Limit (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="e.g. 8.0"
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Job Details & Description
              </label>
              <textarea
                placeholder="Include responsibilities, process flow, and qualifications details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-650 hover:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 active:scale-98 transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Create and Broadcast Drive'
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Announcements Portal */
        <div className="max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
            Publish Real-Time Announcements
          </h4>
          <form onSubmit={handleBroadcastSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Recipient Student Account ID (Leave blank to Broadcast to ALL students)
              </label>
              <input
                type="text"
                placeholder="e.g. 64b8a213e4b0c79... (or empty for global)"
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Announcement Title
              </label>
              <input
                type="text"
                placeholder="e.g. Technical Test Instructions"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Message Body
              </label>
              <textarea
                placeholder="Type your message announcement here. This is sent instantly over Socket.io and saved in database profiles."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={notifLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-650 hover:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-lg active:scale-98 transition-all"
            >
              {notifLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Megaphone className="h-4.5 w-4.5" />
                  Emit Live Alert
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
