import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule, BaseChartDirective],
})
export class DashboardComponent implements OnInit {
  @ViewChild('doughnutChart', { static: false }) doughnutChart?: BaseChartDirective;
  @ViewChild('barChart', { static: false }) barChart?: BaseChartDirective;
  projectCount = 0;
  taskCount = 0;
  userCount = 0;
  unreadNotificationCount = 0;
  recentProjects: any[] = [];
  recentTasks: any[] = [];
  recentUsers: any[] = [];

  // Loading states
  loadingProjects = true;
  loadingTasks = true;
  loadingUsers = true;

  // Error states
  errorProjects = '';
  errorTasks = '';
  errorUsers = '';

  // Chart.js configs
  barChartData = {
    labels: ['Projects', 'Tasks', 'Users'],
    datasets: [
      {
        label: 'Count',
        data: [0, 0, 0],
        backgroundColor: ['#5e72e4', '#2dce89', '#11cdef'],
        borderRadius: 8,
        maxBarThickness: 40
      }
    ]
  };
  barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Overview' }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } }
    }
  };

  doughnutChartData = {
    labels: ['Open', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Tasks',
        data: [0, 0, 0],
        backgroundColor: ['#fb6340', '#11cdef', '#2dce89'],
        borderWidth: 2
      }
    ]
  };
  doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Task Status' }
    }
  };

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Fetch project count and recent projects
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projectCount = projects.length;
        this.recentProjects = projects.slice(-5).reverse();
        this.barChartData.datasets[0].data[0] = this.projectCount;
        this.loadingProjects = false;
        setTimeout(() => this.barChart?.update?.(), 0);
      },
      error: (err) => {
        this.errorProjects = 'Failed to load projects.';
        this.loadingProjects = false;
      }
    });

    // Fetch task count and recent tasks
    this.taskService.getTasksPaginated(1, 5).subscribe({
      next: (res) => {
        this.taskCount = res.total;
        this.recentTasks = res.data;
        this.barChartData.datasets[0].data[1] = this.taskCount;
        // Count task statuses for doughnut chart
        const statusCounts = { Open: 0, 'In Progress': 0, Done: 0 };
        (res.data || []).forEach((t: any) => {
          const status = t.status as keyof typeof statusCounts;
          if (statusCounts[status] !== undefined) statusCounts[status]++;
        });
        // If all values are zero, set a fallback value to show the chart
        const donutData = [statusCounts.Open, statusCounts['In Progress'], statusCounts.Done];
        if (donutData.every(v => v === 0)) {
          this.doughnutChartData.datasets[0].data = [1, 0, 0]; // fallback to show empty chart
        } else {
          this.doughnutChartData.datasets[0].data = donutData;
        }
        this.loadingTasks = false;
        setTimeout(() => this.doughnutChart?.update?.(), 0);
      },
      error: (err) => {
        this.errorTasks = 'Failed to load tasks.';
        this.loadingTasks = false;
      }
    });

    // Fetch user count and recent users
    this.userService.getUsers(1, 5).subscribe({
      next: (res) => {
        this.userCount = res.total || (res.data ? res.data.length : 0);
        this.recentUsers = res.data || res;
        this.barChartData.datasets[0].data[2] = this.userCount;
        this.loadingUsers = false;
      },
      error: (err) => {
        this.errorUsers = 'Failed to load users.';
        this.loadingUsers = false;
      }
    });

    // Fetch unread notification count
    this.notificationService.getUserNotifications({ isRead: false, page: 1, limit: 1 }).subscribe((res) => {
      this.unreadNotificationCount = res.total;
    });
  }
}
