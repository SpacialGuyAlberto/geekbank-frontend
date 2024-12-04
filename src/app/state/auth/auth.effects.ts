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

// src/app/state/auth/auth.effects.ts

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      switchMap(() =>
        this.authService.getUserDetails().pipe(
          map(user => AuthActions.loadUserDetailsSuccess({ user })),
          tap(() => this.router.navigate(['/home'])),
          catchError(error => of(AuthActions.loadUserDetailsFailure({ error })))
        )
      )
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

  loadUserDetailsSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadUserDetailsSuccess),
        tap(({ user }) => {
          sessionStorage.setItem('user', JSON.stringify(user));
        })
      ),
    { dispatch: false }
  );


  loadUserFromSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromSession),
      switchMap(() =>
        this.authService.checkAuthentication().pipe(
          switchMap(authenticated => {
            if (authenticated) {
              return this.authService.getUserDetails().pipe(
                map(user => AuthActions.loadUserDetailsSuccess({ user })),
                catchError(error => of(AuthActions.loadUserDetailsFailure({ error })))
              );
            } else {
              return of(AuthActions.loginFailure({ error: 'Not authenticated' }));
            }
          }),
          catchError(error => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );



  // logout$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(AuthActions.logout),
  //       tap(() => {
  //         sessionStorage.removeItem('token');
  //         sessionStorage.removeItem('userId');
  //         sessionStorage.removeItem('user');
  //
  //         this.authService.logout()
  //         this.router.navigate(['/login']);
  //       })
  //     ),
  //   { dispatch: false }
  // );

}
