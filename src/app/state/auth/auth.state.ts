// src/app/state/auth/auth.state.ts
import { User } from '../../models/User';

// auth.state.ts
export interface AuthState {
  userId: string | null;
  user: User | null;
  isAuthenticated: boolean | null;
  error: any;
}

export const initialAuthState: AuthState = {
  userId: null,
  user: null,
  isAuthenticated: null,
  error: null,
};

