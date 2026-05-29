import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardGame } from './entity/boardgame.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBG } from './dto/bg.dto';
import { User } from '../user/entities/user.entity';
import { preferredBoardGame } from '../user/entities/preferredBG.entity';
import { playedBoardGame } from '../user/entities/playedBG.entity';

@Injectable()
export class BoardGameService {
  constructor(
    @InjectRepository(BoardGame)
    private readonly boardgameRepository: Repository<BoardGame>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(preferredBoardGame)
    private readonly preferredRepository: Repository<preferredBoardGame>,
    @InjectRepository(playedBoardGame)
    private readonly playedRepository: Repository<playedBoardGame>,
  ) {}

  findAll() {
    return this.boardgameRepository.find();
  }

  async findOne(id: number) {
    const boardGame = await this.boardgameRepository.findOne({ where: { id } });

    if (!boardGame) {
      throw new NotFoundException('보드게임을 찾을 수 없습니다.');
    }

    return boardGame;
  }

  async create(dto: CreateBG) {
    const bg = this.boardgameRepository.create(dto);
    return this.boardgameRepository.save(bg);
  }

  async update(id: number, dto: CreateBG) {
    const boardGame = await this.findOne(id);
    const updated = this.boardgameRepository.merge(boardGame, dto);
    return this.boardgameRepository.save(updated);
  }

  async togglePreferred(boardGameId: number, userId: number) {
    const [user, boardgame] = await Promise.all([
      this.findUser(userId),
      this.findOne(boardGameId),
    ]);
    const current = await this.preferredRepository.findOne({
      where: { user: { id: userId }, boardgame: { id: boardGameId } },
      relations: { user: true, boardgame: true },
    });

    if (current) {
      await this.preferredRepository.remove(current);
      return { preferred: false };
    }

    await this.preferredRepository.save(
      this.preferredRepository.create({ user, boardgame }),
    );
    return { preferred: true };
  }

  async togglePlayed(boardGameId: number, userId: number) {
    const [user, boardgame] = await Promise.all([
      this.findUser(userId),
      this.findOne(boardGameId),
    ]);
    const current = await this.playedRepository.findOne({
      where: { user: { id: userId }, boardgame: { id: boardGameId } },
      relations: { user: true, boardgame: true },
    });

    if (current) {
      await this.playedRepository.remove(current);
      return { played: false };
    }

    await this.playedRepository.save(
      this.playedRepository.create({ user, boardgame }),
    );
    return { played: true };
  }

  private async findUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }
}
