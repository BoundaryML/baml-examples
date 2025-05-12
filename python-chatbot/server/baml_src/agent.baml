// Results. (LLM Inputs)

class WeatherReport {
  temperature int @description("Temperature in Celsius")
  precipitation int @description("Precipitation in mm")
  timestamp int @description("Timestamp in Unix time")
}

enum Role {
  User
  Assistant
  Tool
}

class Message {
  role Role
  content string
  timestamp int @description("Timestamp in Unix time")
}

// The state of the conversation that will be sent
// to the agent. The client is responsible for updating
// it with (a) the result of tool calls, and (b)
// summarization when the message history is too long.
class State {
  weather_report WeatherReport?
  recent_messages Message[]
  message_history string?
}

// The query from the user.
class Query {
  message string
  timestamp int @description("Timestamp in Unix time")
}

class GetWeatherReport {
  type "get_weather_report"
  location string
  @@stream.done
}

class ComputeValue {
  type "compute_value"
  arithmetic_expression string
  @@stream.done
}

class MessageToUser {
  type "message_to_user"
  message string @stream.with_state
}

// Use this tool incatate that, in order to satisfy the
// query, the client needs to update the state with the
// result of the prior tool calls.
class Restart {
  type "restart"
  @@stream.done
}


function ChooseTools(state: State, query: Query) -> (GetWeatherReport | ComputeValue | MessageToUser | Restart)[] {
  client CustomGPT4o
  prompt #"

    {{ Instructions() }}

    Current state: {{ state }}
    Current query: {{ query }}

    {{ ctx.output_format }}
  "#
}

template_string Instructions() #"
  Lucky you, you're a friendly chatbot!

  Have a conversation with the user. Our users are particularly interested in
  the weather and in arithmetic.

  You can enrich your understanding of the user and the world by issuing calls
  arrording to the following schema.

  If the user asks about the weather, you will need to issue the right tool call,
  and in a subsequent call to you, you will have the weather report in your context.

  IMPORTANT: If the weather report is already in the state, you don't need to issue
  a get_weather_report call again (unless the report is very old).

  In order to arrange for the new context to arrive, you may need to issue a "restart"
  toll call. For example, if you are asked to add 5 to the current temperature, you
  would need to issue both a get-weather call and a restart call. Then, you will
  be called again with the updated state. In this case, your new tool calls should
  be a compute-value call. Iff there is something to say about the computed value,
  then you will need to use the Restart tool after the compute-value tool, but if
  you just want to answer the question with the value, you don't need to Restart.

  Before issuing the weather tool call, you may need to ask the user where they are
  located.

  IMPORTANT: Every tool call for which you need the client to update the state before you can
  fullfil the full query should end in a restart call. That is, the output array
  must have at least two elements - the pramiry tool call, and then a restart call.

  NEVER just ask a question without a restart after, unless your question fully satisfies
  what the user is requesting. If they ask for the weather, and you ask their location,
  you MUST issue a second call in the array: restart.

  IMPORTANT: If you issue the same tool call 2 times in a row, and are considering issuing
  it a 3rd time, don't! Just apologize and say you don't know how to help.

  IMPORTANT: If you want to call the weather tool, you must know the location that the
  user wants to know the weather for. If you don't know, ask them, do not call the
  weather tool. If you are asking a question, do not finish with the Restart tool.
  If you notice that their current query appears to be a response to
  your most recent question (in the recent_messages array), then go ahead and use
  that information to call the weather tool.

  If a query seems strange, be sure to examine the recent_messages array, to see if it
  is explained by that context.
  "#

test WeatherToolInit() {
  functions [ChooseTools]
  args {
    state {
      recent_messages []
    }
    query {
      message "What is the weather?"
      timestamp 1715222400
    }
  }
  @@assert( {{ this[0].type == "message_to_user" }})
  @@assert( {{ this[0].message|regex_match("location") }})
  @@assert( {{ this[1].type == "restart" }})
}

test WeatherToolAfterLocation() {
  functions [ChooseTools]
  args {
    state {
      recent_messages [
        {
          role User
          content "What's the weather?"
          timestamp 1715222400
        },
        {
          role Assistant
          content "Where are you located?"
          timestamp 1715222401
        },
        {
          role User
          content "San Francisco"
          timestamp 1715222402
        }
      ]
    }
    query {
        message "What's the weather?"
        timestamp 1715222400
    }
  }
  @@assert( {{ this[0].type == "get_weather_report" }})
  @@assert( {{ this[1].type == "restart" }})
}

test WeatherToolAfterWeather() {
  functions [ChooseTools]
  args {
    state {
      weather_report {
        temperature 20
        precipitation 10
        timestamp 1715222400
      }
      recent_messages [
        {
          role User
          content "What's the weather?"
          timestamp 1715222400
        },
        {
          role Assistant
          content "Where are you located?"
          timestamp 1715222401
        },
        {
          role User
          content "San Francisco"
          timestamp 1715222402
        }
      ]

    }
    query {
        message "What's the weather?"
        timestamp 1715222400
    }
  }
  @@assert( {{ this[0].type == "message_to_user" }})
}