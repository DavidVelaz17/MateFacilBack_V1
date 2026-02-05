import { Controller, Get, Post, Body } from '@nestjs/common';
import { StudentsService } from './app.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.studentsService.create(body);
  }
}