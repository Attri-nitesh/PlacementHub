import { create } from 'zustand';
import api from '../services/api';

const useDriveStore = create((set, get) => ({
  drives: [],
  applications: [],
  analytics: null,
  loading: false,
  error: null,

  // List all drives
  fetchDrives: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/drives');
      if (res.data.success) {
        set({ drives: res.data.data, loading: false });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch drives', loading: false });
    }
  },

  // Student: Get own applications
  fetchStudentApplications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/students/applications');
      if (res.data.success) {
        set({ applications: res.data.data, loading: false });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load applications', loading: false });
    }
  },

  // Recruiter: Get applicants for drive
  fetchRecruiterApplicants: async (driveId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/recruiters/applicants/${driveId}`);
      if (res.data.success) {
        set({ applications: res.data.data, loading: false });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load drive applicants', loading: false });
    }
  },

  // Admin: Get all applications
  fetchAllApplicants: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/admin/applicants');
      if (res.data.success) {
        set({ applications: res.data.data, loading: false });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load all applications', loading: false });
    }
  },

  // Create placement drive (Recruiter/Admin)
  createDrive: async (driveData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/drives', driveData);
      if (res.data.success) {
        set((state) => ({
          drives: [...state.drives, res.data.data],
          loading: false
        }));
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to publish placement drive';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Update placement drive (Recruiter/Admin)
  updateDrive: async (id, driveData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/drives/${id}`, driveData);
      if (res.data.success) {
        set((state) => ({
          drives: state.drives.map((d) => (d._id === id ? res.data.data : d)),
          loading: false
        }));
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update placement drive';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Apply to drive (Student)
  applyToDrive: async (driveId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/drives/${driveId}/apply`);
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit application';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Update application status (Student Kanban drag-and-drop / Recruiter management)
  updateApplicationStatus: async (applicationId, status, feedback) => {
    const previousApps = get().applications;
    
    // Optimistically update status locally in store state
    set((state) => ({
      applications: state.applications.map((app) =>
        app._id === applicationId ? { ...app, status, feedback: feedback !== undefined ? feedback : app.feedback } : app
      )
    }));

    try {
      const res = await api.put(`/applications/${applicationId}/status`, { status, feedback });
      if (res.data.success) {
        return { success: true };
      }
    } catch (err) {
      // Revert store state on API failures
      set({ applications: previousApps });
      return { success: false, error: err.response?.data?.message || 'Failed to update status' };
    }
  },

  // Admin approval/rejection
  approveOrRejectApplication: async (applicationId, action) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/admin/applications/${applicationId}/approve`, { action });
      if (res.data.success) {
        set((state) => ({
          applications: state.applications.map((app) =>
            app._id === applicationId ? res.data.data : app
          ),
          loading: false
        }));
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to process application action';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Fetch charts & rates analytics
  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/analytics');
      if (res.data.success) {
        set({ analytics: res.data.data, loading: false });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load analytics', loading: false });
    }
  }
}));

export default useDriveStore;
