import api from './api';

export const aiApi = {
  analyzeAtsScore: async (jobDriveId, forceRefresh = false) => {
    const response = await api.post('/ai/analyze-ats', { jobDriveId, forceRefresh });
    return response.data;
  },
};
