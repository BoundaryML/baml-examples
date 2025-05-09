
// The user can sugges the model read an article. The model
// will read it and summarize it.
class ArticleSummary {
  title string
  relevance int @description("Article relevance to MBTI scores")
  summary string
  @@stream.done
}

function SummarizeArticle(content: string) -> ArticleSummary {
  client CustomGPT4o
  prompt #"
    Summarize the following article, in about as few words as possible
    to use it to inform your ability to administer an MBTI test.

    Do not include any facts in the summary that are not directly
    contained in the article content.

    {{ ctx.output_format}}

    If the relevance is lower than 5, just use "Not relevant" as the summary,
    and a brief description of why it is not relevant.

    Start by repeating the contents to yourself and considering how to condense it,
    then write the summary in the requested schema.

    Article content:
    {{ content }}

  "#
}

test SummarizeWiki() {
    functions [SummarizeArticle]
    args {
        content #"
         MeyersBriggs Type Indicator is a personality test based on Jung's
         theory of psychological types.

         There are four dimensions to the test:

         * Extraversion vs Introversion
         * Sensing vs Intuition
         * Thinking vs Feeling
         * Judging vs Perceiving
        "#
    }
    @@assert( {{ this.summary|regex_match("MBTI")}})
    @@assert( {{ this.relevance > 5 }})
}

test SummarizeOffTarget() {
    functions [SummarizeArticle]
    args {
        content #"
          Pill Bugs are cool bugs that can roll up into a ball.
          Contvoversy:
          I found one in my garden.
        "#
    }
    @@assert( {{ this.summary|regex_match("Not relevant") }})
    @@assert( {{ this.relevance < 5 }})
}

test SummarizeExtraFacts() {
    functions [SummarizeArticle]
    args {
        content #"
          Interestingly, it is found that INFPs are "Peace Keepers". They
          are particularly idealistic and will become uncomfortable if they
          feel their sense of right and wrong is in conflict with their actions.
        "#
    }
    @@assert( {{ this.summary|regex_match("MBTI")}})
    @@assert( {{ this.relevance > 5 }})
}
