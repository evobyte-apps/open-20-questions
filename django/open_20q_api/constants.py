from decouple import config


# answers
affirmative_answers = ['yes', 'prob_yes']
negative_answers = ['no', 'prob_no']
valid_answers = affirmative_answers + ['unknown'] + negative_answers

# scoring
full_matching_answer_score = 1
partial_matching_answer_divisor = 2

# cutoffs
distance_from_leader_cutoff = config('distance_from_leader_cutoff', cast=int)
clear_leader_cutoff = config('clear_leader_cutoff', cast=int)
exploration_questions_after_clear_leader = config('exploration_questions_after_clear_leader', cast=int)
max_total_questions = config('max_total_questions', cast=int)

# question add autocomplete
max_question_autocomplete_results = config('max_question_autocomplete_results', cast=int)
min_common_words_for_question_autocomplete = config('min_common_words_for_question_autocomplete', cast=int)

# question add randoms
random_entities_for_new_question = config('random_entities_for_new_question', cast=int)

#other
latest_games_for_stats = config('latest_games_for_stats', cast=int)