from django.urls import path

from open_20q_api.views import gamestart_view, gamequestion_view, \
    gameprovidefeedback_view, entityautocomplete_view, \
    questionautocomplete_view, questionsubmit_view

urlpatterns = [
    path('api/game/', gamestart_view.GameStartView.as_view()),
    path('api/game/<uuid:pk>/', gamestart_view.GameStartView.as_view()),
    path('api/gamequestion/<uuid:pk>/',
         gamequestion_view.GameQuestionView.as_view()),
    path('api/game/<uuid:pk>/submitfeedback/',
         gameprovidefeedback_view.GameProvideFeedbackView.as_view()),
    path('api/entity/autocomplete/<str:query>/',
         entityautocomplete_view.EntityAutocompleteView.as_view()),
    path('api/question/autocomplete/',
         questionautocomplete_view.QuestionAutocompleteView.as_view()),
    path('api/question/',
         questionsubmit_view.QuestionSubmitView.as_view()),
]
