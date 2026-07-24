import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  register(data: {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, data).pipe(
      tap((response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          // Store login timestamp for session management
          localStorage.setItem('login_timestamp', Date.now().toString());
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('login_timestamp');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    const loginTimestamp = localStorage.getItem('login_timestamp');
    if (!token || !loginTimestamp) {
      this.logout();
      return false;
    }
    const now = Date.now();
    const loginTime = parseInt(loginTimestamp, 10);
    // 6 hours in milliseconds
    const maxSessionDuration = 6 * 60 * 60 * 1000;
    if (now - loginTime > maxSessionDuration) {
      this.logout();
      return false;
    }
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

 sendResetLink(email: string): Observable<any> {
  console.log('[AuthService] Sending reset link for:', email);
  return this.http.post(`${this.API_URL}/forgot-password`, { email }).pipe(
    tap({
      next: (res) => console.log('[AuthService] Reset link response:', res),
      error: (err) => console.error('[AuthService] Reset link error:', err)
    })
  );

}

forgotPassword(email: string) {
  console.log('Sending forgot password request for email:', email);
  return this.http.post(`${this.API_URL}/forgot-password`, { email });
}

resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {
  console.log('[AuthService] Resetting password with token:', token);
  return this.http.post(`${this.API_URL}/reset-password/${token}`, {
    password,
    confirmPassword
  }).pipe(
    tap({
      next: (res) => console.log('[AuthService] Password reset response:', res),
      error: (err) => console.error('[AuthService] Password reset error:', err)
    })
  );
}

checkResetToken(token: string) {
  return this.http.get(`${this.API_URL}/check-reset-token/${token}`);
}


getCurrentUser(): Observable<User> {
  const token = this.getToken();
  if (!token) throw new Error('No token found');

  return this.http.get<User>(`${this.API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


}
