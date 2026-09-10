import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';

const Sidebar = ({ items = [], activeTab, onTabChange, onLogout, role }) => {
  const isStudent = role === 'student';
  const isAdmin = role === 'admin' || role === 'superadmin';

  // Separate main navigation items from Settings
  const settingsItem = items.find((i) => i.id === 'settings') || {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
  };
  const mainItems = items.filter((i) => i.id !== 'settings');

  const getActiveItemClasses = () => {
    if (isAdmin) return 'text-[#F5F7FB] bg-rose-500/15 border border-rose-500/30';
    if (isStudent) return 'text-[#F5F7FB] bg-[#3B68FF]/15 border border-[#3B68FF]/30';
    return 'text-[#F5F7FB] bg-amber-500/15 border border-amber-500/30';
  };

  const getActiveIconClasses = () => {
    if (isAdmin) return 'text-rose-400';
    if (isStudent) return 'text-[#3B68FF]';
    return 'text-amber-400';
  };

  return (
    <aside className="w-full md:w-64 lg:w-[270px] shrink-0 bg-[#101622] border border-[#222B3D] rounded-3xl p-4 shadow-2xl relative overflow-hidden flex flex-col justify-start">
      {/* PRIMARY NAVIGATION GROUP */}
      <div className="space-y-1.5">
        <nav className="space-y-1.5">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-['Inter'] transition-all duration-200 relative group ${
                  isActive
                    ? getActiveItemClasses()
                    : 'text-[#91A0B8] hover:text-[#F5F7FB] hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? getActiveIconClasses() : 'text-[#91A0B8] group-hover:text-[#F5F7FB]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. SUBTLE DIVIDER */}
      <div className="border-t border-[#222B3D] my-3.5" />

      {/* 4. SETTINGS & SIGN OUT GROUP (VISUALLY GROUPED TOGETHER) */}
      <div className="space-y-1.5">
        {/* Settings Item */}
        {settingsItem && (
          <button
            onClick={() => onTabChange(settingsItem.id)}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-['Inter'] transition-all duration-200 relative group ${
              activeTab === settingsItem.id
                ? getActiveItemClasses()
                : 'text-[#91A0B8] hover:text-[#F5F7FB] hover:bg-white/5 border border-transparent'
            }`}
          >
            <settingsItem.icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                activeTab === settingsItem.id
                  ? getActiveIconClasses()
                  : 'text-[#91A0B8] group-hover:text-[#F5F7FB]'
              }`}
            />
            <span className="truncate">{settingsItem.label}</span>
          </button>
        )}

        {/* Sign Out Item */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-['Inter'] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B]/20 border border-transparent transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 text-[#FF6B6B] group-hover:translate-x-0.5 transition-transform shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
