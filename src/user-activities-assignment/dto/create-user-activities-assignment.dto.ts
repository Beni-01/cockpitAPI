import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateUserActivitiesAssignmentDto {
  @ApiProperty({
    description: "ID de l'utilisateur à assigner",
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID de la sous-activité à assigner',
    example: 5,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  sousActivityId: number;
}
