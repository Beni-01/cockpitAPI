import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateConfigDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    sheet_url: string;

    @IsString()
    @IsOptional()
    worksheet_name?: string;

    @IsEnum(['oauth', 'service_account'])
    @IsOptional()
    auth_type?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
