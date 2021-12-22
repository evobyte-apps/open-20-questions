from rest_framework.response import Response
from rest_framework.views import APIView

from open_20q_api.models import Entity
from open_20q_api.serializers import EntitySerializer


class EntityAutocompleteView(APIView):

    def get(self, request, query):
        if len(query) < 3:
            return Response([])

        entities = Entity.objects.filter(name__icontains=query)
        return Response(EntitySerializer(entities, many=True).data)
