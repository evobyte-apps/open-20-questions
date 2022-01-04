from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from open_20q_api import constants
from open_20q_api.models import Question
from open_20q_api.serializers import QuestionSerializer


class QuestionAutocompleteView(APIView):
    def post(self, request):

        if not 'text' in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        query = request.data['text']
        if len(query) < 10:
            return Response([])

        questions = Question.objects.raw(
'''
SELECT
	*
from 
    public.open_20q_api_question as q
order by 
    SIMILARITY(%s, q.text) desc
limit
    %s
''', [query, constants.max_question_autocomplete_results])
        return Response(QuestionSerializer(questions, many=True).data)

