export interface EntityAnswer {
    id_entity: string
    answer: string
}

export interface NewQuestionWithAnswers {
    text: string
    answers: EntityAnswer[]
}