import { MiddlewareConsumer, Module, NestMiddleware, RequestMethod } from '@nestjs/common';


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
import { AuditSubscriber } from './audit-log/audit-log.subscriber';
import { AttachUserMiddleware } from './audit-log/attachUser.middleware';
import { UserLivrableModule } from './user-livrable/user-livrable.module';
import { DemandeUserModule } from './demande-user/demande-user.module';
import { RequestContextMiddleware } from './user/request-context.middleware';
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
    AuthModule,
    UserLivrableModule,
    DemandeUserModule
   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule  {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachUserMiddleware) // Appliquer le middleware
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Sur toutes les routes

    consumer.apply(RequestContextMiddleware).forRoutes('*'); // Appliquer à toutes les routes   
  }
}
