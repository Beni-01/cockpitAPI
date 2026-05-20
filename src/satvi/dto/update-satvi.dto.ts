import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateSatviDto, SatviEvaluationDto } from './create-satvi.dto';

export class UpdateSatviEvaluationDto extends PartialType(SatviEvaluationDto) {}

export class UpdateSatviDto extends PartialType(
  OmitType(CreateSatviDto, ['evaluation'] as const),
) {
  @ApiPropertyOptional({ type: UpdateSatviEvaluationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSatviEvaluationDto)
  evaluation?: UpdateSatviEvaluationDto;
}
