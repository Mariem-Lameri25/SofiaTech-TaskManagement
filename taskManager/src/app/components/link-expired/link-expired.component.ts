import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link-expired',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-page">
      <h1>⚠️ Lien invalide ou déjà utilisé</h1>
      <p>Le lien de réinitialisation de mot de passe est expiré ou a déjà été utilisé.</p>
      <a routerLink="/forgot-password">Demander un nouveau lien</a>
    </div>
  `,
  styles: [`
    .error-page {
      text-align: center;
      margin-top: 50px;
    }
  `]
})
export class LinkExpiredComponent {}
