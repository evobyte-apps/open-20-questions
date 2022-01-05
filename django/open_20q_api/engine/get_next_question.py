from django.db.models import F, Count
from scipy.stats import entropy

from open_20q_api import constants
from open_20q_api.models import QuestionEntity, GameQuestion, \
    Question, GameEntity
from open_20q_api.view_models import GameStageResult


def compute_question_counts(leader_entity, asked_questions):
    """
    Computes question counts, a dictionary:
    d[q] = (yes_count, no_count) where:
    - q is a question from the QuestionEntity table
    - yes_count is how many entities have a majority yes answer for q
    - no_count is how many entities have a majority no answer for q
    - unknown answers are ignored

    Computed only among unasked questions q.
    """
    question_counts = {}

    cutoff = leader_entity.entity_score - constants.distance_from_leader_cutoff
    cutoff_entities = GameEntity.objects \
        .filter(
        entity_score__lt=cutoff,
        game_id=leader_entity.game_id) \
        .values_list('entity_id', flat=True)
    question_entities = QuestionEntity.objects \
        .exclude(question_id__in=asked_questions) \
        .exclude(entity_id__in=cutoff_entities)
    for questionentity in question_entities:
        yes, no, unknown = questionentity.yes_count, \
                           questionentity.no_count, \
                           questionentity.unknown_count
        q = questionentity.question
        if yes == max(yes, no, unknown):
            update = [1, 0]
        elif no == max(yes, no, unknown):
            update = [0, 1]
        else:
            update = [0, 0]
        if q in question_counts:
            question_counts[q][0] += update[0]
            question_counts[q][1] += update[1]
        else:
            question_counts[q] = update

    return question_counts


def compute_entropies(question_counts):
    """
    Updates the question_counts dictionary to:
    d[q] = entropy for q
    based on the computed counts.

    Returns a list of (question, entropy) sorted descendingly by entropy.
    """
    entropies = {}
    for key in question_counts:
        counts = question_counts[key]
        s = sum(counts)
        if s == 0:
            entropies[key] = 0
        else:
            entropies[key] = entropy([counts[0] / s, counts[1] / s], base=2)

    questions_entropies = sorted(entropies.items(), key=lambda x: x[1],
                                 reverse=True)

    return questions_entropies


def handle_get_next_stage(game, leader_entities):
    """
    Returns the next GameQuestion object for a given game or the game with a guess.
    """

    asked_questions = game.gamequestion_set.count()
    if asked_questions == constants.max_total_questions or \
            asked_questions == Question.objects.count():
        game.guessed = leader_entities[0].entity
        game.save()
        return GameStageResult(game_with_new_info=game,
                               next_gamequestion=None,
                               top_candidates=leader_entities)

    asked_questions = GameQuestion.objects \
        .filter(game_id=game.pk) \
        .values_list('question_id', flat=True)

    # probably we don't have many entities yet,
    # so just return a random question
    if len(leader_entities) < 2:
        next_gamequestion = GameQuestion.objects.create(
            game=game,
            question=Question
                .objects
                .exclude(pk__in=asked_questions)
                .order_by('?')
                .first(),
            entropy=-1)

        return GameStageResult(game_with_new_info=None,
                               next_gamequestion=next_gamequestion,
                               top_candidates=leader_entities)

    question_counts = compute_question_counts(leader_entities[0],
                                              asked_questions)
    questions_entropies = compute_entropies(question_counts)

    # guess or explore
    leaders_diff = leader_entities[0].entity_score - leader_entities[
        1].entity_score
    entropies_ok = questions_entropies and questions_entropies[0][1] > 0
    if not entropies_ok or leaders_diff > constants.clear_leader_cutoff:
        if game.exploration_questions < constants.exploration_questions_after_clear_leader:

            game.exploration_questions += 1
            game.save()

            # try the one not linked to the leader and with fewest links
            to_ask = Question.objects \
                .exclude(pk__in=asked_questions) \
                .exclude(questionentity__entity=leader_entities[0].entity) \
                .annotate(total_links=Count('questionentity__entity')) \
                .order_by('total_links') \
                .first()
            if not to_ask:
                # then just one with fewest links
                to_ask = Question.objects \
                    .exclude(pk__in=asked_questions) \
                    .annotate(total_links=Count('questionentity__entity')) \
                    .order_by('total_links') \
                    .first()

            if to_ask:
                next_gamequestion = GameQuestion.objects.create(
                    game=game,
                    question=to_ask,
                    entropy=-1)

                return GameStageResult(game_with_new_info=None,
                                       next_gamequestion=next_gamequestion,
                                       top_candidates=leader_entities)
        else:
            game.exploration_questions = 0
            game.save()

        game.guessed = leader_entities[0].entity
        game.save()
        return GameStageResult(game_with_new_info=game,
                               next_gamequestion=None,
                               top_candidates=leader_entities)
    else:
        next_gamequestion = GameQuestion.objects.create(
            game=game,
            question=questions_entropies[0][0],
            entropy=questions_entropies[0][1])

        return GameStageResult(game_with_new_info=None,
                               next_gamequestion=next_gamequestion,
                               top_candidates=leader_entities)