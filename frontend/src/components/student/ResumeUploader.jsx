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

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const data = await getResume();
      setResumeState(data.resume);
    } catch (err) {
      setError('Failed to fetch uploaded resume');
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
      setError('Only PDF files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const res = await uploadResume(formData);
      setResumeState(res.resume);
      setSuccess('Resume uploaded and ATS ingested successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded resume?')) return;

    try {
      setLoading(true);
      await deleteResume();
      setResumeState(null);
      setSuccess('Resume removed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete resume');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreviewResume = () => {
    if (!resume?.fileUrl) return;
    const fullUrl = resume.fileUrl.startsWith('http')
      ? resume.fileUrl
      : `http://localhost:5001${resume.fileUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center justify-center space-x-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <span className="text-sm font-medium">Checking Resume Vault...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <span>Resume Vault</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              ATS Verified
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload your master resume PDF for placement drive applications & AI ATS optimization.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-300 text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-300 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {resume ? (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
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
              onClick={handlePreviewResume}
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
    </div>
  );
};

export default ResumeUploader;
