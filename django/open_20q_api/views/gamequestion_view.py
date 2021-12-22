from django.db.models import F
from django.db.models.functions import Greatest
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from scipy.stats import entropy

from open_20q_api import constants
from open_20q_api.engine.get_guess import handle_get_leaders
from open_20q_api.engine.get_next_question import handle_get_next_question
from open_20q_api.engine.update_scores import handle_update_scores
from open_20q_api.models import GameQuestion, GameEntity, QuestionEntity
from open_20q_api.serializers import GameQuestionSerializer



class GameQuestionView(APIView):

    def post(self, request, pk, format=None):

        gamequestion = self.get_gamequestion(pk)
        game = gamequestion.game
        if game.guessed:
            raise Http404

        serializer = GameQuestionSerializer(gamequestion, data=request.data)
        if serializer.is_valid():
            serializer.save()

            leader_entities = handle_get_leaders(game)
            handle_update_scores(gamequestion, leader_entities)
            next_gamequestion = handle_get_next_question(game, leader_entities)

            return Response(GameQuestionSerializer(next_gamequestion).data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_gamequestion(self, pk):
        try:
            return GameQuestion.objects.get(pk=pk)
        except GameQuestion.DoesNotExist:
            raise Http404
