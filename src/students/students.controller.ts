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

  @Delete(':id') // Eliminar (DELETE /discentes/1)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
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
