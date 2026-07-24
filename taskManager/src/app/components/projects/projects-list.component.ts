import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';

import {
  Project,
  CreateProject,
  ProjectStatus,
  UpdateProject,
} from '../../models/project.model';
import { ProjectUserRole } from '../../models/project-user-role.enum';
import { User } from '../../models/user.model';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
})
export class ProjectsListComponent implements OnInit {
  projects: Project[] = [];
  users: User[] = [];
managers: User[] = []; // ✅ Ajouté

  teamMembers: { userId: number; roleProjet: ProjectUserRole }[] = [];
  editTeamMembers: { userId: number; roleProjet: ProjectUserRole }[] = [];

  newProject: CreateProject = {
    nom: '',
    nomClient: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    dateCreation: new Date().toISOString(),
    status: ProjectStatus.ACTIVE,
    abreviation: '',
    managerId: '',
    projectUsers: [],
  };

  projectStatuses = Object.values(ProjectStatus);
  projectRoles = Object.values(ProjectUserRole);

  loading = false;
  showAddProjectModal = false;
  showEditModal = false;
  selectedProject: Project | null = null;

  // Recherche & Filtres
  searchTerm: string = '';
  selectedStatus: ProjectStatus | '' = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private cdr: ChangeDetectorRef, // Ajoutez cette injection
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.loading = true;
    forkJoin({
      projects: this.projectService.getProjects(),
      users: this.userService.getUsers(1, 100)
    }).subscribe({
      next: (data: any) => {
        console.log('Données chargées :', data);

        this.projects = data.projects || [];
        // Support paginated user response
        if (data.users && Array.isArray(data.users.data)) {
          this.users = data.users.data;
        } else {
          this.users = data.users || [];
        }

        // ✅ On filtre la liste des managers
        this.managers = this.users.filter(u => u.role === 'MANAGER');

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement données :', err);
        this.projects = [];
        this.users = [];
        this.managers = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addTeamMember(): void {
    this.teamMembers.push({ userId: 0, roleProjet: ProjectUserRole.DEV });
  }

  removeTeamMember(index: number): void {
    this.teamMembers.splice(index, 1);
  }

  addEditTeamMember(): void {
    this.editTeamMembers.push({ userId: 0, roleProjet: ProjectUserRole.DEV });
  }

  removeEditTeamMember(index: number): void {
    this.editTeamMembers.splice(index, 1);
  }

  createProject(): void {
    this.newProject.projectUsers = this.teamMembers.map((member) => ({
      userId: Number(member.userId),
      roleProjet: member.roleProjet,
    }));

    this.projectService.createProject(this.newProject).subscribe({
      next: () => {
        this.resetForm();
        this.showAddProjectModal = false;
        this.refreshData();
      },
      error: (err) => console.error('Erreur création projet :', err),
    });
  }

  resetForm(): void {
    this.newProject = {
      nom: '',
      nomClient: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      dateCreation: new Date().toISOString(),
      status: ProjectStatus.ACTIVE,
      abreviation: '',
      managerId: '',
      projectUsers: [],
    };
    this.teamMembers = [];
  }

  openEditModal(project: Project): void {
    this.selectedProject = { ...project };
    this.editTeamMembers =
      project.projectUsers?.map((pu) => ({
        userId: pu.utilisateur.id_user,
        roleProjet: pu.roleProjet,
      })) || [];
    this.showEditModal = true;
  }

  updateProject(): void {
    if (!this.selectedProject) return;

    const updatePayload: UpdateProject = {
      nomClient: this.selectedProject.nomClient,
      nom: this.selectedProject.nom,
      description: this.selectedProject.description,
      dateDebut: this.selectedProject.dateDebut,
      dateFin: this.selectedProject.dateFin,
      dateCreation: this.selectedProject.dateCreation,
      status: this.selectedProject.status,
      abreviation: this.selectedProject.abreviation,
      managerId: this.selectedProject.managerId,
      projectUsers: this.editTeamMembers.map((member) => ({
        userId: Number(member.userId),
        roleProjet: member.roleProjet,
      })),
    };

    this.projectService
      .updateProject(this.selectedProject.id_projet, updatePayload)
      .subscribe({
        next: () => {
          this.showEditModal = false;
          this.selectedProject = null;
          this.editTeamMembers = [];
          this.refreshData();
        },
        error: (err) => console.error('Erreur mise à jour projet :', err),
      });
  }

  deleteProject(project: Project): void {
    Swal.fire({
      title: `Supprimer ${project.nom} ?`,
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteProject(project.id_projet).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Projet supprimé',
              timer: 1500,
              showConfirmButton: false,
            });
            this.refreshData();
          },
          error: (err) => {
            console.error('Erreur suppression projet :', err);
            Swal.fire('Erreur', 'La suppression a échoué.', 'error');
          },
        });
      }
    });
  }

  get filteredProjects(): Project[] {
    let filtered = this.projects;

    // Recherche texte (nom, nomClient, abreviation)
    if (this.searchTerm) {
      const lower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.nom?.toLowerCase().includes(lower) ||
          project.nomClient?.toLowerCase().includes(lower) ||
          project.abreviation?.toLowerCase().includes(lower)
      );
    }

    // Filtrage par status
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (project) => project.status === this.selectedStatus
      );
    }

    return filtered;
  }

  get paginatedProjects(): Project[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProjects.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  // Méthode pour rediriger vers la liste des tâches d’un projet
  goToProjectTasks(projectId: number) {
    this.router.navigate(['/projects', projectId, 'tasks']);
  }
}
