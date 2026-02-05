import { Module } from '@nestjs/common';
import { StudentsModule } from './students/students.module';
import { StudentsService } from './app.service';
import { StudentsController } from './app.controller';

@Module({
  imports: [StudentsModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class AppModule {}
