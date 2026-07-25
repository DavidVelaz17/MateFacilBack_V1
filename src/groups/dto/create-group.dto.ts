import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class DocenteRefDto {
  @IsInt()
  id_docente: number;
}

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  Nombre_Grupo: string;

  @IsInt()
  Año: number;

  @IsInt()
  Grado: number;

  @ValidateNested()
  @Type(() => DocenteRefDto)
  docente: DocenteRefDto;
}
