import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class UsersComponent implements OnInit {
  // Helper for pagination rendering
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  users: User[] = [];
  searchTerm: string = ''; // Recherche globale (nom, email, téléphone)
  roleFilter: string = ''; // Filtre rôle
  sortBy: string = '';
  sortOrder: 'ASC' | 'DESC' = 'DESC';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalUsers: number = 0;

  showAddUserModal: boolean = false;
  newUser: Partial<User> = {
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: undefined,
  };

  @ViewChild('addUserForm') addUserForm!: NgForm;

  editUserModalVisible: boolean = false;
  selectedUserToEdit: Partial<User> = {};
  loading = false;
  @ViewChild('editUserForm') editUserForm!: NgForm;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  viewUser(id: number): void {
    this.router.navigate(['/user-profile', id]);
  }

  // Chargement depuis le backend avec pagination, recherche et filtre
  loadUsers(): void {
    this.loading = true;
    this.userService
      .getUsers(
        this.currentPage,
        this.itemsPerPage,
        this.searchTerm,
        this.roleFilter,
        this.sortBy,
        this.sortOrder
      )
      .subscribe({
        next: (res: any) => {
          try {
            if (Array.isArray(res)) {
              this.users = res;
              this.totalUsers = res.length;
            } else if (res && Array.isArray(res.data)) {
              this.users = res.data;
              this.totalUsers = res.total || 0;
              if (res.limit) {
                this.itemsPerPage = res.limit;
              }
            } else {
              this.users = [];
              this.totalUsers = 0;
              Swal.fire('Erreur', 'Réponse du serveur inattendue.', 'error');
            }
            console.log('Loaded users for page', this.currentPage, this.users);
          } catch (e) {
            this.users = [];
            this.totalUsers = 0;
            Swal.fire('Erreur', 'Erreur lors du traitement des utilisateurs.', 'error');
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur chargement utilisateurs :', err);
          this.loading = false;
          this.users = [];
          Swal.fire('Erreur', "Impossible de charger les utilisateurs.", 'error');
          this.cdr.detectChanges();
        },
      });
  }

  // Pages totales
  get totalPages(): number {
    const pages = Math.ceil(this.totalUsers / this.itemsPerPage);
    return pages > 0 ? pages : 1;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    this.loadUsers();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
    this.loadUsers();
  }

  // Déclenché sur changement recherche, filtre ou tri
  onSearchOrFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  // Changement du tri
  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'ASC';
    }
    this.loadUsers();
  }

  // Ajouter utilisateur
  openAddUserModal(): void {
    this.showAddUserModal = true;
    this.newUser = {
      firstname: '',
      lastname: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: undefined,
    };
  }

  addUser(): void {
    if (
      this.newUser.firstname &&
      this.newUser.lastname &&
      this.newUser.email &&
      this.newUser.phoneNumber &&
      this.newUser.password &&
      this.newUser.role
    ) {
      this.userService.createUser(this.newUser).subscribe({
        next: () => {
          this.showAddUserModal = false;
          this.newUser = {};
          if (this.addUserForm) {
            this.addUserForm.resetForm();
          }
          this.loadUsers();
        },
        error: () => {
          Swal.fire('Erreur', "Erreur lors de l'ajout de l'utilisateur.", 'error');
        },
      });
    } else {
      Swal.fire('Attention', 'Tous les champs sont obligatoires.', 'warning');
    }
  }

  // Supprimer utilisateur
  deleteUser(user: User): void {
    Swal.fire({
      title: `Supprimer ${user.firstname} ${user.lastname} ?`,
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id_user).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire({
              icon: 'success',
              title: 'Utilisateur supprimé',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: () => {
            Swal.fire('Erreur', 'La suppression a échoué.', 'error');
          },
        });
      }
    });
  }

  // Édition utilisateur
  openEditUserModal(user: User): void {
    this.selectedUserToEdit = { ...user };
    this.editUserModalVisible = true;
  }

  updateUser(): void {
    if (
      this.selectedUserToEdit.id_user &&
      this.selectedUserToEdit.firstname &&
      this.selectedUserToEdit.lastname &&
      this.selectedUserToEdit.email &&
      this.selectedUserToEdit.phoneNumber &&
      this.selectedUserToEdit.role
    ) {
      const id = this.selectedUserToEdit.id_user;
      // Find the original user to compare role
      const originalUser = this.users.find(u => u.id_user === id);
      const roleChanged = originalUser && originalUser.role !== this.selectedUserToEdit.role;
      const update$ = roleChanged
        ? this.userService.updateUserRole(id, this.selectedUserToEdit.role as string)
        : this.userService.updateUser(id, this.selectedUserToEdit);
      update$.subscribe({
        next: () => {
          this.editUserModalVisible = false;
          this.selectedUserToEdit = {};
          if (this.editUserForm) {
            this.editUserForm.resetForm();
          }
          this.loadUsers();
          Swal.fire({
            icon: 'success',
            title: 'Utilisateur mis à jour',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: () => {
          Swal.fire('Erreur', 'Erreur lors de la mise à jour.', 'error');
        },
      });
    } else {
      Swal.fire('Attention', 'Tous les champs sont obligatoires.', 'warning');
    }
  }
}
