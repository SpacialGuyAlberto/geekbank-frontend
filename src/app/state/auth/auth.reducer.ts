import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import {User} from "../../models/User";

// auth.state.ts
export interface AuthState {
  userId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  error: any;
}

export const initialAuthState: AuthState = {
  userId: null,
  user: null,
  isAuthenticated: false,
  error: null,
};


export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginSuccess, (state, { userId}) => ({
    ...state,
    userId,
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
    return {
      ...state,
      user,

      isAuthenticated: true,
      error: null,
    };
  }),
  // auth.reducer.ts
  on(AuthActions.loadUserDetailsSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    error: null,
  })),

  on(AuthActions.loadUserDetailsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    userId: null,
    isAuthenticated: false,
    error: null,
  })),
);
