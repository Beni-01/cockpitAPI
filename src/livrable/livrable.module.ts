import { Module } from '@nestjs/common';
import { LivrableService } from './livrable.service';
import { LivrableController } from './livrable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livrable } from './entities/livrable.entity';
import { UserLivrableModule } from 'src/user-livrable/user-livrable.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Livrable]), // Import de l'entité Livrable pour TypeORM
    UserLivrableModule,
    UserModule
  ],
  controllers: [LivrableController],
  providers: [LivrableService],
})
export class LivrableModule {}
