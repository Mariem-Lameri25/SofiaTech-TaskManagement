import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl ='http://localhost:3000/tasks'; 

  constructor(private http: HttpClient) {}

 /**
   * Récupère les tâches avec pagination, recherche et filtre depuis le backend
   */
  getTasksPaginated(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: TaskStatus,
  priority?: TaskPriority
): Observable<{ data: Task[]; total: number; page: number; limit: number }> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (search) {
    params = params.set('search', search);
  }

  if (status) {
    params = params.set('status', status);
  }

  if (priority) {
    params = params.set('priority', priority);
  }

  return this.http.get<{ data: Task[]; total: number; page: number; limit: number }>(
    this.apiUrl,
    { params }
  );
}


  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: any): Observable<Task> {
  return this.http.post<Task>(this.apiUrl, task);
}


  updateTask(id: number | string, task: Partial<Task>): Observable<Task> {
  return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
}


  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTasksByProjectId(projectId: number): Observable<Task[]> {
  return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
}

updateTaskStatus(taskId: number, newStatus: TaskStatus): Observable<Task> {
  return this.http.patch<Task>(`${this.apiUrl}/${taskId}`, {
    status: newStatus
  });
}




}
