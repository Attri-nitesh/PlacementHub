import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StudentLayout from '../layouts/StudentLayout';
import ReadinessMeter from '../components/student/ReadinessMeter';
import ResumeUploader from '../components/student/ResumeUploader';
import ApplicationKanban from '../components/student/ApplicationKanban';
import JobDetailsModal from '../components/student/JobDetailsModal';
import NotificationsCenter from '../components/NotificationsCenter';
import StudentAnalytics from '../components/student/StudentAnalytics';
import EmailTrackingSettings from '../components/student/EmailTrackingSettings';
import PhoneVerificationSection from '../components/student/PhoneVerificationSection';
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
  getApplications,
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
  Target,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout, updateUser } = useAuth();
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
  const [applications, setApplications] = useState([]);
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

  const loadApplications = async () => {
    try {
      const data = await getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadDrives();
    loadPortfolio();
    loadApplications();
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

  const totalAppliedCount = applications.length > 0 ? applications.length : 42;
  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedOffset = 0;

  const breakdownData = [
    { label: 'Applied', count: 18, color: '#2E5AF0' },
    { label: 'OA Test', count: 7, color: '#06B6D4' },
    { label: 'Interview', count: 3, color: '#F59E0B' },
    { label: 'Offer', count: 2, color: '#10B981' },
    { label: 'Rejected', count: 4, color: '#EF4444' },
  ];

  const donutSegments = breakdownData.map((item) => {
    const strokeDasharray = `${(item.count / totalAppliedCount) * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (item.count / totalAppliedCount) * donutCircumference;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* TAB 1: OVERVIEW DASHBOARD (CLEAN SPACIOUS 12-COLUMN SAAS GRID) */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-12 gap-4 sm:gap-5 w-full min-w-0 pb-8"
        >
          {/* ROW 1: TOP HEADER / WELCOME CARD (col-span-12) */}
          <div className="col-span-12 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#2E5AF0]/10 border border-[#2E5AF0]/20 text-[#2E5AF0] text-[11px] font-mono font-bold">
                  Placement Season 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Student</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] truncate">
                Welcome back, {user?.name || 'Bucky Attri'} 👋
              </h1>
              <p className="text-xs text-slate-400 font-['Inter'] truncate">
                Roll Number: <span className="font-mono text-slate-200 font-semibold">{user?.rollNumber || editProfile.registrationNumber || 'GOOG-994703'}</span> &bull; Status: <span className="text-emerald-400 font-semibold">Placement Eligible.</span>
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="flex items-center space-x-2 bg-[#162032] border border-[#1E2E4A] px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300">
                <Zap className="w-4 h-4 text-[#2E5AF0]" />
                <span>Profile Completion: {metrics?.completionPercentage || 35}%</span>
              </div>
            </div>
          </div>

          {/* ROW 2 LEFT: CAMPUS RECRUITMENT PROGRESS (col-span-12 lg:col-span-8) */}
          <div className="col-span-12 lg:col-span-8 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
              <div className="space-y-0.5">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#2E5AF0]" />
                  <span>Campus Recruitment Progress</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-['Inter']">
                  Live stage progress across active applications
                </p>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                Active Season
              </span>
            </div>

            {/* Recruitment Progression Stage Flow Graph */}
            <div className="py-2 px-1 flex-1 flex flex-col justify-center min-h-[90px]">
              <div className="relative w-full h-20 sm:h-24">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="recruitmentProgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2E5AF0" stopOpacity="0.25" />
                      <stop offset="33%" stopColor="#06B6D4" stopOpacity="0.25" />
                      <stop offset="66%" stopColor="#F59E0B" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.25" />
                    </linearGradient>
                    <linearGradient id="recruitmentStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2E5AF0" />
                      <stop offset="33%" stopColor="#06B6D4" />
                      <stop offset="66%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fill */}
                  <path
                    d="M 50 18 C 100 18, 120 48, 150 48 C 180 48, 220 62, 250 62 C 280 62, 310 68, 350 68 L 350 78 L 50 78 Z"
                    fill="url(#recruitmentProgGrad)"
                  />

                  {/* Curved Flow Line */}
                  <path
                    d="M 50 18 C 100 18, 120 48, 150 48 C 180 48, 220 62, 250 62 C 280 62, 310 68, 350 68"
                    fill="none"
                    stroke="url(#recruitmentStrokeGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Stage Node 1: Applied (18) */}
                  <circle cx="50" cy="18" r="6" fill="#2E5AF0" stroke="#111622" strokeWidth="2" />
                  <text x="50" y="8" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="bold">18</text>

                  {/* Stage Node 2: OA Test (7) */}
                  <circle cx="150" cy="48" r="6" fill="#06B6D4" stroke="#111622" strokeWidth="2" />
                  <text x="150" y="38" textAnchor="middle" fill="#06B6D4" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="bold">7</text>

                  {/* Stage Node 3: Interview (3) */}
                  <circle cx="250" cy="62" r="6" fill="#F59E0B" stroke="#111622" strokeWidth="2" />
                  <text x="250" y="52" textAnchor="middle" fill="#F59E0B" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="bold">3</text>

                  {/* Stage Node 4: Offer Received (2) */}
                  <circle cx="350" cy="68" r="6" fill="#10B981" stroke="#111622" strokeWidth="2" />
                  <text x="350" y="58" textAnchor="middle" fill="#10B981" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="bold">2</text>
                </svg>
              </div>
            </div>

            {/* Compact Horizontal Step Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Step 1: Applied */}
              <div className="bg-[#162032] rounded-xl border border-[#1E2E4A] p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Inter']">Applied</span>
                  <span className="w-2 h-2 rounded-full bg-[#2E5AF0]" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-mono font-['Plus_Jakarta_Sans']">18</span>
                  <span className="text-[10px] text-slate-400 font-['Inter']">Submissions</span>
                </div>
              </div>

              {/* Step 2: OA Test */}
              <div className="bg-[#162032] rounded-xl border border-[#1E2E4A] p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Inter']">OA Test</span>
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-mono font-['Plus_Jakarta_Sans']">7</span>
                  <span className="text-[10px] text-cyan-400 font-['Inter']">Shortlisted</span>
                </div>
              </div>

              {/* Step 3: Interview */}
              <div className="bg-[#162032] rounded-xl border border-[#1E2E4A] p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Inter']">Interview</span>
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-mono font-['Plus_Jakarta_Sans']">3</span>
                  <span className="text-[10px] text-amber-400 font-['Inter']">Rounds Active</span>
                </div>
              </div>

              {/* Step 4: Offer */}
              <div className="bg-[#162032] rounded-xl border border-[#1E2E4A] p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-['Inter'] font-bold">Offer Received</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-mono font-['Plus_Jakarta_Sans']">2</span>
                  <span className="text-[10px] text-emerald-400 font-['Inter']">Max ₹42 LPA</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2 RIGHT: PLACEMENT CALENDAR WIDGET (col-span-12 lg:col-span-4) */}
          <div className="col-span-12 lg:col-span-4 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3">
            {/* Calendar Header */}
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#2E5AF0]" />
                <h3 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans']">
                  Placement Calendar
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#2E5AF0] bg-[#2E5AF0]/10 px-2 py-0.5 rounded-md border border-[#2E5AF0]/20">
                Aug 2026
              </span>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
                <span key={i} className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                  {day}
                </span>
              ))}
            </div>

            {/* 31-Day Month Grid (August 2026 starts on Saturday = offset 5 days) */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {[...Array(5)].map((_, i) => (
                <div key={`empty-${i}`} className="h-6" />
              ))}

              {[...Array(31)].map((_, i) => {
                const dayNum = i + 1;
                const eventMap = {
                  4: { color: 'bg-amber-400', title: 'Google Interview' },
                  10: { color: 'bg-[#2E5AF0]', title: 'Amazon Drive' },
                  15: { color: 'bg-cyan-400', title: 'Uber OA Test' },
                  18: { color: 'bg-amber-400', title: 'Microsoft Interview' },
                  22: { color: 'bg-rose-400', title: 'Application Deadline' },
                };
                const event = eventMap[dayNum];
                const isToday = dayNum === 24;

                return (
                  <div
                    key={dayNum}
                    className={`h-6 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-semibold relative transition-colors cursor-pointer ${
                      isToday
                        ? 'bg-[#2E5AF0] text-white font-bold shadow-sm'
                        : 'text-slate-300 hover:bg-[#162032]'
                    }`}
                    title={event ? `${dayNum} Aug: ${event.title}` : `${dayNum} Aug`}
                  >
                    <span>{dayNum}</span>
                    {event && !isToday && (
                      <span className={`w-1 h-1 rounded-full absolute bottom-0.5 ${event.color}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Event Legend Footer */}
            <div className="pt-2 border-t border-[#1E2E4A] flex items-center justify-between text-[9px] text-slate-400 font-['Inter']">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E5AF0]" />
                <span>Drive</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>OA</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Interview</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Deadline</span>
              </div>
            </div>
          </div>

          {/* ROW 3 LEFT: RECENT APPLICATIONS (col-span-12 lg:col-span-8 lg:row-span-2) */}
          <div className="col-span-12 lg:col-span-8 lg:row-span-2 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3 mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-[#2E5AF0]" />
                    <span>Recent Applications</span>
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="text-xs font-bold text-[#2E5AF0] hover:underline flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compact Application Rows */}
              <div className="divide-y divide-slate-800/60">
                {[
                  { company: 'Google', role: 'Software Engineer', date: '18 Aug 2026', status: 'Interview', package: '₹42.0 LPA', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                  { company: 'Uber', role: 'Backend Engineer', date: '15 Aug 2026', status: 'OA Test', package: '₹38.0 LPA', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
                  { company: 'Amazon', role: 'SDE Intern & FTE', date: '10 Aug 2026', status: 'Offer Released', package: '₹32.0 LPA', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                  { company: 'Microsoft', role: 'Cloud Engineer', date: '05 Aug 2026', status: 'Shortlisted', package: '₹44.0 LPA', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                  { company: 'Atlassian', role: 'Fullstack Developer', date: '01 Aug 2026', status: 'Applied', package: '₹52.0 LPA', color: 'bg-[#2E5AF0]/10 text-[#2E5AF0] border-[#2E5AF0]/20' },
                ].map((app, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0 hover:bg-white/[0.02] transition-colors rounded-xl px-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#162032] border border-[#1E2E4A] flex items-center justify-center text-[#2E5AF0] font-black text-xs shrink-0">
                        {app.company.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white font-['Plus_Jakarta_Sans'] truncate">{app.company}</h4>
                        <p className="text-[11px] text-slate-400 font-['Inter'] truncate">{app.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5 shrink-0">
                      <span className="hidden sm:inline text-xs font-mono text-slate-400">{app.date}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${app.color}`}>
                        {app.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">{app.package}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3 RIGHT: UPCOMING DEADLINES (col-span-12 sm:col-span-6 lg:col-span-4) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
              <h3 className="text-base font-extrabold text-[#F5F7FB] font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Upcoming Deadlines</span>
              </h3>
            </div>

            {/* Compact Deadline Items */}
            <div className="space-y-2">
              {[
                { company: 'Google Cloud', role: 'SWE - Level 59', badge: '4 Days Left', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', progress: '60%', bar: 'bg-amber-400' },
                { company: 'Microsoft Azure', role: 'SDE-1 Hybrid', badge: '1 Day Left (Urgent)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', progress: '90%', bar: 'bg-rose-400' },
                { company: 'Atlassian', role: 'Frontend Engineer', badge: '9 Days Left', color: 'bg-[#2E5AF0]/10 text-[#2E5AF0] border-[#2E5AF0]/20', progress: '25%', bar: 'bg-[#2E5AF0]' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#162032] border border-[#1E2E4A] space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs font-['Plus_Jakarta_Sans'] truncate">{item.company}</h4>
                      <p className="text-[10px] text-slate-400 font-['Inter'] truncate">{item.role}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.color}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.bar}`} style={{ width: item.progress }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 4 RIGHT: APPLICATION STATUS (col-span-12 sm:col-span-6 lg:col-span-4) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-[#111622] rounded-2xl sm:rounded-3xl border border-[#1E2E4A] p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-3">
              <h3 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#2E5AF0]" />
                <span>Application Status</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">42 Total</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Donut Ring Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {donutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      fill="transparent"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-white font-['Plus_Jakarta_Sans'] leading-none">
                    {totalAppliedCount}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-['Inter'] mt-0.5">
                    TOTAL
                  </span>
                </div>
              </div>

              {/* Legend Items */}
              <div className="space-y-1 flex-1 min-w-0">
                {[
                  { label: 'Applied', count: 18, color: '#2E5AF0' },
                  { label: 'OA Test', count: 7, color: '#06B6D4' },
                  { label: 'Interview', count: 3, color: '#F59E0B' },
                  { label: 'Offer Received', count: 2, color: '#10B981' },
                  { label: 'Rejected', count: 4, color: '#EF4444' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 min-w-0 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 font-['Inter'] truncate">{item.label}</span>
                    </div>
                    <span className="font-mono font-bold text-white ml-2 shrink-0">{item.count}</span>
                  </div>
                ))}
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
                        <PhoneVerificationSection
                          phone={editProfile.phone}
                          onChangePhone={(newPhone) => setEditProfile({ ...editProfile, phone: newPhone })}
                          phoneVerified={profileData?.phoneVerified || false}
                          phoneVerifiedAt={profileData?.phoneVerifiedAt || null}
                          onVerificationSuccess={(verifiedAt, updatedProfile, updatedUser) => {
                            setProfileData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    phoneVerified: Boolean(verifiedAt),
                                    phoneVerifiedAt: verifiedAt || null,
                                    ...(updatedProfile || {}),
                                  }
                                : prev
                            );
                            if (updateUser && updatedUser) {
                              updateUser(updatedUser);
                            }
                            loadProfile();
                          }}
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
    </StudentLayout>
  );
};

export default StudentDashboard;
