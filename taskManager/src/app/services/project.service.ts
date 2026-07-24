import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Project,
  CreateProject,
  UpdateProject,
  ProjectStatus,
} from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:3000/projects';

  constructor(private http: HttpClient) {}

  // Récupérer tous les projets
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  // Récupérer un projet par ID
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau projet - using specific CreateProject interface
  createProject(projectData: CreateProject): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, projectData);
  }

  // Mettre à jour un projet - using specific UpdateProject interface
  updateProject(id: number, updateData: UpdateProject): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, updateData);
  }

  // Supprimer un projet

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Optional: Add method to get projects by manager
  getProjectsByManager(managerId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}?managerId=${managerId}`);
  }

  // Optional: Add method to get projects by status
  getProjectsByStatus(status: ProjectStatus): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}?status=${status}`);
  }

  getMyProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/my-projects`);
  }

}
