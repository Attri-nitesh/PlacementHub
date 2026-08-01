import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const RoleSelectionModal = ({ isOpen, tempUser, onRoleSelected, loading }) => {
  const [selectedRole, setSelectedRole] = useState('student');

  if (!isOpen || !tempUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md selection:bg-violet-500/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="glass-panel p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient Top Glow Orb */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2 relative z-10">
          {tempUser.profilePicture ? (
            <img
              src={tempUser.profilePicture}
              alt={tempUser.name}
              className="w-16 h-16 rounded-full mx-auto border-2 border-white/20 shadow-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center mx-auto shadow-glow-violet">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          )}

          <h2 className="text-2xl font-extrabold tracking-tight text-white pt-2">
            Welcome, {tempUser.name || 'User'} 👋
          </h2>
          <p className="text-slate-400 text-xs">
            {tempUser.email} &bull; First Google Login Detected
          </p>
        </div>

        {/* Question & Options */}
        <div className="space-y-4 relative z-10">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">
            Continue as
          </label>

          <div className="grid grid-cols-1 gap-3">
            {/* Option 1: Student */}
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                selectedRole === 'student'
                  ? 'bg-emerald-500/15 border-emerald-500/50 shadow-glow-emerald text-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl ${selectedRole === 'student' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Student</p>
                  <p className="text-xs text-slate-400">Access campus drives, applications & resume vault</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === 'student' ? 'border-emerald-400 bg-emerald-500/30' : 'border-slate-500'}`}>
                {selectedRole === 'student' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
              </div>
            </button>

            {/* Option 2: Placement Cell */}
            <button
              type="button"
              onClick={() => setSelectedRole('placement')}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                selectedRole === 'placement'
                  ? 'bg-violet-500/15 border-violet-500/50 shadow-glow-violet text-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl ${selectedRole === 'placement' ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-400'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Placement Cell</p>
                  <p className="text-xs text-slate-400">Manage student roster, drives & announcements</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === 'placement' ? 'border-violet-400 bg-violet-500/30' : 'border-slate-500'}`}>
                {selectedRole === 'placement' && <div className="w-2 h-2 rounded-full bg-violet-400" />}
              </div>
            </button>
          </div>
        </div>

        {/* Submit Action Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          onClick={() => onRoleSelected(selectedRole)}
          className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 relative z-10 ${
            selectedRole === 'student'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-glow-emerald border border-emerald-400/30'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-glow-violet border border-violet-400/30'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Role...</span>
            </>
          ) : (
            <>
              <span>Confirm & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RoleSelectionModal;
