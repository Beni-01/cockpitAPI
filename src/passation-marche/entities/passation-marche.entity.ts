


import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column,
    ManyToOne, 

} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from "src/user/entities/user.entity";


@Entity({
    name:'passation_marche'
})
export class PassationMarche extends Timestamp {
    
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'ID de la passation de marché' })
    id: number;

    @Column({ name: 'intitule', type: 'varchar' })
    @ApiProperty({ description: 'Intitulé du marché' })
    intitule: string;

    @Column({ name: 'service', type: 'varchar', length: 100 })
    @ApiProperty({ description: 'Service concerné' })
    service: string;

    @Column({ name: 'montant', type: 'decimal', precision: 15, scale: 2 })
    @ApiProperty({ description: 'Montant du marché' })
    montant: number;

    @Column({ name: 'type_marche', type: 'varchar', length: 50 })
    @ApiProperty({ description: 'Type de marché' })
    type: string;

    @Column({ name: 'mode_passation', type: 'varchar', length: 50 })
    @ApiProperty({ description: 'Mode de passation' })
    mode: string;

    @Column({ name: 'deadline', type: 'varchar', length: 50 })
    @ApiProperty({ description: 'Date limite' })
    deadline: string;

    @Column({ name: 'as_tdr', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de TDR' })
    asTDR?: boolean;

    @Column({ name: 'as_amidao', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de AMIDAO' })
    asAMIDAO: boolean | null;

    @Column({ name: 'as_ano', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de ANO' })
    asANO: boolean | null;

    @Column({ name: 'as_public', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Est public' })
    asPublic: boolean | null;

    @Column({ name: 'as_depot', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de dépôt' })
    asDepot: boolean | null;

    @Column({ name: 'sub_commission_analyse', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Sous-commission analyse' })
    subCommission_analyse: boolean | null;

    @Column({ name: 'commission_pm', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Commission PM' })
    commission_pm: boolean | null;

    @Column({ name: 'demande_proposition', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Demande de proposition' })
    demande_prop: boolean | null;

    @Column({ name: 'depot_proposition_tech', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Dépôt proposition technique' })
    depot_prop_Tech: boolean | null;

    @Column({ name: 'analyse_technique', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse technique' })
    analyse_tech: boolean | null;

    @Column({ name: 'analyse_proposition_fin', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse proposition financière' })
    analyse_prop_fin: boolean | null;

    @Column({ name: 'analyse_combinee', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse combinée' })
    analyse_comb: boolean | null;

    @Column({ name: 'notification', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Notification' })
    notif: boolean | null;

    @Column({ name: 'publication_2', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Deuxième publication' })
    publication2: boolean | null;

    @Column({ name: 'ano_rapport_analyse', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'ANO rapport analyse' })
    ano_rapport_analyse: boolean | null;

    @Column({ name: 'mise_point_contrat', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Mise au point contrat' })
    mise_point_contrat: boolean | null;

    @Column({ name: 'approbation_tutelle_pm', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Approbation tutelle PM' })
    approb_tut_pm: boolean | null;

    @Column({ name: 'notification_definitive', type: 'boolean', nullable: true })
    @ApiPropertyOptional({ description: 'Notification définitive' })
    notif_def: boolean | null;

    @Column({ name: 'observations', type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Observations' })
    obs: string | null;

    @Column({ name: 'userId', type: 'int', nullable: false }) 
    userId:number

    @ManyToOne(()=>User, (user)=>user.passations)
    user:User

}











