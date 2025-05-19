
class Score {
  year int @description(#"
    The year you're giving the score for.
  "#)
  score int @description(#"
    1 to 100
  "#)
}

class PopularityOverTime {
  bookName string
  scores Score[]
}

class WordCount {
  bookName string
  count int
}

class Ranking {
  bookName string
  score int @description(#"
    1 to 100 of your own personal score of this book
  "#)
}

class BookAnalysis {
  bookNames string[] @assert({{ this|length > 0 }}) @description(#"
    The list of book names provided
  "#)
  popularityOverTime PopularityOverTime[] @description(#"
    Print the popularity of EACH BOOK over time.
    Make sure you add datapoints up to the current year. Try to use a max of 10 datapoints to
    represent the whole timeline for all books (so 10 handpicked years).
  "#) @alias(popularityData)
  popularityRankings Ranking[] @description(#"
    A list of the book's popularity rankings over time.
    The first element is the top ranking.
  "#)
  wordCounts WordCount[]
}

function AnalyzeBooks(input: string) -> BookAnalysis {
  client GPT4o
  prompt #"
    Analyze the following book list and provide the information in the schema.
    For any unknown fields, make a best guess.
    {{ ctx.output_format }}

    {{ _.role('user') }}
    {{ input }}
  "#
}

test TestName {
  functions [AnalyzeBooks]
  args {
    input #"
      brave new world
      the lord of the rings
      three body problem
      stormlight archive
    "#
  }
}
