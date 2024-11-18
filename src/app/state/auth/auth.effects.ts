// src/app/state/auth/auth.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../auth.service';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions, private authService: AuthService, private router: Router) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) => {
            const { userId, token } = response;
            return AuthActions.loginSuccess({ userId, token });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ userId, token }) => {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('userId', userId);
          this.router.navigate(['/home']);
        })
      ),
    { dispatch: false }
  );
  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          // Manejar errores de login si es necesario
          console.error('Login failed:', error);
        })
      ),
    { dispatch: false }
  );

  loadUserFromSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromSession),
      map(() => {
        const token = sessionStorage.getItem('token');
        const userId = sessionStorage.getItem('userId');
        if (token && userId) {
          return AuthActions.loginSuccess({ userId, token });
        } else {
          return AuthActions.loginFailure({ error: 'No user in session storage' });
        }
      })
    )
  );
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          // Limpiar el sessionStorage
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userId');

          // Opcional: Llamada al backend para invalidar el token
          this.authService.logout().subscribe(); // Si el backend lo soporta

          // Redirigir al usuario a la página de login
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false } // No necesitamos despachar otra acción
  );
}
