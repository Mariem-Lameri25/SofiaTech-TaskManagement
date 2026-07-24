
// src/mailer/mailer.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendWelcomeEmail(email: string, password: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue sur Task Manager',
      html: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0056b3;">Bienvenue sur Task Manager !</h2>
        <p>Bonjour,</p>
        <p>Votre compte a été créé avec succès. Voici vos identifiants de connexion :</p>
        <ul>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Mot de passe :</strong> ${password}</li>
        </ul>
        <p>Vous pouvez vous connecter à l'application avec ces informations.</p>
        <p style="font-size: 0.9em; color: #777;">Nous vous recommandons de changer votre mot de passe après la première connexion.</p>
        <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #999;">&copy; 2025 Task Manager. Tous droits réservés.</p>
      </div>`
    });
  }
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(email: string, token: string) {
    const url = `http://localhost:4200/#/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Réinitialisation de mot de passe',
      html: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0056b3;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte sur Task Manager.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${url}" 
             style="background-color: #eb2020ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
        <p><a href="${url}">${url}</a></p>
        <p style="font-size: 0.9em; color: #777;">
          Ce lien est valable 15 minutes et utilisable une seule fois.
          <br>Si vous n’avez pas demandé cette réinitialisation, vous pouvez ignorer ce message.
        </p>
        <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #999;">&copy; 2025 Task Manager. Tous droits réservés.</p>
      </div>
    `,
    });
  }
}
