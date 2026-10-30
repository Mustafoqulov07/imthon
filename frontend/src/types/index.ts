export type Role = 'USER' | 'SUPER_ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE';
export type GapStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type RoundStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID';

export interface User {
  id: number;
  fullName: string;
  phone: string;
  role: Role;
  status: Status;
  avatar?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Device {
  id: number;
  device: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface GapMember {
  id: number;
  gapId: number;
  userId: number;
  user: User;
  joinAt: string;
}

export interface Gap {
  id: number;
  name: string;
  description?: string | null;
  organizerId: number;
  organizer: User;
  maxMembers: number;
  monthlyAmount: number;
  duration: number;
  status: GapStatus;
  members: GapMember[];
  rounds?: Round[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  roundId: number;
  userId: number;
  amount: number;
  status: PaymentStatus;
  user?: User;
  paidAt?: string | null;
  createdAt: string;
}

export interface Round {
  id: number;
  gapId: number;
  roundNumber: number;
  receiverId: number;
  receiver: User;
  status: RoundStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  payments?: Payment[];
  gap?: Gap;
}

export interface CreateGapData {
  name: string;
  description?: string;
  maxMembers: number;
  monthlyAmount: number;
}

export interface UpdateGapData {
  name?: string;
  description?: string;
  maxMembers?: number;
  monthlyAmount?: number;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}
