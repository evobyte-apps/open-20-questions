import { Game } from "./game"
import { Question } from "./question"

export interface GameQuestion {
    id: string
    question?: Question
    answer?: string
    entropy?: number
    expected_answer?: string
}
