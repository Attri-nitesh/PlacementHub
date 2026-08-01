import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

const Sidebar = ({ items, activeTab, onTabChange, onLogout, role }) => {
  const isStudent = role === 'student';

  return (
    <aside className="w-full md:w-64 lg:w-72 glass-panel border border-white/10 rounded-3xl flex flex-col justify-between shrink-0 p-5 md:min-h-[calc(100vh-6rem)] shadow-xl relative overflow-hidden bg-slate-900/40 backdrop-blur-xl">
      <div className="space-y-6">
        {/* Navigation Header Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
            <span>{isStudent ? 'Student Workspace' : 'Placement Command'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </p>

          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 relative group ${
                    isActive
                      ? isStudent
                        ? 'text-white bg-emerald-500/15 border border-emerald-500/30 shadow-glow-emerald'
                        : 'text-white bg-violet-500/15 border border-violet-500/30 shadow-glow-violet'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? isStudent
                          ? 'text-emerald-400'
                          : 'text-violet-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute right-3 w-1.5 h-6 rounded-full ${
                        isStudent ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-violet-400 shadow-glow-violet'
                      }`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout Bottom Trigger */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-red-400 group-hover:rotate-12 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
