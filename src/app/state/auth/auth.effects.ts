// src/app/state/auth/auth.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../auth.service';
import {map, switchMap, catchError, tap, mergeMap} from 'rxjs/operators';
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
            const { userId } = response;
            return AuthActions.loginSuccess({ userId });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ userId }) => {
        this.router.navigate(['/home']);
      }),
      map(({ userId }) => AuthActions.loadUserDetails({ userId }))
    )
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

  loadUserDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserDetails),
      switchMap(({ userId }) =>
        this.authService.getUserById(userId).pipe(
          map((user) => AuthActions.loadUserDetailsSuccess({ user })),
          catchError((error) => of(AuthActions.loadUserDetailsFailure({ error })))
        )
      )
    )
  );

// auth.effects.ts
  loadUserFromSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromSession),
      switchMap(() =>
        this.authService.checkAuthentication().pipe(
          switchMap(authenticated => {
            if (authenticated) {
              const userId = sessionStorage.getItem('userId');
              if (userId) {
                return of(AuthActions.loginSuccess({ userId }));
              } else {
                return of(AuthActions.loginFailure({ error: 'No userId in session storage' }));
              }
            } else {
              return of(AuthActions.loginFailure({ error: 'Not authenticated' }));
            }
          }),
          catchError(error => of(AuthActions.loginFailure({ error })))
        )
      )
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
