import { BoardGameService } from './boardgame.service';
import { CreateBG } from './dto/bg.dto';
export declare class BoardGameController {
    private readonly boardGameService;
    constructor(boardGameService: BoardGameService);
    findAll(): (options?: import("typeorm").FindManyOptions<import("./entity/boardgame.entity").BoardGame> | undefined) => Promise<import("./entity/boardgame.entity").BoardGame[]>;
    create(createBG: CreateBG): Promise<import("./entity/boardgame.entity").BoardGame>;
}
