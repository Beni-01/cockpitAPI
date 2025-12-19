import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class WebhookPayloadDto {
    @IsString()
    @IsNotEmpty()
    sheetId: string;

    @IsString()
    @IsNotEmpty()
    sheetName: string;

    @IsArray()
    @IsNotEmpty()
    data: any[][];

    @IsString()
    @IsOptional()
    timestamp?: string;
}
