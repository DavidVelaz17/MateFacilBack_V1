import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateDiscenteDto } from './dto/create-discente.dto';
import { UpdateDiscenteDto } from './dto/update-discente.dto';
import { CreateAttemptDto } from '../attempts/dto/create-attempt.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('discentes')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateDiscenteDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(@Query('tzOffset') tzOffset?: string) {
    return this.studentsService.findAll(Number(tzOffset) || 0);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateDiscenteDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  // Restringido al admin: los docentes solo pueden desasignar al alumno
  // de un grupo (ver removeFromGroup), no eliminarlo del sistema.
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }

  @Delete(':id/groups/:groupId')
  removeFromGroup(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
  ) {
    return this.studentsService.removeFromGroup(+id, +groupId);
  }

  @Post(':id/attempts')
  saveAttempt(@Param('id') id: string, @Body() attemptData: CreateAttemptDto) {
    return this.studentsService.saveAttempt(+id, attemptData);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Query('tzOffset') tzOffset?: string) {
    return this.studentsService.getStudentStats(+id, Number(tzOffset) || 0);
  }

  // El frontend manda instantes ISO precisos (hora local ya resuelta), no
  // fechas sueltas (ver ReportQueryDto).
  @Get(':id/report')
  getReport(@Param('id') id: string, @Query() query: ReportQueryDto) {
    const desde = new Date(query.desde);
    const hasta = new Date(query.hasta);
    return this.studentsService.getStudentReport(
      +id,
      desde,
      hasta,
      query.tzOffset ?? 0,
    );
  }
}
