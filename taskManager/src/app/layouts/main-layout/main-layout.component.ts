import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <!-- Fixed sidebar -->
    <app-sidebar></app-sidebar>
    
    <!-- Fixed navbar -->
    <app-navbar></app-navbar>
    
    <!-- Main content area with proper margins -->
    <div class="main-content-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-content-wrapper {
      margin-left: 260px;
      margin-top: 80px;
      padding: 2rem;
      min-height: calc(100vh - 80px);
      background-color: #f8f9fa;
    }

    @media (max-width: 1200px) {
      .main-content-wrapper {
        margin-left: 220px;
      }
    }

    @media (max-width: 992px) {
      .main-content-wrapper {
        margin-left: 0;
        padding: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent {}