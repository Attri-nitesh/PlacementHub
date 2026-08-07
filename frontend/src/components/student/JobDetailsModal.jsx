import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyToJob } from '../../services/studentApi';
import { aiApi } from '../../services/aiApi';
import AtsAnalysisModal from '../ai/AtsAnalysisModal';
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Loader2,
  Lock,
  Cpu,
} from 'lucide-react';

const JobDetailsModal = ({ isOpen, drive, onClose, onApplied }) => {
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  // AI Resume Intelligence State
  const [loadingAts, setLoadingAts] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  if (!isOpen || !drive) return null;

  const isClosed = drive.status === 'Closed' || new Date(drive.deadline) < new Date();

  const handleApply = async () => {
    if (isClosed) return;
    try {
      setError('');
      setApplying(true);
      await applyToJob({
        jobDriveId: drive._id,
        companyName: drive.companyName,
        companyLogo: drive.companyLogo,
        roleTitle: drive.roleTitle,
        packageLPA: drive.packageLPA,
        location: drive.location,
        deadline: drive.deadline,
      });
      if (onApplied) onApplied(drive._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const handleAnalyzeResume = async (forceRefresh = false) => {
    try {
      setError('');
      if (forceRefresh) setReanalyzing(true);
      else setLoadingAts(true);

      const res = await aiApi.analyzeAtsScore(drive._id, forceRefresh);
      if (res.success && res.analysis) {
        setAtsAnalysis(res.analysis);
        setShowAtsModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run AI ATS analysis. Ensure your resume PDF is uploaded.');
    } finally {
      setLoadingAts(false);
      setReanalyzing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Top Header */}
            <div className="p-6 border-b border-white/10 bg-slate-900/60 flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {drive.companyLogo ? (
                  <img
                    src={drive.companyLogo}
                    alt={drive.companyName}
                    className="w-14 h-14 rounded-2xl object-contain bg-white p-1.5 border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-xl shrink-0">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {drive.type || 'Full Time'}
                    </span>
                    {isClosed && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>Closed</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{drive.roleTitle}</h3>
                  <p className="text-xs text-slate-400 font-medium">{drive.companyName}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                  {error}
                </div>
              )}

              {isClosed && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
                  <div className="font-bold text-xs flex items-center space-x-1">
                    <Lock className="w-4 h-4 text-red-400" />
                    <span>Applications for this drive have closed.</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Closed Reason: {drive.closeReason || 'Application Deadline Passed'}
                  </p>
                  {drive.closedAt && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Closed Date: {new Date(drive.closedAt).toLocaleDateString()} by {drive.closedBy || 'Placement Cell'}
                    </span>
                  )}
                </div>
              )}

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Package / CTC</span>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{drive.packageLPA}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                  <div className="text-sm font-bold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-violet-400" />
                    <span className="truncate">{drive.location}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Min CGPA</span>
                  <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <span>{drive.eligibilityCGPA || 7.0} CGPA</span>
                  </div>
                </div>
              </div>

              {/* AI ATS Resume Analysis CTA Card */}
              <div className="glass-panel p-4 rounded-2xl border border-violet-500/30 bg-violet-600/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-extrabold text-white text-sm flex items-center justify-center sm:justify-start space-x-1.5">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    <span>AI Resume Match Intelligence</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Evaluate your uploaded resume against {drive.companyName}'s skill requirements before applying.
                  </p>
                </div>

                <button
                  disabled={loadingAts}
                  onClick={() => handleAnalyzeResume(false)}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-glow-violet transition-colors flex items-center space-x-2 shrink-0 disabled:opacity-50"
                >
                  {loadingAts ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating ATS Match...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>✨ Analyze Resume</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                  Job Overview & Role Summary
                </h4>
                <p className="leading-relaxed text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                  {drive.description}
                </p>
              </div>

              {/* Skills Required */}
              {drive.skillsRequired?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                    Required Skill Matrix
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {drive.skillsRequired.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Process Rounds */}
              {drive.selectionProcess?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                    Recruitment & Interview Pipeline
                  </h4>
                  <div className="space-y-2">
                    {drive.selectionProcess.map((round, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-200"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{round}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-6 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
              </div>

              {isClosed ? (
                <button
                  disabled
                  className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-xs cursor-not-allowed flex items-center space-x-2 opacity-80"
                >
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Applications Closed</span>
                </button>
              ) : drive.isApplied ? (
                <div className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Application Submitted</span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={applying}
                  onClick={handleApply}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs text-white shadow-glow-emerald border border-emerald-400/30 flex items-center space-x-2"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit 1-Click Application</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* AI Resume Intelligence Modal */}
      <AtsAnalysisModal
        isOpen={showAtsModal}
        onClose={() => setShowAtsModal(false)}
        analysis={atsAnalysis}
        onReanalyze={() => handleAnalyzeResume(true)}
        reanalyzing={reanalyzing}
        jobDriveTitle={`${drive.companyName} - ${drive.roleTitle}`}
      />
    </>
  );
};

export default JobDetailsModal;
