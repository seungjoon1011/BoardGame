"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationService = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("./mail/mail.service");
let EmailVerificationService = class EmailVerificationService {
    redis;
    mailService;
    constructor(redis, mailService) {
        this.redis = redis;
        this.mailService = mailService;
    }
    async sendEmailCode(email) {
        const code = this.generateCode();
        await this.redis.set(`email:verify:${email}`, code, {
            EX: 300,
        });
        await this.mailService.sendAuthCode(email, code);
    }
    generateCode() {
        return Math.floor(10000 + Math.random() * 900000).toString();
    }
    async verifyCode(email, code) {
        const savedCode = await this.redis.get(`email:verify:${email}`);
        if (!savedCode) {
            throw new common_1.BadRequestException('인증 코드가 만료되었습니다.');
        }
        if (savedCode !== code) {
            throw new common_1.BadRequestException('인증 코드가 올바르지 않습니다.');
        }
        await this.redis.del(`email:verify:${email}`);
        await this.redis.set(`email:isAuth:${email}`, 'true', 'EX', 600);
        return { message: '이메일 인증 성공' };
    }
};
exports.EmailVerificationService = EmailVerificationService;
exports.EmailVerificationService = EmailVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [Object, mail_service_1.MailService])
], EmailVerificationService);
//# sourceMappingURL=email-verification.service.js.map