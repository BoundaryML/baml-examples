class Citation {
  documentTitle string
  sourceLink string
  relevantTextFromDocument string
  number int @description(#"
    the index in this array
  "#)
}

class Answer {
  answersInText Citation[]
  answer string @description(#"
    When you answer, ensure to add citations from the documents in the CONTEXT with a number that corresponds to the answersInText array.
  "#)
}


class Document {
  title string
  text string
  link string
}
class Context {
  documents Document[]
}

function AnswerQuestion(question: string, context: Context) -> Answer {
  client GPT4
  prompt #"
    Answer the following question using the given context below.
    CONTEXT:
    {% for document in context.documents %}
    ----
    DOCUMENT TITLE: {{  document.title }}
    {{ document.text }}
    DOCUMENT LINK: {{ document.link }}
    ----
    {% endfor %}

    {{ ctx.output_format }}

    {{ _.role("user") }}
    QUESTION: {{ question }}

    ANSWER:
  "#
}

// open this in the playground to run it instantly
test SampleTest {
  functions [AnswerQuestion]
  args {
    question #"
      what achievements did spacex accomplish before anyone else?
    "#
    context {
      documents [
        {
    title "SpaceX Overview"
    link "https://en.wikipedia.org/wiki/SpaceX"
    text #"
    Space Exploration Technologies Corporation, commonly referred to as SpaceX, is an American spacecraft manufacturer, launch service provider and satellite communications company headquartered in Hawthorne, California. The company was founded in 2002 by Elon Musk with the goal of reducing space transportation costs and ultimately developing a sustainable colony on Mars. The company currently produces and operates the Falcon 9 and Falcon Heavy rockets along with the Dragon and Starship spacecraft.

The company offers internet service via its Starlink subsidiary, which became the largest-ever satellite constellation in January 2020 and, as of April 2024, comprised more than 6,000 small satellites in orbit.[8]

Meanwhile, the company is developing Starship, a human-rated, fully-reusable, super heavy-lift launch system for interplanetary and orbital spaceflight. On its first flight in April 2023, it became the largest and most powerful rocket ever flown. The rocket reached space on its second flight that took place in November 2023.

SpaceX is the first private company to develop a liquid-propellant rocket that has reached orbit; to launch, orbit, and recover a spacecraft; to send a spacecraft to the International Space Station; and to send astronauts to the International Space Station. It is also the first organization of any type to achieve a vertical propulsive landing of an orbital rocket booster and the first to reuse such a booster. The company's Falcon 9 rockets have landed and flown again more than 300 times.[9] As of December 2023, SpaceX has around US$180 billion valuation.[10][11]
History
Main article: History of SpaceX
See also: List of Falcon 9 and Falcon Heavy launches

    "#
  }
  
      ]
    }
  }
}

