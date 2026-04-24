import { MailService } from './mail/mail.service';
export declare class EmailVerificationService {
    private readonly redis;
    private readonly mailService;
    constructor(redis: any, mailService: MailService);
    sendEmailCode(email: string): Promise<void>;
    private generateCode;
    verifyCode(email: string, code: string): Promise<{
        message: string;
    }>;
}
