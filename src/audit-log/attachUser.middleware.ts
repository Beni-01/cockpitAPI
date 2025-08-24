import { Injectable, NestMiddleware, UseGuards } from '@nestjs/common';
import { LocalGuard } from 'src/auth/guards/local.guard';

@Injectable()
@UseGuards(LocalGuard)
export class AttachUserMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: () => void) {
    if (req.body) {
      req.queryRunner = (req.body.performedId) ? {data:{userId:req.body.performedId}} : { data: { userId: req?.body?.userId || +req?.query?.performedId || req?.body?.agentId } }; // Attache l'utilisateur
    }

    delete req.body.performedId
    next();
  }
}
