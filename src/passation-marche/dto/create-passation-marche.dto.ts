import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, MaxLength, IsDecimal, IsBoolean, IsOptional, IsInt, IsNumber } from "class-validator";

export class CreatePassationMarcheDto {
     @ApiProperty({ description: 'Intitulé du marché' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    intitule: string;

    @ApiProperty({ description: 'Service concerné' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    service: string;

    @ApiProperty({ description: 'Montant du marché' })
    @IsNotEmpty()
    montant: number;

    @ApiProperty({ description: 'Type de marché' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    type: string;

    @ApiProperty({ description: 'Mode de passation' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    mode: string;

    @ApiProperty({ description: 'Date limite' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    deadline: string;

    @ApiPropertyOptional({ description: 'Dispose de TDR' })
    @IsBoolean()
    @IsOptional()
    asTDR?: boolean;

    @ApiPropertyOptional({ description: 'Dispose de AMIDAO' })
    @IsBoolean()
    @IsOptional()
    asAMIDAO?: boolean;

    @ApiPropertyOptional({ description: 'Dispose de ANO' })
    @IsBoolean()
    @IsOptional()
    asANO?: boolean;

    @ApiPropertyOptional({ description: 'Est public' })
    @IsBoolean()
    @IsOptional()
    asPublic?: boolean;

    @ApiPropertyOptional({ description: 'Dispose de dépôt' })
    @IsBoolean()
    @IsOptional()
    asDepot?: boolean;

    @ApiPropertyOptional({ description: 'Sous-commission analyse' })
    @IsBoolean()
    @IsOptional()
    subCommission_analyse?: boolean;

    @ApiPropertyOptional({ description: 'Commission PM' })
    @IsBoolean()
    @IsOptional()
    commission_pm?: boolean;

    @ApiPropertyOptional({ description: 'Demande de proposition' })
    @IsBoolean()
    @IsOptional()
    demande_prop?: boolean;

    @ApiPropertyOptional({ description: 'Dépôt proposition technique' })
    @IsBoolean()
    @IsOptional()
    depot_prop_Tech?: boolean;

    @ApiPropertyOptional({ description: 'Analyse technique' })
    @IsBoolean()
    @IsOptional()
    analyse_tech?: boolean;

    @ApiPropertyOptional({ description: 'Analyse proposition financière' })
    @IsBoolean()
    @IsOptional()
    analyse_prop_fin?: boolean;

    @ApiPropertyOptional({ description: 'Analyse combinée' })
    @IsBoolean()
    @IsOptional()
    analyse_comb?: boolean;

    @ApiPropertyOptional({ description: 'Notification' })
    @IsBoolean()
    @IsOptional()
    notif?: boolean;

    @ApiPropertyOptional({ description: 'Deuxième publication' })
    @IsBoolean()
    @IsOptional()
    publication2?: boolean;

    @ApiPropertyOptional({ description: 'ANO rapport analyse' })
    @IsBoolean()
    @IsOptional()
    ano_rapport_analyse?: boolean;

    @ApiPropertyOptional({ description: 'Mise au point contrat' })
    @IsBoolean()
    @IsOptional()
    mise_point_contrat?: boolean;

    @ApiPropertyOptional({ description: 'Approbation tutelle PM' })
    @IsBoolean()
    @IsOptional()
    approb_tut_pm?: boolean;

    @ApiPropertyOptional({ description: 'Notification définitive' })
    @IsBoolean()
    @IsOptional()
    notif_def?: boolean;

    @ApiPropertyOptional({ description: 'Observations' })
    @IsString()
    @IsOptional()
    obs?: string;

    @ApiProperty({ description: 'ID de l\'utilisateur associé' })
    @IsNumber()
    @IsNotEmpty()
    userId: number;
}

export class PassationMarchePaginationDto {
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number;
}