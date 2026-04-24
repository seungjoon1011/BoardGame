import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { RedisModule } from 'src/redis/redis.module';
import { MailModule } from './mail/mail.module';
import { EmailVerificationService } from './email-verification.service';
import { EmailAuthController } from './email-verification.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    TypeOrmModule.forFeature([User]),
    RedisModule,
    MailModule,
  ],
  controllers: [AuthController, EmailAuthController],
  providers: [AuthService, EmailVerificationService],
})
export class AuthModule {}
