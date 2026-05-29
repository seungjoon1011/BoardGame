import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardGame } from './entity/boardgame.entity';
import { Module } from '@nestjs/common';
import { BoardGameController } from './boardgame.controller';
import { BoardGameService } from './boardgame.service';
import { preferredBoardGame } from '../user/entities/preferredBG.entity';
import { playedBoardGame } from '../user/entities/playedBG.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardGame,
      User,
      preferredBoardGame,
      playedBoardGame,
    ]),
  ],
  controllers: [BoardGameController],
  providers: [BoardGameService],
})
export class BoardGameModule {}
