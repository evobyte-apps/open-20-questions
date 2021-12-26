import { Game } from "./game";

export interface GameStats {
    total_games: number
    total_finished: number
    total_correct: number

    total_24h: number
    total_finished_24h: number
    total_correct_24h: number

    latest_games: Game[]
}