// src/app/state/auth/auth.actions.ts
import { createAction, props } from '@ngrx/store';
import { User } from '../../user-details/User';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ userId: string; }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

// Logout Action
export const logout = createAction('[Auth] Logout');

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ email: string; password: string; name: string }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: any }>()
);


export const loadUserDetails = createAction(
  '[Auth] Load User Details',
  props<{ userId: string }>()
);

export const loadUserDetailsSuccess = createAction(
  '[Auth] Load User Details Success',
  props<{ user: User }>()
);

export const loadUserDetailsFailure = createAction(
  '[Auth] Load User Details Failure',
  props<{ error: any }>()
);
// Load User from SessionStorage
export const loadUserFromSession = createAction('[Auth] Load User From SessionStorage');
