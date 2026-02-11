import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConfigDto {
    @ApiProperty({ example: 'Monthly budget import' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'https://docs.google.com/spreadsheets/d/...' })
    @IsString()
    @IsNotEmpty()
    sheet_url: string;

    @ApiPropertyOptional({ example: 'Sheet1' })
    @IsString()
    @IsOptional()
    worksheet_name?: string;

    @ApiPropertyOptional({ enum: ['oauth', 'service_account'] })
    @IsEnum(['oauth', 'service_account'])
    @IsOptional()
    auth_type?: string;

    @ApiPropertyOptional({ type: Boolean })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
