// src/app/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from './state/auth/auth.selectors';
import {Observable, tap} from 'rxjs';
import { map, take } from 'rxjs/operators';
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private store: Store, private router: Router) {}

  // canActivate(): Observable<boolean> {
  //   return this.store.select(selectIsAuthenticated).pipe(
  //     take(1),
  //     map((isAuthenticated) => {
  //       if (!isAuthenticated) {
  //         this.router.navigate(['/login']);
  //         return false;
  //       }
  //       return true;
  //     })
  //   );
  // }
  canActivate(): Observable<boolean> {
    return this.authService.checkAuthentication().pipe(
      tap(authenticated => {
        if (!authenticated) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
