import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, GraduationCap, Briefcase, Sparkles, Loader2, Save, Send, Edit } from 'lucide-react';

const DriveModal = ({ isOpen, onClose, onSave, companies = [], initialDrive = null }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [packageLPA, setPackageLPA] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [type, setType] = useState('Full Time');
  const [eligibilityCGPA, setEligibilityCGPA] = useState(7.5);
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [selectionProcess, setSelectionProcess] = useState('');
  const [loading, setLoading] = useState(false);

  const activeCompanies = (companies || []).filter((c) => (c.status || 'Active') === 'Active');

  useEffect(() => {
    if (initialDrive) {
      const compId = initialDrive.company?._id || initialDrive.company || '';
      setSelectedCompanyId(compId);
      setCompanyName(initialDrive.companyName || '');
      setCompanyLogo(initialDrive.companyLogo || '');
      setRoleTitle(initialDrive.roleTitle || '');
      setPackageLPA(initialDrive.packageLPA || '');
      setLocation(initialDrive.location || 'Bengaluru');
      setType(initialDrive.type || 'Full Time');
      setEligibilityCGPA(initialDrive.eligibilityCGPA || 7.5);
      setDeadline(
        initialDrive.deadline ? new Date(initialDrive.deadline).toISOString().split('T')[0] : ''
      );
      setDescription(initialDrive.description || '');
      setSkillsRequired(initialDrive.skillsRequired ? initialDrive.skillsRequired.join(', ') : '');
      setSelectionProcess(initialDrive.selectionProcess ? initialDrive.selectionProcess.join(', ') : '');
    } else if (activeCompanies.length > 0) {
      if (!selectedCompanyId || !activeCompanies.some((c) => c._id === selectedCompanyId)) {
        setSelectedCompanyId(activeCompanies[0]._id);
        setCompanyName(activeCompanies[0].name);
        setCompanyLogo(activeCompanies[0].logo || '');
      }
    }
  }, [initialDrive, companies, isOpen]);

  if (!isOpen) return null;

  const handleCompanySelect = (compObjId) => {
    setSelectedCompanyId(compObjId);
    const matched = companies.find((c) => c._id === compObjId);
    if (matched) {
      setCompanyName(matched.name);
      setCompanyLogo(matched.logo || '');
    }
  };

  const handleFormSubmit = async (e, targetStatus) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      alert('Please select or onboard a corporate partner first!');
      return;
    }
    if (!roleTitle.trim()) {
      alert('Please enter a Job Role Title.');
      return;
    }
    if (!packageLPA.trim()) {
      alert('Please enter a Package / CTC value.');
      return;
    }
    if (!location.trim()) {
      alert('Please enter a Job Location.');
      return;
    }
    if (!deadline) {
      alert('Please select a valid Application Deadline date.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a Job Description.');
      return;
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      alert('Invalid date format for Application Deadline.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        company: selectedCompanyId,
        companyName,
        companyLogo,
        roleTitle: roleTitle.trim(),
        packageLPA: packageLPA.trim(),
        location: location.trim(),
        type,
        eligibilityCGPA: Number(eligibilityCGPA) || 7.0,
        deadline: parsedDeadline.toISOString(),
        description: description.trim(),
        skillsRequired: typeof skillsRequired === 'string'
          ? skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
          : Array.isArray(skillsRequired) ? skillsRequired : [],
        selectionProcess: typeof selectionProcess === 'string'
          ? selectionProcess.split(',').map((s) => s.trim()).filter(Boolean)
          : Array.isArray(selectionProcess) ? selectionProcess : [],
      };

      if (!initialDrive && targetStatus) {
        payload.status = targetStatus;
      }

      await onSave(payload, initialDrive?._id);
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save placement drive.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>
                {initialDrive ? `Edit Placement Drive: ${initialDrive.companyName}` : 'Placement Drive Configurator & Eligibility Rules'}
              </span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Corporate Partner *</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => handleCompanySelect(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1 bg-[#0B0F17] text-white border border-slate-700"
                >
                  {activeCompanies.map((comp) => (
                    <option key={comp._id} value={comp._id}>
                      {comp.name} ({comp.industry})
                    </option>
                  ))}
                  {activeCompanies.length === 0 && <option value="">-- No Active Companies (Onboard First) --</option>}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Job Role Title *</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Development Engineer I (SDE-1)"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Package / CTC *</label>
                <input
                  type="text"
                  required
                  value={packageLPA}
                  onChange={(e) => setPackageLPA(e.target.value)}
                  placeholder="₹28 LPA or ₹1L/mo Intern"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Work Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1 bg-[#0B0F17]"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Min CGPA Cutoff *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={eligibilityCGPA}
                  onChange={(e) => setEligibilityCGPA(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Job Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bengaluru / Hyderabad"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Application Deadline *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Job Description & Responsibilities *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Develop high-availability distributed systems, cloud computing platforms..."
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Required Skill Matrix (comma separated)</label>
              <input
                type="text"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                placeholder="Data Structures, Algorithms, C++, Java, Distributed Systems"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Selection Process Rounds (comma separated)</label>
              <input
                type="text"
                value={selectionProcess}
                onChange={(e) => setSelectionProcess(e.target.value)}
                placeholder="Online Assessment, Technical Interview 1, Technical Interview 2, HR Round"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            {/* Action Buttons */}
            {initialDrive ? (
              <div className="pt-2">
                <button
                  disabled={loading}
                  type="button"
                  onClick={(e) => handleFormSubmit(e, null)}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-glow-violet transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Save Drive Changes</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  disabled={loading}
                  type="button"
                  onClick={(e) => handleFormSubmit(e, 'Draft')}
                  className="w-full py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save as Draft (🟡 Draft)</span>
                </button>

                <button
                  disabled={loading}
                  type="button"
                  onClick={(e) => handleFormSubmit(e, 'Published')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-glow-emerald transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publish Drive Live (🟢 Published)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DriveModal;
