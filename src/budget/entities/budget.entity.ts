import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, RelationId, OneToMany } from 'typeorm';
import { Department } from 'src/department/entities/department.entity';
import { MappingCashFlow } from './mapping-cashflow.entity';
import { BudgetActivity } from './budget-activity.entity';
import { BudgetSousActivity } from './budget-sous-activity.entity';
import { BudgetTache } from './budget-tache.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Entity('budget')
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cost_center', type: 'varchar', length: 255, nullable: true })
  costCenter: string | null;

  @Column({ name: 'description_cc', type: 'text', nullable: true })
  descriptionCc: string | null;

  @Column({ name: 'province_ville', type: 'varchar', length: 255, nullable: true })
  provinceVille: string | null;

  @Column({ name: 'coordinations_provinciales', type: 'text', nullable: true })
  coordinationsProvinciales: string | null;

  @Column({ name: 'local_etranger', type: 'varchar', length: 100, nullable: true })
  localEtranger: string | null;

  @Column({ name: 'categorie_grade', type: 'varchar', length: 255, nullable: true })
  categorieGrade: string | null;

  @Column({ name: 'nature_depenses', type: 'text', nullable: true })
  natureDepenses: string | null;

  @Column({ name: 'account_ohada', type: 'varchar', length: 255, nullable: true })
  accountOhada: string | null;

  @Column({ name: 'departement', type: 'varchar', length: 255, nullable: true })
  departement: string | null;

  @Column({ name: 'texte_libelle', type: 'text', nullable: true })
  texteLibelle: string | null;

  @Column({ name: 'unite_mesure', type: 'varchar', length: 255, nullable: true })
  uniteMesure: string | null;

  @Column({ name: 'cout_unitaire_usd', type: 'decimal', precision: 15, scale: 2, nullable: true })
  coutUnitaireUsd: string | null;

  @Column({ name: 'jan', type: 'decimal', precision: 15, scale: 2, nullable: true })
  jan: string | null;
  @Column({ name: 'feb', type: 'decimal', precision: 15, scale: 2, nullable: true })
  feb: string | null;
  @Column({ name: 'mar', type: 'decimal', precision: 15, scale: 2, nullable: true })
  mar: string | null;
  @Column({ name: 'apr', type: 'decimal', precision: 15, scale: 2, nullable: true })
  apr: string | null;
  @Column({ name: 'may', type: 'decimal', precision: 15, scale: 2, nullable: true })
  may: string | null;
  @Column({ name: 'jun', type: 'decimal', precision: 15, scale: 2, nullable: true })
  jun: string | null;
  @Column({ name: 'jul', type: 'decimal', precision: 15, scale: 2, nullable: true })
  jul: string | null;
  @Column({ name: 'aug', type: 'decimal', precision: 15, scale: 2, nullable: true })
  aug: string | null;
  @Column({ name: 'sep', type: 'decimal', precision: 15, scale: 2, nullable: true })
  sep: string | null;
  @Column({ name: 'oct', type: 'decimal', precision: 15, scale: 2, nullable: true })
  oct: string | null;
  @Column({ name: 'nov', type: 'decimal', precision: 15, scale: 2, nullable: true })
  nov: string | null;
  @Column({ name: 'dec', type: 'decimal', precision: 15, scale: 2, nullable: true })
  dec: string | null;

  @Column({ name: 'total_units', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalUnits: string | null;

  @Column({ name: 'total_budget_usd', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalBudgetUsd: string | null;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @RelationId((b: Budget) => b.department)
  departmentId?: number;

  @ManyToOne(() => MappingCashFlow, { nullable: true })
  @JoinColumn({ name: 'mapping_cash_flow_id' })
  mappingCashFlow?: MappingCashFlow;

  @RelationId((b: Budget) => b.mappingCashFlow)
  mappingCashFlowId?: number;

  @ManyToOne(() => BudgetActivity, { nullable: true })
  @JoinColumn({ name: 'activity_id' })
  activity?: BudgetActivity;

  @RelationId((b: Budget) => b.activity)
  activityId?: number;

  @ManyToOne(() => BudgetSousActivity, { nullable: true })
  @JoinColumn({ name: 'sous_activity_id' })
  sousActivity?: BudgetSousActivity;

  @RelationId((b: Budget) => b.sousActivity)
  sousActivityId?: number;

  @ManyToOne(() => BudgetTache, { nullable: true })
  @JoinColumn({ name: 'tache_id' })
  tache?: BudgetTache;

  @RelationId((b: Budget) => b.tache)
  tacheId?: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', precision: 6, nullable: true })
  deletedAt: Date | null;

  @OneToMany(()=>Transaction, (transactions)=>transactions.centre, {eager:true})
  transactions:Transaction[]

}
