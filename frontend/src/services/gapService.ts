import { api } from './api';

export const gapService = {
  create: (data: { name: string; description?: string; maxMembers: number; monthlyAmount: number }) =>
    api.post('/gap', data),

  findAll: () => api.get('/gap'),

  findOne: (id: number) => api.get(`/gap/${id}`),

  update: (id: number, data: { name?: string; description?: string; maxMembers?: number; monthlyAmount?: number }) =>
    api.patch(`/gap/${id}`, data),

  cancel: (id: number) => api.patch(`/gap/${id}/cancel`),

  remove: (id: number) => api.delete(`/gap/${id}`),

  addMember: (gapId: number, userId: number) =>
    api.post(`/gap/${gapId}/member`, { userId }),

  removeMember: (gapId: number, userId: number) =>
    api.delete(`/gap/${gapId}/member/${userId}`),

  startGap: (gapId: number) =>
    api.post(`/gap/${gapId}/start`),
};
