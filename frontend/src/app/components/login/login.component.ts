import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;
    error: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            const emailControl = this.loginForm.get('email');
            const passwordControl = this.loginForm.get('password');

            if (!emailControl?.value && !passwordControl?.value) {
                this.toastr.error('Veuillez remplir tous les champs');
            } else if (emailControl?.errors?.['required']) {
                this.toastr.error('L\'email est requis');
            } else if (emailControl?.errors?.['email']) {
                this.toastr.error('Veuillez entrer une adresse email valide');
            } else if (passwordControl?.errors?.['required']) {
                this.toastr.error('Le mot de passe est requis');
            }
            return;
        }

        this.authService.login(this.loginForm.value).subscribe({
            next: () => this.router.navigate(['/']),
            error: (err) => this.toastr.error(err.error.message || 'Login failed')
        });
    }
}
