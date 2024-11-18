// src/app/state/auth/auth.reducer.ts

import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  error: any;
}

export const initialAuthState: AuthState = {
  userId: null,
  token: null,
  isAuthenticated: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginSuccess, (state, { userId, token }) => ({
    ...state,
    userId,
    token,
    isAuthenticated: true,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    error,
    isAuthenticated: false,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    userId: null,
    token: null,
    isAuthenticated: false,
    error: null,
  }))
);
