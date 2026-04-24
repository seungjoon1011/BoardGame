import { Body, Controller, Post } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';

@Controller('email')
export class EmailAuthController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('send')
  async send(@Body('email') email: string) {
    return this.emailVerificationService.sendEmailCode(email);
  }

  @Post('verify')
  async verify(@Body('email') email: string, @Body('code') code: string) {
    return this.emailVerificationService.verifyCode(email, code);
  }
}
