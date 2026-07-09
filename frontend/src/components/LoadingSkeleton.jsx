import React from 'react';

export const CardSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
    <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
    <div className="mt-4 h-8 w-2/3 rounded bg-slate-300 dark:bg-slate-700"></div>
    <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800"></div>
  </div>
);

export const ListSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map((n) => (
      <div key={n} className="flex items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/4 rounded bg-slate-300 dark:bg-slate-700"></div>
          <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-10 rounded-t-lg bg-slate-200 dark:bg-slate-800"></div>
    {[1, 2, 3, 4, 5].map((n) => (
      <div key={n} className="h-12 border-b border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900"></div>
    ))}
  </div>
);
