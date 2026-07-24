import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  message: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.forgotForm.get('email')?.valueChanges.subscribe(() => {
      this.clearMessages();
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const email = this.forgotForm.value.email;
    console.log('Sending reset link for email:', email);

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        console.log('Reset link sent:', res);
        this.message = 'Un lien de réinitialisation a été envoyé à votre adresse e-mail. Vérifiez votre boîte de réception.';
        console.log('Message:', this.message);
        this.error = '';
        this.forgotForm.reset(); // ✅ Réinitialise le champ e-mail
      },
      error: (err) => {
        console.error('Error while sending reset password link:', err);
        this.handleError(err);
      },
      complete: () => {
        this.isLoading = false; // ✅ Garantit que le bouton arrête de spinner
      },
    });
  }

  private handleError(error: any): void {
    if (error.status === 404) {
      this.error = 'Aucun compte trouvé avec cette adresse e-mail.';
    } else if (error.status === 429) {
      this.error = 'Trop de tentatives. Veuillez réessayer plus tard.';
    } else if (error.status === 0) {
      this.error = 'Problème de connexion. Vérifiez votre connexion internet.';
    } else {
      this.error = 'Une erreur s\'est produite. Veuillez réessayer.';
    }
    this.message = '';
  }

  private clearMessages(): void {
    this.message = '';
    this.error = '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotForm.controls).forEach(key => {
      const control = this.forgotForm.get(key);
      control?.markAsTouched();
    });
  }
}
