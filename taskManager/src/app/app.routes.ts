import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { ProjectTasksComponent } from './components/project-tasks/project-tasks.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { LinkExpiredComponent } from './components/link-expired/link-expired.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
       //{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/users/users.component').then(
            (m) => m.UsersComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./components/projects/projects-list.component').then(
            (m) => m.ProjectsListComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'my-projects',
        loadComponent: () =>
          import('./components/project-card/project-card.component').then(
            (m) => m.ProjectCardComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./components/tasks/tasks-list.component').then(
            (m) => m.TasksListComponent
          ),
        canActivate: [AuthGuard],
      },
      { path: 'tasks/project/:id', component: ProjectTasksComponent, canActivate: [AuthGuard] },
      {
        path: 'user-profile',
        loadComponent: () =>
          import('./components/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'user-profile/:id',
        loadComponent: () =>
          import('./components/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
        canActivate: [AuthGuard],
      },
      // page d'accueil principale avec sidebar
      // tu peux ajouter d'autres routes ici (ex : tasks, projects, etc.)
      // Leave this empty for now; future routes go here
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'dashboard', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      {
        path: 'reset-password/:token',
        loadComponent: () =>
          import('./components/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      { path: 'link-expired', component: LinkExpiredComponent },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
