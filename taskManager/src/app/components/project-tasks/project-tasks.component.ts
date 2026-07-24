import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { RouterModule } from '@angular/router';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  templateUrl: './project-tasks.component.html',
  styleUrls: ['./project-tasks.component.scss'],
})
export class ProjectTasksComponent implements OnInit {
  projectId!: number;
  allTasks: Task[] = [];
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  loading = true;
  error: string | null = null;
project: Project | null = null;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTasks();
    this.projectService.getProjectById(this.projectId).subscribe({
  next: (proj) => {
    this.project = proj;
  },
  error: (err) => {
    console.error("Erreur lors de la récupération du projet :", err);
  }
});

  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;
    this.taskService.getTasksByProjectId(this.projectId).subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.organizeTasks();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error =
          'Erreur lors du chargement des tâches: ' + (err.message || err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  organizeTasks(): void {
    this.todoTasks = this.allTasks.filter(
      (task) => task.status === TaskStatus.EN_ATTENTE
    );
    this.inProgressTasks = this.allTasks.filter(
      (task) => task.status === TaskStatus.EN_COURS
    );
    this.doneTasks = this.allTasks.filter(
      (task) => task.status === TaskStatus.TERMINE
    );
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const task = event.container.data[event.currentIndex];
      const newStatus = this.getContainerStatus(event.container.id);
      this.updateTaskStatus(task, newStatus);
    }
  }

  getContainerStatus(containerId: string): TaskStatus {
    switch (containerId) {
      case 'todo-drop-list':
        return TaskStatus.EN_ATTENTE;
      case 'inprogress-drop-list':
        return TaskStatus.EN_COURS;
      case 'done-drop-list':
        return TaskStatus.TERMINE;
      default:
        return TaskStatus.EN_ATTENTE;
    }
  }

 updateTaskStatus(task: Task, newStatus: TaskStatus): void {
  this.taskService.updateTaskStatus(task.id_tache!, newStatus).subscribe({
    next: (updatedTask) => {
      // Soit tu modifies la tâche locale
      task.status = updatedTask.status;

      // Puis tu recharges la liste complète (plus sûr pour l'affichage)
      this.loadTasks();
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour du statut :', err);
    }
  });
}


  getTaskId(index: number, task: Task): any {
    return task.id_tache || index;
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'ELEVEE':
        return 'priority-high';
      case 'MOYENNE':
        return 'priority-medium';
      case 'FAIBLE':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'ELEVEE':
        return 'Élevée';
      case 'MOYENNE':
        return 'Moyenne';
      case 'FAIBLE':
        return 'Faible';
      default:
        return 'Moyenne';
    }
  }
}
