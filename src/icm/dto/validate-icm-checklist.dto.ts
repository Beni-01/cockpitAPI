import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class ValidateIcmChecklistDto {
  @ApiProperty({
    description: 'ID de la checklist à valider',
    example: 1,
  })
  @IsNotEmpty({ message: 'L\'ID checklist est requis' })
  @IsInt({ message: 'L\'ID checklist doit être un entier' })
  checklistId: number;
}
