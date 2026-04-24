import { EmailVerificationService } from './email-verification.service';
export declare class EmailAuthController {
    private readonly emailVerificationService;
    constructor(emailVerificationService: EmailVerificationService);
    send(email: string): Promise<void>;
    verify(email: string, code: string): Promise<{
        message: string;
    }>;
}
