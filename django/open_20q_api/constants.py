# answers
affirmative_answers = ['yes', 'prob_yes']
negative_answers = ['no', 'prob_no']
valid_answers = affirmative_answers + ['unknown'] + negative_answers

# scoring
full_matching_answer_score = 1
partial_matching_answer_divisor = 2

# cutoffs
distance_from_leader_cutoff = 3
clear_leader_cutoff = 2
exploration_questions_after_clear_leader = 3
max_total_questions = 20

# question add autocomplete
max_question_autocomplete_results = 20
min_common_words_for_question_autocomplete = 4

# question add randoms
random_entities_for_new_question = 20