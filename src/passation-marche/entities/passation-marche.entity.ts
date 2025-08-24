


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

    @Column({ name: 'intitule', type: 'text' })
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

    @Column({ name: 'as_tdr', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de TDR' })
    asTDR?: string;

    @Column({ name: 'as_amidao', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de AMIDAO' })
    asAMIDAO: string | null;

    @Column({ name: 'as_ano', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de ANO' })
    asANO: string | null;

    @Column({ name: 'as_public', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Est public' })
    asPublic: string | null;

    @Column({ name: 'as_depot', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Dispose de dépôt' })
    asDepot: string | null;

    @Column({ name: 'sub_commission_analyse', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Sous-commission analyse' })
    subCommission_analyse: string | null;

    @Column({ name: 'commission_pm', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Commission PM' })
    commission_pm: string | null;

    @Column({ name: 'demande_proposition', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Demande de proposition' })
    demande_prop: string | null;

    @Column({ name: 'depot_proposition_tech', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Dépôt proposition technique' })
    depot_prop_Tech: string | null;

    @Column({ name: 'analyse_technique', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse technique' })
    analyse_tech: string | null;

    @Column({ name: 'analyse_proposition_fin', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse proposition financière' })
    analyse_prop_fin: string | null;

    @Column({ name: 'analyse_combinee', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Analyse combinée' })
    analyse_comb: string | null;

    @Column({ name: 'notification', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Notification' })
    notif: string | null;

    @Column({ name: 'publication_2', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Deuxième publication' })
    publication2: string | null;

    @Column({ name: 'ano_rapport_analyse', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'ANO rapport analyse' })
    ano_rapport_analyse: string | null;

    @Column({ name: 'mise_point_contrat', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Mise au point contrat' })
    mise_point_contrat: string | null;

    @Column({ name: 'approbation_tutelle_pm', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Approbation tutelle PM' })
    approb_tut_pm: string | null;

    @Column({ name: 'notification_definitive', type: 'varchar', nullable: true })
    @ApiPropertyOptional({ description: 'Notification définitive' })
    notif_def: string | null;

    @Column({ name: 'observations', type: 'text', nullable: true })
    @ApiPropertyOptional({ description: 'Observations' })
    obs: string | null;

    @Column({ name: 'userId', type: 'int', nullable: false }) 
    userId:number

    @ManyToOne(()=>User, (user)=>user.passations)
    user:User

}











