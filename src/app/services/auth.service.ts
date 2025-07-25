import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'finance_token';
  private userDetails: any = null;

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.userDetails = null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setUserDetails(user: any): void {
    this.userDetails = user;
  }

  getUserDetails(): any {
    return this.userDetails;
  }
}
