import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-article-list',
    templateUrl: './article-list.component.html',
    styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit, OnDestroy {
    articlesSubject = new BehaviorSubject<any[]>([]);
    articles$ = this.articlesSubject.asObservable();

    newArticleTitle: string = '';
    newArticleContent: string = '';
    newArticleImage: string = '';
    newArticleTags: string = '';
    newCommentContent: { [key: string]: string } = {};

    editingArticleId: string | null = null;
    private updateArticleSubscription?: Subscription;

    private newArticleSubscription?: Subscription;
    private deleteArticleSubscription?: Subscription;
    private newCommentSubscription?: Subscription;
    private deleteCommentSubscription?: Subscription;

    constructor(
        private articleService: ArticleService,
        private socketService: SocketService,
        public authService: AuthService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.loadArticles();

        // listen pour les nouveaux articles via socket
        this.newArticleSubscription = this.socketService.onNewArticle().subscribe((newArticle) => {
            const currentArticles = this.articlesSubject.value;
            this.articlesSubject.next([{ ...newArticle, comments: [] }, ...currentArticles]);
        });

        // Listen for updated articles
        this.updateArticleSubscription = this.socketService.onUpdateArticle().subscribe((updatedArticle) => {
            const currentArticles = this.articlesSubject.value;
            const index = currentArticles.findIndex(a => a._id === updatedArticle._id);
            if (index !== -1) {
                const newArticles = [...currentArticles];
                // Preserve comments
                updatedArticle.comments = newArticles[index].comments;
                newArticles[index] = updatedArticle;
                this.articlesSubject.next(newArticles);
            }
        });

        // Listen pour les articles supprimés
        this.deleteArticleSubscription = this.socketService.onDeleteArticle().subscribe((articleId: string) => {
            const currentArticles = this.articlesSubject.value;
            this.articlesSubject.next(currentArticles.filter(a => a._id !== articleId));
        });

        // Listen for new comments
        this.newCommentSubscription = this.socketService.onNewComment().subscribe((comment) => {
            console.log('Socket: New comment received', comment);
            const currentArticles = this.articlesSubject.value;
            // Ensure we compare strings
            const articleIndex = currentArticles.findIndex(a => a._id === comment.article.toString());

            if (articleIndex !== -1) {
                console.log('Socket: Updating article', currentArticles[articleIndex]._id);
                const updatedArticles = [...currentArticles];
                const articleToUpdate = { ...updatedArticles[articleIndex] };

                // Create new comments array
                const currentComments = articleToUpdate.comments ? [...articleToUpdate.comments] : [];
                currentComments.push(comment);

                articleToUpdate.comments = currentComments;
                updatedArticles[articleIndex] = articleToUpdate;

                this.articlesSubject.next(updatedArticles);
            } else {
                console.warn('Socket: Article not found for comment', comment.article);
            }
        });

        // Listen for deleted comments
        this.deleteCommentSubscription = this.socketService.onDeleteComment().subscribe((commentId) => {
            console.log('Socket: Comment deleted', commentId);
            const currentArticles = this.articlesSubject.value;
            const updatedArticles = currentArticles.map(article => {
                if (article.comments && article.comments.some((c: any) => c._id === commentId)) {
                    return {
                        ...article,
                        comments: article.comments.filter((c: any) => c._id !== commentId)
                    };
                }
                return article;
            });
            this.articlesSubject.next(updatedArticles);
        });
    }

    loadArticles() {
        this.articleService.getArticles().subscribe(articles => {
            this.articlesSubject.next(articles);
        });
    }

    createArticle() {

        if (!this.newArticleTitle.trim() || !this.newArticleContent.trim()) {
            this.toastr.warning('Titre et contenu sont requis', 'Avertissement de validation');
            return;
        }

        const articleData = {
            title: this.newArticleTitle,
            content: this.newArticleContent,
            tags: this.newArticleTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            image: this.newArticleImage
        };

        if (this.editingArticleId) {
            this.articleService.updateArticle(this.editingArticleId, articleData).subscribe(() => {
                this.resetForm();
            });
        } else {
            this.articleService.createArticle(articleData).subscribe(() => {
                this.resetForm();
            });
        }
    }

    editArticle(article: any) {
        this.editingArticleId = article._id;
        this.newArticleTitle = article.title;
        this.newArticleContent = article.content;
        this.newArticleImage = article.image || '';
        this.newArticleTags = article.tags ? article.tags.join(', ') : '';
    }

    cancelEdit() {
        this.resetForm();
    }

    resetForm() {
        this.editingArticleId = null;
        this.newArticleTitle = '';
        this.newArticleContent = '';
        this.newArticleImage = '';
        this.newArticleTags = '';
    }

    addComment(articleId: string) {
        const content = this.newCommentContent[articleId];
        if (!content?.trim()) {
            this.toastr.warning('Contenu est requis', 'Avertissement');
            return;
        }

        this.articleService.addComment(articleId, content).subscribe(() => {
            this.newCommentContent[articleId] = '';
        });
    }

    deleteArticle(articleId: string, event: Event) {
        event.stopPropagation();
        event.preventDefault();

        if (!confirm('Are you sure you want to delete this article?')) return;

        this.articleService.deleteArticle(articleId).subscribe({
            error: (err) => alert(err.error?.message || 'Failed to delete article')
        });
    }

    deleteComment(commentId: string) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        this.articleService.deleteComment(commentId).subscribe({
            error: (err) => alert(err.error?.message || 'Failed to delete comment')
        });
    }

    canDeleteArticle(article: any): boolean {
        const user = this.authService.currentUser;
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'editor') return true;
        if (user.role === 'writer' && article.author._id === user._id) return true;
        return false;
    }

    canEditArticle(article: any): boolean {
        const user = this.authService.currentUser;
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'editor') return true;
        if (user.role === 'writer' && article.author._id === user._id) return true;
        return false;
    }

    canDeleteComment(comment: any): boolean {
        const user = this.authService.currentUser;
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'editor') return true;
        if (user.role === 'writer' && comment.user._id === user._id) return true;
        return false;
    }

    ngOnDestroy(): void {
        if (this.newArticleSubscription) this.newArticleSubscription.unsubscribe();
        if (this.updateArticleSubscription) this.updateArticleSubscription.unsubscribe();
        if (this.deleteArticleSubscription) this.deleteArticleSubscription.unsubscribe();
        if (this.newCommentSubscription) this.newCommentSubscription.unsubscribe();
        if (this.deleteCommentSubscription) this.deleteCommentSubscription.unsubscribe();
    }

    trackByArticleId(index: number, article: any): string {
        return article._id;
    }
}
