import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/registerDto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): (options?: import("typeorm").FindManyOptions<User> | undefined) => Promise<User[]>;
    create(dto: RegisterDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    remove(userId: number): Promise<import("typeorm").DeleteResult>;
}
