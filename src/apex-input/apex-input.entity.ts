import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity({ name: 'apex_input' })
export class ApexInput {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cost_center: string | null;

  @Column({ type: 'text', nullable: true })
  description_cc: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  province_ville: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coordinations_provinciales: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  local_etranger: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categorie_grade: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nature_depenses: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  account_ohada: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  departement: string | null;

  @Column({ type: 'text', nullable: true })
  texte_libelle: string | null;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  cout_unitaire_auto: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  unite_de_mesure: string | null;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  cout_unitaire_manuel: string | null;

  // months
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) jan: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) feb: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) mar: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) apr: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) may: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) jun: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) jul: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) aug: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) sep: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) oct: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) nov: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) dec: string | null;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) total_units: string | null;
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true }) total_budget_usd: string | null;

  @Column({ type: 'int', nullable: true })
  department_id: number | null;

  @Column({ type: 'int', nullable: true })
  mapping_cash_flow_id: number | null;

  @Column({ type: 'int', nullable: true })
  activity_id: number | null;

  @Column({ type: 'int', nullable: true })
  sous_activity_id: number | null;

  @Column({ type: 'int', nullable: true })
  tache_id: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleteAt: Date | null;
}

export default ApexInput;
