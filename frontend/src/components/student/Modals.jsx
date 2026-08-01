import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';

// Reusable Modal Shell
export const ModalShell = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden bg-[#0B0F17] shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- PROJECT MODAL ---
export const ProjectModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tech, setTech] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTech(initialData.technologies ? initialData.technologies.join(', ') : '');
      setGithubLink(initialData.githubLink || '');
      setLiveLink(initialData.liveLink || '');
    } else {
      setTitle('');
      setDescription('');
      setTech('');
      setGithubLink('');
      setLiveLink('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const techArray = tech.split(',').map((t) => t.trim()).filter(Boolean);
    await onSave({ title, description, technologies: techArray, githubLink, liveLink });
    setLoading(false);
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Project' : 'Add Project Portfolio'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300">Project Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. PlacementHub SaaS Portal"
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-300">Description *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of features, architectural highlights, and problem solved..."
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-300">Technologies (comma separated)</label>
          <input
            type="text"
            value={tech}
            onChange={(e) => setTech(e.target.value)}
            placeholder="React, Node.js, Express, MongoDB, Tailwind"
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-300">GitHub Repository URL</label>
          <input
            type="url"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-300">Live Demo URL</label>
          <input
            type="url"
            value={liveLink}
            onChange={(e) => setLiveLink(e.target.value)}
            placeholder="https://myproject.com"
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition-colors"
        >
          {loading ? 'Saving...' : initialData ? 'Update Project' : 'Add Project'}
        </button>
      </form>
    </ModalShell>
  );
};

// --- SKILL MODAL ---
export const SkillModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming Languages');
  const [proficiency, setProficiency] = useState(80);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'Programming Languages');
      setProficiency(initialData.proficiency || 80);
    } else {
      setName('');
      setCategory('Programming Languages');
      setProficiency(80);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ name, category, proficiency: Number(proficiency) });
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Skill' : 'Add Technical Skill'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300">Skill Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. C++, React.js, Docker, MongoDB"
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-300">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium mt-1 bg-[#0B0F17]"
          >
            <option value="Programming Languages">Programming Languages</option>
            <option value="Frameworks">Frameworks</option>
            <option value="Databases">Databases</option>
            <option value="Tools">Tools</option>
            <option value="Cloud">Cloud</option>
            <option value="Soft Skills">Soft Skills</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-300">Proficiency Level ({proficiency}%)</label>
          <input
            type="range"
            min="10"
            max="100"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="w-full accent-emerald-400 mt-2"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition-colors"
        >
          Save Skill
        </button>
      </form>
    </ModalShell>
  );
};
