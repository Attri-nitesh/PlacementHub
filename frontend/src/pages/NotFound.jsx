import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, FileX } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 transition-colors">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 shadow-sm">
        <FileX className="h-10 w-10" />
      </div>
      <h2 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h2>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs text-center leading-normal">
        The requested URL was not found on this server, or you lack the role permissions required to access it.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
