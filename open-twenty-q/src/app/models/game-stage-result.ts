import { Game } from "./game";
import { GameEntity } from "./game-entity";
import { GameQuestion } from "./game-question";

export interface GameStageResult {
    game_with_new_info?: Game
    next_gamequestion?: GameQuestion
    top_candidates: GameEntity[]
}
