import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/auth';
    private userSubject = new BehaviorSubject<any>(null);
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {
        this.loadUser();
    }

    private loadUser() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    this.logout();
                } else {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    this.userSubject.next({ ...user, token });
                }
            } catch (e) {
                this.logout();
            }
        }
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((res: any) => this.handleAuth(res)),
            catchError(this.handleError.bind(this))
        );
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => this.handleAuth(res)),
            catchError(this.handleError.bind(this))
        );
    }

    private handleAuth(res: any) {
        if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res));
            this.userSubject.next(res);
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    currentUserValue(): any {
        return this.userSubject.value;
    }

    get currentUser(): any {
        return this.userSubject.value;
    }

    hasRole(roles: string[]): boolean {
        const user = this.userSubject.value;
        if (!user) return false;
        return roles.includes(user.role);
    }
    private handleError(error: any) {
        if (error.status === 429) {
            this.toastr.error(error.error.message || 'Too many requests, please try again later.');
        }
        return throwError(() => error);
    }
}
