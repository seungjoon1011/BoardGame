"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const user_entity_1 = require("../user/entities/user.entity");
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("@nestjs/typeorm");
const mail_service_1 = require("./mail/mail.service");
let AuthService = class AuthService {
    jwtService;
    userService;
    mailService;
    userRepository;
    redis;
    constructor(jwtService, userService, mailService, userRepository, redis) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.mailService = mailService;
        this.userRepository = userRepository;
        this.redis = redis;
    }
    async register(dto) {
        const isAuth = await this.redis.get(`email:isAuth:${dto.email}`);
        if (!isAuth) {
            throw new common_1.BadRequestException('이메일 인증이 필요합니다.');
        }
        const hashedPw = await bcrypt.hash(dto.password, 10);
        const user = await this.userRepository.create({
            ...dto,
            password: hashedPw,
        });
        await this.redis.del(`email:isAuth:${dto.email}`);
        return this.userRepository.save(user);
    }
    async login(dto) {
        const realUser = await this.userService.findByEmail(dto.email);
        console.log(realUser);
        if (!realUser) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(dto.password, realUser.password);
        if (isMatch) {
            const payload = {
                sub: realUser.id,
                email: realUser.email,
            };
            console.log('로그인 성공');
            return {
                access_token: this.jwtService.sign(payload),
            };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(4, (0, common_1.Inject)('REDIS')),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UsersService,
        mail_service_1.MailService,
        typeorm_1.Repository, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map