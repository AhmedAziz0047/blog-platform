import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'] // Reusing login styles or create new
})
export class RegisterComponent {
    registerForm: FormGroup;
    error: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService
    ) {
        this.registerForm = this.fb.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['reader'] // role par defaut
        });
    }

    onSubmit() {
        if (this.registerForm.invalid) {
            const usernameControl = this.registerForm.get('username');
            const emailControl = this.registerForm.get('email');
            const passwordControl = this.registerForm.get('password');

            if (!usernameControl?.value && !emailControl?.value && !passwordControl?.value) {
                this.toastr.error('Veuillez remplir tous les champs');
            } else if (usernameControl?.errors?.['required']) {
                this.toastr.error('Le nom d\'utilisateur est requis');
            } else if (emailControl?.errors?.['required']) {
                this.toastr.error('L\'email est requis');
            } else if (emailControl?.errors?.['email']) {
                this.toastr.error('Veuillez entrer une adresse email valide');
            } else if (passwordControl?.errors?.['required']) {
                this.toastr.error('Le mot de passe est requis');
            } else if (passwordControl?.errors?.['minlength']) {
                this.toastr.error('Le mot de passe doit contenir au moins 6 caractères');
            }
            return;
        }

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.toastr.success('Inscription réussie');
                this.router.navigate(['/login']);
            },
            error: (err) => this.toastr.error(err.error.message || 'Registration failed')
        });
    }
}
