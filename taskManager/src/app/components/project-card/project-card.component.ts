import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  // Use default change detection for instant updates
  // (Angular uses Default by default, but this makes it explicit)
  // If you previously set OnPush, this will override it
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProjectCardComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('[ProjectCardComponent] ngOnInit - starting to load user projects');
    this.loadMyProjects();
  }

  /**
   * Load only the user's own projects (assigned or managed)
   */
  loadMyProjects(): void {
    this.isLoading = true;
    console.log('[ProjectCardComponent] Calling ProjectService.getMyProjects()');

    this.projectService.getMyProjects().subscribe({
      next: (data) => {
        console.log('[ProjectCardComponent] API response:', data);
        if (!Array.isArray(data)) {
          this.errorMessage = 'Le backend n\'a pas renvoyé un tableau de projets.';
          this.projects = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
        this.projects = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[ProjectCardComponent] Error loading projects:', err);
        this.errorMessage = 'Erreur lors du chargement de mes projets.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Load all projects
   */
 

  /**
   * Get the CSS class for a given project status
   */
  getStatusClass(status: ProjectStatus | string): string {
    switch (status) {
      case ProjectStatus.ACTIVE:
      case 'ACTIVE':
        return 'status-active';
      case ProjectStatus.PAUSED:
      case 'PAUSED':
        return 'status-paused';
      case ProjectStatus.COMPLETED:
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  }

  /**
   * Edit project handler (to be implemented)
   */
  editProject(id: number): void {
    console.log('[ProjectCardComponent] Edit project clicked:', id);
    // TODO: Implement navigation or modal
  }

  /**
   * Delete project handler
   */
  deleteProject(id: number): void {
    console.log('[ProjectCardComponent] Delete project clicked:', id);
    if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          console.log('[ProjectCardComponent] Project deleted successfully:', id);
          this.projects = this.projects.filter(p => p.id_projet !== id);
        },
        error: (err) => {
          console.error('[ProjectCardComponent] Error deleting project:', err);
          alert('Erreur lors de la suppression du projet');
        },
      });
    }
  }
}
