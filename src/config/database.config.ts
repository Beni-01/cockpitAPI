// config/database.config.ts
import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',

  // Ne jamais synchroniser automatiquement en prod
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',


  entities: [join(__dirname, '/../**/*.entity.{ts,js}')],

  migrations: [join(__dirname, '../../db/migrations/*.{ts,js}')],
  migrationsTableName: 'migrations',

  extra: {
    connectionLimit: 50,
    connectTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    idleTimeout: 60000,
    charset: 'utf8mb4',
    decimalNumbers: true,
    timezone: 'Z',
  },
}));
