import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/teacher.entity';
import { Grupo } from '../groups/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Docente, Grupo])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
