from rest_framework import pagination
from rest_framework.viewsets import ModelViewSet

from open_20q_api.models import Entity
from open_20q_api.serializers import EntitySerializer


class CustomPagination(pagination.PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 50
    page_query_param = 'page'


class EntityViewSet(ModelViewSet):
    serializer_class = EntitySerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        return Entity.objects.order_by('name')
