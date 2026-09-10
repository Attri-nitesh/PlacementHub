import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { sendPhoneOtp, verifyPhoneOtp } from '../../services/studentApi';

const PhoneVerificationModal = ({
  isOpen,
  onClose,
  phone,
  onSuccess,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setIsSuccess(false);
      setResendTimer(30);
      triggerSendOtp();
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 150);
    }
  }, [isOpen]);

  // Resend Countdown Timer Effect
  useEffect(() => {
    let timer;
    if (isOpen && resendTimer > 0 && !isSuccess) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendTimer, isSuccess]);

  const triggerSendOtp = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setResending(true);
      setError('');
      const res = await sendPhoneOtp(phone.trim());
      if (res.success) {
        setResendTimer(res.resendInSeconds || 30);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send verification code. Please try again.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Auto-advance focus to next box
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleVerify(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');

    const focusIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    try {
      setVerifying(true);
      setError('');

      const res = await verifyPhoneOtp(phone.trim(), fullOtp);
      if (res.success && res.phoneVerified) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(res.phoneVerifiedAt, res.profile, res.user);
          onClose();
        }, 1000);
      } else {
        setError(res.message || '❌ Incorrect verification code.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || '❌ Incorrect verification code.';
      setError(errMsg);

      // Enable resend immediately if expired
      if (errMsg.toLowerCase().includes('expired')) {
        setResendTimer(0);
      }
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Centered Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden text-white space-y-6"
        >
          {/* Top Decorative Indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full" />

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">Verify Phone Number</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Code sent to <span className="text-emerald-300 font-mono font-bold">{phone}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen Animation */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h4 className="text-base font-extrabold text-white">Phone Verified Successfully!</h4>
              <p className="text-xs text-emerald-300 font-medium">Updating your profile status...</p>
            </motion.div>
          ) : (
            /* OTP Content Container (NO FORM TAG) */
            <div className="space-y-5">
              {/* 6 Box Segmented OTP Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-between gap-2 sm:gap-2.5 pt-1" onPaste={handlePaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={verifying}
                      className="w-11 sm:w-12 h-12 sm:h-14 rounded-2xl bg-white/5 border border-white/10 text-center font-mono font-bold text-lg sm:text-xl text-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-emerald-500/5 disabled:opacity-50 transition-all outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* In-Modal Inline Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-2 text-rose-300 text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || otp.join('').length !== 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 font-bold text-sm text-white shadow-glow-emerald border border-emerald-400/30 transition-all flex items-center justify-center space-x-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <span>Verify OTP</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClose();
                    }}
                    className="text-slate-400 hover:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>

                  {resendTimer > 0 ? (
                    <span className="text-slate-500 font-medium">
                      Resend code in <span className="font-mono text-slate-300 font-bold">{resendTimer}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerSendOtp}
                      disabled={resending || verifying}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 transition-colors"
                    >
                      {resending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PhoneVerificationModal;
