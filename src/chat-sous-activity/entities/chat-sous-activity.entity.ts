import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { SousActivity } from 'src/sous-activity/entities/sous-activity.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('chat_sous_activity')
export class ChatSousActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Contenu du message ou commentaire' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ description: 'Ressources partagées (liens, noms de fichiers)', example: ['rapport.pdf', 'https://link.com'] })
  @Column({ type: 'json', nullable: true })
  resources: string[];

  @ApiProperty({ description: 'Indique si ce message marque un changement d\'état d\'avancement' })
  @Column({ default: false })
  isProgressUpdate: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  sousActivityId: number;

  @ManyToOne(() => SousActivity, (sa) => sa.chatMessages)
  @JoinColumn({ name: 'sousActivityId' })
  sousActivity: SousActivity;

  @CreateDateColumn()
  createdAt: Date;
}
