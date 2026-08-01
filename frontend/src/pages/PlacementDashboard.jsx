import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CompanyModal from '../components/placement/CompanyModal';
import DriveModal from '../components/placement/DriveModal';
import DriveActionsManager from '../components/placement/DriveActionsManager';
import ApplicationReviewModal from '../components/placement/ApplicationReviewModal';
import ScheduleInterviewModal from '../components/placement/ScheduleInterviewModal';
import OfferModal from '../components/placement/OfferModal';
import AnnouncementModal from '../components/placement/AnnouncementModal';
import PlacementAnalytics from '../components/placement/PlacementAnalytics';
import NotificationsCenter from '../components/NotificationsCenter';

import {
  getPlacementDashboard,
  getCompanies,
  createCompany,
  getPlacementDrives,
  createPlacementDrive,
  updatePlacementDrive,
  updateDriveStatus,
  duplicatePlacementDrive,
  deletePlacementDrive,
  getAllApplications,
  updateApplicationStage,
  getInterviews,
  scheduleInterview,
  getOffers,
  releaseOffer,
  rejectApplication,
  getAnnouncements,
  createAnnouncement,
  getStudentDirectory,
  getExportReportUrl,
  getActivityLogs,
} from '../services/placementApi';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Plus,
  Search,
  FileText,
  XCircle,
  Download,
  Calendar,
  Award,
  Activity,
  Bell,
  Eye,
  AlertCircle,
  Copy,
  Trash2,
  Play,
  Pause,
  Archive,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  Lock,
  Edit,
  RotateCcw,
  Sparkles,
  Settings,
} from 'lucide-react';

