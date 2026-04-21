import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  async sendAuthCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: '회원가입 인증 코드입니다',
      text: `인증 코드 : ${code}`,
    });
  }
}
