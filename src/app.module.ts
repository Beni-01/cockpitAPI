import { Module } from '@nestjs/common';


import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig, DatabaseConfig } from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ActivityModule } from './activity/activity.module';
import { SousActivityModule } from './sous-activity/sous-activity.module';
import { DemandeProlongationModule } from './demande-prolongation/demande-prolongation.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AnnotationActivityModule } from './annotation-activity/annotation-activity.module';
import { LivrableModule } from './livrable/livrable.module';
import { AuditInitializerService } from './audit-log/audit-initializer.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [AppConfig, DatabaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),

      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PassportModule,
    ActivityModule,
    SousActivityModule,
    DemandeProlongationModule,
    AuditLogModule,
    AnnotationActivityModule,
    LivrableModule,
   
  ],
  controllers: [AppController],
  providers: [AppService, AuditInitializerService],
})
export class AppModule {}
