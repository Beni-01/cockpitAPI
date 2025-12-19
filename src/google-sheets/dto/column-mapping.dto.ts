import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class ColumnMappingDto {
    @IsString()
    @IsNotEmpty()
    sheet_column_name: string;

    @IsString()
    @IsNotEmpty()
    db_field_name: string;

    @IsEnum(['string', 'number', 'date', 'boolean'])
    @IsOptional()
    data_type?: string;

    @IsBoolean()
    @IsOptional()
    is_required?: boolean;

    @IsString()
    @IsOptional()
    default_value?: string;
}
