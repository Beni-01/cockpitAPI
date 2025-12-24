import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateConfigDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    sheet_url?: string;

    @IsString()
    @IsOptional()
    worksheet_name?: string;

    @IsString()
    @IsOptional()
    range?: string;

    @IsEnum(['oauth', 'service_account'])
    @IsOptional()
    auth_type?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsObject()
    @IsOptional()
    columnMapping?: any;
}
