import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { Discente } from './entities/student.entity';

@Controller('discentes') //
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post() // Crear (POST /discentes)
  create(@Body() createStudentDto: Discente) {
    return this.studentsService.create(createStudentDto);
  }

  @Get() // Leer todos (GET /discentes)
  findAll() {
    return this.studentsService.findAll();
  }

  @Patch(':id') // Actualizar (PATCH /discentes/1)
  update(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id') // Eliminar (DELETE /discentes/1)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}