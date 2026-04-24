import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BoardGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  difficulty: number;

  @Column()
  minPlayer: number;

  @Column()
  maxPlayer: number;

  @Column('json')
  genres: string[];
}
