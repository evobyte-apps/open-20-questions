from open_20q_api.engine.get_guess import handle_get_leaders
from open_20q_api.engine.get_next_question import handle_get_next_stage
from open_20q_api.models import Game, Entity, GameEntity, Question, \
    GameQuestion


def handle_start_game():
    """
    Starts a game and returns the first question in it.
    """

    game = Game()
    game.save()
    entities = Entity.objects.all()
    game_entities = []
    for entity in entities:
        game_entity = GameEntity(game=game, entity=entity)
        game_entities.append(game_entity)

    GameEntity.objects.bulk_create(game_entities)

    leader_entities = handle_get_leaders(game)
    first_gamestage = handle_get_next_stage(game, leader_entities)
    first_gamestage.game_with_new_info = game

    return first_gamestage
