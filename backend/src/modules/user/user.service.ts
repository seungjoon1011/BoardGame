import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/registerDto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  // private users: CreateUserDto[] = [];
  findAll() {
    return this.userRepository.find;
  }

  async create(dto: RegisterDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  async remove(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
