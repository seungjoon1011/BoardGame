import { Body, Controller, Get, Post } from '@nestjs/common';
import { BoardGameService } from './boardgame.service';
import { CreateBG } from './dto/bg.dto';

@Controller('boardgame')
export class BoardGameController {
  constructor(private readonly boardGameService: BoardGameService) {}
  @Get()
  findAll() {
    return this.boardGameService.findAll();
  }
  @Post()
  create(@Body() createBG: CreateBG) {
    return this.boardGameService.create(createBG);
  }
}
