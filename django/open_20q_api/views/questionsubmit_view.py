from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from open_20q_api import constants
from open_20q_api.models import Entity, Question, QuestionEntity
from open_20q_api.serializers import EntitySerializer, \
    NewQuestionWithAnswersSerializer


class QuestionSubmitView(APIView):

    def get(self, request):

        random_entities = Entity.objects.order_by('?')[:constants.random_entities_for_new_question]
        return Response(EntitySerializer(random_entities, many=True).data)

    def post(self, request):

        serializer = NewQuestionWithAnswersSerializer(data=request.data)
        if serializer.is_valid():
            new_question_with_answers = serializer.create(serializer.validated_data)
            question = Question.objects.create(text=new_question_with_answers.text)

            question_entities = []
            for entity_answer in new_question_with_answers.answers:
                new_questionentity = QuestionEntity(
                    question_id=question.id,
                    entity_id=entity_answer.id_entity,
                    yes_count=1 if entity_answer.answer == 'yes' else 0,
                    no_count=1 if entity_answer.answer == 'no' else 0,
                    unknown_count=1 if entity_answer.answer == 'unknown' else 0
                )
                question_entities.append(new_questionentity)
            QuestionEntity.objects.bulk_create(question_entities)

            return Response(status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
