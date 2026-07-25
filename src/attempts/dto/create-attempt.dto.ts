import { IsInt, Max, Min } from 'class-validator';

// Rangos tomados de la formula real del frontend (GameScene.tsx:
// handleDoorCollision/triggerLoss). No es anti-cheat, solo evita que
// datos fuera de rango rompan el dashboard de estadisticas.
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
}
