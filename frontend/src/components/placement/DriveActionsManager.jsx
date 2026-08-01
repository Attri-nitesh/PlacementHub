import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  MoreVertical,
  Edit,
  Eye,
  Play,
  Pause,
  Lock,
  Archive,
  Copy,
  Trash2,
  RefreshCw,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';

const DriveActionsManager = ({
  drive,
  onEdit,
  onPreview,
  onPublish,
  onPause,
  onCloseDrive,
  onReopen,
  onArchive,
  onRestore,
  onDuplicate,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const [toast, setToast] = useState(null);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 240;
    const menuHeight = 260;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

    let top = openUpward ? rect.top - menuHeight - 8 : rect.bottom + 8;
    let left = rect.right - menuWidth;

    if (left < 12) left = 12;
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }

    setCoords({ top, left, openUpward });
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (loading) return;
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const executeAction = async (actionFn, driveArg, toastMessage) => {
    setIsOpen(false);
    try {
      setLoading(true);
      await actionFn(driveArg);
      if (toastMessage) showToast(toastMessage, 'success');
    } catch (err) {
      showToast('Unable to complete action.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderMenuItems = () => {
    switch (drive.status) {
      case 'Draft':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit(drive);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Edit className="w-4 h-4 text-violet-400 shrink-0" />
              <span>✏ Edit Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onPreview(drive);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Eye className="w-4 h-4 text-blue-400 shrink-0" />
              <span>👁 Preview Info</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onPublish, drive, '✅ Drive Published Live!');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Play className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>🟢 Publish Live</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, '✅ Drive Duplicated as Draft');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📄 Duplicate Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDelete, drive, '✅ Draft Drive Deleted');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-red-500/20 text-red-400 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
              <span>🗑 Delete Draft</span>
            </button>
          </>
        );

      case 'Published':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit(drive);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Edit className="w-4 h-4 text-violet-400 shrink-0" />
              <span>✏ Edit Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onPause, drive, '✅ Applications Paused');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-amber-500/20 text-amber-300 font-medium flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Pause className="w-4 h-4 text-amber-400 shrink-0" />
              <span>⏸ Pause Applications</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onCloseDrive, drive, '✅ Applications Closed');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-red-500/20 text-red-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>🔴 Close Applications</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, '✅ Drive Duplicated');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📄 Duplicate Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onArchive, drive, '✅ Drive Archived');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-700 text-slate-300 font-medium flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Archive className="w-4 h-4 text-slate-400 shrink-0" />
              <span>📦 Archive Drive</span>
            </button>
          </>
        );

      case 'Closed':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onPreview(drive);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Eye className="w-4 h-4 text-blue-400 shrink-0" />
              <span>👁 View Drive Info</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onReopen, drive, '✅ Drive Reopened!');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>🟢 Reopen Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onArchive, drive, '✅ Drive Archived');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-slate-700 text-slate-300 font-medium flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Archive className="w-4 h-4 text-slate-400 shrink-0" />
              <span>📦 Archive Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, '✅ Drive Duplicated');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📄 Duplicate Drive</span>
            </button>
          </>
        );

      case 'Archived':
        return (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onRestore, drive, '✅ Drive Restored to Draft');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-amber-500/20 text-amber-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>♻ Restore to Draft</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, '✅ Drive Duplicated');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📄 Duplicate Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDelete, drive, '✅ Drive Deleted Permanently');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl hover:bg-red-500/20 text-red-400 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
              <span>🗑 Delete Permanently</span>
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Highly Discoverable Actions Button */}
      <button
        ref={buttonRef}
        disabled={loading}
        onClick={toggleMenu}
        className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold flex items-center space-x-1.5 shadow-md ${
          isOpen
            ? 'bg-violet-600 border-violet-400 text-white shadow-glow-violet ring-2 ring-violet-400/50'
            : 'bg-[#161B26] hover:bg-[#1E2638] border-[#2A344B] text-slate-200 hover:text-white'
        }`}
        title="Manage Placement Drive Lifecycle"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
        ) : (
          <Settings className="w-3.5 h-3.5 text-violet-400" />
        )}
        <span>⚙ Manage</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating React Portal Menu */}
      {isOpen &&
        ReactDOM.createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: coords.openUpward ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: coords.openUpward ? 6 : -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-60 rounded-2xl bg-[#111622] border border-[#1E2638] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1.5 space-y-0.5 text-xs select-none"
          >
            {renderMenuItems()}
          </motion.div>,
          document.body
        )}

      {/* Toast Notification Banner */}
      {toast &&
        ReactDOM.createPortal(
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}
            className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center space-x-3 text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>,
          document.body
        )}
    </>
  );
};

export default DriveActionsManager;
