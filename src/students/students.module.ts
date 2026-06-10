import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discente } from './entities/student.entity';
import { Intento } from '../attempts/entities/attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discente, Intento])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