const PlacementDashboard = () => {
  const { user, logout } = useAuth();
  const { realtimeNotification, clearNotification, socket } = useSocket();
  const [searchParams] = useSearchParams();

  const urlTab = searchParams.get('tab');
  const targetAppId = searchParams.get('appId');
  const targetInterviewId = searchParams.get('interviewId');
  const targetOfferId = searchParams.get('offerId');

  const [activeTab, setActiveTab] = useState(urlTab || 'dashboard');
  const [errorMessage, setErrorMessage] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);

  // Metrics & Dashboard State
  const [metrics, setMetrics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  // Data Collections
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [driveStatusFilter, setDriveStatusFilter] = useState('All');
  const [driveSearch, setDriveSearch] = useState('');

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [studentDirectory, setStudentDirectory] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Modals Control
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [previewDrive, setPreviewDrive] = useState(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [reviewAppModal, setReviewAppModal] = useState(null);
  const [scheduleInterviewModalApp, setScheduleInterviewModalApp] = useState(null);
  const [offerModalApp, setOfferModalApp] = useState(null);

  // Confirm Dialog Modal State
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Filters State
  const [appSearch, setAppSearch] = useState('');
  const [appStageFilter, setAppStageFilter] = useState('All');

  const itemRefs = useRef({});

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'drives', label: 'Placement Drives', icon: CalendarDays },
    { id: 'applications', label: 'Applications Screening', icon: FileText },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'offers', label: 'Offers & Rejections', icon: Award },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'announcements', label: 'Announcements & Alerts', icon: Megaphone },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'activity_logs', label: 'Activity Logs', icon: Activity },
  ];

  const loadDashboard = async () => {
    try {
      const data = await getPlacementDashboard();
      setMetrics(data.metrics);
      setRecentLogs(data.recentActivity || []);
    } catch (err) {
      console.error('Failed to load placement dashboard:', err);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const loadDrives = async () => {
    try {
      const data = await getPlacementDrives({
        status: driveStatusFilter,
        search: driveSearch,
      });
      setDrives(data.drives || []);
    } catch (err) {
      console.error('Failed to fetch drives:', err);
    }
  };

  const loadApps = async () => {
    try {
      const data = await getAllApplications({
        search: appSearch,
        stage: appStageFilter,
        category: 'screening',
      });
      const fetchedApps = data.applications || [];
      setApplications(fetchedApps);

      if (targetAppId) {
        const found = fetchedApps.find((a) => a._id === targetAppId);
        if (found) {
          setReviewAppModal(found);
          setHighlightedId(targetAppId);
          setTimeout(() => setHighlightedId(null), 3500);
        } else {
          const allData = await getAllApplications({ search: '' });
          const allApps = allData.applications || [];
          const foundAny = allApps.find((a) => a._id === targetAppId);
          if (foundAny) {
            setReviewAppModal(foundAny);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const loadInterviews = async () => {
    try {
      const data = await getInterviews();
      const fetchedInterviews = data.interviews || [];
      setInterviews(fetchedInterviews);

      if (targetInterviewId) {
        const found = fetchedInterviews.find((i) => i._id === targetInterviewId);
        if (found) {
          setHighlightedId(targetInterviewId);
          setTimeout(() => setHighlightedId(null), 3500);
        }
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    }
  };

  const loadOffers = async () => {
    try {
      const data = await getOffers();
      const fetchedOffers = data.offers || [];
      setOffers(fetchedOffers);

      if (targetOfferId) {
        const found = fetchedOffers.find((o) => o._id === targetOfferId);
        if (found) {
          setHighlightedId(targetOfferId);
          setTimeout(() => setHighlightedId(null), 3500);
        }
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  const loadStudentDir = async () => {
    try {
      const data = await getStudentDirectory();
      setStudentDirectory(data.students || []);
    } catch (err) {
      console.error('Failed to fetch student directory:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await getActivityLogs();
      setActivityLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    }
  };

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  useEffect(() => {
    loadDashboard();
    loadCompanies();
    loadDrives();
    loadApps();
    loadInterviews();
    loadOffers();
    loadAnnouncements();
    loadStudentDir();
    loadLogs();
  }, [targetAppId, targetInterviewId, targetOfferId]);

  useEffect(() => {
    loadDrives();
  }, [driveStatusFilter, driveSearch]);

  useEffect(() => {
    loadApps();
  }, [appSearch, appStageFilter]);

  // Socket.IO Real-time Events
  useEffect(() => {
    if (!socket) return;

    socket.on('application_updated', () => {
      loadApps();
      loadInterviews();
      loadOffers();
      loadDashboard();
    });

    socket.on('drive_created', () => {
      loadDrives();
      loadDashboard();
    });

    socket.on('drive_published', () => {
      loadDrives();
      loadDashboard();
    });

    socket.on('drive_status_updated', () => {
      loadDrives();
      loadDashboard();
    });

    socket.on('company_created', () => {
      loadCompanies();
      loadDashboard();
    });

    return () => {
      socket.off('application_updated');
      socket.off('drive_created');
      socket.off('drive_published');
      socket.off('drive_status_updated');
      socket.off('company_created');
    };
  }, [socket]);

  // Lifecycle Action Handlers with Confirmation Modals
  const requestPublishDrive = (drive) => {
    return new Promise((resolve, reject) => {
      setConfirmDialog({
        title: `Publish Placement Drive?`,
        message: `"${drive.companyName} - ${drive.roleTitle}" will become visible to eligible students immediately with real-time notifications.`,
        confirmLabel: `🟢 Publish Live`,
        confirmClass: `bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald`,
        onConfirm: async () => {
          try {
            await updateDriveStatus(drive._id, 'Published');
            loadDrives();
            loadDashboard();
            setConfirmDialog(null);
            resolve();
          } catch (err) {
            setConfirmDialog(null);
            reject(err);
          }
        },
      });
    });
  };

  const requestCloseDrive = (drive) => {
    return new Promise((resolve, reject) => {
      const reason = prompt('Enter reason for closing applications (e.g. Recruiter Closed / Target Reached):') || 'Recruiter Closed Applications';
      setConfirmDialog({
        title: `Close Applications for ${drive.companyName}?`,
        message: `Students will no longer be able to submit applications for ${drive.roleTitle}. The Apply button will become "Applications Closed".`,
        confirmLabel: `🔴 Close Applications`,
        confirmClass: `bg-red-600 hover:bg-red-500 text-white`,
        onConfirm: async () => {
          try {
            await updateDriveStatus(drive._id, 'Closed', reason);
            loadDrives();
            loadDashboard();
            setConfirmDialog(null);
            resolve();
          } catch (err) {
            setConfirmDialog(null);
            reject(err);
          }
        },
      });
    });
  };

  const requestArchiveDrive = (drive) => {
    return new Promise((resolve, reject) => {
      setConfirmDialog({
        title: `Archive Placement Drive?`,
        message: `"${drive.companyName} - ${drive.roleTitle}" will be hidden from student search views, but retained for university CSV reports.`,
        confirmLabel: `📦 Archive Drive`,
        confirmClass: `bg-slate-700 hover:bg-slate-600 text-white`,
        onConfirm: async () => {
          try {
            await updateDriveStatus(drive._id, 'Archived');
            loadDrives();
            loadDashboard();
            setConfirmDialog(null);
            resolve();
          } catch (err) {
            setConfirmDialog(null);
            reject(err);
          }
        },
      });
    });
  };

  const requestReopenDrive = (drive) => {
    return new Promise((resolve, reject) => {
      setConfirmDialog({
        title: `Reopen Placement Drive?`,
        message: `Reopen applications for "${drive.companyName} - ${drive.roleTitle}"? Eligible students will be able to apply again.`,
        confirmLabel: `🟢 Reopen Drive`,
        confirmClass: `bg-emerald-600 hover:bg-emerald-500 text-white`,
        onConfirm: async () => {
          try {
            await updateDriveStatus(drive._id, 'Published');
            loadDrives();
            loadDashboard();
            setConfirmDialog(null);
            resolve();
          } catch (err) {
            setConfirmDialog(null);
            reject(err);
          }
        },
      });
    });
  };

  const requestRestoreDrive = (drive) => {
    return new Promise((resolve, reject) => {
      setConfirmDialog({
        title: `Restore Drive to Draft?`,
        message: `Restore "${drive.companyName} - ${drive.roleTitle}" back to Draft status for review?`,
        confirmLabel: `♻ Restore to Draft`,
        confirmClass: `bg-amber-600 hover:bg-amber-500 text-white`,
        onConfirm: async () => {
          try {
            await updateDriveStatus(drive._id, 'Draft');
            loadDrives();
            loadDashboard();
            setConfirmDialog(null);
            resolve();
          } catch (err) {
            setConfirmDialog(null);
            reject(err);
          }
        },
      });
    });
  };

  const requestPauseDrive = (drive) => {
    return new Promise((resolve, reject) => {
      setConfirmDialog({
        title: `Pause Applications?`,
        message: `Move "${drive.companyName}" drive back to Draft status to pause student applications?`,
        confirmLabel: `⏸ Pause Drive`,
        confirmClass: `bg-amber-600 hover:bg-amber-500 text-white`,
        onConfirm: async () => {
          try {
            await updateDriveStatus(drive._id, 'Draft');
            loadDrives();
            loadDashboard();
            setConfirmDialog(null);
            resolve();
          } catch (err) {
            setConfirmDialog(null);
            reject(err);
          }
        },
      });
    });
  };

  const handleDuplicate = async (driveId) => {
    await duplicatePlacementDrive(driveId);
    loadDrives();
    loadDashboard();
  };

  const handleDeletePermanent = (drive) => {
    return new Promise((resolve, reject) => {
      setConfirmDialog({
        title: `Delete Drive Permanently?`,
        message: `Are you sure you want to permanently delete "${drive.companyName} - ${drive.roleTitle}"? This action CANNOT be undone.`,
        confirmLabel: `🗑 Delete Permanently`,
        confirmClass: `bg-red-600 hover:bg-red-500 text-white font-bold`,
        onConfirm: async () => {
          try {
            await deletePlacementDrive(drive._id);
            loadDrives();
            loadDashboard();
            setConfirmDialog(null);
            resolve();
          } catch (err) {
            setConfirmDialog(null);
            reject(err);
          }
        },
      });
    });
  };

  const handleCreateCompany = async (data) => {
    await createCompany(data);
    loadCompanies();
    loadDashboard();
  };

  const handleSaveDriveModal = async (payload, editId) => {
    if (editId) {
      await updatePlacementDrive(editId, payload);
    } else {
      await createPlacementDrive(payload);
    }
    loadDrives();
    loadDashboard();
    setEditingDrive(null);
  };

  const handleCreateAnnouncement = async (data) => {
    await createAnnouncement(data);
    loadAnnouncements();
  };

  const handleStageUpdate = async (appId, stage) => {
    await updateApplicationStage(appId, stage);
    loadApps();
    loadInterviews();
    loadOffers();
    loadDashboard();
    setReviewAppModal(null);
  };

  const handleScheduleInterview = async (data) => {
    await scheduleInterview(data);
    loadInterviews();
    loadApps();
    loadDashboard();
    setScheduleInterviewModalApp(null);
    setReviewAppModal(null);
  };

  const handleReleaseOffer = async (data) => {
    await releaseOffer(data);
    loadOffers();
    loadApps();
    loadDashboard();
    setOfferModalApp(null);
    setReviewAppModal(null);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center space-x-1 w-max">
            <span>🟡</span>
            <span>Draft</span>
          </span>
        );
      case 'Published':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center space-x-1 w-max">
            <span>🟢</span>
            <span>Published</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[10px] flex items-center space-x-1 w-max">
            <span>🔴</span>
            <span>Closed</span>
          </span>
        );
      case 'Archived':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 font-bold text-[10px] flex items-center space-x-1 w-max">
            <span>⚫</span>
            <span>Archived</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col selection:bg-violet-500/30">
      {/* Navbar */}
      <Navbar onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 px-6 sm:px-8 py-6">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={logout}
          role="placement"
        />

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Hero Banner */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-slate-900 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span>Enterprise Placement Drive Lifecycle Command</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    Command Center &bull; {user?.name || 'Placement Cell'}
                  </h1>

                  <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
                    Full lifecycle ATS active. Manage Draft, Published, Closed, and Archived drives with real-time student notifications.
                  </p>
                </div>
              </div>

              {/* Enterprise Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-amber-500/10 space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Draft Drives</span>
                  <div className="text-3xl font-extrabold text-white font-mono">{metrics?.draftDrives || 0}</div>
                  <p className="text-[11px] text-amber-300">🟡 Pending recruiter publish</p>
                </div>

                <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Published Drives</span>
                  <div className="text-3xl font-extrabold text-white font-mono">{metrics?.publishedDrives || 0}</div>
                  <p className="text-[11px] text-emerald-300">🟢 Active for student application</p>
                </div>

                <div className="glass-panel p-5 rounded-3xl border border-red-500/30 bg-red-500/10 space-y-1">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Closed Drives</span>
                  <div className="text-3xl font-extrabold text-white font-mono">{metrics?.closedDrives || 0}</div>
                  <p className="text-[11px] text-red-300">🔴 Applications disabled</p>
                </div>

                <div className="glass-panel p-5 rounded-3xl border border-slate-700 bg-slate-800/40 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archived Drives</span>
                  <div className="text-3xl font-extrabold text-white font-mono">{metrics?.archivedDrives || 0}</div>
                  <p className="text-[11px] text-slate-400">⚫ Stored for CSV & analytics</p>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Command Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setCompanyModalOpen(true)}
                      className="w-full p-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all text-left flex items-center justify-between"
                    >
                      <span>+ Onboard Corporate Partner</span>
                      <Building2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingDrive(null);
                        setDriveModalOpen(true);
                      }}
                      className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all text-left flex items-center justify-between"
                    >
                      <span>+ Config Placement Drive</span>
                      <CalendarDays className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAnnouncementModalOpen(true)}
                      className="w-full p-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-all text-left flex items-center justify-between"
                    >
                      <span>+ Broadcast Announcement</span>
                      <Megaphone className="w-4 h-4" />
                    </button>
                    <a
                      href={getExportReportUrl()}
                      download
                      className="w-full p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all text-left flex items-center justify-between"
                    >
                      <span>📥 Export CSV Report</span>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </a>
                  </div>
                </div>

                <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Audit Activity Log</h4>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                    {recentLogs.map((log) => (
                      <div key={log._id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{log.details}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            By: {log.performedBy?.name || 'System'} &bull; {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                          {log.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: COMPANIES MANAGEMENT */}
          {activeTab === 'companies' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <Building2 className="w-6 h-6 text-violet-400" />
                    <span>Corporate Partners Directory</span>
                  </h2>
                  <p className="text-xs text-slate-400">Onboard and manage active campus recruiting companies.</p>
                </div>
                <button
                  onClick={() => setCompanyModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-glow-violet transition-colors flex items-center space-x-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard Company</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {companies.map((comp) => (
                  <div key={comp._id} className="glass-panel p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {comp.logo ? (
                          <img src={comp.logo} alt={comp.name} className="w-12 h-12 rounded-2xl object-contain bg-white p-1.5 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center text-xl shrink-0">
                            {comp.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-white text-base">{comp.name}</h4>
                          <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                            {comp.industry}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{comp.description}</p>

                    <div className="pt-3 border-t border-white/5 space-y-1 text-xs text-slate-400">
                      <p>HR Representative: <strong className="text-slate-200">{comp.hrName}</strong> ({comp.hrEmail})</p>
                      <p>Location: <span className="text-slate-200">{comp.location}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PLACEMENT DRIVES LIFECYCLE TABLE & ENTERPRISE ACTIONS MANAGER */}
          {activeTab === 'drives' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Header & Config New Drive Action */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <CalendarDays className="w-6 h-6 text-emerald-400" />
                    <span>Placement Drive Lifecycle Management</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enterprise ATS state machine: Draft &rarr; Published &rarr; Closed &rarr; Archived. Manage drives using ⚙ Manage menu.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingDrive(null);
                    setDriveModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-glow-emerald transition-colors flex items-center space-x-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Config New Drive</span>
                </button>
              </div>

              {/* Search & Lifecycle Status Filter Tabs */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={driveSearch}
                    onChange={(e) => setDriveSearch(e.target.value)}
                    placeholder="Search drive by company or role..."
                    className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
                  {['All', 'Draft', 'Published', 'Closed', 'Archived'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDriveStatusFilter(tab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        driveStatusFilter === tab
                          ? 'bg-violet-600 text-white shadow-glow-violet'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'Draft' && '🟡 '}
                      {tab === 'Published' && '🟢 '}
                      {tab === 'Closed' && '🔴 '}
                      {tab === 'Archived' && '⚫ '}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enterprise Placement Drive Table */}
              <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/40 shadow-2xl overflow-visible">
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Company & Role</th>
                        <th className="p-4">Package</th>
                        <th className="p-4 text-center">Applications</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Created By / Date</th>
                        <th className="p-4">Deadline</th>
                        <th className="p-4 text-right">Actions (⚙ Manage)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {drives.map((drive) => (
                        <tr key={drive._id} className="hover:bg-white/5 transition-colors">
                          {/* Company & Role */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              {drive.companyLogo ? (
                                <img
                                  src={drive.companyLogo}
                                  alt={drive.companyName}
                                  className="w-10 h-10 rounded-xl object-contain bg-white p-1 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center text-sm shrink-0">
                                  {drive.companyName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h4 className="font-extrabold text-white text-sm">{drive.roleTitle}</h4>
                                <p className="text-slate-400 text-xs">{drive.companyName}</p>
                              </div>
                            </div>
                          </td>

                          {/* Package */}
                          <td className="p-4 font-mono font-bold text-emerald-400">{drive.packageLPA}</td>

                          {/* Applications Count */}
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 font-mono font-bold">
                              {drive.applicationsCount || 0} Submissions
                            </span>
                          </td>

                          {/* Lifecycle Status Badge */}
                          <td className="p-4">
                            {renderStatusBadge(drive.status)}
                            {drive.status === 'Closed' && drive.closeReason && (
                              <span className="text-[10px] text-slate-400 block mt-1 italic">
                                Reason: {drive.closeReason}
                              </span>
                            )}
                          </td>

                          {/* Created By & Date */}
                          <td className="p-4 space-y-0.5 text-slate-400">
                            <p className="text-white font-medium">{drive.publishedBy || 'Placement Cell'}</p>
                            <p className="text-[10px] font-mono">{new Date(drive.createdAt).toLocaleDateString()}</p>
                          </td>

                          {/* Deadline */}
                          <td className="p-4 font-mono text-slate-300">
                            {new Date(drive.deadline).toLocaleDateString()}
                          </td>

                          {/* ENTERPRISE DRIVE ACTIONS MANAGER (PORTAL & TOASTS) */}
                          <td className="p-4 text-right">
                            <DriveActionsManager
                              drive={drive}
                              onEdit={(d) => {
                                setEditingDrive(d);
                                setDriveModalOpen(true);
                              }}
                              onPreview={(d) => setPreviewDrive(d)}
                              onPublish={requestPublishDrive}
                              onPause={requestPauseDrive}
                              onCloseDrive={requestCloseDrive}
                              onReopen={requestReopenDrive}
                              onArchive={requestArchiveDrive}
                              onRestore={requestRestoreDrive}
                              onDuplicate={handleDuplicate}
                              onDelete={handleDeletePermanent}
                            />
                          </td>
                        </tr>
                      ))}

                      {drives.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-400 text-xs italic">
                            No placement drives found in status "{driveStatusFilter}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: APPLICATIONS SCREENING */}
          {activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Search & Filter */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    <span>Applications Screening Queue</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Displays applications awaiting recruiter screening (Applied, Shortlisted, OA).
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="Search candidate or company..."
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {/* Screening Applications List */}
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    ref={(el) => (itemRefs.current[app._id] = el)}
                    className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      app._id === highlightedId
                        ? 'border-violet-400 bg-violet-600/30 ring-4 ring-violet-500/50 shadow-glow-violet animate-pulse'
                        : 'border-white/10 bg-white/5 hover:border-violet-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {app.user?.profilePicture ? (
                        <img src={app.user.profilePicture} alt={app.user.name} className="w-12 h-12 rounded-2xl object-cover border border-white/20 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg shrink-0">
                          <Users className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-base">{app.user?.name || 'Student'}</h4>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                            {app.stage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          {app.companyName} &bull; {app.roleTitle} ({app.packageLPA})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setReviewAppModal(app)}
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-glow-violet transition-colors flex items-center space-x-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Profile & Decisions</span>
                      </button>
                    </div>
                  </div>
                ))}

                {applications.length === 0 && (
                  <div className="py-16 text-center text-slate-400 text-xs italic">
                    No active applications currently awaiting screening.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: SCHEDULED INTERVIEWS */}
          {activeTab === 'interviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-amber-400" />
                  <span>Scheduled Candidate Interviews</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Displays candidates currently scheduled for active interview rounds.
                </p>
              </div>

              <div className="space-y-3">
                {interviews.map((inv) => {
                  const isHighlighted = inv._id === highlightedId;

                  return (
                    <div
                      key={inv._id}
                      ref={(el) => (itemRefs.current[inv._id] = el)}
                      className={`glass-panel p-5 rounded-2xl border transition-all space-y-3 ${
                        isHighlighted
                          ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-500/50 shadow-glow-amber animate-pulse'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-base">{inv.user?.name || 'Candidate'}</h4>
                          <p className="text-xs text-slate-400">{inv.companyName} &bull; {inv.round}</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300">
                          {inv.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-1 font-medium">
                        <p>📅 Date: {new Date(inv.date).toLocaleDateString()} at {inv.time}</p>
                        {inv.meetLink && (
                          <p>
                            🔗 Video Link:{' '}
                            <a href={inv.meetLink} target="_blank" rel="noreferrer" className="text-violet-400 underline font-mono">
                              {inv.meetLink}
                            </a>
                          </p>
                        )}
                        <p>👤 Interviewer: {inv.interviewerName || 'Technical Team'}</p>
                      </div>
                    </div>
                  );
                })}

                {interviews.length === 0 && (
                  <div className="py-16 text-center text-slate-400 text-xs italic">
                    No scheduled interviews currently active.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: OFFERS & REJECTIONS */}
          {activeTab === 'offers' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <Award className="w-6 h-6 text-emerald-400" />
                  <span>Released Placement Offers Log</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Displays candidate offer letters released by corporate partners.
                </p>
              </div>

              <div className="space-y-3">
                {offers.map((off) => {
                  const isHighlighted = off._id === highlightedId;

                  return (
                    <div
                      key={off._id}
                      ref={(el) => (itemRefs.current[off._id] = el)}
                      className={`glass-panel p-5 rounded-2xl border transition-all space-y-2 ${
                        isHighlighted
                          ? 'border-emerald-400 bg-emerald-500/20 ring-4 ring-emerald-500/50 shadow-glow-emerald animate-pulse'
                          : 'border-emerald-500/30 bg-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-white text-base">{off.user?.name}</h4>
                          <p className="text-xs text-emerald-300">{off.companyName} &bull; {off.roleTitle} ({off.packageLPA})</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                          Offer {off.status}
                        </span>
                      </div>
                      {off.joiningDate && (
                        <p className="text-xs text-slate-300 font-mono">
                          Joining Date: {new Date(off.joiningDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}

                {offers.length === 0 && (
                  <div className="py-16 text-center text-slate-400 text-xs italic">
                    No offer letters released yet.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: STUDENT DIRECTORY */}
          {activeTab === 'students' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <span>University Student Database Directory</span>
                </h2>
              </div>

              <div className="space-y-3">
                {studentDirectory.map((st) => (
                  <div key={st._id} className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{st.name}</h4>
                      <p className="text-xs text-slate-400">{st.email} &bull; Roll: {st.rollNumber || 'REG-CS-01'}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      CGPA: {st.profile?.cgpa || 8.5}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 8: ANNOUNCEMENTS & NOTIFICATIONS CENTER */}
          {activeTab === 'announcements' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <Megaphone className="w-6 h-6 text-amber-400" />
                  <span>Campus Announcements & Broadcast Center</span>
                </h2>
                <button
                  onClick={() => setAnnouncementModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white"
                >
                  + Broadcast Announcement
                </button>
              </div>

              <NotificationsCenter onNavigateTab={(tab) => setActiveTab(tab)} />
            </motion.div>
          )}

          {/* TAB 9: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <PlacementAnalytics />
            </motion.div>
          )}

          {/* TAB 10: AUDIT ACTIVITY LOGS */}
          {activeTab === 'activity_logs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60">
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-violet-400" />
                  <span>System Activity Audit Logs</span>
                </h2>
              </div>

              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div key={log._id} className="glass-panel p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{log.details}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        By: {log.performedBy?.name || 'Officer'} &bull; {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <CompanyModal isOpen={companyModalOpen} onClose={() => setCompanyModalOpen(false)} onSave={handleCreateCompany} />

      <DriveModal
        isOpen={driveModalOpen}
        onClose={() => {
          setDriveModalOpen(false);
          setEditingDrive(null);
        }}
        onSave={handleSaveDriveModal}
        companies={companies}
        initialDrive={editingDrive}
      />

      {/* Drive Details Preview Modal */}
      <AnimatePresence>
        {previewDrive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B0F17] p-6 space-y-4 text-xs text-slate-300 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>{previewDrive.roleTitle}</span>
                </h3>
                <button
                  onClick={() => setPreviewDrive(null)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <p>Company: <strong className="text-white">{previewDrive.companyName}</strong></p>
              <p>Package: <span className="text-emerald-400 font-bold">{previewDrive.packageLPA}</span></p>
              <p>Min CGPA Cutoff: <span className="text-amber-400 font-mono">{previewDrive.eligibilityCGPA}</span></p>
              <p>Location: {previewDrive.location}</p>
              <p>Description: {previewDrive.description}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog Modal */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-3xl border border-white/10 bg-[#0B0F17] p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center space-x-3 text-amber-400">
                <Sparkles className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-extrabold text-white">{confirmDialog.title}</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{confirmDialog.message}</p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${confirmDialog.confirmClass}`}
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnnouncementModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        onPost={handleCreateAnnouncement}
      />

      <ApplicationReviewModal
        isOpen={Boolean(reviewAppModal)}
        application={reviewAppModal}
        onClose={() => setReviewAppModal(null)}
        onStageUpdate={handleStageUpdate}
        onOpenScheduleInterview={(app) => setScheduleInterviewModalApp(app)}
        onOpenOfferModal={(app) => setOfferModalApp(app)}
        onOpenRejectionModal={(app) => {
          const reason = prompt('Enter rejection reason for candidate:');
          if (reason) {
            rejectApplication({ applicationId: app._id, reason, feedback: 'Keep preparing!' }).then(() => {
              loadApps();
              setReviewAppModal(null);
            });
          }
        }}
      />

      <ScheduleInterviewModal
        isOpen={Boolean(scheduleInterviewModalApp)}
        application={scheduleInterviewModalApp}
        onClose={() => setScheduleInterviewModalApp(null)}
        onSchedule={handleScheduleInterview}
      />

      <OfferModal
        isOpen={Boolean(offerModalApp)}
        application={offerModalApp}
        onClose={() => setOfferModalApp(null)}
        onReleaseOffer={handleReleaseOffer}
      />
    </div>
  );
};

export default PlacementDashboard;
