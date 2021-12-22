from django.db.models import F

from open_20q_api import constants
from open_20q_api.models import QuestionEntity, GameQuestion, Question


def submit_feedback(game):
    """
    Submits an entity as feedback for a given game. This is used when our guess
    was wrong and we ask the user to provide feedback.
    """
    pass


def update_question_entities(game, for_entity):
    """
    Update the entries in the QuestionEntity table based on the anwers
    to the questions given in the game and either the guessed entity or
    the feedback entity.
    """

    asked_gamequestions = GameQuestion.objects.filter(game_id=game.pk)
    for_update = []
    for_create = []
    for gamequestion in asked_gamequestions:
        yes_update = 1 if gamequestion.answer in constants.affirmative_answers else 0
        no_update = 1 if gamequestion.answer in constants.negative_answers else 0
        unknown_update = 1 if yes_update == 0 and no_update == 0 else 0
        if gamequestion.answer.startswith('prob'):
            yes_update /= constants.partial_matching_answer_divisor
            no_update /= constants.partial_matching_answer_divisor
        existing_questionentity = QuestionEntity.objects.filter(
            question_id=gamequestion.question_id,
            entity_id=for_entity.pk
        ).first()
        if existing_questionentity:
            existing_questionentity.yes_count += yes_update
            existing_questionentity.no_count += no_update
            existing_questionentity.unknown_count += unknown_update
            for_update.append(existing_questionentity)
        else:
            for_create.append(
                QuestionEntity(
                    question=gamequestion.question,
                    entity=for_entity,
                    yes_count=yes_update,
                    no_count=no_update,
                    unknown_count=unknown_update
                )
            )

    QuestionEntity.objects.bulk_create(for_create)
    QuestionEntity.objects.bulk_update(
        for_update,
        ['yes_count', 'no_count', 'unknown_count']
    )

