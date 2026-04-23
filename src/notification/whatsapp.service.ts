import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly whatsappApiUrl = 'http://graph-mail/send/whatsapp'; // À adapter selon l'URL réelle

  async sendWhatsapp(to: string, message: string) {
    const payload = {
      to,
      message,
    };

    try {
      this.logger.log(`Envoi WhatsApp à ${to}`);
      
      const response = await fetch(this.whatsappApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP WhatsApp: ${response.status}`);
      }

      const data = await response.json();
      this.logger.log(`WhatsApp envoyé avec succès à ${to}`);
      return data;
      
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi WhatsApp à ${to}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}
