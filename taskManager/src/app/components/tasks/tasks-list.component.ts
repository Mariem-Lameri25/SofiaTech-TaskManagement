import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';

import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { User } from '../../models/user.model';
import { Project } from '../../models/project.model';

import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.scss'],
})
export class TasksListComponent implements OnInit {
  tasks: Task[] = [];

  users: User[] = [];
  projects: Project[] = [];

  loading = false;
  submitting = false;

  searchTerm = '';
  selectedStatus: TaskStatus | '' = '';
  selectedPriority: TaskPriority | '' = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalTasks = 0;
  totalPages = 0;

  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  // Form validation state
  formErrors: { [key: string]: string } = {};

  labelsInput = ''; // create modal labels input
  editLabelsInput = ''; // edit modal labels input

  newTask: Task = {
    nom: '',
    description: '',
    status: TaskStatus.EN_ATTENTE,
    dateCreation: new Date().toISOString(),
    dateDebut: '',
    dateFin: '',
    priorite: TaskPriority.MOYENNE,
    location: '',
    project: {} as Project,
    createdBy: {} as User,
    assignedTo: {} as User,
    labels: [],
  };

  selectedTask: Task = {} as Task;
  showAddTaskModal = false;
  showEditTaskModal = false;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadUsersAndProjects();
    this.loadTasksPaginated();

    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      // Optionnel si tu veux charger par projet au départ
      // this.loadTasksForProject(+projectId);
    }
  }

  loadUsersAndProjects(): void {
    forkJoin([
      this.userService.getUsers(),
      this.projectService.getProjects()
    ]).subscribe({
      next: ([usersResp, projects]) => {
        // Support paginated user response
        if (usersResp && Array.isArray(usersResp.data)) {
          this.users = usersResp.data;
        } else {
          this.users = usersResp || [];
        }
        this.projects = projects;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs et projets:', err);
        this.showErrorMessage('Erreur lors du chargement des utilisateurs et projets');
      }
    });
  }

  loadTasksPaginated(): void {
    this.loading = true;
    this.taskService.getTasksPaginated(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm || undefined,
      this.selectedStatus || undefined,
      this.selectedPriority || undefined
    ).subscribe({
      next: (response) => {
        this.tasks = response.data;
        this.totalTasks = response.total;
        this.totalPages = Math.ceil(this.totalTasks / this.itemsPerPage);
        this.loading = false;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: (err) => {
        console.error('Erreur chargement tâches paginées', err);
        this.tasks = [];
        this.loading = false;
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  onSearchTermChange(): void {
    this.currentPage = 1;
    this.loadTasksPaginated();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadTasksPaginated();
  }

  onPriorityFilterChange(): void {
    this.currentPage = 1;
    this.loadTasksPaginated();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTasksPaginated();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTasksPaginated();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTasksPaginated();
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.currentPage = 1;
    this.loadTasksPaginated();
  }

  // Méthode pour afficher labels
  getLabelsDisplay(labels: string | string[] | undefined): string | null {
    if (!labels) return null;

    if (typeof labels === 'string') {
      return labels.trim() || null;
    }

    if (Array.isArray(labels) && labels.length > 0) {
      return labels.join(', ');
    }

    return null;
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.newTask.nom?.trim()) {
      this.formErrors['nom'] = 'Le nom est requis';
      isValid = false;
    }
    if (!this.newTask.description?.trim()) {
      this.formErrors['description'] = 'La description est requise';
      isValid = false;
    }
    if (!this.newTask.dateDebut) {
      this.formErrors['dateDebut'] = 'La date de début est requise';
      isValid = false;
    }
    if (!this.newTask.dateFin) {
      this.formErrors['dateFin'] = 'La date de fin est requise';
      isValid = false;
    }
    if (
      this.newTask.dateDebut &&
      this.newTask.dateFin &&
      new Date(this.newTask.dateDebut) >= new Date(this.newTask.dateFin)
    ) {
      this.formErrors['dateFin'] =
        'La date de fin doit être postérieure à la date de début';
      isValid = false;
    }
    if (!this.newTask.location?.trim()) {
      this.formErrors['location'] = 'Le lieu est requis';
      isValid = false;
    }
    const projectId = Number(this.newTask.project?.id_projet);
    if (!projectId || projectId === 0 || isNaN(projectId)) {
      this.formErrors['projectId'] = 'Veuillez sélectionner un projet';
      isValid = false;
    }
    const assignedToId = Number(this.newTask.assignedTo?.id_user);
    if (!assignedToId || assignedToId === 0 || isNaN(assignedToId)) {
      this.formErrors['assignedToId'] = 'Veuillez assigner la tâche à quelqu\'un';
      isValid = false;
    }

    return isValid;
  }

  createTask(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.labelsInput.trim()) {
      this.newTask.labels = this.labelsInput
        .split(',')
        .map(label => label.trim())
        .filter(label => label.length > 0);
    } else {
      this.newTask.labels = [];
    }

    const taskToSend = {
      nom: this.newTask.nom,
      description: this.newTask.description,
      status: this.newTask.status,
      dateCreation: new Date().toISOString().split('.')[0] + 'Z',
      dateDebut: this.newTask.dateDebut,
      dateFin: this.newTask.dateFin,
      priorite: this.newTask.priorite,
      location: this.newTask.location,
      projectId: Number(this.newTask.project.id_projet),
      assignedToId: Number(this.newTask.assignedTo.id_user),
      labels: this.newTask.labels
    };

    this.submitting = true;
    this.taskService.createTask(taskToSend).subscribe({
      next: () => {
        this.resetForm();
        this.showAddTaskModal = false;
        this.submitting = false;
        this.loadTasksPaginated();
        this.showSuccessMessage('Tâche créée avec succès');
      },
      error: (err) => {
        console.error('Erreur création tâche:', err);
        this.submitting = false;
        this.showErrorMessage('Erreur lors de la création de la tâche');
      },
    });
  }

  deleteTask(id: number): void {
    Swal.fire({
      title: 'Supprimer la tâche ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(id).subscribe({
          next: () => {
            Swal.fire('Supprimé', 'La tâche a été supprimée.', 'success');
            this.loadTasksPaginated();
          },
          error: (err) => {
            console.error('Erreur suppression tâche :', err);
            Swal.fire('Erreur', 'Échec suppression tâche.', 'error');
          },
        });
      }
    });
  }

  resetForm(): void {
    this.newTask = {
      nom: '',
      description: '',
      status: TaskStatus.EN_ATTENTE,
      dateCreation: new Date().toISOString(),
      dateDebut: '',
      dateFin: '',
      priorite: TaskPriority.MOYENNE,
      location: '',
      project: { id_projet: 0 } as Project,
      createdBy: { id_user: 0 } as User,
      assignedTo: { id_user: 0 } as User,
      labels: [],
    };
    this.formErrors = {};
    this.labelsInput = '';
  }

  openCreateModal(): void {
    this.resetForm();
    this.showAddTaskModal = true;
  }

  closeCreateModal(): void {
    this.showAddTaskModal = false;
    this.resetForm();
  }

  openEditModal(task: Task): void {
    if (this.users.length === 0 || this.projects.length === 0) {
      forkJoin([
        this.userService.getUsers(),
        this.projectService.getProjects(),
      ]).subscribe(([users, projects]) => {
        this.users = users;
        this.projects = projects;
        this.setSelectedTask(task);
      });
    } else {
      this.setSelectedTask(task);
    }
  }

  private setSelectedTask(task: Task): void {
    this.selectedTask = {
      ...task,
      project:
        this.projects.find((p) => p.id_projet === task.project?.id_projet) ||
        ({} as Project),
      createdBy:
        this.users.find((u) => u.id_user === task.createdBy?.id_user) ||
        ({} as User),
      assignedTo:
        this.users.find((u) => u.id_user === task.assignedTo?.id_user) ||
        ({} as User),
    };

    if (task.labels) {
      if (Array.isArray(task.labels)) {
        this.editLabelsInput = task.labels.join(', ');
      } else if (typeof task.labels === 'string') {
        this.editLabelsInput = task.labels;
      } else {
        this.editLabelsInput = '';
      }
    } else {
      this.editLabelsInput = '';
    }

    this.showEditTaskModal = true;
  }

  closeEditModal(): void {
    this.showEditTaskModal = false;
    this.selectedTask = {} as Task;
    this.editLabelsInput = '';
  }

  updateTask(task: Task): void {
    if (!task.id_tache) {
      console.error('Task ID is required for update');
      return;
    }

    if (this.editLabelsInput.trim()) {
      task.labels = this.editLabelsInput
        .split(',')
        .map(label => label.trim())
        .filter(label => label.length > 0);
    } else {
      task.labels = [];
    }

    this.taskService.updateTask(task.id_tache.toString(), task).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(
          (t) => t.id_tache === updatedTask.id_tache
        );
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.showSuccessMessage('Tâche mise à jour avec succès');
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Erreur mise à jour tâche :', err);
        this.showErrorMessage('Erreur lors de la mise à jour de la tâche');
      },
    });
  }

  // UI helper messages
  private showSuccessMessage(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
      timer: 3000,
      showConfirmButton: false,
    });
  }

  private showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
    });
  }
}
