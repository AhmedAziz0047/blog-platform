import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class ArticleService {
    private apiUrl = 'http://localhost:5000/api';

    constructor(private http: HttpClient, private toastr: ToastrService) { }

    getArticles(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/articles`);
    }

    getArticle(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/articles/${id}`);
    }

    createArticle(article: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/articles`, article).pipe(
            catchError(this.handleError.bind(this))
        );
    }

    updateArticle(id: string, article: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/articles/${id}`, article);
    }

    deleteArticle(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/articles/${id}`);
    }

    getComments(articleId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/comments/${articleId}`);
    }

    addComment(articleId: string, content: string, parentComment: string | null = null): Observable<any> {
        return this.http.post(`${this.apiUrl}/comments/${articleId}`, { content, parentComment }).pipe(
            catchError(this.handleError.bind(this))
        );
    }

    deleteComment(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/comments/${id}`);
    }
    private handleError(error: any) {
        if (error.status === 429) {
            this.toastr.error(error.error.message || 'Too many requests, please try again later.');
        }
        return throwError(() => error);
    }
}
