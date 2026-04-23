import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @ApiProperty({ example: -4.32142 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: 15.31257 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiPropertyOptional({ example: 'iPhone 13, iOS 15.4' })
  @IsString()
  @IsOptional()
  deviceInfo?: string;

  @ApiPropertyOptional({ example: 'Embouteillages' })
  @IsString()
  @IsOptional()
  commentaire?: string;
}

export class CheckOutDto {
  @ApiProperty({ example: -4.32145 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: 15.31259 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiPropertyOptional({ example: 'Travail terminé' })
  @IsString()
  @IsOptional()
  commentaire?: string;
}
