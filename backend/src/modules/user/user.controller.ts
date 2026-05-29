import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.findMe(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  @Get('me/boardgames')
  @UseGuards(JwtAuthGuard)
  findMyBoardGames(@Req() req: AuthenticatedRequest) {
    return this.usersService.findMyBoardGames(req.user.id);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: AuthenticatedRequest) {
    return this.usersService.remove(req.user.id);
  }
}
