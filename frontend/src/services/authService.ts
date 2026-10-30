import { api } from './api';

export const authService = {
  register: (data: { fullName: string; phone: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (phone: string) =>
    api.post('/auth/forgot-password', { phone }),

  verifyOtp: (data: { phone: string; code: string; newPassword: string }) =>
    api.post('/auth/verify-otp', data),
};
