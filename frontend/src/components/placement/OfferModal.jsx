import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, DollarSign, Calendar, Sparkles, Loader2 } from 'lucide-react';

const OfferModal = ({ isOpen, application, onClose, onReleaseOffer }) => {
  const [packageLPA, setPackageLPA] = useState(application?.packageLPA || '₹28 LPA');
  const [joiningDate, setJoiningDate] = useState('');
  const [offerLetterMessage, setOfferLetterMessage] = useState('We are thrilled to extend a formal placement offer for your outstanding performance in campus recruitment.');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onReleaseOffer({
        applicationId: application._id,
        userId: application.user?._id || application.user,
        companyName: application.companyName,
        roleTitle: application.roleTitle,
        packageLPA,
        joiningDate: new Date(joiningDate),
        offerLetterMessage,
      });
      onClose();
    } catch (err) {
      alert('Failed to release offer.');
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
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Release Formal Offer Letter 🎉</span>
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <span className="font-bold text-sm block">{application.user?.name}</span>
              <span className="text-xs">{application.companyName} &bull; {application.roleTitle}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Final CTC Package *</label>
              <input
                type="text"
                required
                value={packageLPA}
                onChange={(e) => setPackageLPA(e.target.value)}
                placeholder="₹28 LPA"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Expected Joining Date *</label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Offer Letter Message / Congratulatory Note *</label>
              <textarea
                required
                rows={4}
                value={offerLetterMessage}
                onChange={(e) => setOfferLetterMessage(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-xs text-white shadow-glow-emerald transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Release Offer Letter & Notify Student</span>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OfferModal;
