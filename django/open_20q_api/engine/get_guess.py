from open_20q_api.models import GameEntity


def handle_get_leaders(game, top=5):
    """
    Returns GameEntities for a given game, based on the scores of the
    entities: the first top entity with highest score are always returned, based on
    however the ORM returns the objects in case of equalities.

    """

    top_entities = GameEntity.objects\
        .filter(game_id=game.pk)\
        .order_by('-entity_score')[:top]

    return top_entities
