import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from "src/user/entities/user.entity";

@Entity({ name:'passation_marche' })
export class PassationMarche extends Timestamp {

    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'ID unique de la passation de marché' })
    id: number;

    @Column({ name: 'intitule', type: 'text' })
    @ApiProperty({ description: 'Intitulé du marché' })
    intitule: string;

    @Column({ name: 'service', type: 'varchar', length: 100 })
    @ApiProperty({ description: 'Service concerné par le marché' })
    service: string;

    @Column({ name: 'montant', type: 'decimal', precision: 15, scale: 2 })
    @ApiProperty({ description: 'Montant total du marché en USD ou CDF' })
    montant: number;

    @Column({ name: 'type_marche', type: 'varchar', length: 50 })
    @ApiProperty({ description: 'Type de marché (ex : Travaux, Fournitures, Services)' })
    type: string;

    @Column({ name: 'mode_passation', type: 'varchar', length: 50 })
    @ApiProperty({ description: 'Mode de passation (Appel d\'offres, DAO, etc.)' })
    mode: string;

    @Column({ name: 'deadline', type: 'varchar', length: 50 })
    @ApiProperty({ description: 'Date limite de l’étape en cours' })
    deadline: string;

    @Column({ name: 'as_tdr', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Disponibilité des Termes de Référence (TDR)' })
    asTDR?: string;

    @Column({ name: 'as_amidao', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Disponibilité de l’AMIDAO' })
    asAMIDAO: string | null;

    @Column({ name: 'as_ano', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Disponibilité de l’ANO' })
    asANO: string | null;

    @Column({ name: 'as_public', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Publication effectuée (Oui/Non)' })
    asPublic: string | null;

    @Column({ name: 'as_depot', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Disponibilité du dépôt administratif' })
    asDepot: string | null;

    @Column({ name: 'sub_commission_analyse', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Sous-commission chargée de l’analyse' })
    subCommission_analyse: string | null;

    @Column({ name: 'commission_pm', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Commission de passation des marchés' })
    commission_pm: string | null;

    @Column({ name: 'demande_proposition', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Demande de proposition émise' })
    demande_prop: string | null;

    @Column({ name: 'depot_proposition_tech', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Dépôt des propositions techniques' })
    depot_prop_Tech: string | null;

    @Column({ name: 'analyse_technique', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse technique effectuée' })
    analyse_tech: string | null;

    @Column({ name: 'analyse_proposition_fin', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse des propositions financières' })
    analyse_prop_fin: string | null;

    @Column({ name: 'analyse_combinee', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse combinée (technique + financière)' })
    analyse_comb: string | null;

    @Column({ name: 'notification', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Notification envoyée' })
    notif: string | null;

    @Column({ name: 'publication_2', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Deuxième publication effectuée' })
    publication2: string |null;

    @Column({ name: 'ano_rapport_analyse', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Rapport d’analyse ANO disponible' })
    ano_rapport_analyse: string | null;

    @Column({ name: 'mise_point_contrat', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Mise au point du contrat' })
    mise_point_contrat: string | null;

    @Column({ name: 'approbation_tutelle_pm', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Approbation par la tutelle PM' })
    approb_tut_pm: string | null;

    @Column({ name: 'notification_definitive', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Notification définitive envoyée' })
    notif_def: string | null;

    @Column({ name: 'observations', type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Observations générales' })
    obs: string | null;

    @Column({ name: 'userId', type: 'int', nullable: false })
    @ApiProperty({ description: 'ID de l’utilisateur ayant créé ou modifié l’entrée' })
    userId: number;

    @ManyToOne(() => User, (user) => user.passations)
    @ApiProperty({ description: 'Utilisateur lié à cette passation de marché' })
    user: User;
}
