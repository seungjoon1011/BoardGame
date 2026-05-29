import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BoardGameService } from './boardgame.service';
import { CreateBG } from './dto/bg.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('boardgames')
export class BoardGameController {
  constructor(private readonly boardGameService: BoardGameService) {}

  @Get()
  findAll() {
    return this.boardGameService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardGameService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBG: CreateBG) {
    return this.boardGameService.create(createBG);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateBG: CreateBG) {
    return this.boardGameService.update(Number(id), updateBG);
  }

  @Post(':id/preferred')
  @UseGuards(JwtAuthGuard)
  togglePreferred(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.boardGameService.togglePreferred(Number(id), req.user.id);
  }

  @Post(':id/played')
  @UseGuards(JwtAuthGuard)
  togglePlayed(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.boardGameService.togglePlayed(Number(id), req.user.id);
  }
}
