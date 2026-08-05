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
import { AuthGuard } from '@nestjs/passport';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('teachers') // <-- La ruta base será http://localhost:3001/teachers
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post() // Crear (POST /teachers)
  create(@Body() createTeacherDto: CreateTeacherDto) {
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
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(+id, updateTeacherDto);
  }

  @Get(':id/delete-impact') // Impacto de eliminar (GET /teachers/1/delete-impact)
  getDeleteImpact(@Param('id') id: string) {
    return this.teachersService.getDeleteImpact(+id);
  }

  @Delete(':id') // Eliminar (DELETE /teachers/1)
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}
