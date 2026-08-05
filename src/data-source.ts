import 'dotenv/config';
import { DataSource } from 'typeorm';

// Fuente de datos usada solo por el CLI de TypeORM (migration:generate,
// migration:run, migration:revert). La app en si se conecta a traves de
// TypeOrmModule.forRoot en app.module.ts, que reutiliza estas mismas
// variables de entorno pero via ConfigModule.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
