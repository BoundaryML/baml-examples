// Results. (LLM Inputs)

enum GenderIdentity {
  Male
  Female
  NonBinary
}

class State {
  name string?
  gender_identity GenderIdentity?
  age_years int?
  test_interactions TestInteraction[]
  article_summaries ArticleSummary[]
}


class TestInteraction {
  question string
  answer int
}

// Tools. (LLM Outputs)

class GetGenderIdentity {
  type "get_gender_identity"
  @@stream.done
}

class GetAgeYears {
  type "get_age_years"
  @@stream.done
}

class AdministerQuestion {
  type "administer_question"
  questions string
  @@stream.done
}

class ChatToUser {
  type "chat_to_user" @stream.not_null
  message string
}

class ReadArticle {
  type "read_article"
  article_url string
  @@stream.done
}

class Query {
  query string
  responding_to string?
}

class ReportArticleSummary {
  type "report_article_summary"
  summary ArticleSummary
  @@stream.done
}

class ReportMBTIType {
  type "report_mbti_type"
  mbti_type string
  @@stream.done
}

function ChooseTools(state: State, query: Query) -> (GetGenderIdentity | GetAgeYears | AdministerQuestion | ChatToUser | ReadArticle | ReportArticleSummary | ReportMBTIType)[] {
  client CustomGPT4o
  prompt #"
    User's name: {{ state.name if state.name else "Unknown" }}
    User's gender identity: {{ state.gender_identity if state.gender_identity else "Unknown" }}
    Previous interactions:
    {% for interaction in state.test_interactions %}
      Question: {{ interaction.question }}
      Answer: {{ interaction.answer }}
    {% endfor %}
    {% if state.test_interactions|length == 0 %}
      No interactions yet.
    {% endif %}

    {{ instructions }}
    {{ ctx.output_format }}
  "#
}

template_string Instructions() #"
    You are a MeyersBriggs test administrator.

    Use the tools provided below to learn about the user and help them
    learn their MeyersBriggs personality type.

    Start by getting their name and gender if you don't already know them.

    Suggest to the user via the chat tool that they can suggest articles
    to you by url, or request a MeyersBriggs test.

    If they are ready for a test, use the AdministerQuestion tool to
    administer questions. Use their responses from previous questions
    to build up an impression of their MBTI type. When they have
    answered enough questions that you know their type, use the
    ReportMBTIType tool to report their type. Then invite them to chat
    about what that type means and how you came to your conclusion.

    If they suggest an article, use the ReadArticle tool to read it.
    Then use the ReportArticleSummary tool to report the summary.
  "#