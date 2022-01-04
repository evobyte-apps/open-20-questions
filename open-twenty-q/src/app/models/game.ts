import { Entity } from "./entity"
import { GameEntity } from "./game-entity";

export interface Game {
    id: string
    guessed: Entity
    feedback_entity: Entity
    top_candidates: GameEntity[]
}
