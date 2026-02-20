import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../groups/entities/group.entity';
import { Hall } from '../../halls/entities/hall.entity';

@Entity({ name: 'reservations' })
export class Reservation {
  @PrimaryGeneratedColumn('uuid', { name: 'res_id' })
  id: string;

  @Column('timestamp', { name: 'res_starttime' })
  startTime: Date;

  @Column('timestamp', { name: 'res_endtime' })
  endTime: Date;

  @CreateDateColumn({ name: 'res_createdat', type: 'timestamp' })
  createdAt: Date;

  @Column('text', { name: 'res_purpose' })
  purpose: string;

  @Column('text', { name: 'res_applicationnotes', nullable: true })
  applicationNotes: string;

  @Column('text', { name: 'res_rejectionreason', nullable: true })
  rejectionReason: string;

  @Column('text', { name: 'res_state', default: 'pending' })
  state: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'usr_id' })
  user: User;

  @ManyToOne(() => Group, { eager: true })
  @JoinColumn({ name: 'gru_id' })
  group: Group;

  @ManyToOne(() => Hall, { eager: true })
  @JoinColumn({ name: 'hal_id' })
  hall: Hall;
}