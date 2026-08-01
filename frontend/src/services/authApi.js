import api from './api';

export const authApi = {
  login: async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  },

  registerStudent: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  googleAuth: async (googleData) => {
    const response = await api.post('/auth/google', googleData);
    return response.data;
  },

  setRole: async (roleData) => {
    const response = await api.post('/auth/set-role', roleData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
