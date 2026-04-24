import { LoginDto } from './dto/loginDto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/registerDto';
import { MailService } from './mail/mail.service';
export declare class AuthService {
    private jwtService;
    private userService;
    private mailService;
    private readonly userRepository;
    private readonly redis;
    constructor(jwtService: JwtService, userService: UsersService, mailService: MailService, userRepository: Repository<User>, redis: any);
    register(dto: RegisterDto): Promise<User>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    } | undefined>;
}
