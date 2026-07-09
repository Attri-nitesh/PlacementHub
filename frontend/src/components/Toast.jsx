import React, { useEffect } from 'react';
import useNotifStore from '../store/useNotifStore';
import { X, CheckCircle, AlertTriangle, Info, BellRing } from 'lucide-react';

const Toast = () => {
  const { toast, clearToast } = useNotifStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const { title, message, type } = toast;

  let bgClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
  let icon = <Info className="h-5 w-5 text-blue-500" />;

  if (type === 'success') {
    bgClass = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200';
    icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
  } else if (type === 'warning') {
    bgClass = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200';
    icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
  } else if (type === 'error') {
    bgClass = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-950 dark:text-rose-200';
    icon = <X className="h-5 w-5 text-rose-500" />;
  } else if (type === 'info') {
    bgClass = 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-950 dark:text-blue-200';
    icon = <BellRing className="h-5 w-5 text-blue-500" />;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${bgClass}`}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm leading-tight">{title}</h4>
        <p className="mt-1 text-xs opacity-90 leading-normal">{message}</p>
      </div>
      <button
        onClick={clearToast}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
