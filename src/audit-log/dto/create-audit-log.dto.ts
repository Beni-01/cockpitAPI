import { IsNumber, IsString, IsJSON, IsOptional, IsDate } from "class-validator";
import { CreateDateColumn } from "typeorm";

export class CreateAuditLogDto {

  @IsString()
  tableName?: string;

  @IsNumber()
  entityId?: number;

  @IsString()
  action?: string;

  @IsJSON()
  @IsOptional()
  oldData?: any;

  @IsJSON()
  @IsOptional()
  newData?: any;

  @IsNumber()
  @IsOptional()
  userId?: number;

 
}
