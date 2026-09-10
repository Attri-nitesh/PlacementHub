import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Calendar,
  Users,
  Award,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  UserCheck,
  Power,
  Archive,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import {
  getCompanies,
  getPlacementDrives,
  updateCompany,
  deleteCompany,
  getAllApplications,
  getOffers,
} from '../../services/placementApi';
import { useSocket } from '../../context/SocketContext';

const SuperAdminCompanies = () => {
  const { socket } = useSocket();
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals State
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Manage Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.manage-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State
  const [editForm, setEditForm] = useState({ name: '', industry: '', website: '', contactEmail: '', status: 'Active', officerName: '' });
  const [assignedOfficer, setAssignedOfficer] = useState('');

  // Sample Placement Officers list for reassignment
  const placementOfficers = [
    { name: 'Head of Placement Cell', email: 'officer@placement.edu' },
    { name: 'Dada Attri', email: 'dada.attri@placementhub.edu' },
    { name: 'Priya Sharma', email: 'priya.sharma@placement.edu' },
    { name: 'Rahul Verma', email: 'rahul.v@placement.edu' },
  ];

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, driveRes, appRes, offerRes] = await Promise.all([
        getCompanies(),
        getPlacementDrives(),
        getAllApplications(),
        getOffers(),
      ]);

      if (compRes.success && compRes.companies) {
        setCompanies(compRes.companies);
      }
      if (driveRes.success && driveRes.drives) {
        setDrives(driveRes.drives);
      }
      if (appRes.success && appRes.applications) {
        setApplications(appRes.applications);
      }
      if (offerRes.success && offerRes.offers) {
        setOffers(offerRes.offers);
      }
    } catch (err) {
      console.error('Error loading admin company management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Socket.IO Real-time Synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('company_created', loadData);
    socket.on('company_updated', loadData);
    socket.on('company_deleted', loadData);
    socket.on('drive_created', loadData);
    socket.on('drive_updated', loadData);
    socket.on('drive_deleted', loadData);

    return () => {
      socket.off('company_created', loadData);
      socket.off('company_updated', loadData);
      socket.off('company_deleted', loadData);
      socket.off('drive_created', loadData);
      socket.off('drive_updated', loadData);
      socket.off('drive_deleted', loadData);
    };
  }, [socket]);

  // Compute Summary Metrics directly from fetched live backend data
  const totalCompaniesCount = companies.length;
  const activeCompaniesCount = companies.filter((c) => (c.status || 'Active') === 'Active').length;
  const archivedCompaniesCount = companies.filter((c) => c.status === 'Archived').length;
  const totalDrivesCount = drives.length;

  // Filtered List
  const filteredCompanies = companies.filter((comp) => {
    const status = comp.status || 'Active';
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    const matchesSearch =
      comp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.officerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Action Handlers
  const handleOpenView = (company) => {
    setSelectedCompany(company);
    setViewModalOpen(true);
  };

  const handleOpenEdit = (company) => {
    setSelectedCompany(company);
    setEditForm({
      name: company.name || '',
      industry: company.industry || '',
      website: company.website || '',
      contactEmail: company.contactEmail || company.email || '',
      status: company.status || 'Active',
      officerName: company.officerName || 'Head of Placement Cell',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      const res = await updateCompany(selectedCompany._id, editForm);
      if (res.success) {
        showToast(`Updated company: ${editForm.name}`);
        setEditModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update company');
    }
  };

  const handleOpenReassign = (company) => {
    setSelectedCompany(company);
    setAssignedOfficer(company.officerName || 'Head of Placement Cell');
    setReassignModalOpen(true);
  };

  const handleSaveReassign = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      const res = await updateCompany(selectedCompany._id, { officerName: assignedOfficer });
      if (res.success) {
        showToast(`Reassigned ${selectedCompany.name} to ${assignedOfficer}`);
        setReassignModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reassign officer');
    }
  };

  const handleToggleDisable = async (company) => {
    const currentStatus = company.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    try {
      const res = await updateCompany(company._id, { status: newStatus });
      if (res.success) {
        showToast(`${company.name} is now ${newStatus}`);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to change company status');
    }
  };

  const handleArchive = async (company) => {
    try {
      const res = await updateCompany(company._id, { status: 'Archived' });
      if (res.success) {
        showToast(`${company.name} moved to Archived status`);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to archive company');
    }
  };

  const handleOpenDelete = (company) => {
    setSelectedCompany(company);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCompany) return;
    try {
      const res = await deleteCompany(selectedCompany._id);
      if (res.success) {
        showToast(`Permanently deleted ${selectedCompany.name}`);
        setDeleteModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete company');
    }
  };

  return (
    <div className="space-y-6 pb-12 relative w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Toast Feedback Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 border border-rose-400/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 backdrop-blur-xl relative overflow-hidden shadow-2xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 w-full">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs tracking-wider uppercase">
                Global Corporate Directory
              </span>
              <span className="text-xs text-slate-400 font-mono">Shared Backend Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Company Management &amp; Partner Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Global administrator view of all corporate recruitment partners onboarded across campus departments.
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center space-x-2 shrink-0 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Sync</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
        <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Companies</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalCompaniesCount}</div>
          <p className="text-[11px] text-slate-400 font-medium">Shared Database Records</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Companies</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{activeCompaniesCount}</div>
          <p className="text-[11px] text-emerald-400 font-medium">Eligible for Placement Drives</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archived Companies</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Archive className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{archivedCompaniesCount}</div>
          <p className="text-[11px] text-amber-400 font-medium">Inactive Historical Records</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Drives</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalDrivesCount}</div>
          <p className="text-[11px] text-indigo-400 font-medium">Campus Drives Created</p>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="p-4 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, industry, officer..."
            className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-rose-400" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161B26] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-rose-500 w-full sm:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Disabled">Disabled</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Enterprise Company Directory Table */}
      <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-2xl w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Company Logo &amp; Name</th>
                <th className="py-4 px-5">Industry</th>
                <th className="py-4 px-5">Active Drives</th>
                <th className="py-4 px-5">Placement Officer</th>
                <th className="py-4 px-5">Created Date</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-200">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-xs italic">
                    No corporate partners found matching search or filter parameters.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp) => {
                  const companyDrives = drives.filter(
                    (d) => d.companyName?.toLowerCase() === comp.name?.toLowerCase() || d.company?._id === comp._id
                  );
                  const activeDrivesCount = companyDrives.filter((d) => d.status === 'Published').length;
                  const status = comp.status || 'Active';

                  return (
                    <tr key={comp._id} className="hover:bg-white/5 transition-colors">
                      {/* Logo & Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {comp.logo ? (
                              <img src={comp.logo} alt={comp.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5 text-rose-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-white text-sm block">{comp.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{comp.website || 'corporate-partner.com'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="py-4 px-5 align-middle">
                        <span className="inline-flex items-center h-[28px] px-3.5 rounded-full bg-slate-800/90 border border-white/10 text-slate-300 text-xs font-semibold whitespace-nowrap shrink-0">
                          {comp.industry || 'Technology & Software'}
                        </span>
                      </td>

                      {/* Active Drives */}
                      <td className="py-4 px-5 align-middle">
                        <span className="inline-flex items-center justify-center h-[28px] px-3 rounded-full bg-[#6D4AFF] text-white text-xs font-semibold whitespace-nowrap shrink-0 shadow-sm">
                          {activeDrivesCount} {activeDrivesCount === 1 ? 'Drive' : 'Drives'}
                        </span>
                      </td>

                      {/* Placement Officer */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex items-center space-x-2 text-slate-300 whitespace-nowrap">
                          <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{comp.officerName || 'Head of Placement Cell'}</span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-5 align-middle font-mono text-slate-400 whitespace-nowrap">
                        {comp.createdAt ? new Date(comp.createdAt).toLocaleDateString('en-GB') : '08 Aug 2026'}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 align-middle">
                        <span
                          className={`inline-flex items-center space-x-2 h-[28px] px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border ${
                            status === 'Active'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : status === 'Disabled'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              status === 'Active'
                                ? 'bg-emerald-400'
                                : status === 'Disabled'
                                ? 'bg-amber-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span>{status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right align-middle">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Primary 1: View */}
                          <button
                            onClick={() => handleOpenView(comp)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all shrink-0"
                            title="View Detailed Profile"
                          >
                            <Eye className="w-4 h-4 text-rose-400" />
                          </button>

                          {/* Primary 2: Edit */}
                          <button
                            onClick={() => handleOpenEdit(comp)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all shrink-0"
                            title="Edit Company"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>

                          {/* Three-Dot Menu: More Options */}
                          <div className="relative inline-block text-left manage-dropdown-container shrink-0">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === comp._id ? null : comp._id)}
                              className={`p-1.5 rounded-xl border transition-all ${
                                openDropdownId === comp._id
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-400 hover:text-white'
                              }`}
                              title="More Options"
                              aria-haspopup="true"
                              aria-expanded={openDropdownId === comp._id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {openDropdownId === comp._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute right-0 top-full mt-1.5 w-56 glass-panel rounded-2xl border border-white/10 bg-[#161B26] p-1.5 shadow-2xl z-40 space-y-0.5 text-left text-xs font-semibold"
                                >
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleOpenReassign(comp);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white flex items-center space-x-2.5 transition-colors"
                                  >
                                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>Assign Placement Officer</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleToggleDisable(comp);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white flex items-center space-x-2.5 transition-colors"
                                  >
                                    <Power className={`w-4 h-4 shrink-0 ${status === 'Active' ? 'text-amber-400' : 'text-emerald-400'}`} />
                                    <span>{status === 'Active' ? 'Deactivate Company' : 'Activate Company'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleArchive(comp);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white flex items-center space-x-2.5 transition-colors"
                                  >
                                    <Archive className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>Archive Company</span>
                                  </button>

                                  <div className="border-t border-white/10 my-1" />

                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleOpenDelete(comp);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 flex items-center space-x-2.5 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 shrink-0 text-rose-400" />
                                    <span>Delete Company</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW DETAILED COMPANY PROFILE & STATISTICS */}
      <AnimatePresence>
        {viewModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-[#111622] max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative text-xs"
            >
              {/* Close Button */}
              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Company Header */}
              <div className="flex items-center space-x-4 border-b border-white/10 pb-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedCompany.logo ? (
                    <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-rose-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedCompany.name}</h2>
                  <div className="flex items-center space-x-3 text-slate-400 mt-1">
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px] font-bold">
                      {selectedCompany.industry || 'IT & Software'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Globe className="w-3.5 h-3.5 text-rose-400" /> {selectedCompany.website || 'corporate-partner.com'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recruitment History & Placement Statistics Grid */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Recruitment History &amp; Campus Statistics</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <span className="text-slate-400 text-[11px] block">Placement Drives</span>
                    <span className="text-xl font-black text-white font-mono mt-1 block">
                      {drives.filter((d) => d.companyName?.toLowerCase() === selectedCompany.name?.toLowerCase()).length}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <span className="text-slate-400 text-[11px] block">Applications Received</span>
                    <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">
                      {applications.filter((a) => a.companyName?.toLowerCase() === selectedCompany.name?.toLowerCase()).length}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <span className="text-slate-400 text-[11px] block">Offers Extended</span>
                    <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                      {offers.filter((o) => o.companyName?.toLowerCase() === selectedCompany.name?.toLowerCase()).length}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <span className="text-slate-400 text-[11px] block">Max CTC Offered</span>
                    <span className="text-xl font-black text-amber-400 font-mono mt-1 block">₹52.0 LPA</span>
                  </div>
                </div>
              </div>

              {/* Associated Placement Drives List */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-white text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Associated Campus Drives</span>
                </h3>

                <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-slate-400 font-bold uppercase">
                      <tr>
                        <th className="p-3">Job Role</th>
                        <th className="p-3">Package (CTC)</th>
                        <th className="p-3">Deadline</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                      {drives.filter((d) => d.companyName?.toLowerCase() === selectedCompany.name?.toLowerCase()).length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-slate-400 italic">No associated placement drives recorded.</td>
                        </tr>
                      ) : (
                        drives
                          .filter((d) => d.companyName?.toLowerCase() === selectedCompany.name?.toLowerCase())
                          .map((drive) => (
                            <tr key={drive._id} className="hover:bg-white/5">
                              <td className="p-3 font-bold text-white">{drive.roleTitle}</td>
                              <td className="p-3 font-mono text-emerald-400 font-bold">{drive.packageLPA}</td>
                              <td className="p-3 font-mono text-slate-400">{new Date(drive.deadline).toLocaleDateString()}</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">{drive.status}</span></td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Audit History</span>
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Onboarded by <strong className="text-slate-200">{selectedCompany.officerName || 'Placement Officer'}</strong>. All actions logged in system telemetry audit database.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT COMPANY */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-[#111622] max-w-md w-full space-y-6 shadow-2xl relative text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Edit className="w-5 h-5 text-rose-400" />
                  <span>Edit Corporate Partner</span>
                </h3>
                <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Industry</label>
                  <input
                    type="text"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow-rose"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: REASSIGN PLACEMENT OFFICER */}
      <AnimatePresence>
        {reassignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-[#111622] max-w-md w-full space-y-5 shadow-2xl relative text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>Reassign Placement Officer</span>
                </h3>
                <button onClick={() => setReassignModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReassign} className="space-y-4">
                <p className="text-slate-300">
                  Select the Placement Cell Officer responsible for managing <strong className="text-white">{selectedCompany?.name}</strong>:
                </p>

                <div className="space-y-2">
                  {placementOfficers.map((officer, idx) => (
                    <label
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        assignedOfficer === officer.name
                          ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="block font-bold text-white">{officer.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{officer.email}</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="officerRadio"
                        checked={assignedOfficer === officer.name}
                        onChange={() => setAssignedOfficer(officer.name)}
                        className="w-4 h-4 accent-rose-600"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setReassignModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-glow-amber"
                  >
                    Confirm Reassignment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 rounded-3xl border border-rose-500/40 bg-[#111622] max-w-sm w-full space-y-4 text-center shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Delete Corporate Partner?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-white">{selectedCompany.name}</strong> from PlacementHub? This action is recorded in audit logs.
                </p>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white shadow-glow-rose transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminCompanies;
