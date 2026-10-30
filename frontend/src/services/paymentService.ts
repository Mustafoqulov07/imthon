import { api } from './api';

export const paymentService = {
  create: (roundId: number) =>
    api.post('/payments', { roundId }),

  pay: (paymentId: number) =>
    api.patch(`/payments/${paymentId}/pay`),

  findAll: () =>
    api.get('/payments'),

  findOne: (id: number) =>
    api.get(`/payments/${id}`),

  findByRound: (roundId: number) =>
    api.get(`/payments/round/${roundId}`),
};
