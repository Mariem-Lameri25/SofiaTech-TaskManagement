export interface Notification {
  id: number;
  contenu: string;
  isRead: boolean;
  dateCreation: string; // ou Date si tu veux le parser
  user: {
    id_user: number;
    email: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    avatar?: string;
    role: string;
  };
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  lastPage: number;
}
