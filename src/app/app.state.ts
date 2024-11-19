// src/app/app.state.ts

import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './state/auth/auth.reducer';

export interface AppState {
  auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
};
