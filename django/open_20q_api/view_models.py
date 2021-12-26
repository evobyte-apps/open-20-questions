from dataclasses import dataclass

from open_20q_api.models import Game


@dataclass
class EntityAnswer:
    id_entity: int
    answer: str


@dataclass
class NewQuestionWithAnswers:
    text: str
    answers: list[EntityAnswer]


@dataclass
class GameStats:
    total_games: int
    total_finished: int
    total_correct: int

    total_24h: int
    total_finished_24h: int
    total_correct_24h: int

    latest_games: list[Game]
