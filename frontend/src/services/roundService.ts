import { api } from './api';

export const roundService = {
  createRounds: (gapId: number) => api.post(`/round/gap/${gapId}`),
  findByGap: (gapId: number) => api.get(`/round/gap/${gapId}`),
  findActive: (gapId: number) => api.get(`/round/active/${gapId}`),
  findOne: (id: number) => api.get(`/round/${id}`),
};
