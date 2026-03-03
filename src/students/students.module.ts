import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discente } from './entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discente])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
