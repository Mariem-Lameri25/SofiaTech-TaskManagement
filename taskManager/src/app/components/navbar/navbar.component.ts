import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  username = 'Utilisateur';
  profileImage = 'assets/img/profile.jpg';
  notificationCount = 0;
  notifications: Notification[] = [];
  showNotifications = false;
  currentUser: any = null;

  // Pagination
  page = 1;
  lastPage = 1;
  limit = 5;
  loading = false;

  // Toggle behavior: true = use Prev/Next buttons; false = infinite scroll append
  usePagingButtons = true;

  private destroy$ = new Subject<void>();
  private sessionInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        console.log('[Navbar] Utilisateur récupéré :', user);
        if (user) {
          this.currentUser = user;
          this.username = `${user.firstname} ${user.lastname}`;
          this.profileImage = user.avatar ?? 'assets/img/profile.jpg';
          // Force change detection for immediate UI update
          this.cdr.detectChanges();
          // load first page
          this.page = 1;
          this.loadNotifications();
        }
      });
    // Session expiration check every minute
    this.sessionInterval = setInterval(() => {
      if (!this.authService.isLoggedIn()) {
        this.onLogout();
      }
    }, 60 * 1000); // check every 1 minute
  }

 loadNotifications(reset = false): void {
  if (!this.currentUser) {
    console.warn('[Navbar] currentUser manquant, impossible de charger les notifications');
    return;
  }

  if (reset) {
    this.page = 1;
    this.notifications = []; 
    if (!this.usePagingButtons) this.notifications = [];
  }

  if (this.loading) return;
  if (!reset && this.page > this.lastPage) return;

  this.loading = true;
  console.log(`[Navbar] fetch notifications page=${this.page} limit=${this.limit}`);

  this.notificationService
    .getUserNotifications({
      isRead: false,
      page: this.page,
      limit: this.limit,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        console.log('[Navbar] raw API response:', res);

        // Ici on sait que res correspond au backend NestJS
        const { data, total, lastPage } = res;

        if (this.usePagingButtons) {
          this.notifications = data;
        } else {
          this.notifications = reset ? data : [...this.notifications, ...data];
        }

        this.notificationCount = total;
        this.lastPage = lastPage;
        console.log(`[Navbar] page=${this.page} lastPage=${this.lastPage} total=${this.notificationCount}`);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Navbar] erreur getUserNotifications', err);
        this.loading = false;
      },
    });
}



  // Utilisé par le scroll event (si infinite scroll activé)
  onScrollEvent(event: any): void {
    if (this.usePagingButtons) return; // si on utilise boutons, ignore le scroll

    const el = event.target as HTMLElement;
    const threshold = 20; // px avant la fin
    const atBottom =
      el.scrollHeight - el.scrollTop <= el.clientHeight + threshold;
    if (atBottom && !this.loading && this.page < this.lastPage) {
      this.page++;
      this.loadNotifications();
    }
  }

  // Pagination buttons (si usePagingButtons = true)
  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadNotifications();
    }
  }

  nextPage(): void {
    if (this.page < this.lastPage) {
      this.page++;
      this.loadNotifications();
    }
  }

  onNotificationClick(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      // recharge la première page à l'ouverture
      this.page = 1;
      this.loadNotifications();
    }
  }

  markAsRead(notificationId: number): void {
  this.notificationService.markAsRead(notificationId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        // Retire la notification localement pour effet immédiat
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.notificationCount = Math.max(0, this.notificationCount - 1);
        this.cdr.detectChanges();
        // Recharge la liste pour synchroniser avec le backend
        setTimeout(() => this.loadNotifications(), 200);
      },
      error: (err) => console.error('[Navbar] markAsRead error', err),
    });
}





  markAllAsRead(): void {
    // Option simple : marquer chaque notifications non lues
    const unread = this.notifications.filter((n) => !n.isRead);
    let completed = 0;
    if (unread.length === 0) {
      this.loadNotifications(true);
      return;
    }
    unread.forEach((n) => {
      this.notificationService
        .markAsRead(n.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            completed++;
            if (completed === unread.length) {
              // Une fois toutes les notifications marquées, recharge
              this.loadNotifications(true);
              this.notificationCount = Math.max(0, this.notificationCount - unread.length);
              this.cdr.detectChanges();
            }
          },
          error: () => {
            completed++;
            if (completed === unread.length) {
              this.loadNotifications(true);
              this.cdr.detectChanges();
            }
          }
        });
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    if (this.currentUser)
      this.router.navigate(['/user-profile', this.currentUser.id_user]);
  }

  ngOnDestroy(): void {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
