import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';
import {
  User,
  Mail,
  Lock,
  Hash,
  Eye,
  EyeOff,
  UserCheck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerStudent, googleAuth, user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') navigate('/student/dashboard', { replace: true });
      else if (user.role === 'placement') navigate('/placement/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, rollNumber, password, confirmPassword } = formData;

    if (!name || !email || !rollNumber || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerStudent(formData);
      if (res.success && res.user) {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googlePayload) => {
    try {
      setError('');
      const res = await googleAuth(googlePayload);
      if (res.success && res.user) {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google Auth failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/30">
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial-glow-emerald pointer-events-none opacity-70" />

      {/* Top Left Navigation Back */}
      <button
        onClick={() => navigate('/login?role=student')}
        className="absolute top-6 left-6 z-30 flex items-center space-x-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Login</span>
      </button>

      {/* Main Registration Box */}
      <div className="w-full max-w-lg space-y-6 relative z-10 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center mx-auto shadow-glow-emerald border border-emerald-400/30">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Student Registration
          </h2>
          <p className="text-slate-400 text-sm">
            Create your PlacementHub profile to access placement drives.
          </p>
        </div>

        {/* Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 shadow-glass space-y-5"
        >
          {/* Quick Sign up with Google */}
          <div className="space-y-4">
            <GoogleButton
              onGoogleSuccess={handleGoogleSuccess}
              onError={(errMsg) => setError(errMsg)}
              text="Sign up with Google"
            />

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#0F172A] px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Or Register Manually
              </span>
            </div>
          </div>

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

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email & Roll Number Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@student.edu"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  College Roll Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. CS2026001"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full glass-input pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-glow-emerald border border-emerald-400/30 transition-all duration-200 flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Complete Student Registration</span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Existing Account Footer */}
        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link
            to="/login?role=student"
            className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
