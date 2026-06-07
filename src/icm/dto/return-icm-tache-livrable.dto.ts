import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReturnIcmTacheLivrableDto {
  @ApiProperty({
    description: 'Motif du retour',
    example: 'Le rapport doit être signé avant validation.',
  })
  @IsNotEmpty({ message: 'Le motif du retour est requis' })
  @IsString()
  motifRetour: string;
}
