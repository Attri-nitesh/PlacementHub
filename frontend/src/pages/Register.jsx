import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Mail, Lock, User, UserPlus, GraduationCap, ShieldAlert, Building2 } from 'lucide-react';

const Register = () => {
  const { register, error, loading, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    clearError();
    setLocalError('');
    if (isAuthenticated) {
      navigate('/');
    }
  }, [clearError, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!name || !email || !password || !role) {
      setLocalError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const res = await register(name, email, password, role);
    if (res?.success) {
      navigate('/');
    }
  };

  const getRoleDesc = () => {
    if (role === 'admin') return 'Register as College Placement Cell officer to manage drives and applicants.';
    if (role === 'recruiter') return 'Register as a Corporate Recruiter to publish jobs and shortlist candidates.';
    return 'Register as a student to build your resume, apply to job drives, and track statuses.';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Header logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Account
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Get started with PlacementHub today
          </p>
        </div>

        {/* Card envelope */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-colors duration-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error logs */}
            {(localError || error) && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {localError || error}
              </div>
            )}

            {/* Name input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.com"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>
            </div>

            {/* Role Select options */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
                  { id: 'recruiter', label: 'Recruiter', icon: <Building2 className="h-4 w-4" /> },
                  { id: 'admin', label: 'Admin', icon: <ShieldAlert className="h-4 w-4" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs font-bold transition-all ${
                      role === item.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-100/50 dark:hover:bg-slate-850'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500 leading-normal">
                {getRoleDesc()}
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-4.5 w-4.5" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Redirect to login */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-450"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
