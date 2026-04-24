import { Injectable } from '@nestjs/common';
import { BoardGame } from './entity/boardgame.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBG } from './dto/bg.dto';

@Injectable()
export class BoardGameService {
  constructor(
    @InjectRepository(BoardGame)
    private readonly boardgameRepository: Repository<BoardGame>,
  ) {}
  findAll() {
    return this.boardgameRepository.find;
  }
  async create(dto: CreateBG) {
    const bg = this.boardgameRepository.create(dto);
    return this.boardgameRepository.save(bg);
  }
}
