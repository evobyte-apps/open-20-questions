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
        query_words = query.split(' ')
        if len(query_words) < 4:
            return Response([])

        questions = {}
        for word in query_words:
            found_questions = Question.objects.filter(text__icontains=f'{word}')
            for found_question in found_questions:
                if found_question in questions:
                    questions[found_question] += 1
                else:
                    questions[found_question] = 1

        questions = [question for question, count in
                     sorted(questions.items(), key=lambda item: -item[1]) if
                     count >= constants.min_common_words_for_question_autocomplete]
        return Response(QuestionSerializer(questions[:constants.max_question_autocomplete_results], many=True).data)

