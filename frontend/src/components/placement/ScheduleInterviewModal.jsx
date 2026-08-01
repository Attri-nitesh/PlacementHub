import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, MapPin, User, Loader2 } from 'lucide-react';

const ScheduleInterviewModal = ({ isOpen, application, onClose, onSchedule }) => {
  const [round, setRound] = useState('Technical Interview Round 1');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('02:30 PM');
  const [type, setType] = useState('Online');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/abc-defg-hij');
  const [venue, setVenue] = useState('Campus Auditorium Lab 4');
  const [instructions, setInstructions] = useState('Prepare live coding environment in C++/Java. Test microphone and camera beforehand.');
  const [interviewerName, setInterviewerName] = useState('Senior Technical Architect');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSchedule({
        applicationId: application._id,
        userId: application.user?._id || application.user,
        companyName: application.companyName,
        roleTitle: application.roleTitle,
        round,
        date: new Date(date),
        time,
        type,
        meetLink,
        venue,
        instructions,
        interviewerName,
      });
      onClose();
    } catch (err) {
      alert('Failed to schedule interview.');
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
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Schedule Interview Round for {application.user?.name || 'Student'}</span>
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div>
              <label className="text-xs font-semibold text-slate-300">Interview Round Title *</label>
              <input
                type="text"
                required
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="e.g. Technical Round 1 (Data Structures)"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Interview Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Interview Time *</label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="02:30 PM"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Interview Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1 bg-[#0B0F17]"
                >
                  <option value="Online">Online (Google Meet / Teams)</option>
                  <option value="Offline">Offline Campus Venue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Interviewer Name</label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  placeholder="Rajesh Verma (Senior Architect)"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            </div>

            {type === 'Online' ? (
              <div>
                <label className="text-xs font-semibold text-slate-300">Google Meet / Video Link *</label>
                <input
                  type="url"
                  required
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-300">Offline Campus Venue *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Campus Auditorium Lab 4"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300">Candidate Instructions</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Prepare live coding environment..."
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Schedule & Notify Student Instantly</span>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleInterviewModal;
