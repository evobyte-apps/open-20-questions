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


def compute_entropies(game, leader_entity):
    cutoff = leader_entity.entity_score - constants.distance_from_leader_cutoff

    question_entropies = Question.objects.raw(
"""

SELECT
	t.question_id as id,
	case 
		when t.yeses = 0 or t.nos = 0 then 0
		else (-(t.yeses::float / (t.yeses + t.nos))*log((t.yeses::float / (t.yeses+ t.nos)))/0.30102999566-(t.nos::float / (t.yeses + t.nos))*log(t.nos::float / (t.yeses + t.nos))/0.30102999566) 
	end as entropy
FROM (
	SELECT
		qe.question_id,
		sum(
			case when qe.yes_count = greatest(
			    qe.no_count, 
			    qe.yes_count, 
			    qe.unknown_count) then 1 else 0 end
		) as yeses,
		sum(
			case when qe.no_count = greatest(
			    qe.no_count, 
			    qe.yes_count, 
			    qe.unknown_count) then 1 else 0 end
		) as nos
	FROM 	
		public.open_20q_api_questionentity as qe
	WHERE (
		NOT EXISTS (
			SELECT 
			    gq.question_id 
            FROM 
                public.open_20q_api_gamequestion gq 
            WHERE 
                gq.game_id = %s and gq.question_id = qe.question_id 
		) AND NOT EXISTS (
			SELECT 
			    ge.entity_id 
			FROM 
			    public.open_20q_api_gameentity ge 
			WHERE ge."entity_score" < %s AND ge.game_id = %s and ge.entity_id = qe.entity_id
			)
		)
	group by 
		qe.question_id
) t
order by entropy desc
""", [game.pk, cutoff, game.pk])

    return question_entropies


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

    # probably we don't have many entities yet,
    # so just return a random question
    if len(leader_entities) < 2:
        asked_questions = GameQuestion.objects \
            .filter(game_id=game.pk) \
            .values_list('question_id', flat=True)
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

    questions_entropies = compute_entropies(game, leader_entities[0])

    # guess or explore
    leaders_diff = leader_entities[0].entity_score - leader_entities[
        1].entity_score
    entropies_ok = questions_entropies and questions_entropies[0].entropy > 0
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
            question_id=questions_entropies[0].id,
            entropy=questions_entropies[0].entropy)

        return GameStageResult(game_with_new_info=None,
                               next_gamequestion=next_gamequestion,
                               top_candidates=leader_entities)