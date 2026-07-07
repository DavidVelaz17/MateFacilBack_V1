import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { Discente } from './entities/student.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('discentes') //
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post() // Crear (POST /discentes)
  create(@Body() createStudentDto: Discente) {
    return this.studentsService.create(createStudentDto);
  }

  @Get() // Leer todos (GET /discentes)
  findAll(@Req() req: any) {
    return this.studentsService.findAllByTeacher(req.user.id);
  }

  @Patch(':id')  //Actualizar (PATCH /discentes/1)
  update(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id') // Eliminar (DELETE /discentes/1)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }

  // Guardar datos al finalizar partida
  @Post(':id/attempts')
  saveAttempt(@Param('id') id: string, @Body() attemptData: any) {
    return this.studentsService.saveAttempt(+id, attemptData);
  }

  // Leer las estadisticas procesadas para el Dashboard
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.studentsService.getStudentStats(+id);
  }
}
