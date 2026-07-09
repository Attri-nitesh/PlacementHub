import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Mail, ArrowLeft, GraduationCap, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword, error, loading, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email) {
      setLocalError('Please enter your email');
      return;
    }

    const res = await forgotPassword(email);
    if (res?.success) {
      setSuccess(true);
      setMessage(res.message || 'Verification link sent to your email.');
    } else {
      setLocalError(res?.error || 'Password reset request failed.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Recover your PlacementHub account credentials
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-colors duration-200">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Check Your Inbox</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-450"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Errors container */}
              {(localError || error) && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {localError || error}
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Enter your email address below. We'll send you an HTML mail with a unique verification link valid for 10 minutes.
              </p>

              {/* Email Address */}
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

              {/* Action buttons */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 active:scale-98 transition-all"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
