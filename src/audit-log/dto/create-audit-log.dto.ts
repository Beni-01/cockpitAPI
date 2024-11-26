import { IsNumber, IsString, IsJSON, IsOptional, IsDate } from "class-validator";

export class CreateAuditLogDto {
 @IsNumber()
  id: number;

  @IsString()
  tableName: string;

  @IsNumber()
  entityId: number;

  @IsString()
  action: string;

  @IsJSON()
  @IsOptional()
  oldData?: any;

  @IsJSON()
  @IsOptional()
  newData?: any;

  @IsNumber()
  @IsOptional()
  performedBy?: number;

  @IsDate()
  performedAt: Date;
}
