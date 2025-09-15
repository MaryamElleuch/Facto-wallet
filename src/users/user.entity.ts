import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Account } from 'src/accounts/account.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: false })
  email: string;

  @Column({ default: 'default_password' })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  lastName: string; // ✅ nouveau

  @Column({ nullable: true })
  idType: string; // ✅ type de pièce d'identité

  @Column({ nullable: true })
  idNumber: string; // ✅ numéro de pièce

  @Column({ default: false })
  isValidated: boolean;

  @Column({ type: 'text', nullable: true })
  validationToken: string | null;

  @OneToMany(() => Account, (account) => account.user, { cascade: true })
  accounts: Account[];
}
