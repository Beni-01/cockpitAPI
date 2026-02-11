import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfigDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    sheet_url?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    worksheet_name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    range?: string;

    @ApiPropertyOptional({ enum: ['oauth', 'service_account'] })
    @IsEnum(['oauth', 'service_account'])
    @IsOptional()
    auth_type?: string;

    @ApiPropertyOptional({ type: Boolean })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    columnMapping?: any;
}
