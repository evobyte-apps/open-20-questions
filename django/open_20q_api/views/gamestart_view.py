from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from open_20q_api.engine.start_game import handle_start_game
from open_20q_api.models import Game
from open_20q_api.serializers import GameQuestionSerializer, \
    GameWithQuestionsSerializer


class GameStartView(APIView):

    def get(self, request, pk=None, format=None):

        if not pk:
            return Response('', status=status.HTTP_400_BAD_REQUEST)

        game = self.get_game(pk)
        serializer = GameWithQuestionsSerializer(game)
        return Response(serializer.data)

    def post(self, request, format=None):

        gamequestion = handle_start_game()
        serializer = GameQuestionSerializer(gamequestion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_game(self, pk):
        try:
            return Game.objects.get(pk=pk)
        except Game.DoesNotExist:
            raise Http404
