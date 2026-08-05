import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateDiscenteDto } from './create-discente.dto';

export class UpdateDiscenteDto extends PartialType(CreateDiscenteDto) {
  // Solo se puede cambiar al editar (dar de baja / reactivar), no al crear.
  @IsOptional()
  @IsBoolean()
  Activo?: boolean;
}
