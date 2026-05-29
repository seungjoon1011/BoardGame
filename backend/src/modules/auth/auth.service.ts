import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    const savedUser = await this.userRepository.save(user);
    const { password, refreshToken, ...safeUser } = savedUser;
    return safeUser;
  }

  async login(dto: LoginDto) {
    const realUser = await this.userService.findByEmail(dto.email);
    if (!realUser) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    const isMatch = await bcrypt.compare(dto.password, realUser.password);

    if (!isMatch) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.issueTokens(realUser);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: number; email: string };

    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('refresh token이 유효하지 않습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException('refresh token이 유효하지 않습니다.');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isMatch) {
      throw new UnauthorizedException('refresh token이 유효하지 않습니다.');
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.userRepository.update(user.id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
