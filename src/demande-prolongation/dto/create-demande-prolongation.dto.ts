

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDemandeProlongationDto {
  @ApiProperty({
    description: 'Description of the request for extension',
    example: 'Need more time due to unforeseen circumstances',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Impact of the extension request',
    example: 'Project timeline delay',
  })
  @IsNotEmpty()
  @IsString()
  impact: string;

  @ApiProperty({
    description: 'Level of the extension (e.g., critical, high, low)',
    example: 'High',
  })
  @IsNotEmpty()
  @IsString()
  niveau: string;

  @ApiProperty({
    description: 'Response to the extension request',
    example: 'Approved',
  })
  @IsNotEmpty()
  @IsString()
  reponse: string;

  @ApiProperty({
    description: 'Additional comments for the extension request',
    example: 'Request reviewed by the manager',
  })
  @IsNotEmpty()
  @IsString()
  commentaire: string;

  @ApiProperty({
    description: 'ID of the user making the request',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number; // Foreign key for the user



  @ApiProperty({ description: 'ID  activité principale', example: 12 })
  @IsNotEmpty()
  @IsNumber()
  activityId:number
}
