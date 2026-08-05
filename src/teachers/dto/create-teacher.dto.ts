import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  Nombre_Docente: string;

  @IsString()
  @IsNotEmpty()
  Apellido_Paterno_Docente: string;

  @IsString()
  @IsNotEmpty()
  Apellido_Materno_Docente: string;

  @IsString()
  @IsNotEmpty()
  Usuario: string;

  @IsString()
  @MinLength(4)
  Password: string;
}
