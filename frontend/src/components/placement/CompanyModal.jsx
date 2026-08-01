import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Globe, Mail, Phone, MapPin, Briefcase, Loader2 } from 'lucide-react';

const CompanyModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Information Technology');
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrPhone, setHrPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave({
        name,
        logo,
        description,
        website,
        industry,
        hrName,
        hrEmail,
        hrPhone,
        location,
        status: 'Active',
      });
      onClose();
    } catch (err) {
      alert('Failed to onboard company.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-violet-400" />
              <span>Onboard New Recruiting Company</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Company Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Google India"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Industry Sector *</label>
                <input
                  type="text"
                  required
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Enterprise Cloud & Software"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Company Logo Image URL</label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://company.com/logo.svg"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Official Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://careers.company.com"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Company Overview & Profile</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Global technology leader specializing in enterprise cloud computing & AI infrastructure..."
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            {/* HR Representative Details */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Corporate HR Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">HR Name *</label>
                  <input
                    type="text"
                    required
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">HR Email *</label>
                  <input
                    type="email"
                    required
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder="priya@company.com"
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">HR Phone *</label>
                  <input
                    type="text"
                    required
                    value={hrPhone}
                    onChange={(e) => setHrPhone(e.target.value)}
                    placeholder="+91 9811223344"
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Job Location(s) *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bengaluru / Hyderabad / Remote"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-glow-violet transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Onboard Corporate Partner</span>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompanyModal;
