import { Group } from 'src/groups/entities/group.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, BeforeInsert} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid', {name: 'usr_id'})
    id: string;

    @Column('text', { name: 'usr_name' })
    name: string;

    @Column("text", { name: 'usr_email', unique: true })
    email: string;

    @Column("text", { name: 'usr_password' })
    @Exclude()
    password: string;

    @Column("bool", { name: 'usr_isadmin', default: false })
    isAdmin: boolean;

    @BeforeInsert()
    async hashPassword() {
        if (!this.password) return;

        if (!this.password.startsWith('$2b$') && !this.password.startsWith('$2a$')) {
          this.password = await bcrypt.hash(this.password, 10);
        }
    }

    @ManyToMany(() => Group, { eager: true })
    @JoinTable({
        name: 'integrates',
        joinColumn: {
            name: 'usr_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'gru_id',
            referencedColumnName: 'id'
        }
    })
    groups: Group[];  
}


