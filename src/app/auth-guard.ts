import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class authGuard implements CanActivate {
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> {
    return this.http

      .get(`${environment.apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('finance_token')}`,
        },
      })
      .pipe(
        tap((user) => this.authService.setUserDetails(user)),
        map(() => true),
        catchError(() => {
          this.router.navigate(['/']);
          return of(false);
        })
      );
  }
}
