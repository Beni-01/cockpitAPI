import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class RejectIcmChecklistDto {
  @ApiProperty({
    description: 'ID de la checklist à rejeter',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID checklist est requis' })
  @IsInt({ message: 'L\'ID checklist doit être un entier' })
  checklistId: number;

  @ApiProperty({
    description: 'Motif du rejet',
    example: 'Preuves incomplètes pour les questions RH',
  })
  @IsNotEmpty({ message: 'Le motif du rejet est requis' })
  @IsString({ message: 'Le motif doit être une chaîne' })
  rejectionReason: string;
}
