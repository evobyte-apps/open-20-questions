from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from open_20q_api.engine.end_game import update_question_entities
from open_20q_api.models import Game, Entity
from open_20q_api.serializers import EntitySerializer


class GameProvideFeedbackView(APIView):

    def post(self, request, pk, format=None):
        game = self.get_game(pk)
        entity_serializer = EntitySerializer(data=request.data)
        if entity_serializer.is_valid():
            existing_entity = Entity.objects.filter(
                name=entity_serializer.validated_data['name'].strip()
            ).first()
            if existing_entity:
                entity = existing_entity
            else:
                entity = entity_serializer.save()

            update_question_entities(game, entity)
            game.feedback_entity = entity
            game.save()

            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def get_game(self, pk):
        try:
            return Game.objects.get(pk=pk)
        except Game.DoesNotExist:
            raise Http404

