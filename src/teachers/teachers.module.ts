import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Docente])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}