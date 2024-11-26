import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { AuditSubscriber } from 'src/audit-log/audit-log.subscriber';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.getOrThrow('DB_HOST'),
  port: +configService.getOrThrow('DB_PORT'),
  username: configService.getOrThrow('DB_USER'),
  password: configService.getOrThrow('DB_PASSWORD'),
  database: configService.getOrThrow('DB_NAME'),
  entities: [`${__dirname}/../src/**/*/*.entity{.ts,.js}`],
  synchronize: configService.getOrThrow('NODE_ENV') === 'development',
  logging: configService.getOrThrow('NODE_ENV') === 'development',
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
  subscribers: [AuditSubscriber],
});
