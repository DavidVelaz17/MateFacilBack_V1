import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscenteDto } from './create-discente.dto';

export class UpdateTeacherDto extends PartialType(CreateDiscenteDto) {}
