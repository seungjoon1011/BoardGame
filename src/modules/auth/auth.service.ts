import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/loginDto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/registerDto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from './mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('REDIS') private readonly redis,
  ) {}

  async register(dto: RegisterDto) {
    const isAuth = await this.redis.get(`email:isAuth:${dto.email}`);

    if (!isAuth) {
      throw new BadRequestException('이메일 인증이 필요합니다.');
    }
    const hashedPw = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPw,
    });
    await this.redis.del(`email:isAuth:${dto.email}`);
    return this.userRepository.save(user);
  }
  async login(dto: LoginDto) {
    const realUser = await this.userService.findByEmail(dto.email);
    console.log(realUser);
    if (!realUser) {
      throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(dto.password, realUser.password);
    if (isMatch) {
      const payload = {
        sub: realUser.id,
        email: realUser.email,
      };
      console.log('로그인 성공');
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }
}
