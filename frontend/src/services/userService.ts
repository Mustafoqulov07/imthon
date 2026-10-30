import { api } from './api';

export const userService = {
  findAll: () => api.get('/user'),
  findOne: (id: number) => api.get(`/user/${id}`),
  update: (id: number, formData: FormData) =>
    api.patch(`/user/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  remove: (id: number) => api.delete(`/user/${id}`),
  updateStatus: (id: number, status: 'ACTIVE' | 'INACTIVE') =>
    api.patch(`/user/${id}/status`, { status }),
};
