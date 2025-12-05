// db/typeorm.config.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Charge les variables d'environnement
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',

  // ✅ Chemin des entités (cohérent avec database.config.ts)
  entities: [join(__dirname, '../**/*.entity.{ts,js}')],

  // ✅ Chemin des migrations
  migrations: [join(__dirname, './migrations/*.{ts,js}')],
  migrationsTableName: 'migrations',

  // Ne pas synchroniser automatiquement
  synchronize: false,

  // Logging uniquement en développement
  logging: process.env.NODE_ENV === 'development',

  // Configuration supplémentaire pour la connexion
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

  // Log les requêtes lentes > 1s
  maxQueryExecutionTime: 1000,
});
