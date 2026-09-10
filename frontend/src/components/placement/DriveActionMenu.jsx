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
  MoreVertical,
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
      const menuWidth = 220;
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
                setIsOpen(false);
                onDuplicate(drive._id);
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
                setIsOpen(false);
                onPause(drive);
              }}
              className="w-full px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 flex items-center space-x-2.5 font-semibold transition-all duration-200 text-xs text-left"
            >
              <Pause className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>Pause Applications</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onCloseDrive(drive);
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
                setIsOpen(false);
                onArchive(drive);
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
                setIsOpen(false);
                onDuplicate(drive._id);
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
                setIsOpen(false);
                onPublish(drive);
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
                setIsOpen(false);
                onDelete(drive);
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
                setIsOpen(false);
                onDuplicate(drive._id);
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
                setIsOpen(false);
                onReopen(drive);
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
                setIsOpen(false);
                onArchive(drive);
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
                setIsOpen(false);
                onRestore(drive);
              }}
              className="w-full px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 font-bold flex items-center space-x-2.5 transition-all duration-200 text-xs text-left"
            >
              <RotateCcw className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              <span>Restore to Draft</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDuplicate(drive._id);
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
                setIsOpen(false);
                onDelete(drive);
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
            className="w-56 rounded-2xl bg-[#111622] border border-[#1E2638] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1 text-xs select-none"
          >
            {renderMenuItems()}
          </motion.div>,
          document.body
        )}
    </>
  );
};

export default DriveActionMenu;
