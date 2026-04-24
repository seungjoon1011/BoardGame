export declare class MailService {
    private transporter;
    sendAuthCode(email: string, code: string): Promise<void>;
}
