import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedNotifications } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  // ✅ Appel backend avec paramètres bien typés
  getUserNotifications(params?: { isRead?: boolean; page?: number; limit?: number }): Observable<PaginatedNotifications> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.isRead !== undefined) {
        httpParams = httpParams.set('isRead', String(params.isRead)); // boolean → string pour HTTP
      }
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', String(params.page));
      }
      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', String(params.limit));
      }
    }

    return this.http.get<PaginatedNotifications>(this.apiUrl, { params: httpParams });
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  deleteNotification(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
