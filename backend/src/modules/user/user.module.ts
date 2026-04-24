import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BoardGame } from '../boardgame/entity/boardgame.entity';
import { preferredBoardGame } from './entities/preferredBG.entity';
import { playedBoardGame } from './entities/playedBG.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      BoardGame,
      preferredBoardGame,
      playedBoardGame,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
