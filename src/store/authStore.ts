import { create } from 'zustand';
import type { User } from 'firebase/auth';

export type UserRole = 'admin' | 'club' | 'player';

export interface UserProfile {
  uid?: string;
  role: UserRole;
  clubId?: string | null;
  name?: string;
  username?: string;
  email?: string;
  category?: string;
  teamId?: string;
  sportType?: 'soccer' | 'basketball' | 'futsal';
  accountType?: 'jugador' | 'tutor';
  isAdult?: boolean;
  status?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));
