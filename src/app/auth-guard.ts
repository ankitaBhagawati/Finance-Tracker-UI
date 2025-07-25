import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '@env';
import { of, map, catchError, tap } from 'rxjs';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('finance_token');

  if (!token) {
    router.navigate(['/']);
    return of(false);
  }

  return http
    .get(`${environment.apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('finance_token')}`,
      },
    })
    .pipe(
      tap((user) => authService.setUserDetails(user)),
      map(() => {
        return true;
      }),
      catchError(() => {
        router.navigate(['/']);
        return of(false);
      }),
    );
};
