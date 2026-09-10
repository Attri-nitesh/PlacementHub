import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil,
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
  ChevronDown,
  Settings,
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
    const menuWidth = 220;
    const menuHeight = 270;

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
      case 'Published':
        return (
          <div className="p-1 space-y-0.5">
            {/* Group 1: Edit & Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit(drive);
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Pencil className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Edit Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, 'Drive Duplicated');
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Copy className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Duplicate Drive</span>
            </button>

            {/* Separator 1 */}
            <div className="my-1 border-t border-white/10" />

            {/* Group 2: Pause & Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onPause, drive, 'Applications Paused');
              }}
              className="w-full px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Pause className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>Pause Applications</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onCloseDrive, drive, 'Applications Closed');
              }}
              className="w-full px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Lock className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              <span>Close Applications</span>
            </button>

            {/* Separator 2 */}
            <div className="my-1 border-t border-white/10" />

            {/* Group 3: Archive */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onArchive, drive, 'Drive Archived');
              }}
              className="w-full px-3 py-2 rounded-xl text-slate-400 hover:bg-white/5 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Archive className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span>Archive Drive</span>
            </button>
          </div>
        );

      case 'Draft':
        return (
          <div className="p-1 space-y-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit(drive);
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Pencil className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Edit Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onPreview(drive);
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Eye className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Preview Info</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, 'Drive Duplicated as Draft');
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Copy className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Duplicate Drive</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onPublish, drive, 'Drive Published Live!');
              }}
              className="w-full px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 font-bold flex items-center space-x-2.5 transition-all duration-200 text-xs text-left"
            >
              <Play className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>Publish Live</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDelete, drive, 'Draft Drive Deleted');
              }}
              className="w-full px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-bold flex items-center space-x-2.5 transition-all duration-200 text-xs text-left"
            >
              <Trash2 className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              <span>Delete Draft</span>
            </button>
          </div>
        );

      case 'Closed':
        return (
          <div className="p-1 space-y-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onEdit(drive);
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Pencil className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Edit Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, 'Drive Duplicated');
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Copy className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Duplicate Drive</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onReopen, drive, 'Drive Reopened!');
              }}
              className="w-full px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 font-bold flex items-center space-x-2.5 transition-all duration-200 text-xs text-left"
            >
              <RefreshCw className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>Reopen Drive</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onArchive, drive, 'Drive Archived');
              }}
              className="w-full px-3 py-2 rounded-xl text-slate-400 hover:bg-white/5 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Archive className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span>Archive Drive</span>
            </button>
          </div>
        );

      case 'Archived':
        return (
          <div className="p-1 space-y-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onRestore, drive, 'Drive Restored to Draft');
              }}
              className="w-full px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 font-bold flex items-center space-x-2.5 transition-all duration-200 text-xs text-left"
            >
              <RotateCcw className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>Restore to Draft</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDuplicate, drive._id, 'Drive Duplicated');
              }}
              className="w-full px-3 py-2 rounded-xl text-white hover:bg-white/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Copy className="w-4.5 h-4.5 text-slate-200 shrink-0" />
              <span>Duplicate Drive</span>
            </button>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                executeAction(onDelete, drive, 'Drive Deleted Permanently');
              }}
              className="w-full px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-bold flex items-center space-x-2.5 transition-all duration-200 text-xs text-left"
            >
              <Trash2 className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              <span>Delete Permanently</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Manage Action Trigger Button */}
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
        <span>Manage</span>
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
            className="w-56 rounded-2xl bg-[#111622] border border-[#1E2638] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1 text-xs select-none"
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
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
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
