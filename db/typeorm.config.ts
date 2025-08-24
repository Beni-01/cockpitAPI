import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';


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
  
  extra: {
    timezone: 'Z', // Pour UTC
    // timezone: 'Africa/Kinshasa', // Pour un fuseau horaire spécifique
  },
});
