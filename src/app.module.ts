import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GroupsModule } from './groups/groups.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';
import { AttemptsModule } from './attempts/attempts.module';

@Module({
  imports: [
    // 1. Cargar variables del .env
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Configurar la conexión a PostgreSQL
    // synchronize queda apagado a proposito: el esquema se crea/actualiza
    // por migraciones (src/migrations), que corren solas al arrancar
    // (migrationsRun) tanto en local como dentro del contenedor Docker.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      migrationsRun: true,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),

    GroupsModule,

    TeachersModule,

    StudentsModule,

    AuthModule,

    AttemptsModule,
  ],
})
export class AppModule {}
