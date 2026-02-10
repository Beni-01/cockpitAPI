import { MiddlewareConsumer, Module, NestMiddleware, RequestMethod } from '@nestjs/common';


import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig, DatabaseConfig } from './config';
import { AppController } from './app.controller';import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ActivityModule } from './activity/activity.module';
import { SousActivityModule } from './sous-activity/sous-activity.module';
import { DemandeProlongationModule } from './demande-prolongation/demande-prolongation.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AnnotationActivityModule } from './annotation-activity/annotation-activity.module';
import { LivrableModule } from './livrable/livrable.module';


import { AttachUserMiddleware } from './audit-log/attachUser.middleware';
import { UserLivrableModule } from './user-livrable/user-livrable.module';
import { DemandeUserModule } from './demande-user/demande-user.module';
import { RequestContextMiddleware } from './user/request-context.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogService } from './audit-log/audit-log.service';
import { AuditInterceptor } from './audit-log/audti-log.interceptor';
import { PassationMarcheModule } from './passation-marche/passation-marche.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';
import { MasterDataModule } from './master-data/master-data.module';
import { DisbursementModule } from './disbursement/disbursement.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DepartmentModule } from './department/department.module';
import { BudgetModule } from './budget/budget.module';
import ApexInputModule from './apex-input/apex-input.module';
import { CategoryModule } from './category/category.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [AppConfig, DatabaseConfig],
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 150,
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Récupération de la configuration database
        const db = configService.get('database');

        return {
          type: db.type,
          host: db.host,
          port: Number(db.port),
          username: db.username,
          password: db.password,
          database: db.database,
          entities: db.entities,
          migrations: db.migrations,
          migrationsTableName: db.migrationsTableName,

          // Ne jamais synchroniser automatiquement en prod
          synchronize: false,
          logging: db.logging,

          // Options supplémentaires
          extra: db.extra,
        };
      },
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
    DemandeUserModule,
    PassationMarcheModule,
    GoogleSheetsModule,
    MasterDataModule,
    DisbursementModule,
    TransactionsModule,
    DisbursementModule,
    DepartmentModule,
    BudgetModule,
    ApexInputModule,
    CategoryModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttachUserMiddleware) // Appliquer le middleware
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Sur toutes les routes

    consumer.apply(RequestContextMiddleware).forRoutes('*'); // Appliquer à toutes les routes   
  }
}

