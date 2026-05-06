import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('teachers') // <-- La ruta base será http://localhost:3001/teachers
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post() // Crear (POST /teachers)
  create(@Body() createTeacherDto: any) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get() // Leer todos (GET /teachers)
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id') // Buscar docente por ID (GET / ID)
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @Patch(':id') // Actualizar (PATCH /teachers/1)
  update(@Param('id') id: string, @Body() updateTeacherDto: any) {
    return this.teachersService.update(+id, updateTeacherDto);
  }

  @Delete(':id') // Eliminar (DELETE /teachers/1)
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}