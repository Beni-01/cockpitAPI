import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mailApiUrl = 'http://graph-mail/send/template'; // À adapter selon l'URL réelle

  async sendTemplateEmail(to: string, subject: string, text: string, directeurCivilite: string = 'Monsieur/Madame') {
    const mail = {
      to,
      subject,
      template: '360template.html',
      variables: {
        directeurCivilite,
        text,
      },
    };

    try {
      this.logger.log(`Envoi d'email à ${to} avec le sujet : ${subject}`);
      
      const response = await fetch(this.mailApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mail),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      this.logger.log(`Email envoyé avec succès à ${to}`);
      return data;
      
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${to}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}
