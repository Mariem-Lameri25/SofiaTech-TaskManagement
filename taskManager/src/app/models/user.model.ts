export interface User {
  id_user: number;
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  avatar?: string;
  password?: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}