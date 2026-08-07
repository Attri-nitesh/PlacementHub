import React, { useState, useEffect, useRef } from 'react';
import { getApplications } from '../../services/studentApi';
import { useSocket } from '../../context/SocketContext';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
  Lock,
  History,
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Award,
  Video,
  Download,
} from 'lucide-react';

const STAGES = [
  { id: 'Applied', title: 'Applied', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { id: 'Resume Shortlisted', title: 'Resume Shortlisted', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
  { id: 'OA', title: 'OA (Online Test)', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { id: 'Interview', title: 'Interview Round', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { id: 'Offer Released', title: 'Offer Received 🎉', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { id: 'Rejected', title: 'Rejected', color: 'border-red-500/30 text-red-400 bg-red-500/10' },
];

const ApplicationKanban = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state - DEFAULT CLOSED (null)
  const [selectedTimelineApp, setSelectedTimelineApp] = useState(null);
  const [selectedModalApp, setSelectedModalApp] = useState(null);
  const [activeModalType, setActiveModalType] = useState(''); // 'interview' | 'offer' | 'rejected' | 'oa'
  const [highlightedAppId, setHighlightedAppId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchParams] = useSearchParams();
  const applicationIdParam = searchParams.get('applicationId') || searchParams.get('appId');
  const modalParam = searchParams.get('modal');

  const { socket } = useSocket();
  const cardRefs = useRef({});

  // Always fetch fresh application data directly from backend
  const fetchFreshApps = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      const fetchedApps = data.applications || [];
      setApplications(fetchedApps);

      // ONLY process deep link highlight & modal opening if applicationIdParam IS EXPLICITLY PRESENT
      if (applicationIdParam) {
        const foundApp = fetchedApps.find((a) => a._id === applicationIdParam);
        if (foundApp) {
          setHighlightedAppId(applicationIdParam);

          if (modalParam === 'interview') {
            setSelectedModalApp(foundApp);
            setActiveModalType('interview');
          } else if (modalParam === 'offer') {
            setSelectedModalApp(foundApp);
            setActiveModalType('offer');
          } else if (modalParam === 'rejected') {
            setSelectedModalApp(foundApp);
            setActiveModalType('rejected');
          } else if (modalParam === 'oa') {
            setSelectedModalApp(foundApp);
            setActiveModalType('oa');
          } else if (modalParam === 'timeline') {
            setSelectedTimelineApp(foundApp);
          }

          // Smooth scroll ONLY for explicit notification deep link
          setTimeout(() => {
            if (cardRefs.current[applicationIdParam]) {
              cardRefs.current[applicationIdParam].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);

          // Clear highlight after 3.5 seconds
          setTimeout(() => {
            setHighlightedAppId(null);
          }, 3500);
        } else {
          setErrorMessage('This application is no longer available.');
          setTimeout(() => setErrorMessage(''), 4000);
        }
      } else {
        // DEFAULT CLEAN BOARD VIEW: Ensure no modals are open and no card is selected
        setSelectedTimelineApp(null);
        setSelectedModalApp(null);
        setHighlightedAppId(null);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreshApps();
  }, [applicationIdParam, modalParam]);

  // Real-time Socket.IO synchronization
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchFreshApps();

    socket.on('application_updated', handleUpdate);
    socket.on('application_created', handleUpdate);

    return () => {
      socket.off('application_updated', handleUpdate);
      socket.off('application_created', handleUpdate);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {/* Error Alert Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-2 shadow-2xl"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-emerald-400" />
              <span>Job Application Status Kanban</span>
            </h2>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Read-Only ATS Sync</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reflects live recruitment progression updated exclusively by Placement Cell officers.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{applications.length} Submissions Active</span>
        </div>
      </div>

      {/* Clean Kanban Board (Default View) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const colApps = applications.filter((app) => {
            if (col.id === 'Offer Released') {
              return app.stage === 'Offer Released' || app.stage === 'Offer';
            }
            return app.stage === col.id;
          });

          return (
            <div
              key={col.id}
              className="glass-panel p-4 rounded-3xl border border-white/10 bg-slate-900/40 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colApps.map((app) => {
                  const isHighlighted = app._id === highlightedAppId;

                  return (
                    <motion.div
                      key={app._id}
                      ref={(el) => (cardRefs.current[app._id] = el)}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        setSelectedTimelineApp(app);
                      }}
                      className={`glass-panel p-4 rounded-2xl border transition-all duration-500 space-y-3 relative overflow-hidden cursor-pointer ${
                        isHighlighted
                          ? 'border-violet-400 bg-violet-600/30 ring-4 ring-violet-500/50 shadow-glow-violet animate-pulse scale-[1.02]'
                          : 'border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-white/10'
                      }`}
                    >
                      {/* Top Row: Logo & Company Name */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {app.companyLogo ? (
                            <img
                              src={app.companyLogo}
                              alt={app.companyName}
                              className="w-9 h-9 rounded-xl object-contain bg-white p-1 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-white text-sm leading-snug">{app.companyName}</h4>
                              {app.autoTracked && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[9px] font-extrabold shrink-0" title="Automatically tracked via Gmail">
                                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                  Auto-tracked
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">{app.roleTitle}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="space-y-1 text-[11px] text-slate-300 font-medium">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{app.packageLPA}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{app.location}</span>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </span>

                        <div className="flex items-center space-x-2">
                          {(app.stage === 'Offer Released' || app.stage === 'Offer') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModalApp(app);
                                setActiveModalType('offer');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30"
                            >
                              Offer Details
                            </button>
                          )}

                          {app.stage === 'Interview' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModalApp(app);
                                setActiveModalType('interview');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/30"
                            >
                              Interview Details
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTimelineApp(app);
                            }}
                            className="flex items-center space-x-1 text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Timeline</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-xs italic">
                    No applications in {col.title}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Timeline Drawer Modal (Only Opens on User Interaction) */}
      <AnimatePresence>
        {selectedTimelineApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-3">
                  <History className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Application Audit Timeline</h3>
                    <p className="text-xs text-slate-400">
                      {selectedTimelineApp.companyName} &bull; {selectedTimelineApp.roleTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTimelineApp(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {selectedTimelineApp.timeline?.length > 0 ? (
                  <div className="relative pl-6 space-y-6 border-l-2 border-white/10">
                    {selectedTimelineApp.timeline.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-violet-600 border-2 border-[#0B0F17] shadow-glow-violet" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{item.stage}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{item.remarks || 'Stage updated'}</p>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Updated By: {item.updatedBy || 'Placement Cell'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 italic">
                    Application submitted on {new Date(selectedTimelineApp.appliedDate).toLocaleDateString()}.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Context Modal for Offer / Interview / Rejection Details (Only Opens on User Interaction) */}
      <AnimatePresence>
        {selectedModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-3">
                  {activeModalType === 'offer' ? (
                    <Award className="w-5 h-5 text-emerald-400" />
                  ) : activeModalType === 'interview' ? (
                    <Calendar className="w-5 h-5 text-amber-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {activeModalType === 'offer'
                        ? 'Formal Offer Details 🎉'
                        : activeModalType === 'interview'
                        ? 'Scheduled Interview Details'
                        : 'Application Status Details'}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedModalApp.companyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModalApp(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-300">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-base">{selectedModalApp.roleTitle}</h4>
                  <p className="text-emerald-400 font-bold font-mono text-sm">Package: {selectedModalApp.packageLPA}</p>
                  <p className="text-slate-400">Current Stage: <span className="text-white font-bold">{selectedModalApp.stage}</span></p>
                </div>

                {activeModalType === 'offer' && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <span className="font-bold text-emerald-300 block text-xs">Official Offer Letter</span>
                    <p className="text-slate-200 leading-relaxed">
                      {selectedModalApp.timeline?.[selectedModalApp.timeline.length - 1]?.remarks || 'Formal placement offer letter released.'}
                    </p>
                    <button
                      onClick={() => alert('Downloading official offer letter PDF...')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center space-x-2 shadow-glow-emerald"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Offer Letter</span>
                    </button>
                  </div>
                )}

                {activeModalType === 'interview' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <span className="font-bold text-amber-300 block text-xs">Interview Schedule</span>
                    <p className="text-slate-200">
                      {selectedModalApp.timeline?.[selectedModalApp.timeline.length - 1]?.remarks || 'Technical Interview round scheduled.'}
                    </p>
                  </div>
                )}

                {activeModalType === 'rejected' && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
                    <span className="font-bold text-red-300 block text-xs">Rejection Reason & Feedback</span>
                    <p className="text-slate-200">
                      Reason: {selectedModalApp.rejectionReason || 'Not selected in recruiter evaluation.'}
                    </p>
                    {selectedModalApp.rejectionFeedback && (
                      <p className="text-slate-400 italic">Feedback: {selectedModalApp.rejectionFeedback}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationKanban;
