import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateDiscenteDto } from './dto/create-discente.dto';
import { UpdateDiscenteDto } from './dto/update-discente.dto';
import { CreateAttemptDto } from '../attempts/dto/create-attempt.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('discentes') //
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post() // Crear (POST /discentes)
  create(@Body() createStudentDto: CreateDiscenteDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get() // Leer todos (GET /discentes) - sin filtrar por docente, con o sin grupo
  findAll() {
    return this.studentsService.findAll();
  }

  @Patch(':id')  //Actualizar (PATCH /discentes/1)
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateDiscenteDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  // Eliminar al alumno del sistema por completo. Restringido al admin: los
  // docentes solo pueden desasignarlo de un grupo (ver removeFromGroup).
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }

  // Desasignar al alumno de un grupo puntual, sin borrarlo del sistema.
  @Delete(':id/groups/:groupId')
  removeFromGroup(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
  ) {
    return this.studentsService.removeFromGroup(+id, +groupId);
  }

  // Guardar datos al finalizar partida
  @Post(':id/attempts')
  saveAttempt(@Param('id') id: string, @Body() attemptData: CreateAttemptDto) {
    return this.studentsService.saveAttempt(+id, attemptData);
  }

  // Leer las estadisticas procesadas para el Dashboard
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.studentsService.getStudentStats(+id);
  }
}
