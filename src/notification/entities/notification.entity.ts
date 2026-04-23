import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export enum NotificationType {
  TAG = 'TAG',
  ASSIGNMENT = 'ASSIGNMENT',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM'
}

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  link: string; // URL ou route vers laquelle rediriger (ex: /sous-activity/12)

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
