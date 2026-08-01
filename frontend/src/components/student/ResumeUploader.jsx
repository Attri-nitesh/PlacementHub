import React, { useState, useEffect } from 'react';
import { getResume, uploadResume, deleteResume } from '../../services/studentApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  Trash2,
  Download,
  Eye,
  FileCheck,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

const ResumeUploader = () => {
  const [resume, setResumeState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const data = await getResume();
      setResumeState(data.resume);
    } catch (err) {
      console.error('Failed to fetch resume:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Unsupported file type. Only PDF format is accepted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5 MB limit.');
      return;
    }

    try {
      setError('');
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', file);
      const res = await uploadResume(formData);
      setResumeState(res.resume);
      setSuccess('Resume uploaded & verified successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      setLoading(true);
      await deleteResume();
      setResumeState(null);
      setSuccess('Resume deleted.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to delete resume.');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb > 1024) return (kb / 1024).toFixed(2) + ' MB';
    return kb.toFixed(1) + ' KB';
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-slate-900/60 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Resume Vault & ATS Verification</span>
          </h2>
          <p className="text-xs text-slate-400">
            Upload your latest ATS-optimized single-page PDF resume for campus placement drives.
          </p>
        </div>

        {resume && (
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Verified Document</span>
          </span>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs">Fetching resume status...</span>
        </div>
      ) : resume ? (
        /* Uploaded Resume Card */
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base truncate max-w-xs sm:max-w-md">
                {resume.fileName}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span>Size: {formatBytes(resume.fileSize)}</span>
                <span>&bull;</span>
                <span>Uploaded: {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setPreviewOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              <Eye className="w-4 h-4 text-violet-400" />
              <span>Preview</span>
            </button>

            <a
              href={`http://localhost:5001${resume.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-glow-emerald"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="Delete Resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Drag Zone */
        <label className="border-2 border-dashed border-white/20 hover:border-emerald-400/60 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-white/5 hover:bg-emerald-500/5 group">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {uploading ? 'Uploading & Verifying PDF...' : 'Click to Upload or Drag & Drop Resume'}
            </p>
            <p className="text-xs text-slate-400">Supported format: PDF &bull; Maximum file size: 5 MB</p>
          </div>
        </label>
      )}

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewOpen && resume && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-4xl h-[85vh] rounded-3xl border border-white/10 overflow-hidden flex flex-col bg-[#0B0F17]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">{resume.fileName}</span>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <iframe
                src={`http://localhost:5001${resume.fileUrl}`}
                title="Resume Preview"
                className="w-full flex-1 bg-white"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeUploader;
