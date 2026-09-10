import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  getEmailStatus,
  getGoogleConnectUrl,
  syncEmail,
  disconnectGoogle,
} from '../../services/emailApi';

const EmailTrackingSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState({
    connected: false,
    email: '',
    provider: 'google',
    lastSyncedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message: string }

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getEmailStatus();
      if (data.success) {
        setStatus({
          connected: Boolean(data.connected),
          email: data.email || '',
          provider: data.provider || 'google',
          lastSyncedAt: data.lastSyncedAt || null,
        });
      }
    } catch (err) {
      console.error('[Email Tracking Settings] Failed to load status:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Check URL search parameters for OAuth callback results
    const gmailParam = searchParams.get('gmail');
    const reason = searchParams.get('reason');

    if (gmailParam === 'connected') {
      setBanner({
        type: 'success',
        message: 'Gmail connected successfully! PlacementHub will track your job application updates.',
      });
      // Remove query param from URL cleanly
      searchParams.delete('gmail');
      searchParams.delete('reason');
      setSearchParams(searchParams, { replace: true });
    } else if (gmailParam === 'error') {
      const errorMsg =
        reason === 'user_cancelled'
          ? 'Gmail connection was cancelled by the user.'
          : 'Unable to connect Gmail. Please try again.';
      setBanner({
        type: 'error',
        message: errorMsg,
      });
      searchParams.delete('gmail');
      searchParams.delete('reason');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const handleConnectGmail = async () => {
    setConnecting(true);
    setBanner(null);
    try {
      const res = await getGoogleConnectUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error('Failed to retrieve authorization URL.');
      }
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.message || 'Unable to initiate Gmail connection.',
      });
      setConnecting(false);
    }
  };

  const handleSyncNow = async () => {
    if (syncing || !status.connected) return;
    setSyncing(true);
    setBanner(null);
    try {
      const res = await syncEmail();
      if (res.success) {
        const added = res.applicationsCreated || 0;
        const updated = res.applicationsUpdated || 0;
        let msg = 'Sync complete — ';
        if (added > 0 || updated > 0) {
          msg += `${added} application${added === 1 ? '' : 's'} added and ${updated} updated.`;
        } else {
          msg += 'no new application updates found.';
        }
        setBanner({
          type: 'success',
          message: msg,
        });
        if (res.lastSyncedAt) {
          setStatus((prev) => ({ ...prev, lastSyncedAt: res.lastSyncedAt }));
        } else {
          fetchStatus();
        }
      }
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.message || 'Gmail sync failed. Please try again later.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await disconnectGoogle();
      if (res.success) {
        setBanner({
          type: 'success',
          message: 'Gmail disconnected successfully.',
        });
        setStatus({
          connected: false,
          email: '',
          provider: 'google',
          lastSyncedAt: null,
        });
      }
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.message || 'Failed to disconnect Gmail. Please try again.',
      });
    } finally {
      setDisconnecting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Email Application Tracking
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Automatically detect job application updates from your email and keep your application tracker synchronized.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading || syncing}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1 border border-white/5 shrink-0"
          title="Refresh Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 border shadow-md ${
              banner.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{banner.message}</span>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Connection Card */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Google Gmail Icon Badge */}
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Gmail</span>
                {status.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {status.connected ? status.email : 'Link your Google account for automated recruitment tracking'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {status.connected ? (
              <>
                <button
                  onClick={handleSyncNow}
                  disabled={syncing || loading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Scanning job application emails...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Sync Now
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={disconnecting || syncing}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition-all flex items-center gap-2 hover:border-rose-500/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectGmail}
                disabled={connecting || loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    Connect Gmail
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sync Info when Connected */}
        {status.connected && (
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>
              Last synced:{' '}
              <strong className="text-slate-300 font-semibold">
                {status.lastSyncedAt
                  ? new Date(status.lastSyncedAt).toLocaleString()
                  : 'Not synced yet'}
              </strong>
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> AES-256 Encrypted OAuth Token Storage
            </span>
          </div>
        )}
      </div>

      {/* Mandatory Privacy & Scope Disclosure */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">Read-Only Privacy Guarantee</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            PlacementHub uses read-only Gmail access to detect job application and recruitment updates. It cannot send or delete your emails.
          </p>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900 max-w-md w-full space-y-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Disconnect Gmail?</h3>
                  <p className="text-xs text-slate-400">Confirm email integration disconnection</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>Automatic email tracking will stop.</p>
                <p className="text-slate-400 text-[11px]">
                  Your existing job applications and PlacementHub account will not be deleted or affected.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={disconnecting}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisconnect}
                  disabled={disconnecting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Disconnect
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailTrackingSettings;
