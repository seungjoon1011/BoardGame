import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column()
  birth: Date;

  @Column({ nullable: true })
  profileImageKey?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true })
  refreshToken?: string;
}
