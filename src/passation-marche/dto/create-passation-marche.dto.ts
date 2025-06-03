import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, MaxLength, IsDecimal, IsBoolean, IsOptional, IsInt, IsNumber } from "class-validator";

export class CreatePassationMarcheDto {
     @ApiProperty({ description: 'Intitulé du marché' })
    @IsString()
    @IsNotEmpty()
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
    @IsString()
    @IsOptional()
    asTDR?: string;

    @ApiPropertyOptional({ description: 'Dispose de AMIDAO' })
    @IsString()
    @IsOptional()
    asAMIDAO?: string;

    @ApiPropertyOptional({ description: 'Dispose de ANO' })
    @IsString()
    @IsOptional()
    asANO?: string;

    @ApiPropertyOptional({ description: 'Est public' })
    @IsString()
    @IsOptional()
    asPublic?: string;

    @ApiPropertyOptional({ description: 'Dispose de dépôt' })
    @IsString()
    @IsOptional()
    asDepot?: string;

    @ApiPropertyOptional({ description: 'Sous-commission analyse' })
    @IsString()
    @IsOptional()
    subCommission_analyse?: string;

    @ApiPropertyOptional({ description: 'Commission PM' })
    @IsString()
    @IsOptional()
    commission_pm?: string;

    @ApiPropertyOptional({ description: 'Demande de proposition' })
    @IsString()
    @IsOptional()
    demande_prop?: string;

    @ApiPropertyOptional({ description: 'Dépôt proposition technique' })
    @IsString()
    @IsOptional()
    depot_prop_Tech?: string;

    @ApiPropertyOptional({ description: 'Analyse technique' })
    @IsString()
    @IsOptional()
    analyse_tech?: string;

    @ApiPropertyOptional({ description: 'Analyse proposition financière' })
    @IsString()
    @IsOptional()
    analyse_prop_fin?: string;

    @ApiPropertyOptional({ description: 'Analyse combinée' })
    @IsString()
    @IsOptional()
    analyse_comb?: string;

    @ApiPropertyOptional({ description: 'Notification' })
    @IsString()
    @IsOptional()
    notif?: string;

    @ApiPropertyOptional({ description: 'Deuxième publication' })
    @IsString()
    @IsOptional()
    publication2?: string;

    @ApiPropertyOptional({ description: 'ANO rapport analyse' })
    @IsString()
    @IsOptional()
    ano_rapport_analyse?: string;

    @ApiPropertyOptional({ description: 'Mise au point contrat' })
    @IsString()
    @IsOptional()
    mise_point_contrat?: string;

    @ApiPropertyOptional({ description: 'Approbation tutelle PM' })
    @IsString()
    @IsOptional()
    approb_tut_pm?: string;

    @ApiPropertyOptional({ description: 'Notification définitive' })
    @IsString()
    @IsOptional()
    notif_def?: string;

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