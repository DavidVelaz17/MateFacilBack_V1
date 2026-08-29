import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

// El frontend manda instantes ISO precisos (hora local ya resuelta), no
// fechas sueltas.
export class ReportQueryDto {
  @IsDateString()
  desde: string;

  @IsDateString()
  hasta: string;

  // Date.getTimezoneOffset() del navegador: agrupa por dia calendario
  // local en vez de UTC. Sin esto se asume UTC.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tzOffset?: number;
}
