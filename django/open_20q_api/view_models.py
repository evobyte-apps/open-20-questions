from dataclasses import dataclass


@dataclass
class EntityAnswer:
    id_entity: int
    answer: str


@dataclass
class NewQuestionWithAnswers:
    text: str
    answers: list[EntityAnswer]
