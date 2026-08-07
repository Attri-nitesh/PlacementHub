import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ReadinessMeter from '../components/student/ReadinessMeter';
import ResumeUploader from '../components/student/ResumeUploader';
import ApplicationKanban from '../components/student/ApplicationKanban';
import JobDetailsModal from '../components/student/JobDetailsModal';
import NotificationsCenter from '../components/NotificationsCenter';
import StudentAnalytics from '../components/student/StudentAnalytics';
import EmailTrackingSettings from '../components/student/EmailTrackingSettings';
import { ProjectModal, SkillModal } from '../components/student/Modals';

import {
  getStudentProfile,
  updateStudentProfile,
  getJobDrives,
  getProjects,
  addProject,
  deleteProject,
  getSkills,
  addSkill,
  deleteSkill,
} from '../services/studentApi';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Bell,
  Calendar,
  Sparkles,
  Search,
  Plus,
  Github,
  Linkedin,
  Code2,
  Globe,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  Zap,
  BarChart3,
  Settings,
  Quote,
  Layers,
  Lock,
  XCircle,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isSettingsPath = location.pathname === '/settings';
  const initialTab = isSettingsPath
    ? 'settings'
    : searchParams.get('tab') || (searchParams.get('gmail') ? 'settings' : 'dashboard');

  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile & Score state
  const [profileData, setProfileData] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Drives & Search State
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [driveFilterTab, setDriveFilterTab] = useState('Open'); // 'Open' | 'Closed' | 'Applied'

  // Portfolio & Skills State
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);

  // Profile Form States
  const [editProfile, setEditProfile] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    registrationNumber: '',
    department: '',
    branch: '',
    semester: 7,
    cgpa: 8.5,
    backlogs: 0,
    github: '',
    linkedin: '',
    leetcode: '',
    codechef: '',
    codeforces: '',
    portfolio: '',
    preferredRoles: '',
    preferredLocations: '',
    expectedPackage: '',
    workType: 'Full Time',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const quotes = [
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  ];
  const todayQuote = quotes[0];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'resume', label: 'Resume Vault', icon: FileText },
    { id: 'applications', label: 'Application Kanban', icon: Briefcase },
    { id: 'drives', label: 'Placement Drives', icon: Calendar },
    { id: 'skills_projects', label: 'Skills & Projects', icon: Layers },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const loadProfile = async () => {
    try {
      const data = await getStudentProfile();
      setProfileData(data.profile);
      setMetrics(data.metrics);

      if (data.profile) {
        setEditProfile({
          name: data.user?.name || '',
          phone: data.profile.phone || '',
          dob: data.profile.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : '',
          gender: data.profile.gender || 'Male',
          address: data.profile.address || '',
          registrationNumber: data.profile.registrationNumber || '',
          department: data.profile.department || 'Computer Science & Engineering',
          branch: data.profile.branch || 'Computer Science',
          semester: data.profile.semester || 7,
          cgpa: data.profile.cgpa || 8.5,
          backlogs: data.profile.backlogs || 0,
          github: data.profile.codingProfiles?.github || '',
          linkedin: data.profile.codingProfiles?.linkedin || '',
          leetcode: data.profile.codingProfiles?.leetcode || '',
          codechef: data.profile.codingProfiles?.codechef || '',
          codeforces: data.profile.codingProfiles?.codeforces || '',
          portfolio: data.profile.codingProfiles?.portfolio || '',
          preferredRoles: data.profile.preferredRoles ? data.profile.preferredRoles.join(', ') : '',
          preferredLocations: data.profile.preferredLocations ? data.profile.preferredLocations.join(', ') : '',
          expectedPackage: data.profile.expectedPackage || '',
          workType: data.profile.workType || 'Full Time',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadDrives = async () => {
    try {
      const data = await getJobDrives({
        search: searchTerm,
        location: locationFilter,
        jobType: typeFilter,
        filterTab: driveFilterTab,
      });
      setDrives(data.drives || []);
    } catch (err) {
      console.error('Failed to fetch job drives:', err);
    }
  };

  const loadPortfolio = async () => {
    try {
      const projRes = await getProjects();
      setProjects(projRes.projects || []);
      const skillRes = await getSkills();
      setSkills(skillRes.skills || []);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadDrives();
    loadPortfolio();
  }, []);

  useEffect(() => {
    loadDrives();
  }, [searchTerm, locationFilter, typeFilter, driveFilterTab]);

  // Real-Time Socket.IO Listener for Enterprise Drive Lifecycle Events
  useEffect(() => {
    if (!socket) return;

    socket.on('drive_published', () => loadDrives());
    socket.on('drive_status_updated', () => loadDrives());
    socket.on('drive_closed', () => loadDrives());
    socket.on('drive_archived', () => loadDrives());
    socket.on('drive_deleted', () => loadDrives());

    return () => {
      socket.off('drive_published');
      socket.off('drive_status_updated');
      socket.off('drive_closed');
      socket.off('drive_archived');
      socket.off('drive_deleted');
    };
  }, [socket]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await updateStudentProfile({
        name: editProfile.name,
        phone: editProfile.phone,
        dob: editProfile.dob,
        gender: editProfile.gender,
        address: editProfile.address,
        registrationNumber: editProfile.registrationNumber,
        department: editProfile.department,
        branch: editProfile.branch,
        semester: editProfile.semester,
        cgpa: editProfile.cgpa,
        backlogs: editProfile.backlogs,
        codingProfiles: {
          github: editProfile.github,
          linkedin: editProfile.linkedin,
          leetcode: editProfile.leetcode,
          codechef: editProfile.codechef,
          codeforces: editProfile.codeforces,
          portfolio: editProfile.portfolio,
        },
        preferredRoles: editProfile.preferredRoles.split(',').map((r) => r.trim()).filter(Boolean),
        preferredLocations: editProfile.preferredLocations.split(',').map((l) => l.trim()).filter(Boolean),
        expectedPackage: editProfile.expectedPackage,
        workType: editProfile.workType,
      });

      setMetrics(res.metrics);
      setSaveSuccess('Profile saved successfully!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      alert('Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddProject = async (data) => {
    await addProject(data);
    loadPortfolio();
    loadProfile();
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await deleteProject(id);
    loadPortfolio();
    loadProfile();
  };

  const handleAddSkill = async (data) => {
    await addSkill(data);
    loadPortfolio();
    loadProfile();
  };

  const handleDeleteSkill = async (id) => {
    await deleteSkill(id);
    loadPortfolio();
    loadProfile();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col selection:bg-emerald-500/30">
      {/* Navbar */}
      <Navbar onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Main Container */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 px-6 sm:px-8 py-6">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={logout}
          role="student"
        />

        {/* Main Content Pane */}
        <main className="flex-1 space-y-6">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Hero Banner */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Verified Student Account</span>
                      </div>

                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold">
                        <Zap className="w-3.5 h-3.5 text-violet-400" />
                        <span>Profile Completion: {metrics?.completionPercentage || 85}%</span>
                      </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      Welcome, {user?.name || 'Student'} 👋
                    </h1>

                    <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
                      Roll Number: <span className="font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">{user?.rollNumber || 'CS-2026-REG'}</span> &bull; Status: <span className="text-emerald-400 font-semibold">Placement Eligible</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Placement Readiness Gauge */}
              <ReadinessMeter metrics={metrics} />

              {/* Quick Actions & Motivation Quote */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 flex items-start space-x-4">
                  <Quote className="w-8 h-8 text-violet-400 shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold italic text-slate-200">"{todayQuote.text}"</p>
                    <span className="text-xs font-bold text-violet-400">— {todayQuote.author}</span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTab('resume')}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 text-xs font-semibold text-white transition-all text-center"
                    >
                      📄 Upload Resume
                    </button>
                    <button
                      onClick={() => setActiveTab('skills_projects')}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-violet-500/15 border border-white/10 text-xs font-semibold text-white transition-all text-center"
                    >
                      🚀 Add Project
                    </button>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-blue-500/15 border border-white/10 text-xs font-semibold text-white transition-all text-center"
                    >
                      📋 Kanban Board
                    </button>
                    <button
                      onClick={() => setActiveTab('drives')}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-amber-500/15 border border-white/10 text-xs font-semibold text-white transition-all text-center"
                    >
                      💼 View Drives
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: EDITABLE PROFILE */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      <span>Student Academic & Professional Profile</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Keep your profile information accurate for recruiter shortlist eligibility.
                    </p>
                  </div>

                  {saveSuccess && (
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {saveSuccess}
                    </span>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={editProfile.name}
                          onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                        <input
                          type="text"
                          value={editProfile.phone}
                          onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Date of Birth</label>
                        <input
                          type="date"
                          value={editProfile.dob}
                          onChange={(e) => setEditProfile({ ...editProfile, dob: e.target.value })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                      Academic & College Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Department</label>
                        <input
                          type="text"
                          value={editProfile.department}
                          onChange={(e) => setEditProfile({ ...editProfile, department: e.target.value })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Current CGPA (0 - 10) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          required
                          value={editProfile.cgpa}
                          onChange={(e) => setEditProfile({ ...editProfile, cgpa: Number(e.target.value) })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Active Backlogs</label>
                        <input
                          type="number"
                          min="0"
                          value={editProfile.backlogs}
                          onChange={(e) => setEditProfile({ ...editProfile, backlogs: Number(e.target.value) })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Semester</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={editProfile.semester}
                          onChange={(e) => setEditProfile({ ...editProfile, semester: Number(e.target.value) })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional & Coding Handles */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                      Coding Profiles & Online Handles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <Github className="w-3.5 h-3.5 text-slate-400" /> GitHub Profile
                        </label>
                        <input
                          type="url"
                          value={editProfile.github}
                          onChange={(e) => setEditProfile({ ...editProfile, github: e.target.value })}
                          placeholder="https://github.com/username"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          value={editProfile.linkedin}
                          onChange={(e) => setEditProfile({ ...editProfile, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <Code2 className="w-3.5 h-3.5 text-amber-400" /> LeetCode Handle
                        </label>
                        <input
                          type="url"
                          value={editProfile.leetcode}
                          onChange={(e) => setEditProfile({ ...editProfile, leetcode: e.target.value })}
                          placeholder="https://leetcode.com/username"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={savingProfile}
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-xs text-white shadow-glow-emerald border border-emerald-400/30 transition-all"
                  >
                    {savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: RESUME VAULT */}
          {activeTab === 'resume' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ResumeUploader />
            </motion.div>
          )}

          {/* TAB 4: APPLICATION KANBAN */}
          {activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ApplicationKanban />
            </motion.div>
          )}

          {/* TAB 5: PLACEMENT DRIVES & LIFECYCLE FILTER TABS */}
          {activeTab === 'drives' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Header & Filter Tabs */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search company, role title, or skills..."
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium"
                  />
                </div>

                {/* Filter Tabs: Open | Closed | Applied */}
                <div className="flex items-center space-x-2">
                  {['Open', 'Closed', 'Applied'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDriveFilterTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        driveFilterTab === tab
                          ? 'bg-emerald-600 text-white shadow-glow-emerald'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'Open' && '🟢 Open Drives'}
                      {tab === 'Closed' && '🔴 Closed Drives'}
                      {tab === 'Applied' && '💼 Applied'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {drives.map((drive) => {
                  const companyName = drive.companyName || drive.company?.name || 'Partner Company';
                  const companyLogo = drive.companyLogo || drive.company?.logo;
                  const isClosed = drive.status === 'Closed';

                  return (
                    <div
                      key={drive._id}
                      className={`glass-panel p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                        isClosed ? 'border-red-500/30 bg-slate-900/80 opacity-90' : 'border-white/10 bg-gradient-to-br from-white/5 to-slate-900/60 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt={companyName}
                              className="w-12 h-12 rounded-2xl object-contain bg-white p-1.5 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-lg shrink-0">
                              {companyName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-white text-base">{drive.roleTitle}</h4>
                            <p className="text-xs text-slate-400 font-semibold">{companyName}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-1">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {drive.packageLPA}
                          </span>
                          {isClosed && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 flex items-center space-x-1">
                              <Lock className="w-3 h-3" />
                              <span>Closed</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{drive.description}</p>

                      {isClosed && drive.closeReason && (
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                          <strong>Applications Closed:</strong> {drive.closeReason}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                        <span>📍 {drive.location}</span>
                        <button
                          onClick={() => setSelectedDrive(drive)}
                          className={`font-bold flex items-center gap-1 ${isClosed ? 'text-slate-400 hover:text-white' : 'text-emerald-400 hover:text-emerald-300'}`}
                        >
                          <span>{isClosed ? 'View Drive Info' : 'View Details & Apply'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {drives.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400 text-xs italic">
                    No placement drives found in category "{driveFilterTab}".
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: SKILLS & PROJECTS */}
          {activeTab === 'skills_projects' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Skills Matrix */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>Technical Skill Matrix & Progress</span>
                  </h3>
                  <button
                    onClick={() => setSkillModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill) => (
                    <div key={skill._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{skill.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-mono">{skill.proficiency}%</span>
                          <button
                            onClick={() => handleDeleteSkill(skill._id)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div
                          style={{ width: `${skill.proficiency}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Portfolio */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                    <Github className="w-5 h-5 text-violet-400" />
                    <span>Project Showcase & Repositories</span>
                  </h3>
                  <button
                    onClick={() => setProjectModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {projects.map((proj) => (
                    <div key={proj._id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-white text-base">{proj.title}</h4>
                        <button
                          onClick={() => handleDeleteProject(proj._id)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-300">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies?.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 7: CENTRALIZED NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <NotificationsCenter onNavigateTab={(tab) => setActiveTab(tab)} />
            </motion.div>
          )}

          {/* TAB 8: ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <StudentAnalytics />
            </motion.div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <EmailTrackingSettings />
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/60 space-y-4">
                <h3 className="text-lg font-bold text-white">Account & System Settings</h3>
                <p className="text-xs text-slate-400">
                  Manage security preferences, privacy, and theme configuration.
                </p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-2">
                  <p><strong>Session Token:</strong> Encrypted HttpOnly JWT Cookie</p>
                  <p><strong>Identity Provider:</strong> Local & Google OAuth 2.0</p>
                  <p><strong>Security Standard:</strong> Production Verified</p>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <JobDetailsModal
        isOpen={Boolean(selectedDrive)}
        drive={selectedDrive}
        onClose={() => setSelectedDrive(null)}
        onApplied={() => {
          loadDrives();
          loadProfile();
        }}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleAddProject}
      />

      <SkillModal
        isOpen={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        onSave={handleAddSkill}
      />
    </div>
  );
};

export default StudentDashboard;
