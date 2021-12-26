import datetime

from django.db.models import F
from django.http import Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from open_20q_api import constants
from open_20q_api.models import Game
from open_20q_api.serializers import GameStatsSerializer
from open_20q_api.view_models import GameStats


class GameStatstView(APIView):

    def get(self, request):

        total_games = Game.objects.count()
        total_finished = Game.objects.filter(feedback_entity__isnull=False)
        total_correct = Game.objects.filter(
            feedback_entity__isnull=False,
            guessed_id=F('feedback_entity__id')
        )

        last_24h_start = timezone.now() - datetime.timedelta(hours=24)
        total_24h = Game.objects\
            .filter(started_at__gte=last_24h_start)
        total_finished_24h = total_finished\
            .filter(started_at__gte=last_24h_start)
        total_correct_24h = total_correct\
            .filter(started_at__gte=last_24h_start)

        latest = total_finished\
            .order_by('-started_at')[:constants.latest_games_for_stats]

        stats_object = GameStats(
            total_games=total_games,
            total_finished=total_finished.count(),
            total_correct=total_correct.count(),

            total_24h=total_24h.count(),
            total_finished_24h=total_finished_24h.count(),
            total_correct_24h=total_correct_24h.count(),

            latest_games=latest.all()
        )

        response_data = GameStatsSerializer(stats_object).data

        return Response(response_data)
