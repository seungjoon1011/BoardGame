import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { BoardGame } from 'src/modules/boardgame/entity/boardgame.entity';

@Entity()
export class preferredBoardGame {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => BoardGame)
  boardgame: BoardGame;
}
