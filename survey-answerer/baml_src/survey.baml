class SurveyQuestion {
  id string @description("Unique identifier for the question")
  text string @description("The actual question text")
  type "multiple_choice" | "open_ended" | "rating"
  options string[]? @description("Available options for multiple choice questions")
}

class Answer {
  response string
  quality "well_answered" | "partially_answered" | "not_answered" | "skipped"
  followUpNeeded bool @description("Whether this answer needs clarification or follow-up")
  shouldStop bool @description("Whether the survey should stop after this answer")
}

class SurveyStatus {
  completedQuestions string[] @description("IDs of questions that have been answered")
  nextQuestionId string? @description("ID of the next question to ask")
  surveyComplete bool
  overallProgress "not_started" | "in_progress" | "completed"
}

function AnalyzeResponse(
  question: SurveyQuestion,
  response: string
) -> Answer {
  client "openai/gpt-4o-mini"
  prompt #"
    Analyze the following response to a survey question. Determine the quality of the answer and if follow-up is needed.
    
    {{ ctx.output_format }}

    Question: {{ question.text }}
    Type: {{ question.type }}
    {% if question.options %}
    Translate the response into one of these options:
    Options: {{ question.options }}
    {% endif %}

    {{ _.role("user") }}
    Response: {{ response }}
  "#
}

function DetermineNextQuestion(
  questions: SurveyQuestion[],
  previousAnswers: Answer[],
  currentStatus: SurveyStatus
) -> SurveyStatus {
  client "openai/gpt-4o-mini"
  prompt #"
    Determine the next question to ask based on the survey progress and previous answers.
    Consider:
    - Questions that need follow-up due to partial or unclear answers
    - Questions that haven't been asked yet
    - The logical flow of the survey
    - its ok for questions to be partially answered, or if explicitly requested people can skip questions

    {{ ctx.output_format }}
    
    Survey Questions: 
    {% for question in questions %}
    ------
    Question {{ question.id }}: {{ question.text }}
    Type: {{ question.type }}
    {% if question.options %}
    Options: {{ question.options }}
    {% endif %}
    {% endfor %}

    {{ _.role("user") }}
    Answers so far: 
    {% for answer in previousAnswers %}
    ------
    Question {{ answer.questionId }}: {{ answer.response }}
    Quality: {{ answer.quality }}
    Follow Up Needed: {{ answer.followUpNeeded }}
    {% endfor %}
  "#
}

test Favourabledingo {
  functions [DetermineNextQuestion]
  args {
    previousAnswers [
      {
        followUpNeeded true
        response #"mid"#
        quality #"partially_answered"#
        questionId #"1"#
      }
    ]
    currentStatus {
      completedQuestions [

      ]
      nextQuestionId #"q1"#
      overallProgress #"not_started"#
      surveyComplete false
    }
    questions [
      {
        text #"How satisfied are you with the overall purchase process?"#
        type #"rating"#
        id #"q1"#
        options [
          #"1"#,
          #"2"#,
          #"3"#,
          #"4"#,
          #"5"#
        ]
      },
      {
        text #"How satisfied are you with the performance of your new vehicle?"#
        options [
          #"1"#,
          #"2"#,
          #"3"#,
          #"4"#,
          #"5"#
        ]
        type #"rating"#
        id #"q2"#
      },
      {
        text #"How would you rate your experience with our sales team?"#
        type #"rating"#
        id #"q3"#
        options [
          #"1"#,
          #"2"#,
          #"3"#,
          #"4"#,
          #"5"#
        ]
      },
      {
        id #"q4"#
        type #"open_ended"#
        text #"What could we improve in our sales process?"#
      },
      {
        id #"q5"#
        text #"How likely are you to recommend our dealership to others?"#
        options [
          #"1"#,
          #"2"#,
          #"3"#,
          #"4"#,
          #"5"#
        ]
        type #"rating"#
      },
      {
        id #"q6"#
        type #"open_ended"#
        text #"Do you have any additional comments or suggestions?"#
      }
    ]
  }
}

test AnalyzeShortResponse {
  functions [AnalyzeResponse]
  args {
    question {
      id "q1"
      text "How satisfied are you with our service?"
      type "rating"
      options ["1", "2", "3", "4", "5"]
    }
    response "3, it was okay but could be better"
  }
}

test DetermineNextQuestionTest {
  functions [DetermineNextQuestion]
  args {
    questions [
      {
        id "q1"
        text "How satisfied are you with our service?"
        type "rating"
        options ["1", "2", "3", "4", "5"]
      },
      {
        id "q2"
        text "What could we improve?"
        type "open_ended"
      }
    ]
    previousAnswers [
      {
        questionId "q1"
        response "3, it was okay"
        quality "partially_answered"
        followUpNeeded true
      }
    ]
    currentStatus {
      completedQuestions ["q1"]
      nextQuestionId null
      surveyComplete false
      overallProgress "in_progress"
    }
  }
}