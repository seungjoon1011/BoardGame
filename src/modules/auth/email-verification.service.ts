import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MailService } from './mail/mail.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    @Inject('REDIS') private readonly redis,
    private readonly mailService: MailService,
  ) {}
  async sendEmailCode(email: string) {
    const code = this.generateCode();
    await this.redis.set(`email:verify:${email}`, code, {
      EX: 300,
    });
    await this.mailService.sendAuthCode(email, code);
  }
  private generateCode(): string {
    return Math.floor(10000 + Math.random() * 900000).toString();
  }
  async verifyCode(email: string, code: string) {
    const savedCode = await this.redis.get(`email:verify:${email}`);

    if (!savedCode) {
      throw new BadRequestException('인증 코드가 만료되었습니다.');
    }
    if (savedCode !== code) {
      throw new BadRequestException('인증 코드가 올바르지 않습니다.');
    }

    await this.redis.del(`email:verify:${email}`);

    await this.redis.set(`email:isAuth:${email}`, 'true', 'EX', 600);

    return { message: '이메일 인증 성공' };
  }
}
