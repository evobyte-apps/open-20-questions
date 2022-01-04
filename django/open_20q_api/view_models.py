from dataclasses import dataclass
from typing import Optional, List

from open_20q_api.models import Game, GameQuestion, GameEntity


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


@dataclass
class GameStageResult:
    game_with_new_info: Optional[Game]
    next_gamequestion: Optional[GameQuestion]
    top_candidates: List[GameEntity]