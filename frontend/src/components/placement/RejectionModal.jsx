import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, XCircle, Loader2 } from 'lucide-react';

const RejectionModal = ({ isOpen, application, onClose, onRejectCandidate }) => {
  const [reason, setReason] = useState('Assessment / Interview Cutoff Not Met');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Please provide a valid rejection reason.');
      return;
    }

    try {
      setLoading(true);
      await onRejectCandidate({
        applicationId: application._id,
        reason: reason.trim(),
        feedback: feedback.trim() || 'Thank you for participating. We encourage you to keep sharpening your technical skills for upcoming campus drives.',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject candidate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Candidate Rejection Feedback</span>
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            {/* Candidate Summary Card */}
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white">{application.user?.name || 'Student Candidate'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                  {application.stage}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Company: <strong className="text-white">{application.companyName}</strong> &bull; Role: <strong className="text-white">{application.roleTitle}</strong>
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Rejection Reason (Required) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Rejection Reason *
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Technical OA Cutoff Not Met / Interview Feedback"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium"
              />
            </div>

            {/* Optional Interviewer Feedback */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Interviewer / Recruiter Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Constructive feedback to help student prepare for future campus placement drives..."
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Rejection...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Reject Candidate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RejectionModal;
