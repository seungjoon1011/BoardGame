import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardGame } from './entity/boardgame.entity';
import { Module } from '@nestjs/common';
import { BoardGameController } from './boardgame.controller';
import { BoardGameService } from './boardgame.service';

@Module({
  imports: [TypeOrmModule.forFeature([BoardGame])],
  controllers: [BoardGameController],
  providers: [BoardGameService],
})
export class BoardGameModule {}
