import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  profile: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Load current user and profile details
  loadUser: async () => {
    if (!get().token) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        set({
          user: res.data.user,
          profile: res.data.profile,
          isAuthenticated: true,
          loading: false
        });
      }
    } catch (err) {
      console.error('loadUser error:', err);
      // Clean up token if verification fails
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        profile: null,
        isAuthenticated: false,
        loading: false
      });
    }
  },

  // Login action
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false
        });
        // Immediately load profile
        await get().loadUser();
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Verify credentials.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Register action
  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false
        });
        await get().loadUser();
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Verify input details.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Forgot password action
  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send password recovery mail.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Reset password action
  resetPassword: async (resetToken, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/auth/reset-password/${resetToken}`, { password });
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Reset password link is invalid or expired.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Logout action
  logout: async () => {
    try {
      // Notify server (optional, is protected route so it is nice to hit)
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout server warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        profile: null,
        isAuthenticated: false,
        error: null
      });
    }
  },

  // Update Student profile
  updateStudentProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/students/profile', profileData);
      if (res.data.success) {
        set({ profile: res.data.data, loading: false });
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Update Recruiter profile
  updateRecruiterProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/recruiters/profile', profileData);
      if (res.data.success) {
        set({ profile: res.data.data, loading: false });
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update company profile.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Clear errors manually
  clearError: () => set({ error: null })
}));

export default useAuthStore;
