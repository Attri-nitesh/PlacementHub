import React, { useState } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  Briefcase, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Award, 
  ThumbsDown, 
  MessageSquare 
} from 'lucide-react';

const COLUMNS = ['Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected'];

const KanbanBoard = ({ applications = [], onStatusUpdate }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-new');
  const [filterPlatform, setFilterPlatform] = useState('all');

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      await onStatusUpdate(id, targetStatus);
    }
  };

  // Process search, filtering, and sorting
  const processedApps = applications
    .filter((app) => {
      const company = app.drive?.companyName || '';
      const role = app.drive?.jobRole || '';
      const matchesSearch = company.toLowerCase().includes(search.toLowerCase()) ||
                            role.toLowerCase().includes(search.toLowerCase());
      
      const matchesPlatform = filterPlatform === 'all' || app.platform === filterPlatform;
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === 'package-high') {
        return (b.drive?.package || 0) - (a.drive?.package || 0);
      }
      if (sortBy === 'package-low') {
        return (a.drive?.package || 0) - (b.drive?.package || 0);
      }
      if (sortBy === 'date-old') {
        return new Date(a.applicationDate) - new Date(b.applicationDate);
      }
      // date-new (default)
      return new Date(b.applicationDate) - new Date(a.applicationDate);
    });

  const getColumnStyle = (col) => {
    switch (col) {
      case 'Applied': return 'border-t-4 border-slate-400 bg-slate-100/30 dark:bg-slate-900/30';
      case 'Online Assessment': return 'border-t-4 border-amber-400 bg-amber-50/10 dark:bg-amber-950/10';
      case 'Interview': return 'border-t-4 border-purple-500 bg-purple-50/10 dark:bg-purple-950/10';
      case 'Offer': return 'border-t-4 border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/15';
      case 'Rejected': return 'border-t-4 border-rose-500 bg-rose-50/10 dark:bg-rose-950/10';
      default: return 'border-t-4 border-slate-200';
    }
  };

  const getStatusBadge = (col) => {
    switch (col) {
      case 'Offer':
        return <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"><Award className="h-3 w-3" /> Select</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"><ThumbsDown className="h-3 w-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search, Filter, Sort */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200 text-slate-800 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Platform Filter */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350">
            <Filter className="h-4 w-4" />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Platforms</option>
              <option value="PlacementHub">PlacementHub</option>
              <option value="On-Campus">On-Campus</option>
              <option value="Off-Campus">Off-Campus</option>
            </select>
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350">
            <ArrowUpDown className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer"
            >
              <option value="date-new">Date: Newest First</option>
              <option value="date-old">Date: Oldest First</option>
              <option value="package-high">Package: High to Low</option>
              <option value="package-low">Package: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Board Columns Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colApps = processedApps.filter(app => app.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col)}
              className={`flex min-h-[500px] flex-col rounded-xl border border-slate-200 dark:border-slate-800 p-3 transition-colors ${getColumnStyle(col)}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-3 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {col}
                </h3>
                <span className="rounded-full bg-slate-200 dark:bg-slate-850 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {colApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-0.5">
                {colApps.map((app) => (
                  <div
                    key={app._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app._id)}
                    className="group relative flex flex-col justify-between rounded-lg border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200"
                  >
                    <div>
                      {/* Company Name & Status Tag */}
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-sm font-bold text-slate-850 dark:text-white truncate">
                          {app.drive?.companyName || 'Deleted Drive'}
                        </span>
                        {getStatusBadge(col)}
                      </div>

                      {/* Job Role */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                        {app.drive?.jobRole || 'N/A'}
                      </p>

                      {/* Package Details */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-650 dark:text-slate-450">
                        <DollarSign className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-250">
                          {app.drive?.package ? `${app.drive.package} LPA` : 'N/A'}
                        </span>
                      </div>

                      {/* Location Details */}
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{app.drive?.location || 'N/A'}</span>
                      </div>

                      {/* Platform Tag */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-450 uppercase">
                          {app.platform}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(app.applicationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Alert if provided */}
                    {app.feedback && (
                      <div className="mt-3 rounded border border-blue-100 bg-blue-50/40 p-2 dark:border-blue-900/30 dark:bg-blue-950/20 text-[10px] text-blue-750 dark:text-blue-300">
                        <div className="flex gap-1 items-start">
                          <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <p className="line-clamp-2 leading-relaxed">{app.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {colApps.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                    Empty Column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
