import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): (options?: import("typeorm").FindManyOptions<import("./entities/user.entity").User> | undefined) => Promise<import("./entities/user.entity").User[]>;
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    remove(req: any): Promise<import("typeorm").DeleteResult>;
}
