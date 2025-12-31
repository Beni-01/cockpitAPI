import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiPropertyOptional()
  mappingCashFlow?: string;

  @ApiPropertyOptional()
  departementDirection?: string;

  @ApiPropertyOptional()
  activites?: string;

  @ApiPropertyOptional()
  sousActivites?: string;

  @ApiPropertyOptional()
  taches?: string;

  @ApiPropertyOptional()
  codeDepartement?: string;

  @ApiPropertyOptional()
  codeActivite?: string;

  @ApiPropertyOptional()
  codeSousActivite?: string;

  @ApiPropertyOptional()
  codeTache?: string;

  @ApiPropertyOptional()
  costCode?: string;
}
