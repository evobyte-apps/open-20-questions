import { Entity } from "./entity"

export interface Game {
    id: string
    guessed: Entity
    feedback_entity: Entity
}
