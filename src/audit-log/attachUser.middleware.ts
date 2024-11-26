import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AttachUserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (req.user) {
      req.queryRunner = { data: { userId: req.user.id } }; // Attache l'utilisateur
    }
    next();
  }
}
