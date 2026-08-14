import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { CreateDiscenteDto } from './create-discente.dto';

export class UpdateDiscenteDto extends PartialType(CreateDiscenteDto) {
  // Solo se puede cambiar al editar (dar de baja / reactivar), no al crear.
  @IsOptional()
  @IsBoolean()
  Activo?: boolean;

  // Actualizado desde el juego (MapScene), no por el docente.
  @IsOptional()
  @IsInt()
  @Min(0)
  NivelMapaTierra?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  NivelMapaAgua?: number;
}
