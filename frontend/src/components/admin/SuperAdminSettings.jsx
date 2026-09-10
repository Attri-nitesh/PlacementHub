import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Lock,
  Mail,
  ShieldCheck,
  Globe,
  UploadCloud,
  Database,
  Bell,
  Key,
  FileCheck,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  RefreshCw,
  Download,
  Trash2,
  Send,
  Check,
} from 'lucide-react';

const SuperAdminSettings = () => {
  // Toast Save Feedback
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Section Collapse States (All open by default, toggleable)
  const [openSections, setOpenSections] = useState({
    auth: true,
    email: true,
    security: true,
    platform: true,
    upload: true,
    database: true,
    notifications: true,
    apikeys: true,
    audit: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // State Values
  const [settings, setSettings] = useState({
    // Auth
    googleLogin: true,
    localLogin: true,
    sessionTimeout: '60',
    jwtExpiry: '7d',
    force2FA: false,

    // Email
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    senderEmail: 'noreply@placementhub.com',

    // Security
    passwordPolicy: 'Strict',
    minPasswordLength: '8',
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,

    // Platform
    maintenanceMode: false,
    studentRegistration: true,
    officerRegistration: false,

    // File Upload
    maxResumeSize: '5',
    allowedFileTypes: '.pdf, .docx',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    broadcastAlerts: true,

    // API Keys
    googleClientId: 'google_client_id_748392019483.apps.googleusercontent.com',
    googleClientSecret: 'GOCSPX-x83921094823901482903',
    geminiApiKey: 'AIzaSyA89320148920138402194821',
    openaiApiKey: 'sk-proj-4892019482019482019482104812',
    smtpPassword: 'smtp_password_secret_99812',

    // Audit
    logRetentionDays: '90',
  });

  // Reveal API Keys Toggle State
  const [showKeys, setShowKeys] = useState({
    googleSecret: false,
    gemini: false,
    openai: false,
    smtpPass: false,
  });

  const toggleKeyReveal = (key) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    triggerToast('System Configuration saved successfully!');
  };

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 border border-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs tracking-wider uppercase">
                Enterprise Infrastructure Controls
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              System Settings &amp; Security Configuration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Configure global authentication parameters, SMTP email transport, security policies, API secret keys, and database maintenance controls.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: AUTHENTICATION */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('auth')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Lock className="w-4 h-4" />
              </div>
              <span>1. Authentication Settings</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.auth ? 'rotate-180' : ''}`} />
          </button>

          {openSections.auth && (
            <div className="p-6 border-t border-white/10 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Google OAuth 2.0 Login</span>
                    <span className="text-slate-400 text-[11px]">Allow students &amp; staff to sign in with Google</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.googleLogin}
                    onChange={(e) => setSettings({ ...settings, googleLogin: e.target.checked })}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Local Password Authentication</span>
                    <span className="text-slate-400 text-[11px]">Allow email &amp; password logins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.localLogin}
                    onChange={(e) => setSettings({ ...settings, localLogin: e.target.checked })}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Session Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">JWT Cookie Expiry</label>
                  <input
                    type="text"
                    value={settings.jwtExpiry}
                    onChange={(e) => setSettings({ ...settings, jwtExpiry: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Force Multi-Factor 2FA</span>
                    <span className="text-slate-400 text-[11px]">Require OTP for all logins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.force2FA}
                    onChange={(e) => setSettings({ ...settings, force2FA: e.target.checked })}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: EMAIL */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('email')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mail className="w-4 h-4" />
              </div>
              <span>2. Email &amp; SMTP Configuration</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.email ? 'rotate-180' : ''}`} />
          </button>

          {openSections.email && (
            <div className="p-6 border-t border-white/10 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">SMTP Port</label>
                  <input
                    type="text"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Sender Email Address</label>
                  <input
                    type="email"
                    value={settings.senderEmail}
                    onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => triggerToast('Test Email dispatched to administrator!')}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold flex items-center space-x-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: SECURITY */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('security')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>3. Password &amp; Security Policy</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.security ? 'rotate-180' : ''}`} />
          </button>

          {openSections.security && (
            <div className="p-6 border-t border-white/10 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Password Complexity Level</label>
                  <select
                    value={settings.passwordPolicy}
                    onChange={(e) => setSettings({ ...settings, passwordPolicy: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  >
                    <option value="Strict">Strict Enterprise Policy (Recommended)</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Minimum Password Length</label>
                  <input
                    type="number"
                    value={settings.minPasswordLength}
                    onChange={(e) => setSettings({ ...settings, minPasswordLength: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="font-bold text-white">Require Uppercase Letter</span>
                  <input
                    type="checkbox"
                    checked={settings.requireUppercase}
                    onChange={(e) => setSettings({ ...settings, requireUppercase: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="font-bold text-white">Require Numbers</span>
                  <input
                    type="checkbox"
                    checked={settings.requireNumbers}
                    onChange={(e) => setSettings({ ...settings, requireNumbers: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="font-bold text-white">Require Special Symbols</span>
                  <input
                    type="checkbox"
                    checked={settings.requireSymbols}
                    onChange={(e) => setSettings({ ...settings, requireSymbols: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: PLATFORM */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('platform')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Globe className="w-4 h-4" />
              </div>
              <span>4. Platform &amp; Registration Controls</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.platform ? 'rotate-180' : ''}`} />
          </button>

          {openSections.platform && (
            <div className="p-6 border-t border-white/10 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">System Maintenance Mode</span>
                    <span className="text-slate-400 text-[11px]">Disable login for non-admins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Student Self-Registration</span>
                    <span className="text-slate-400 text-[11px]">Allow new student signups</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.studentRegistration}
                    onChange={(e) => setSettings({ ...settings, studentRegistration: e.target.checked })}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Officer Registration</span>
                    <span className="text-slate-400 text-[11px]">Allow officer self-signup</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.officerRegistration}
                    onChange={(e) => setSettings({ ...settings, officerRegistration: e.target.checked })}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: FILE UPLOAD */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('upload')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <UploadCloud className="w-4 h-4" />
              </div>
              <span>5. File Upload &amp; Storage Limits</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.upload ? 'rotate-180' : ''}`} />
          </button>

          {openSections.upload && (
            <div className="p-6 border-t border-white/10 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Max Resume File Size (MB)</label>
                  <input
                    type="number"
                    value={settings.maxResumeSize}
                    onChange={(e) => setSettings({ ...settings, maxResumeSize: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Allowed File Extensions</label>
                  <input
                    type="text"
                    value={settings.allowedFileTypes}
                    onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: DATABASE */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('database')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Database className="w-4 h-4" />
              </div>
              <span>6. MongoDB Maintenance &amp; Backups</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.database ? 'rotate-180' : ''}`} />
          </button>

          {openSections.database && (
            <div className="p-6 border-t border-white/10 space-y-4 text-xs">
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => triggerToast('MongoDB Backup snapshot generated successfully!')}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center space-x-2 shadow-glow-violet transition-all"
                >
                  <Database className="w-4 h-4" />
                  <span>Backup Database</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerToast('Database Restore point ready.')}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold flex items-center space-x-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Restore Database</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerToast('Exporting database JSON dump...')}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold flex items-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export Database JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 7: NOTIFICATIONS */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('notifications')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Bell className="w-4 h-4" />
              </div>
              <span>7. Global System Notifications</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.notifications ? 'rotate-180' : ''}`} />
          </button>

          {openSections.notifications && (
            <div className="p-6 border-t border-white/10 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="font-bold text-white">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="font-bold text-white">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="font-bold text-white">Broadcast Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.broadcastAlerts}
                    onChange={(e) => setSettings({ ...settings, broadcastAlerts: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 8: API KEYS (WITH MASKED & REVEAL TOGGLES) */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('apikeys')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Key className="w-4 h-4" />
              </div>
              <span>8. API Secrets &amp; Encryption Keys</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.apikeys ? 'rotate-180' : ''}`} />
          </button>

          {openSections.apikeys && (
            <div className="p-6 border-t border-white/10 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Google OAuth Client ID</label>
                  <input
                    type="text"
                    value={settings.googleClientId}
                    onChange={(e) => setSettings({ ...settings, googleClientId: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Google Client Secret</label>
                  <div className="relative">
                    <input
                      type={showKeys.googleSecret ? 'text' : 'password'}
                      value={settings.googleClientSecret}
                      onChange={(e) => setSettings({ ...settings, googleClientSecret: e.target.value })}
                      className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyReveal('googleSecret')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showKeys.googleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Gemini AI API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.gemini ? 'text' : 'password'}
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                      className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyReveal('gemini')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">OpenAI API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.openai ? 'text' : 'password'}
                      value={settings.openaiApiKey}
                      onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                      className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyReveal('openai')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 9: AUDIT CONTROLS */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <button
            type="button"
            onClick={() => toggleSection('audit')}
            className="w-full p-5 flex items-center justify-between font-extrabold text-white text-base hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <span>9. Audit Log Controls &amp; Maintenance</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openSections.audit ? 'rotate-180' : ''}`} />
          </button>

          {openSections.audit && (
            <div className="p-6 border-t border-white/10 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Log Retention Period (Days)</label>
                  <input
                    type="number"
                    value={settings.logRetentionDays}
                    onChange={(e) => setSettings({ ...settings, logRetentionDays: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div className="flex items-end space-x-3">
                  <button
                    type="button"
                    onClick={() => triggerToast('Audit Logs JSON exported successfully!')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold flex items-center space-x-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export Audit Logs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerToast('Historical logs purged.')}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold flex items-center space-x-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Purge Old Logs</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STICKY SAVE ACTION BAR */}
        <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-[#111622]/95 border border-rose-500/30 backdrop-blur-2xl shadow-2xl flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-white block">System Configuration Changes</span>
            <span className="text-[11px] text-slate-400">All administrative updates require manual confirmation.</span>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-glow-rose border border-rose-400/40 flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminSettings;
