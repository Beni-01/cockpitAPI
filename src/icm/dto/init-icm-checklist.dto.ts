import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class InitIcmChecklistDto {
  @ApiProperty({
    description: 'ID de la coordination',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID coordination est requis' })
  @IsInt({ message: 'L\'ID coordination doit être un entier' })
  coordinationId: number;

  @ApiProperty({
    description: 'Mois de la période (1-12)',
    example: 4,
  })
  @IsNotEmpty({ message: 'Le mois est requis' })
  @IsInt({ message: 'Le mois doit être un entier' })
  @Min(1, { message: 'Le mois doit être entre 1 et 12' })
  @Max(12, { message: 'Le mois doit être entre 1 et 12' })
  month: number;

  @ApiProperty({
    description: 'Année de la période',
    example: 2026,
  })
  @IsNotEmpty({ message: 'L\'année est requise' })
  @IsInt({ message: 'L\'année doit être un entier' })
  @Min(2000, { message: 'L\'année doit être valide' })
  year: number;
}
