import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GroupsModule } from './groups/groups.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    // 1. Cargar variables del .env
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Configurar la conexión a PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

    GroupsModule,

    TeachersModule,

    StudentsModule,
  ],
})
export class AppModule {}