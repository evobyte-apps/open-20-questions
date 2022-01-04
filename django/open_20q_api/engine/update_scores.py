from django.db.models import F
from django.db.models.functions import Greatest

from open_20q_api import constants
from open_20q_api.models import QuestionEntity, GameEntity


def handle_update_scores(gamequestion, leader_entities):
    """
    Updates a game's entity scores based on an answered gamequestion.
    Answer=yes: all entities whose majority answer is yes get constants.full_matching_answer_score
    Answer=no: all entities whose majority answer is no get constants.full_matching_answer_score
    Answer=prob_yes/no: all entities with the matching majority answer get constants.partial_matching_answer_score
    Answer=unknown: no updates
    """
    game = gamequestion.game
    question = gamequestion.question
    given_answer = gamequestion.answer
    entities_to_score = []
    if not leader_entities:
        cutoff = -1
    else:
        cutoff = leader_entities[0].entity_score - constants.distance_from_leader_cutoff
    if given_answer in constants.affirmative_answers:
        entities_to_score = QuestionEntity.objects\
            .filter(
                question=question,
                yes_count=Greatest(F('yes_count'), F('no_count'),
                                   F('unknown_count')),
                entity__gameentity__game_id=game.pk,
                entity__gameentity__entity_score__gte=cutoff
            )\
            .values_list('entity_id', flat=True)
    elif given_answer in constants.negative_answers:
        entities_to_score = QuestionEntity.objects\
            .filter(
                question=question,
                no_count=Greatest(F('yes_count'), F('no_count'),
                                  F('unknown_count')),
                entity__gameentity__game_id=game.pk,
                entity__gameentity__entity_score__gte=cutoff
            )\
            .values_list('entity_id', flat=True)

    if entities_to_score:
        score_by = constants.full_matching_answer_score
        if given_answer.startswith('prob'):
            score_by /= constants.partial_matching_answer_divisor
        gameentities_to_score = GameEntity.objects.filter(
            game_id=game.pk,
            entity_id__in=entities_to_score
        )
        for gameentity_to_score in gameentities_to_score:
            gameentity_to_score.entity_score += score_by
        GameEntity.objects.bulk_update(gameentities_to_score, ['entity_score'])

