import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Timestamp } from "src/timestime-entity/timestamp.entity";
import { Activity } from "src/activity/entities/activity.entity";
import { SousActivity } from "src/sous-activity/entities/sous-activity.entity";
import { DemandeProlongation } from "src/demande-prolongation/entities/demande-prolongation.entity";
import { AnnotationActivity } from "src/annotation-activity/entities/annotation-activity.entity";
import { UserLivrable } from "src/user-livrable/entities/user-livrable.entity";
import { DemandeUser } from "src/demande-user/entities/demande-user.entity";
import { AuditLog } from "src/audit-log/entities/audit-log.entity";

import { UserActivitiesAssignment } from "src/user-activities-assignment/entities/user-activities-assignment.entity";
import { Coordination } from "src/coordination/entities/coordination.entity";

@Entity({ name:'user' })
export class User extends Timestamp {

  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'ID unique de l’utilisateur' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Nom de l’utilisateur' })
  nom: string;

  @Column({ nullable: true, type: 'varchar' })
  @ApiPropertyOptional({ description: 'Postnom de l’utilisateur' })
  postnom?: string;

  @Column()
  @ApiProperty({ description: 'Prénom de l’utilisateur' })
  prenom: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Adresse e-mail de l’utilisateur' })
  email?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Signature de l’utilisateur' })
  signature?: string;

  @Column({ name: 'coordinationId', type: 'int', nullable: true })
  @ApiProperty({ description: 'ID de la coordination associée à l’utilisateur' })
  coordinationId?: number;

  @Column()
  @ApiProperty({ description: 'Sexe de l’utilisateur (M/F)' })
  sexe: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Numéro de téléphone de l’utilisateur' })
  telephone?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Code OTP de l’utilisateur' })
  otp?: string;

  @Column()
  @ApiProperty({ description: 'Nom d’utilisateur pour la connexion' })
  username: string;

  @Column({ default:"N/A" })
  @ApiProperty({ description: 'Mot de passe (hashé)' })
  password: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Indique si l’utilisateur est superviseur' })
  isSupervisor: boolean;

  @Column({ default: false })
  @ApiProperty({ description: 'Indique si le compte est activé' })
  isActive: boolean;

  @Column({ default: true })
  @ApiProperty({ description: 'Statut actif ou inactif de l’utilisateur' })
  status: boolean;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'ID de la direction' })
  directionId?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'ID de la direction générale' })
  directionGeneraleId?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'ID du service' })
  serviceId?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'ID de la division' })
  divisionId?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Nom de la division' })
  division?: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Indique si le mot de passe a été défini' })
  isSetPassword: boolean;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Nom du service' })
  service?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Nom de la direction' })
  direction?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Fonction de l’utilisateur' })
  fonction?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Grade de l’utilisateur' })
  grade?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'ID du directeur' })
  directeurId?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'ID de l’agent délégué' })
  agentDelegueId?: number;

  // Relations

  @OneToMany(() => Activity, (activity) => activity.user)

  activities: Activity[];

  @OneToMany(() => SousActivity, (subactivity) => subactivity.user)
 
  subactivities: SousActivity[];

  @OneToMany(() => DemandeProlongation, (demande) => demande.user)
 
  demandeProlongations: DemandeProlongation[];

  @OneToMany(() => AnnotationActivity, (annotation) => annotation.user)

  annotations: AnnotationActivity[];

  @OneToMany(() => UserLivrable, (agentValidateur) => agentValidateur.user)

  agentValidateur: UserLivrable[];

  @OneToMany(() => DemandeUser, (demandeUser) => demandeUser.user)

  demandeUser: DemandeUser[];

  @OneToMany(() => AuditLog, (auditable) => auditable.user)

  auditable: AuditLog[];

  @ManyToOne(() => Coordination, (coordination)=>coordination.user, { eager: true })
  @JoinColumn({ name: 'coordinationId' })
  coordination: Coordination;

  @OneToMany(() => UserActivitiesAssignment, (assignment) => assignment.user)
  userActivitiesAssignments: UserActivitiesAssignment[];
}
