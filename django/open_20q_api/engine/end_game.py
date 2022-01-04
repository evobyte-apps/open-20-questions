from django.db.models import F, OuterRef, Case, When, Subquery
from django.db.models.functions import Greatest

from open_20q_api import constants
from open_20q_api.models import QuestionEntity, GameQuestion, Question


def get_gamequestions_with_expected_answers(game):

    # if the game hasn't ended we just return its gamequestion_set
    if not game.feedback_entity:
        return game.gamequestion_set.order_by('-asked_at')

    # I couldn't get this working through the Django ORM
    gamequestions = GameQuestion.objects.raw(
        f'''
select gq.id, gq.game_id, gq.question_id, gq.entropy, gq.answer, gq.asked_at,
case 
    when qe.yes_count=greatest(qe.yes_count, qe.no_count, qe.unknown_count) then 'yes'
    when qe.no_count=greatest(qe.yes_count, qe.no_count, qe.unknown_count) then 'no'
    else 'unknown'
end as "expected_answer"
from public.open_20q_api_gamequestion as gq
join public.open_20q_api_game as game on game.id=gq.game_id
join public.open_20q_api_questionentity qe
    on qe.entity_id=game.feedback_entity_id and qe.question_id=gq.question_id
where gq.game_id=%s
order by gq.asked_at desc
        ''', [game.pk])

    return gamequestions


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

