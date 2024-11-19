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
    account: { balance: 0},
      isAuthenticated: true,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    error,
    isAuthenticated: false,
  })),
  on(AuthActions.loadUserFromSession, (state) => {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const token = sessionStorage.getItem('token');
    return {
      ...state,
      user,
      token,
      isAuthenticated: !!token,
      error: null,
    };
  }),
  on(AuthActions.loadUserDetailsSuccess, (state, { user }) => ({
    ...state,
    user,
  })),
  on(AuthActions.loadUserDetailsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    userId: null,
    token: null,
    isAuthenticated: false,
    error: null,
  })),
);
