import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, (state: AuthState) => state.user);
export const selectIsAuthenticated = createSelector(selectAuthState, (state: AuthState) => state.isAuthenticated);
export const selectToken = createSelector(selectAuthState, (state: AuthState) => state.token);
export const selectAuthError = createSelector(selectAuthState, (state: AuthState) => state.error);
export const selectAuthLoading = createSelector(selectAuthState, (state: AuthState) => state.loading);
