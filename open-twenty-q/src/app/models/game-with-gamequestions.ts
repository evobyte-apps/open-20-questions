import { Entity } from "./entity"
import { GameQuestion } from "./game-question"

export interface GameWithGameQuestions {
    id: string
    started_at: Date
    gamequestion_set: GameQuestion[]
    guessed: Entity
    feedback_entity: Entity
    
}
