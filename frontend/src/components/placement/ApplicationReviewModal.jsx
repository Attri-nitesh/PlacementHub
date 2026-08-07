import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  GraduationCap,
  FileText,
  Github,
  Linkedin,
  Code2,
  ExternalLink,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  Calendar,
  Download,
  Eye,
} from 'lucide-react';

const ApplicationReviewModal = ({
  isOpen,
  application,
  onClose,
  onStageUpdate,
  onOpenScheduleInterview,
  onOpenOfferModal,
  onOpenRejectionModal,
}) => {
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  if (!isOpen || !application) return null;

  const student = application.user || {};
  const studentData = application.studentProfile || {};
  const profile = studentData.profile || {};
  const resume = studentData.resume || null;
  const skills = studentData.skills || [];
  const projects = studentData.projects || [];
  const coding = profile.codingProfiles || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-4xl rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Top Sticky Header */}
          <div className="p-6 border-b border-white/10 bg-slate-900/60 flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {student.profilePicture ? (
                <img
                  src={student.profilePicture}
                  alt={student.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shrink-0">
                  <User className="w-7 h-7" />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-white">{student.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CGPA: {profile.cgpa || 8.5}
                  </span>
                  {application.atsAnalysis && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center space-x-1">
                      <span>✨ ATS Match: {application.atsAnalysis.overallScore}%</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {profile.department || 'Computer Science'} &bull; Roll: {student.rollNumber || 'CS-2026-REG'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Read-Only Profile View */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Stage</span>
                <div className="text-sm font-extrabold text-emerald-400">{application.stage}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Target Role</span>
                <div className="text-sm font-bold text-slate-200 truncate">{application.roleTitle}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Backlogs</span>
                <div className="text-sm font-bold text-amber-400">{profile.backlogs || 0} Backlogs</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Resume Status</span>
                <div className="text-sm font-bold text-emerald-300">
                  {resume ? 'PDF Available' : 'No Resume'}
                </div>
              </div>
            </div>

            {/* Resume Viewer Strip */}
            {resume ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white text-sm block">{resume.fileName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Verified PDF &bull; {Math.round(resume.fileSize / 1024)} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPdfPreviewOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4 text-violet-400" />
                    <span>Preview PDF</span>
                  </button>

                  <a
                    href={`http://localhost:5001${resume.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs italic">
                No PDF resume uploaded by student yet.
              </div>
            )}

            {/* Coding Profiles & Handles */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                Verified Coding Handles & Profiles
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {coding.github && (
                  <a
                    href={coding.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-slate-200 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4 text-slate-400" />
                    <span className="truncate">GitHub Profile</span>
                  </a>
                )}
                {coding.linkedin && (
                  <a
                    href={coding.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-slate-200 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    <span className="truncate">LinkedIn Profile</span>
                  </a>
                )}
                {coding.leetcode && (
                  <a
                    href={coding.leetcode}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-slate-200 hover:text-white transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span className="truncate">LeetCode</span>
                  </a>
                )}
              </div>
            </div>

            {/* Technical Skills Matrix */}
            {skills.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                  Technical Skill Matrix
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((sk) => (
                    <span
                      key={sk._id}
                      className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold flex items-center gap-1.5"
                    >
                      <span>{sk.name}</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{sk.proficiency}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Portfolio */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                  Student Project Showcase
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map((pj) => (
                    <div key={pj._id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                      <h5 className="font-bold text-white text-xs">{pj.title}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{pj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {pj.technologies?.map((tech, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Placement Officer Action Bar */}
          <div className="p-6 border-t border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onStageUpdate(application._id, 'Resume Shortlisted')}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors"
              >
                Shortlist Resume
              </button>

              <button
                onClick={() => onStageUpdate(application._id, 'OA')}
                className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors"
              >
                Mark OA Scheduled
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenScheduleInterview(application)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-colors"
              >
                Schedule Interview
              </button>

              <button
                onClick={() => onOpenOfferModal(application)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-glow-emerald transition-colors"
              >
                Release Offer 🎉
              </button>

              <button
                onClick={() => onOpenRejectionModal(application)}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
              >
                Reject Application
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Embedded PDF Modal */}
      {pdfPreviewOpen && resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-4xl h-[85vh] rounded-3xl border border-white/10 overflow-hidden flex flex-col bg-[#0B0F17]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <span className="font-bold text-white text-sm">{resume.fileName}</span>
              <button
                onClick={() => setPdfPreviewOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe src={`http://localhost:5001${resume.fileUrl}`} title="Resume PDF" className="w-full flex-1 bg-white" />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationReviewModal;
