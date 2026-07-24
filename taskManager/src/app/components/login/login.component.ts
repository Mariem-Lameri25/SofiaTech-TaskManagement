import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  readonly loginForm: FormGroup;
  errorMessage = '';
  isLoading = false; // ✅ Added loading state

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private authService: AuthService,
     private zone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  // ✅ Check if user is already logged in
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               Form actions                                 */
  /* -------------------------------------------------------------------------- */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true; // ✅ Start loading
      this.errorMessage = ''; // ✅ Clear previous errors
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login({ email, password }).subscribe({
       next: () => {
  this.zone.run(() => {
    this.router.navigateByUrl('/dashboard', { replaceUrl: true });
  });
},

        error: (err) => {
          this.isLoading = false; // ✅ Stop loading
          
          // ✅ Better error handling
          if (err.status === 401) {
            this.errorMessage = 'Invalid email or password.';
          } else if (err.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please try again.';
          } else {
            this.errorMessage = err.error?.message || 'An error occurred. Please try again.';
          }
          
          console.error('❌ Login error:', err);
        },
        complete: () => {
          this.isLoading = false; // ✅ Stop loading when complete
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               Social login                                 */
  /* -------------------------------------------------------------------------- */

  signInWithGithub(): void {
    // Implement GitHub OAuth login
    console.log('GitHub login clicked');
  }

  signInWithGoogle(): void {
    // Implement Google OAuth login
    console.log('Google login clicked');
  }

  /* -------------------------------------------------------------------------- */
  /*                             Navigation helpers                             */
  /* -------------------------------------------------------------------------- */

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  createNewAccount(): void {
    this.router.navigate(['/register']);
  }

  /* -------------------------------------------------------------------------- */
  /*                             Form field helpers                            */
  /* -------------------------------------------------------------------------- */

  // ✅ Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}