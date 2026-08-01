import api from './api';

export const getStudentProfile = async () => {
  const response = await api.get('/student/profile');
  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put('/student/profile', profileData);
  return response.data;
};

// Education CRUD
export const getEducation = async () => {
  const response = await api.get('/student/education');
  return response.data;
};

export const addEducation = async (data) => {
  const response = await api.post('/student/education', data);
  return response.data;
};

export const updateEducation = async (id, data) => {
  const response = await api.put(`/student/education/${id}`, data);
  return response.data;
};

export const deleteEducation = async (id) => {
  const response = await api.delete(`/student/education/${id}`);
  return response.data;
};

// Projects CRUD
export const getProjects = async () => {
  const response = await api.get('/student/projects');
  return response.data;
};

export const addProject = async (data) => {
  const response = await api.post('/student/projects', data);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await api.put(`/student/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/student/projects/${id}`);
  return response.data;
};

// Experience CRUD
export const getExperiences = async () => {
  const response = await api.get('/student/experience');
  return response.data;
};

export const addExperience = async (data) => {
  const response = await api.post('/student/experience', data);
  return response.data;
};

export const updateExperience = async (id, data) => {
  const response = await api.put(`/student/experience/${id}`, data);
  return response.data;
};

export const deleteExperience = async (id) => {
  const response = await api.delete(`/student/experience/${id}`);
  return response.data;
};

// Skills CRUD
export const getSkills = async () => {
  const response = await api.get('/student/skills');
  return response.data;
};

export const addSkill = async (data) => {
  const response = await api.post('/student/skills', data);
  return response.data;
};

export const updateSkill = async (id, data) => {
  const response = await api.put(`/student/skills/${id}`, data);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await api.delete(`/student/skills/${id}`);
  return response.data;
};

// Certifications CRUD
export const getCertifications = async () => {
  const response = await api.get('/student/certifications');
  return response.data;
};

export const addCertification = async (data) => {
  const response = await api.post('/student/certifications', data);
  return response.data;
};

export const deleteCertification = async (id) => {
  const response = await api.delete(`/student/certifications/${id}`);
  return response.data;
};

// Resume API
export const getResume = async () => {
  const response = await api.get('/student/resume');
  return response.data;
};

export const uploadResume = async (formData) => {
  const response = await api.post('/student/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteResume = async () => {
  const response = await api.delete('/student/resume');
  return response.data;
};

// Applications & Kanban
export const getApplications = async () => {
  const response = await api.get('/student/applications');
  return response.data;
};

export const applyToJob = async (jobData) => {
  const response = await api.post('/student/applications', jobData);
  return response.data;
};

export const updateApplicationStage = async (id, stage) => {
  const response = await api.put(`/student/applications/${id}/stage`, { stage });
  return response.data;
};

export const deleteApplication = async (id) => {
  const response = await api.delete(`/student/applications/${id}`);
  return response.data;
};

// Job Drives & Search
export const getJobDrives = async (filters = {}) => {
  const response = await api.get('/student/drives', { params: filters });
  return response.data;
};

// Notifications
export const getNotifications = async () => {
  const response = await api.get('/student/notifications');
  return response.data;
};

export const markNotificationsRead = async () => {
  const response = await api.put('/student/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/student/notifications/${id}`);
  return response.data;
};

// Analytics
export const getStudentAnalytics = async () => {
  const response = await api.get('/student/analytics');
  return response.data;
};
