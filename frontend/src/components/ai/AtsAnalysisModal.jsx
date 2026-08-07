import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import AtsScoreGauge from './AtsScoreGauge';

const AtsAnalysisModal = ({
  isOpen,
  onClose,
  analysis,
  onReanalyze,
  reanalyzing,
  jobDriveTitle = 'Placement Drive',
}) => {
  if (!isOpen || !analysis) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-3xl rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 shrink-0">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>AI Resume Intelligence &bull; {jobDriveTitle}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1">
            <AtsScoreGauge
              analysis={analysis}
              onReanalyze={onReanalyze}
              reanalyzing={reanalyzing}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AtsAnalysisModal;
