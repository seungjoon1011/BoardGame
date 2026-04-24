import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerDto';
import { LoginDto } from './dto/loginDto';
import { UsersService } from '../user/user.service';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UsersService);
    register(registerDto: RegisterDto): Promise<import("../user/entities/user.entity").User>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    } | undefined>;
}
