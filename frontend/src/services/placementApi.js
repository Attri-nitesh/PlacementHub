import api from './api';

export const getPlacementDashboard = async () => {
  const response = await api.get('/placement/dashboard');
  return response.data;
};

// Companies
export const getCompanies = async () => {
  const response = await api.get('/placement/companies');
  return response.data;
};

export const createCompany = async (data) => {
  const response = await api.post('/placement/companies', data);
  return response.data;
};

export const updateCompany = async (id, data) => {
  const response = await api.put(`/placement/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (id) => {
  const response = await api.delete(`/placement/companies/${id}`);
  return response.data;
};

// Drives Enterprise Lifecycle API
export const getPlacementDrives = async (params = {}) => {
  const response = await api.get('/placement/drives', { params });
  return response.data;
};

export const createPlacementDrive = async (data) => {
  const response = await api.post('/placement/drives', data);
  return response.data;
};

export const updatePlacementDrive = async (id, data) => {
  const response = await api.put(`/placement/drives/${id}`, data);
  return response.data;
};

export const updateDriveStatus = async (id, status, closeReason = '') => {
  const response = await api.put(`/placement/drives/${id}/status`, { status, closeReason });
  return response.data;
};

export const duplicatePlacementDrive = async (id) => {
  const response = await api.post(`/placement/drives/${id}/duplicate`);
  return response.data;
};

export const deletePlacementDrive = async (id) => {
  const response = await api.delete(`/placement/drives/${id}`);
  return response.data;
};

// Applications Review
export const getAllApplications = async (filters = {}) => {
  const response = await api.get('/placement/applications', { params: filters });
  return response.data;
};

export const updateApplicationStage = async (id, stage) => {
  const response = await api.put(`/placement/applications/${id}/stage`, { stage });
  return response.data;
};

// Interviews
export const getInterviews = async () => {
  const response = await api.get('/placement/interviews');
  return response.data;
};

export const scheduleInterview = async (data) => {
  const response = await api.post('/placement/interviews', data);
  return response.data;
};

// Offers & Rejections
export const getOffers = async () => {
  const response = await api.get('/placement/offers');
  return response.data;
};

export const releaseOffer = async (data) => {
  const response = await api.post('/placement/offers', data);
  return response.data;
};

export const rejectApplication = async (data) => {
  const response = await api.post('/placement/applications/reject', data);
  return response.data;
};

// Announcements
export const getAnnouncements = async () => {
  const response = await api.get('/placement/announcements');
  return response.data;
};

export const createAnnouncement = async (data) => {
  const response = await api.post('/placement/announcements', data);
  return response.data;
};

// Student Directory & Reports
export const getStudentDirectory = async () => {
  const response = await api.get('/placement/students');
  return response.data;
};

export const getExportReportUrl = () => {
  return 'http://localhost:5001/api/placement/reports/export';
};

// Analytics & Activity Logs
export const getPlacementAnalytics = async () => {
  const response = await api.get('/placement/analytics');
  return response.data;
};

export const getActivityLogs = async () => {
  const response = await api.get('/placement/logs');
  return response.data;
};
