import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/registerDto';
import { UpdateUserDto } from './dto/update-user.dto';
import { preferredBoardGame } from './entities/preferredBG.entity';
import { playedBoardGame } from './entities/playedBG.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(preferredBoardGame)
    private readonly preferredRepository: Repository<preferredBoardGame>,
    @InjectRepository(playedBoardGame)
    private readonly playedRepository: Repository<playedBoardGame>,
  ) {}

  // private users: CreateUserDto[] = [];
  findAll() {
    return this.userRepository.find();
  }

  async create(dto: RegisterDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findMe(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const { password, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  async updateMe(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const updated = this.userRepository.merge(user, dto);
    const savedUser = await this.userRepository.save(updated);
    const { password, refreshToken, ...safeUser } = savedUser;
    return safeUser;
  }

  async findMyBoardGames(userId: number) {
    await this.findMe(userId);

    const [preferred, played] = await Promise.all([
      this.preferredRepository.find({
        where: { user: { id: userId } },
        relations: { boardgame: true },
      }),
      this.playedRepository.find({
        where: { user: { id: userId } },
        relations: { boardgame: true },
      }),
    ]);

    return {
      preferred: preferred.map((item) => item.boardgame),
      played: played.map((item) => item.boardgame),
    };
  }

  async remove(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
