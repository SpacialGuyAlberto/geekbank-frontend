// app.state.ts
import { ActionReducerMap } from '@ngrx/store';
import {authReducer} from "./state/auth/auth.reducer";
import {AuthState} from "./state/auth/auth.state";

export interface AppState {
  auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
};
