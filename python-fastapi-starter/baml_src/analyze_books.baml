
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
  bookNames string[] @description(#"
    The list of book names  provided
  "#)
  popularityOverTime PopularityOverTime[] @description(#"
    Print the popularity of EACH BOOK over time.
  "#) @alias("popularityData")
  // popularityRankings Ranking[] @description(#"
  //   A list of the book's popularity rankings over time. 
  //   The first element is the top ranking
  // "#)
 
  // wordCounts WordCount[]
}

function AnalyzeBooks(input: string) -> BookAnalysis {
  client GPT4
  prompt #"
    Analyze the following book list and provide the information in the schema. If you don't know the exact answer, take a guess.
    BOOK_LIST:
    {{ input }}

    {{ ctx.output_format }}
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
