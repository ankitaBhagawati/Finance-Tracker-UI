import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '@env';
import { of, map, catchError } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);

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
      map(() => {
        return true;
      }),
      catchError(() => {
        router.navigate(['/']);
        return of(false);
      }),
    );
};
