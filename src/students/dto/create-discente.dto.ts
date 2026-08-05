import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class GrupoRefDto {
  @IsInt()
  id_grupo: number;
}

export class CreateDiscenteDto {
  @IsString()
  @IsNotEmpty()
  Nombre_Discente: string;

  @IsString()
  @IsNotEmpty()
  Apellido_Paterno_Discente: string;

  @IsString()
  @IsNotEmpty()
  Apellido_Materno_Discente: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrupoRefDto)
  grupos?: GrupoRefDto[];
}
