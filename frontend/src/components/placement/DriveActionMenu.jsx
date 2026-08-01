import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
} from 'lucide-react';

const DriveActionMenu = ({
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
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 240;
      const menuHeight = 250;

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

      let top = openUpward ? rect.top - menuHeight - 8 : rect.bottom + 8;
      let left = rect.right - menuWidth;

      if (left < 12) left = 12;
      if (left + menuWidth > window.innerWidth - 12) {
        left = window.innerWidth - menuWidth - 12;
      }

      setCoords({ top, left, openUpward });
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
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
      if (isOpen) {
        setIsOpen(false);
      }
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
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Edit className="w-4 h-4 text-violet-400 shrink-0" />
              <span>📝 Edit Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onPreview(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Eye className="w-4 h-4 text-blue-400 shrink-0" />
              <span>👁 Preview Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onPublish(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Play className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>🟢 Publish Live</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDuplicate(drive._id);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📄 Duplicate Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-red-500/20 text-red-400 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
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
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Edit className="w-4 h-4 text-violet-400 shrink-0" />
              <span>📝 Edit Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onPause(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-amber-500/20 text-amber-300 font-medium flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Pause className="w-4 h-4 text-amber-400 shrink-0" />
              <span>⏸ Pause Applications</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onCloseDrive(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-red-500/20 text-red-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>🔴 Close Applications</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDuplicate(drive._id);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📄 Duplicate Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onArchive(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-700 text-slate-300 font-medium flex items-center space-x-2.5 transition-colors text-xs text-left"
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
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Eye className="w-4 h-4 text-blue-400 shrink-0" />
              <span>👁 View Drive Info</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onReopen(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>🟢 Reopen Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onArchive(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-700 text-slate-300 font-medium flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <Archive className="w-4 h-4 text-slate-400 shrink-0" />
              <span>📦 Archive Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDuplicate(drive._id);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
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
                setIsOpen(false);
                onRestore(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-amber-500/20 text-amber-300 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
            >
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>♻ Restore to Draft</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDuplicate(drive._id);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 flex items-center space-x-2.5 font-medium transition-colors text-xs text-left"
            >
              <Copy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📄 Duplicate Drive</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDelete(drive);
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-red-500/20 text-red-400 font-bold flex items-center space-x-2.5 transition-colors text-xs text-left"
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
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`p-2 rounded-xl border transition-all ${
          isOpen
            ? 'bg-violet-600 border-violet-400 text-white shadow-glow-violet ring-2 ring-violet-400/50'
            : 'bg-white/10 hover:bg-white/20 border-white/10 text-slate-300 hover:text-white'
        }`}
        title="Placement Drive Lifecycle Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

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
              zIndex: 999999,
            }}
            className="w-60 rounded-2xl bg-[#111622] border border-[#1E2638] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1.5 space-y-0.5 text-xs select-none"
          >
            {renderMenuItems()}
          </motion.div>,
          document.body
        )}
    </>
  );
};

export default DriveActionMenu;
