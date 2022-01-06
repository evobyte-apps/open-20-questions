import uuid

from django.db import models


class Entity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=64, null=False)
    created = models.DateTimeField(auto_now_add=True)


class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=256, null=False)
    created = models.DateTimeField(auto_now_add=True)


class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(auto_now_add=False, null=True)
    feedback_entity = models.ForeignKey(Entity,
                                        null=True,
                                        on_delete=models.CASCADE,
                                        related_name='feedback_in_games')
    guessed = models.ForeignKey(Entity,
                                null=True,
                                on_delete=models.CASCADE,
                                related_name='guessed_in_games')
    exploration_questions = models.IntegerField(default=0)


class QuestionEntity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question,
                                 on_delete=models.CASCADE)
    entity = models.ForeignKey(Entity,
                               on_delete=models.CASCADE)
    yes_count = models.FloatField(default=0)
    no_count = models.FloatField(default=0)
    unknown_count = models.IntegerField(default=0)
    locked_to = models.BooleanField(default=None, null=True)


class GameQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game,
                             on_delete=models.CASCADE)
    question = models.ForeignKey(Question,
                                 on_delete=models.CASCADE)
    entropy = models.FloatField(default=0)
    answer = models.CharField(max_length=10, null=True)
    asked_at = models.DateTimeField(auto_now_add=True)


class GameEntity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game,
                             on_delete=models.CASCADE)
    entity = models.ForeignKey(Entity,
                               on_delete=models.CASCADE)
    entity_score = models.FloatField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['entity_score']),
        ]
