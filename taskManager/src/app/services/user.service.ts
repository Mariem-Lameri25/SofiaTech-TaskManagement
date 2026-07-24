import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

   // Retourne toujours un tableau User[] quel que soit le format renvoyé par l'API
  getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    if (role && role.trim() !== '') {
      params = params.set('role', role.trim());
    }

    if (sortBy && sortBy.trim() !== '') {
      params = params.set('sortBy', sortBy.trim());
    }

    if (sortOrder && (sortOrder === 'ASC' || sortOrder === 'DESC')) {
      params = params.set('sortOrder', sortOrder);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }


  // Récupérer un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouvel utilisateur
  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  // Mettre à jour un utilisateur (données générales)
  updateUser(id: number, updateData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, updateData);
  }

  // Mettre à jour uniquement le rôle d’un utilisateur
  updateUserRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role });
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

   // Méthode pour mettre à jour l'avatar de l'utilisateur
  updateUserAvatar(id: number, avatarFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', avatarFile, avatarFile.name);

    return this.http.patch(`${this.apiUrl}/${id}/avatar`, formData);
  }

}
