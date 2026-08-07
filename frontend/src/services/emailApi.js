import api from './api';

export const getEmailStatus = async () => {
  const response = await api.get('/email/status');
  return response.data;
};

export const getGoogleConnectUrl = async () => {
  const response = await api.get('/email/google/connect');
  return response.data;
};

export const syncEmail = async () => {
  const response = await api.post('/email/sync');
  return response.data;
};

export const disconnectGoogle = async () => {
  const response = await api.delete('/email/google/disconnect');
  return response.data;
};
