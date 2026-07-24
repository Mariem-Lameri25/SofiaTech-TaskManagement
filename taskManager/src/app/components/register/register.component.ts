import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  passwordStrength: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
   this.registerForm = this.fb.group({
  firstname: ['', [Validators.required, Validators.minLength(2)]],
  lastname: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
  phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  agreeToTerms: [false, Validators.requiredTrue]
});


    // Watch password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe((value) => {
      this.updatePasswordStrength(value);
    });
  }

  updatePasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    if (password.length < 6) {
      this.passwordStrength = 'weak';
    } else if (password.length < 10) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  onSubmit() {
  if (this.registerForm.valid) {
    const { firstname, lastname, email, phoneNumber, password } = this.registerForm.value;

    const payload = {
      firstname,
      lastname,
      email,
      phoneNumber,
      password
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        console.log('User registered:', res);
        this.router.navigate(['/login']); // ou rediriger vers la page d’accueil
      },
      error: (err) => {
        console.error('Registration failed:', err);
        // Afficher une erreur à l'utilisateur si nécessaire
      }
    });
  } else {
    console.log('Form is invalid');
  }
}



  signInWithGithub() {
    console.log('Sign in with GitHub');
    // Implement GitHub OAuth
  }

  signInWithGoogle() {
    console.log('Sign in with Google');
    // Implement Google OAuth
  }
}
