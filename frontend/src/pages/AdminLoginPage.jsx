import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Loader2,
  ChevronDown,
} from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('admin@placementhub.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDevCredentials, setShowDevCredentials] = useState(true);

  const isDevMode =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.DEV
      : process.env.NODE_ENV !== 'production';

  // Automatically redirect if user is already authenticated as Admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(email, password, 'admin');
      if (res && res.success && res.user) {
        if (res.user.role === 'admin' || res.user.role === 'superadmin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          setErrorMessage('Invalid administrator credentials.');
        }
      } else {
        setErrorMessage('Invalid administrator credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-rose-500/30">
      {/* Dedicated Crimson Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-rose-500/30 bg-[#111622]/90 backdrop-blur-2xl shadow-2xl relative z-10 space-y-6"
      >
        {/* Header Section */}
        <div className="text-center space-y-2">
          {/* Small Crimson Pill Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs shadow-sm mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>SUPER ADMIN</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            PlacementHub Admin Portal
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Secure access for authorized system administrators only.
          </p>
        </div>

        {/* Development Credentials Collapsible Card (Dev Mode Only) */}
        {isDevMode && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 overflow-hidden text-xs transition-all">
            <button
              type="button"
              onClick={() => setShowDevCredentials(!showDevCredentials)}
              className="w-full p-3.5 flex items-center justify-between font-bold text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <KeyRound className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-[11px] uppercase font-mono tracking-wider">Development Credentials</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDevCredentials ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDevCredentials && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3.5 pb-3.5 space-y-1 border-t border-rose-500/20 text-slate-300 pt-2 font-mono text-[11px]"
                >
                  <p>Email: <strong className="text-white">admin@placementhub.com</strong></p>
                  <p>Password: <strong className="text-white">Admin@123</strong></p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Error Alert (Rendered ONLY AFTER a failed login attempt) */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-2.5 shadow-md"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@placementhub.com"
                className="w-full h-11 bg-[#161B26] border border-slate-700/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-[#161B26] border border-slate-700/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 font-medium py-1">
            <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Unauthorized access attempts are monitored and logged.</span>
          </div>

          {/* Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-glow-rose border border-rose-400/40 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In as Administrator</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </motion.button>
        </form>

        {/* Minimal Enterprise Footer */}
        <div className="text-center pt-4 border-t border-white/5">
          <span className="text-xs text-slate-400 font-mono opacity-70">
            PlacementHub &bull; Administrator Console
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
