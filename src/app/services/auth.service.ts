import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly tokenKey = 'finance_token';
  private readonly userKey = 'finance_user';
  private userDetails: any = null;

  constructor(private http: HttpClient) {
    this.restoreUser();
  }

  private restoreUser() {
    const saved = localStorage.getItem(this.userKey);
    if (saved) {
      this.userDetails = JSON.parse(saved);
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userDetails = null;
  }

  setUserDetails(user: any): void {
    this.userDetails = user;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUserDetails(): any {
    return this.userDetails;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
