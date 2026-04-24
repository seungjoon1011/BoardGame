import { BoardGame } from './entity/boardgame.entity';
import { Repository } from 'typeorm';
import { CreateBG } from './dto/bg.dto';
export declare class BoardGameService {
    private readonly boardgameRepository;
    constructor(boardgameRepository: Repository<BoardGame>);
    findAll(): (options?: import("typeorm").FindManyOptions<BoardGame> | undefined) => Promise<BoardGame[]>;
    create(dto: CreateBG): Promise<BoardGame>;
}
