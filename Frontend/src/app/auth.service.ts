import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  customer_id: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    });
  }

  isAuthenticated(): boolean {
    // Check if user is authenticated (you can implement session storage or token check)
    return sessionStorage.getItem('isAuthenticated') === 'true';
  }

  setAuthenticated(value: boolean): void {
    if (value) {
      sessionStorage.setItem('isAuthenticated', 'true');
    } else {
      sessionStorage.removeItem('isAuthenticated');
    }
  }

  clearSession(): void {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('customerId');
  }
} 