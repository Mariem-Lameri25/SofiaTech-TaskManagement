import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  message = '';
  error = '';
  token = '';
  isLoading = false;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Récupérer le token depuis les params de route
    this.route.params.subscribe((params) => {
      this.token = params['token'] || '';
      console.log('🔑 TOKEN from route params:', this.token);

      if (!this.token) {
        this.router.navigate(['/link-expired']);
        return;
      }

      // Vérifier immédiatement le token sur le backend
      this.authService.checkResetToken(this.token).subscribe({
        next: () => {
          // Token valide → on initialise le formulaire
          this.initForm();
        },
        error: (err) => {
          console.error('❌ Token check failed:', err);
          this.router.navigate(['/link-expired']);
        },
      });
    });
  }

  private initForm(): void {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  get passwordControl() {
    return this.resetForm.get('password');
  }

  get confirmPasswordControl() {
    return this.resetForm.get('confirmPassword');
  }

  get passwordsMatch(): boolean {
    const password = this.resetForm.get('password')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onInputChange(): void {
    this.message = '';
    this.error = '';
  }

  onSubmit(): void {
    this.message = '';
    this.error = '';

    if (this.resetForm.invalid) {
      this.error = 'Veuillez remplir correctement le formulaire.';
      this.markAllFieldsAsTouched();
      return;
    }

    const { password, confirmPassword } = this.resetForm.value;

    if (password !== confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.token) {
      this.error = 'Token de réinitialisation invalide.';
      return;
    }

    this.isLoading = true;

    this.authService
      .resetPassword(this.token, password, confirmPassword)
      .subscribe({
        next: (res) => {
          console.log('✅ Password reset success:', res);
          this.isLoading = false;
          this.message =
            'Votre mot de passe a été réinitialisé avec succès !';

          this.resetForm.reset();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          console.error('❌ Password reset failed:', err);
          this.isLoading = false;

          if (err.status === 400) {
            this.error =
              'Token expiré ou invalide. Veuillez demander une nouvelle réinitialisation.';
          } else if (err.status === 422) {
            this.error =
              'Données invalides. Vérifiez votre mot de passe.';
          } else if (err.status >= 500) {
            this.error =
              'Erreur serveur. Veuillez réessayer plus tard.';
          } else {
            this.error =
              err.error?.message ||
              'Une erreur est survenue. Veuillez réessayer.';
          }
        },
      });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.resetForm.controls).forEach((key) => {
      this.resetForm.get(key)?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'Ce champ est requis.';
    }

    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} caractères requis.`;
    }

    return '';
  }
}
