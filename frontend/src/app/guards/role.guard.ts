import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        const expectedRoles = route.data['roles'] as Array<string>;

        if (this.authService.hasRole(expectedRoles)) {
            return true;
        }

        // Redirect to home or unauthorized page
        return this.router.createUrlTree(['/']);
    }
}
