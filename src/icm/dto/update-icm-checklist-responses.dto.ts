import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateIcmResponseDto } from './update-icm-response.dto';

export class UpdateIcmChecklistResponsesDto {
  @ApiProperty({
    description: 'Tableau des réponses à mettre à jour',
    type: [UpdateIcmResponseDto],
  })
  @IsNotEmpty({ message: 'Les réponses sont requises' })
  @IsArray({ message: 'Les réponses doivent être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => UpdateIcmResponseDto)
  responses: UpdateIcmResponseDto[];
}
