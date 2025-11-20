import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket;
    private url = 'http://localhost:5000';

    constructor(private authService: AuthService) {
        this.socket = io(this.url);

        this.authService.user$.subscribe(user => {
            if (user) {
                this.joinUserRoom(user._id);
            }
        });
    }

    joinArticle(articleId: string) {
        this.socket.emit('join_article', articleId);
    }

    joinUserRoom(userId: string) {
        this.socket.emit('join_user', userId);
    }

    onNewArticle(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('new_article', (data) => {
                observer.next(data);
            });
        });
    }

    onUpdateArticle(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('update_article', (data) => {
                observer.next(data);
            });
        });
    }

    onNewComment(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('new_comment', (data) => {
                observer.next(data);
            });
        });
    }

    onDeleteComment(): Observable<string> {
        return new Observable(observer => {
            this.socket.on('delete_comment', (commentId: string) => {
                observer.next(commentId);
            });
        });
    }

    onDeleteArticle(): Observable<string> {
        return new Observable(observer => {
            this.socket.on('delete_article', (articleId: string) => {
                observer.next(articleId);
            });
        });
    }

    onNotification(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('notification', (data) => {
                observer.next(data);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
