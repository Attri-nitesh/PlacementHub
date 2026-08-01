import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Radio, Loader2 } from 'lucide-react';

const AnnouncementModal = ({ isOpen, onClose, onPost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('New Drive');
  const [priority, setPriority] = useState('High');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onPost({ title, content, category, priority });
      onClose();
    } catch (err) {
      alert('Failed to post announcement.');
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
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span>Broadcast Real-Time Campus Announcement</span>
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div>
              <label className="text-xs font-semibold text-slate-300">Announcement Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Google & Microsoft Campus Drives Published!"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1 bg-[#0B0F17]"
                >
                  <option value="New Drive">New Drive</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Notice">Notice</option>
                  <option value="Update">Update</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1 bg-[#0B0F17]"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Broadcast</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Announcement Message *</label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write clear instructions for all online students..."
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Broadcast Live via Socket.IO</span>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnnouncementModal;
