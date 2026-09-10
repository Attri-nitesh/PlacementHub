import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Edit3 } from 'lucide-react';
import PhoneVerificationModal from './PhoneVerificationModal';

const PhoneVerificationSection = ({
  phone,
  onChangePhone,
  phoneVerified = false,
  phoneVerifiedAt = null,
  onVerificationSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handlePhoneInputChange = (e) => {
    const val = e.target.value;
    onChangePhone(val);
    if (phoneVerified) {
      if (onVerificationSuccess) {
        onVerificationSuccess(null);
      }
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    if (onVerificationSuccess) {
      onVerificationSuccess(null);
    }
  };

  const handleVerifyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleModalSuccess = (verifiedAt, updatedProfile, updatedUser) => {
    setIsEditing(false);
    if (onVerificationSuccess) {
      onVerificationSuccess(verifiedAt, updatedProfile, updatedUser);
    }
  };

  const isLocked = Boolean(phoneVerified) && !isEditing;

  return (
    <div>
      {/* Label & Status Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">Phone Number</label>
        {isLocked && (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        )}
      </div>

      {/* Input Row & Actions */}
      <div className="flex items-center space-x-2 mt-1">
        <input
          type="text"
          value={phone}
          onChange={handlePhoneInputChange}
          readOnly={isLocked}
          placeholder="+91 9876543210"
          className={`flex-1 glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isLocked ? 'opacity-80 bg-slate-900/40 text-emerald-200 border-emerald-500/20' : ''
          }`}
        />

        {isLocked ? (
          <button
            type="button"
            onClick={handleEditClick}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleVerifyClick}
            disabled={!phone || phone.trim().length < 10}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-xs shadow-glow transition-all flex items-center space-x-1 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>
        )}
      </div>

      {/* Production Verification Modal (Portal-rendered) */}
      <PhoneVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        phone={phone}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PhoneVerificationSection;
