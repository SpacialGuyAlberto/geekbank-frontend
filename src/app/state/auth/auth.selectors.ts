import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, (state) => state.user);

export const selectUserId = createSelector(selectAuthState, (state) => state.userId);
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);
// auth.selectors.ts
export const selectUserBalance = createSelector(
  selectUser,
  (user) => user?.account?.balance ?? 0
);

// export const selectAuthToken = createSelector(selectAuthState, (state) => state.token);
