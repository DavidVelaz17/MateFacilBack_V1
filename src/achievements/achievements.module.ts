import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogroAlumno } from './entities/logro-alumno.entity';
import { AchievementsService } from './achievements.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogroAlumno])],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
