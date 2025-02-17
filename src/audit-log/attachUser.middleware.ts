import { Injectable, NestMiddleware, UseGuards } from '@nestjs/common';
import { LocalGuard } from 'src/auth/guards/local.guard';

@Injectable()
@UseGuards(LocalGuard)
export class AttachUserMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: () => void) {
    if (req.body) {
      req.queryRunner = { data: { userId: req.body.userId || req.body.performedId } }; // Attache l'utilisateur
    }

    delete req.body.performedId
    next();
  }
}
