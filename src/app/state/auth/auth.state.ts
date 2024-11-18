// src/app/state/auth/auth.state.ts
import { User } from '../../models/User';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: any;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
};
