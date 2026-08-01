import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCheck, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between relative overflow-hidden selection:bg-violet-500/30">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial-glow pointer-events-none opacity-80" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Floating Geometric SVGs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 left-12 w-24 h-24 border border-violet-500/30 rounded-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-24 right-16 w-32 h-32 border border-emerald-500/30 rounded-full"
        />
      </div>

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 p-0.5 shadow-glow-violet flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Placement<span className="text-violet-400">Hub</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login?role=student')}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all"
          >
            Student Sign In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login?role=placement')}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet transition-all"
          >
            Placement Cell
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto relative z-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Tag Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Phase 1 Authentication & Infrastructure Ready</span>
          </div>

          {/* Project Name & Main Tagline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Next-Generation Campus <br />
              <span className="gradient-text-violet">Placement Management</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Engineered with enterprise security, role-based controls, and seamless campus workflow automation.
            </p>
          </div>

          {/* Dual Role Login Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {/* Student Login Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login?role=student')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-glow-emerald border border-emerald-400/30 transition-all duration-200"
            >
              <UserCheck className="w-5 h-5 text-emerald-100" />
              <span>Student Portal</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </motion.button>

            {/* Placement Cell Login Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login?role=placement')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-violet border border-violet-400/30 transition-all duration-200"
            >
              <ShieldCheck className="w-5 h-5 text-violet-100" />
              <span>Placement Cell</span>
              <ArrowRight className="w-4 h-4 text-violet-200" />
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div>&copy; 2026 PlacementHub. All rights reserved.</div>
        <div className="flex items-center space-x-4">
          <span className="hover:text-slate-200 cursor-pointer">Security Protocol</span>
          <span>&bull;</span>
          <span className="hover:text-slate-200 cursor-pointer">Phase 1 Release</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
