import { DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export class Timestamp {
  @CreateDateColumn({ update: false })
  @ApiProperty({ description: 'Date de création de l’enregistrement' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Date de la dernière mise à jour de l’enregistrement' })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'Date de suppression (soft delete), null si actif', required: false })
  deletedAt: Date;
}

