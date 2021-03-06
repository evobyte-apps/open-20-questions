from rest_framework import serializers

from open_20q_api import constants
from open_20q_api.engine.end_game import \
    get_gamequestions_with_expected_answers
from open_20q_api.engine.get_guess import handle_get_leaders
from open_20q_api.models import GameQuestion, Game, Question, Entity, \
    GameEntity
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
    feedback_entity = EntitySerializer(required=False)

    class Meta:
        model = Game
        fields = ['id', 'guessed', 'feedback_entity']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text']


class GameQuestionSerializer(serializers.ModelSerializer):

    question = QuestionSerializer(required=False)
    expected_answer = serializers.CharField(required=False)

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
        fields = ['id', 'question', 'answer', 'entropy',
                  'expected_answer']


class GameEntitySerializer(serializers.ModelSerializer):

    entity = serializers.SlugRelatedField(slug_field='name', read_only=True)

    class Meta:
        model = GameEntity
        fields = ['entity', 'entity_score']


class GameWithQuestionsSerializer(serializers.ModelSerializer):

    gamequestion_set = serializers.SerializerMethodField()
    guessed = EntitySerializer()
    feedback_entity = EntitySerializer()
    top_candidates = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'started_at', 'gamequestion_set',
                  'guessed', 'feedback_entity', 'top_candidates']

    def get_gamequestion_set(self, instance):
        gamequestions = get_gamequestions_with_expected_answers(instance)
        return GameQuestionSerializer(
            gamequestions, many=True).data

    def get_top_candidates(self, instance):
        return GameEntitySerializer(
            handle_get_leaders(instance),
            many=True).data


class EntityAnswerSerializer(serializers.Serializer):
    id_entity = serializers.UUIDField()
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


class GameStatsSerializer(serializers.Serializer):
    total_games = serializers.IntegerField()
    total_finished = serializers.IntegerField()
    total_correct = serializers.IntegerField()

    total_24h = serializers.IntegerField()
    total_finished_24h = serializers.IntegerField()
    total_correct_24h = serializers.IntegerField()

    latest_games = GameSerializer(many=True)


class GameStageResultSerializer(serializers.Serializer):
    game_with_new_info = GameSerializer(required=False)
    next_gamequestion = GameQuestionSerializer(required=False)
    top_candidates = GameEntitySerializer(many=True, required=False)
