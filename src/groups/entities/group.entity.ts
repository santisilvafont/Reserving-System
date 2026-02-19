import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn('uuid', {name: 'gru_id'})
  id: string;

  @Column('text', { name: 'gru_name', unique: true })
  name: string;

  @Column('text', { name: 'gru_description', nullable: true })
  description: string;

  @Column('bool', { name: 'gru_isActive', default: true })
  isActive: boolean;
}