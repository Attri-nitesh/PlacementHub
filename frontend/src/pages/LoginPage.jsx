import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';
import RoleSelectionModal from '../components/RoleSelectionModal';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, googleAuth, setRole, user, isAuthenticated } = useAuth();

  const [role, setRoleState] = useState(searchParams.get('role') || 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  // Role Selection Modal for First-time Google Users
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempGoogleUser, setTempGoogleUser] = useState(null);
  const [roleSaving, setRoleSaving] = useState(false);

  // Redirect if already authenticated with role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') navigate('/student/dashboard', { replace: true });
      else if (user.role === 'placement') navigate('/placement/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password, role);
      if (res.success && res.user) {
        if (res.user.role === 'student') navigate('/student/dashboard');
        else navigate('/placement/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleData) => {
    try {
      setError('');
      const res = await googleAuth(googleData);

      if (res.needsRoleSelection && res.tempUser) {
        // First Login: Display Role Selection Modal ("Continue as Student / Placement Cell")
        setTempGoogleUser(res.tempUser);
        setShowRoleModal(true);
      } else if (res.success && res.user) {
        // Returning User: Role already saved in MongoDB -> Redirect directly
        if (res.user.role === 'student') navigate('/student/dashboard');
        else if (res.user.role === 'placement') navigate('/placement/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google Authentication failed.');
    }
  };

  const handleRoleConfirm = async (selectedRole) => {
    try {
      setRoleSaving(true);
      setError('');
      const res = await setRole({
        email: tempGoogleUser.email,
        role: selectedRole,
      });

      if (res.success && res.user) {
        setShowRoleModal(false);
        if (res.user.role === 'student') navigate('/student/dashboard');
        else navigate('/placement/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Role assignment failed.');
    } finally {
      setRoleSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex relative overflow-hidden selection:bg-violet-500/30">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 flex items-center space-x-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Split Screen Layout */}
      <div className="w-full grid lg:grid-cols-2 min-h-screen">
        {/* Left Side: Startup Aesthetics */}
        <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#0F172A] via-[#0B0F17] to-[#121824]">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-glow-violet">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">PlacementHub</span>
            </div>
          </div>

          <div className="relative z-10 my-auto py-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 max-w-lg shadow-glass relative overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">OAuth 2.0 Ready</span>
                </div>

                <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <p className="text-xs text-slate-400">Security Standard</p>
                      <p className="text-sm font-bold text-violet-400">JWT + HttpOnly</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <p className="text-xs text-slate-400">Identity Service</p>
                      <p className="text-sm font-bold text-emerald-400">Google OAuth 2.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 text-xs text-slate-400 font-medium">
            PlacementHub Auth &bull; Secure Encrypted Session
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Form */}
        <div className="flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-sm">
                Sign in to your PlacementHub account to continue.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="p-1 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 gap-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setRoleState('student');
                  setError('');
                }}
                className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  role === 'student'
                    ? 'bg-emerald-600 text-white shadow-glow-emerald'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleState('placement');
                  setError('');
                }}
                className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  role === 'placement'
                    ? 'bg-violet-600 text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Placement Cell</span>
              </button>
            </div>

            {/* Login Card */}
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 shadow-glass space-y-6"
            >
              {/* Option 1: Official Google OAuth Button */}
              <div className="space-y-4">
                <GoogleButton
                  onGoogleSuccess={handleGoogleSuccess}
                  onError={(errMsg) => setError(errMsg)}
                  text="Continue with Google"
                />

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-white/10" />
                  <span className="absolute bg-[#0B0F17] px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Or with Email & Password
                  </span>
                </div>
              </div>

              {/* Option 2: Email & Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'student' ? 'student@college.edu' : 'officer@placement.edu'}
                      className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModal(true)}
                      className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full glass-input pl-10 pr-10 py-3 rounded-xl text-sm font-medium placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  type="submit"
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    role === 'student'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-glow-emerald border border-emerald-400/30'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-glow-violet border border-violet-400/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In as {role === 'student' ? 'Student' : 'Placement Cell'}</span>
                  )}
                </motion.button>

                {/* Demo Credentials Tip */}
                <div className="pt-2 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-violet-400" />
                    Demo Test Credentials:
                  </p>
                  {role === 'student' ? (
                    <p>Email: <code className="text-emerald-300">john@student.edu</code> | Pass: <code className="text-emerald-300">student123password</code></p>
                  ) : (
                    <p>Email: <code className="text-violet-300">officer@placement.edu</code> | Pass: <code className="text-violet-300">placement123password</code></p>
                  )}
                </div>
              </form>
            </motion.div>

            {/* Registration link for Students */}
            {role === 'student' && (
              <div className="text-center text-xs text-slate-400">
                Don't have a student account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
                >
                  Register as Student
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Selection Modal on First Google Login */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        tempUser={tempGoogleUser}
        onRoleSelected={handleRoleConfirm}
        loading={roleSaving}
      />

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Forgot Password</h3>
                <p className="text-xs text-slate-400">
                  Password reset logic is disabled in Phase 1. Please contact your Placement Cell for credential reset.
                </p>
              </div>
              <button
                onClick={() => setForgotModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
