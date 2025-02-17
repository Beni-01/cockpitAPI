import { registerAs } from '@nestjs/config';


export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  logging: false,
  migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
}));

//entities: [`${__dirname}/../**/*.entity{.ts,.js}`],