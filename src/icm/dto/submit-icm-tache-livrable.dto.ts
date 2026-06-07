import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SubmitIcmTacheLivrableDto {
  @ApiProperty({ description: 'ID de la coordination', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  coordinationId: number;

  @ApiProperty({
    description: 'Nom du fichier',
    example: 'rapport-entretien-mai-2026.pdf',
  })
  @IsNotEmpty()
  @IsString()
  nomFichier: string;

  @ApiProperty({
    description: 'URL ou chemin du fichier',
    example: 'https://storage.example/rapport-entretien-mai-2026.pdf',
  })
  @IsNotEmpty()
  @IsString()
  urlFichier: string;

  @ApiPropertyOptional({ description: 'Commentaire du soumissionnaire' })
  @IsOptional()
  @IsString()
  commentaire?: string;
}
