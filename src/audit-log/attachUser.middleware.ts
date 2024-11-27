import { Injectable, NestMiddleware, UseGuards } from '@nestjs/common';
import { LocalGuard } from 'src/auth/guards/local.guard';

@Injectable()
@UseGuards(LocalGuard)
export class AttachUserMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: () => void) {
    if (req.body) {
      req.queryRunner = { data: { userId: req.body.userId } }; // Attache l'utilisateur

    }
    console.log('req body ', req.body)
    next();
  }
}
