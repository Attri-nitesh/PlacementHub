import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useNotifStore from '../store/useNotifStore';
import { 
  User, 
  GraduationCap, 
  Building2, 
  Mail, 
  Plus, 
  Trash2, 
  Save, 
  Globe, 
  Info,
  BookOpen
} from 'lucide-react';

const Profile = () => {
  const { user, profile, updateStudentProfile, updateRecruiterProfile, loading } = useAuthStore();
  const { showToast } = useNotifStore();

  // Student specific profile states
  const [cgpa, setCgpa] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [branch, setBranch] = useState('');
  const [contact, setContact] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [education, setEducation] = useState([]);

  // Recruiter specific profile states
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [about, setAbout] = useState('');

  // Education item form states
  const [eduDegree, setEduDegree] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduPassYear, setEduPassYear] = useState('');

  // Initialize values from store state
  useEffect(() => {
    if (user?.role === 'student' && profile) {
      setCgpa(profile.cgpa ?? '');
      setBranch(profile.branch ?? '');
      setContact(profile.contact ?? '');
      setResumeUrl(profile.resumeUrl ?? '');
      setEducation(profile.education ?? []);
      setSkillsStr(profile.skills ? profile.skills.join(', ') : '');
    } else if (user?.role === 'recruiter' && profile) {
      setCompanyName(profile.companyName ?? '');
      setWebsite(profile.website ?? '');
      setIndustry(profile.industry ?? '');
      setAbout(profile.about ?? '');
    }
  }, [user, profile]);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate CGPA
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      showToast('Validation Error', 'CGPA must be a valid number between 0 and 10', 'error');
      return;
    }

    // Convert comma-separated string back to array of trimmed values
    const skills = skillsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const res = await updateStudentProfile({
      cgpa: cgpaNum,
      branch,
      contact,
      resumeUrl,
      education,
      skills
    });

    if (res.success) {
      showToast('Profile Saved', 'Your student credentials have been updated.', 'success');
    } else {
      showToast('Profile Error', res.error || 'Failed to update student profile', 'error');
    }
  };

  const handleRecruiterSubmit = async (e) => {
    e.preventDefault();
    if (!companyName) {
      showToast('Validation Error', 'Company name is required', 'error');
      return;
    }

    const res = await updateRecruiterProfile({
      companyName,
      website,
      industry,
      about
    });

    if (res.success) {
      showToast('Profile Saved', 'Your company details have been updated.', 'success');
    } else {
      showToast('Profile Error', res.error || 'Failed to update company details', 'error');
    }
  };

  const handleAddEducation = () => {
    if (!eduDegree || !eduInstitution || !eduPassYear) {
      showToast('Input Error', 'Please fill all education details before adding', 'warning');
      return;
    }
    const year = parseInt(eduPassYear);
    if (isNaN(year) || year < 1980 || year > 2030) {
      showToast('Input Error', 'Please specify a valid year (1980 - 2030)', 'warning');
      return;
    }

    const newItem = {
      degree: eduDegree,
      institution: eduInstitution,
      passYear: year
    };

    setEducation([...education, newItem]);
    setEduDegree('');
    setEduInstitution('');
    setEduPassYear('');
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* User Core Card Info */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row gap-4 items-center transition-colors">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xl">
          {user?.name ? user.name[0] : 'U'}
        </div>
        <div className="text-center sm:text-left overflow-hidden w-full space-y-1">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{user?.name}</h3>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
            </span>
            <span className="rounded bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-450 uppercase tracking-wide">
              Role: {user?.role}
            </span>
          </div>
        </div>
      </div>

      {user?.role === 'student' && (
        /* Student edit workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile fields form */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-blue-500" /> Student Profile Details
            </h4>
            
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                    Current CGPA (0 - 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.5"
                    value={cgpa}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        if (val < 0) setCgpa('0');
                        else if (val > 10) setCgpa('10');
                        else setCgpa(e.target.value);
                      } else {
                        setCgpa(e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                    Academic Branch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                    Resume Drive URL (PDF Link)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://drive.google.com/resume.pdf"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                  Technical Skills (Comma separated)
                </label>
                <textarea
                  placeholder="e.g. React, Node.js, Mongoose, Python, SQL"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  rows="3"
                  className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <Save className="h-4 w-4" /> Save Core Profile
              </button>
            </form>
          </div>

          {/* Education background list builder */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-indigo-500" /> Add Education
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Degree / Course</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech (CSE) or Class 12"
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    className="w-full rounded-md border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Institution / School</label>
                  <input
                    type="text"
                    placeholder="e.g. State Engineering University"
                    value={eduInstitution}
                    onChange={(e) => setEduInstitution(e.target.value)}
                    className="w-full rounded-md border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Passing Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={eduPassYear}
                    onChange={(e) => setEduPassYear(e.target.value)}
                    className="w-full rounded-md border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-250 dark:border-slate-800 py-2 text-xs font-bold text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>
            </div>

            {/* List preview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-4">
                Education History Logs ({education.length})
              </h4>
              
              <div className="space-y-3.5">
                {education.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{item.degree}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.institution}</p>
                      <span className="text-[9px] font-bold text-blue-500 block mt-0.5">Pass Year: {item.passYear}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="rounded text-rose-500 hover:bg-rose-50 p-1 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {education.length === 0 && (
                  <p className="text-xs text-slate-450 italic text-center py-4">No education logs. Add item above.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'recruiter' && (
        /* Recruiter company editor */
        <div className="max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Building2 className="h-4.5 w-4.5 text-emerald-500" /> Recruiter Company Profile
          </h4>
          
          <form onSubmit={handleRecruiterSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google India"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-emerald-550 focus:outline-none dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://careers.google.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-sm focus:border-emerald-550 focus:outline-none dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                Industry Category
              </label>
              <input
                type="text"
                placeholder="e.g. Technology / E-commerce"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-emerald-550 focus:outline-none dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-650 dark:text-slate-400 mb-2">
                About the Company
              </label>
              <textarea
                placeholder="Write a brief overview of your company, core focus, and recruitment processes..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 py-2.5 px-4 text-sm focus:border-emerald-550 focus:outline-none dark:text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Save className="h-4 w-4" /> Save Company Profile
            </button>
          </form>
        </div>
      )}

      {user?.role === 'admin' && (
        /* Admin read logs info */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 max-w-2xl flex items-start gap-4">
          <Info className="h-6 w-6 text-blue-500 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Admin Profile Management</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Admin profiles are loaded directly from the core college portal directory database. Standard details can only be modified by root database controllers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
