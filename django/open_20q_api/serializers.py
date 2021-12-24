from rest_framework import serializers

from open_20q_api import constants
from open_20q_api.models import GameQuestion, Game, Question, Entity
from open_20q_api.view_models import NewQuestionWithAnswers, EntityAnswer


class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = ['id', 'name', 'created']

    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError(
                'The name should have at least 3 characters.'
            )
        return value.strip()


class GameSerializer(serializers.ModelSerializer):

    guessed = EntitySerializer(required=False)

    class Meta:
        model = Game
        fields = ['id', 'guessed', 'feedback_entity']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text']


class GameQuestionSerializer(serializers.ModelSerializer):

    game = GameSerializer(required=False)
    question = QuestionSerializer(required=False)

    def validate_answer(self, answer):
        gamequestion = self.instance
        if answer not in constants.valid_answers:
            raise serializers.ValidationError(
                f'Valid answers are only: {constants.valid_answers}.'
            )
        if gamequestion.answer:
            raise serializers.ValidationError(
                'This question has already been answered.'
            )
        return answer

    class Meta:
        model = GameQuestion
        fields = ['id', 'game', 'question', 'answer', 'entropy']


class GameQuestionOnlyQuestionSerializer(serializers.ModelSerializer):

    question = QuestionSerializer()

    class Meta:
        model = GameQuestion
        fields = ['id', 'question', 'answer', 'entropy']


class GameWithQuestionsSerializer(serializers.ModelSerializer):

    gamequestion_set = serializers.SerializerMethodField()
    guessed = EntitySerializer()
    feedback_entity = EntitySerializer()

    class Meta:
        model = Game
        fields = ['id', 'started_at', 'gamequestion_set',
                  'guessed', 'feedback_entity']

    def get_gamequestion_set(self, instance):
        gamequestions = instance.gamequestion_set.all()\
            .order_by('-asked_at')
        return GameQuestionSerializer(
            gamequestions, many=True).data


class EntityAnswerSerializer(serializers.Serializer):
    id_entity = serializers.IntegerField()
    answer = serializers.CharField(max_length=10)

    def validate(self, data):

        if data['answer'] not in constants.valid_answers:
            raise serializers.ValidationError(
                f'{data["answer"]} is not a valid answer.'
            )

        return data

    def create(self, validated_data):
        return EntityAnswer(**validated_data)

    def update(self, instance, validated_data):
        return instance


class NewQuestionWithAnswersSerializer(serializers.Serializer):

    text = serializers.CharField(max_length=256)
    answers = EntityAnswerSerializer(many=True)

    def validate(self, data):

        entity_ids = [answer['id_entity'] for answer in data['answers']]
        unique_entity_ids = set(entity_ids)
        if len(unique_entity_ids) != len(entity_ids):
            raise serializers.ValidationError(
                'The answered entity IDs must be unique.'
            )

        found_entities = Entity.objects.filter(pk__in=unique_entity_ids)
        if found_entities.count() != len(unique_entity_ids):
            raise serializers.ValidationError(
                'The answered entity IDs must exist.'
            )

        return data

    def create(self, validated_data):
        obj = NewQuestionWithAnswers(text=validated_data['text'], answers=[])
        for entity_answer_dict in validated_data['answers']:
            obj.answers.append(EntityAnswer(**entity_answer_dict))
        return obj

    def update(self, instance, validated_data):
        return instance
