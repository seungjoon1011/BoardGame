import { User } from './user.entity';
import { BoardGame } from "../../boardgame/entity/boardgame.entity";
export declare class preferredBoardGame {
    id: number;
    user: User;
    boardgame: BoardGame;
}
