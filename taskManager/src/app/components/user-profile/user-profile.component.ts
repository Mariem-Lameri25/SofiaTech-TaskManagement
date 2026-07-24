import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showSuccessMessage = false;
  uploadProgress = 0;
  userId: number = 0;

  constructor() {
    this.profileForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['']
    });
  }

  ngOnInit() {
    // Load connected user first
    this.authService.getCurrentUser().subscribe({
      next: (me) => {
        this.currentUser = me;
        this.route.params.subscribe(params => {
          this.userId = +params['id'];
          if (this.userId) {
            this.loadUser();
          } else {
            this.errorMessage = 'User ID is required';
          }
        });
      },
      error: () => {
        this.currentUser = null;
        this.errorMessage = 'Unable to load current user.';
      }
    });
  }

  loadUser() {
    if (!this.userId) {
      this.errorMessage = 'User ID is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Loading user with ID:', this.userId);

    forkJoin({
      user: this.userService.getUserById(this.userId),
      // You can add more related data here if needed
      // permissions: this.userService.getUserPermissions(this.userId),
    }).subscribe({
      next: (data) => {
        console.log('Données chargées :', data);

        // Utiliser setTimeout pour s'assurer que la mise à jour se fait après le cycle actuel
        setTimeout(() => {
          this.user = data.user || null;
          if (this.user) {
            this.populateForm(this.user);
          }
          this.isLoading = false;
          this.cdr.detectChanges();

          console.log('User après timeout:', this.user);
        }, 0);
      },
      error: (err) => {
        console.error('Erreur chargement données :', err);
        
        setTimeout(() => {
          this.errorMessage = 'Failed to load user profile. Please try again.';
          this.isLoading = false;
          this.user = null;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  populateForm(user: User) {
    this.profileForm.patchValue({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phoneNumber: user.phoneNumber
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.user) {
      this.populateForm(this.user);
      // If admin and viewing another user, disable password field
      if (this.currentUser && this.currentUser.role === 'ADMIN' && this.currentUser.id_user !== this.user.id_user) {
        this.profileForm.get('password')?.disable();
      } else {
        this.profileForm.get('password')?.enable();
      }
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    if (this.user) {
      this.populateForm(this.user);
    }
    this.profileForm.get('password')?.setValue('');
  }

  onSubmit() {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      
      const updateData: Partial<User> = {
        firstname: this.profileForm.value.firstname,
        lastname: this.profileForm.value.lastname,
        email: this.profileForm.value.email,
        phoneNumber: this.profileForm.value.phoneNumber
      };

      // Only include password if it's provided
      if (this.profileForm.value.password) {
        updateData.password = this.profileForm.value.password;
      }

      this.userService.updateUser(this.user.id_user, updateData).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isEditMode = false;
          this.isLoading = false;
          this.cdr.detectChanges();
          this.showSuccess('Profile updated successfully!');
          this.profileForm.get('password')?.setValue('');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update profile. Please try again.';
          console.error('Error updating user:', error);
        }
      });
    }
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.user) {
      this.uploadProgress = 10;
      
      this.userService.updateUserAvatar(this.user.id_user, file).subscribe({
        next: (response) => {
          this.uploadProgress = 100;
          if (this.user && response.avatar) {
            this.user.avatar = response.avatar;
            this.showSuccess('Avatar updated successfully!');
          }
          // Reset progress after a delay
          setTimeout(() => {
            this.uploadProgress = 0;
          }, 1000);
        },
        error: (error) => {
          this.uploadProgress = 0;
          this.errorMessage = 'Failed to upload avatar. Please try again.';
          console.error('Error uploading avatar:', error);
        }
      });
    }
  }

  onImageError(event: any) {
    event.target.src = '/assets/default-avatar.png';
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessMessage = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}