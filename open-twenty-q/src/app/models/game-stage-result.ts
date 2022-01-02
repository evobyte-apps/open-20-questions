import { Game } from "./game";
import { GameQuestion } from "./game-question";

export interface GameStageResult {
    game_with_new_info?: Game
    next_gamequestion?: GameQuestion
}
