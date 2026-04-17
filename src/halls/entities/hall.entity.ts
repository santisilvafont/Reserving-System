import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'halls' })
export class Hall {
    @PrimaryGeneratedColumn('uuid', { name: 'hal_id' })
    id: string;

    @Column('text', { name: 'hal_name', unique: true })
    name: string;
    
    @Column('text', { name: 'hal_description', nullable: true })
    description: string;

    @Column('bool', { name: 'hal_isactive', default: true })
    isActive: boolean;
}