import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// Un evento por cada numero recogido durante la partida (correcto o trampa).
class DesgloseEventoDto {
  @IsInt()
  @Min(1)
  orden: number;

  @IsInt()
  valor: number;

  @IsIn(['objetivo', 'trampa'])
  tipo: 'objetivo' | 'trampa';

  @IsBoolean()
  correcta: boolean;

  @IsInt()
  @Min(0)
  tiempo: number;
}

// Un sub-intento por cada vez que el alumno intento abrir la puerta: una
// vida perdida genera un sub-intento fallido y reinicia el mismo problema.
class DesgloseIntentoDto {
  @IsInt()
  @Min(1)
  numero: number;

  @IsBoolean()
  exitoso: boolean;

  @IsInt()
  @Min(0)
  @Max(3)
  vidasRestantes: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesgloseEventoDto)
  eventos: DesgloseEventoDto[];
}

// Opcional para no romper clientes viejos que aun no lo envian.
class DesgloseDto {
  @IsArray()
  @IsInt({ each: true })
  objetivo: number[];

  @IsArray()
  @IsInt({ each: true })
  trampas: number[];

  @IsInt()
  resultado: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesgloseIntentoDto)
  intentos: DesgloseIntentoDto[];
}

// Rangos tomados de la formula real del frontend (GameScene.tsx). No es
// anti-cheat, solo evita que datos fuera de rango rompan el dashboard.
export class CreateAttemptDto {
  @IsInt()
  @Min(0)
  Tiempo: number;

  @IsInt()
  @Min(1)
  @Max(4)
  Dificultad: number;

  @IsInt()
  @Min(0)
  @Max(100)
  Puntos: number;

  @IsInt()
  @Min(1)
  @Max(3)
  Emocion: number;

  @IsInt()
  @Min(0)
  @Max(3)
  Monedas: number;

  @IsIn(['suma', 'resta', 'multiplicacion', 'division'])
  Operacion: string;

  // Opcional para no romper clientes viejos (bundle en cache) que aun no lo envian.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  Vidas?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DesgloseDto)
  Desglose?: DesgloseDto;

  // Date.getTimezoneOffset() del navegador: para la racha de dias en el
  // dia calendario local, no UTC. Sin esto se asume UTC.
  @IsOptional()
  @IsInt()
  TzOffset?: number;
}
