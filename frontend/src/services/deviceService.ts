import { api } from './api';

export const deviceService = {
  findAll: () => api.get('/device'),
  remove: (id: number) => api.delete(`/device/${id}`),
};
