// https://mastra.ai/en/examples/agents/using-a-tool

// This differs from 02-agentic-workflows in that the agent
// must ask the user for their location if the agent doesn't
// already know it.

// We'll try out 2 hypothetical syntax changes:
//   1. Anonymous records.
//   2. Sum types for tools.

// GetWeather, without being concerned about the exact data structure.
// It is justified to ignore the exact data structure, because we will
// be passing it directly to an LLM that will extract the parts relevant
// to the user's query.
function GetWeather(city: string) -> JSON {
    let geocodingData = std::fetch_value<GeocodingData>(std::Request {
        base_url: #"https://geocoding-api.open-meteo.com/v1/search"#,
        method: "GET",
        query_params: {
            name: city,
            count: 1,
        }
    })[0];
    let weatherApiResponse = fetch_value<JSON>(std::Request {
        base_url: "https://api.open-meteo.com/v1/forecast",
        method: "GET",
        query_params: {
            latitude: geocodingData.latitude,
            longitude: geocodingData.longitude,
            daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode",
        }
    });
    for (day in weatherApiResponse.daily) {
        day.condition = GetWeatherCondition(day.weathercode);
    }
    weatherApiResponse
}

// This sum type gives each union variant a data payload.
// The @@key("type") attribute at the end determines how
// the variant is serialized into a JSON object (it's a
// new field "type" with value as the variant name).
type Tool =
    RequestLocation { message: string }
  | GetWeather { city: string } @stream.done
  | SetCity { city: string } @stream.done
  | FinalResponse { message: string }
  @@key("type")

// An anonymous record lets us quickly group history entries.
// We don't care about history entries enough to give them
// a named type.
class State {
    history: {role: string, message: content}[]
    city string?
    weather: JSON?
}

// The function that the client will call.
// The client is responsible for
//   - Calling the chosen tool. (making a new BAML call for GetWeather)
//   - Updating the state with new data learned from the tool.
//   - Calling RespondToQuery again with the updated state.
function RespondToQuery(state: State, query: string) -> Tool {
    client GPT4o
    prompt #"
      Choose a tool to answer the user's query. Use the tool
      required based on the current state and the dependency graph:

      WeatherDescription -> Weather -> City -> CityInputRequest

      Your state: {{ state }}
      The query: {{ query }}

      {{ ctx.output_format }}
    "#
}

function GetWeatherCondition(weathercode: int) -> string {
    match weathercode {
      0 => "Clear sky",
      1 => "Mainly clear",
      2 => "Partly cloudy",
      3 => "Overcast",
      45 => "Foggy",
      48 => "Depositing rime fog",
      51 => "Light drizzle",
      53 => "Moderate drizzle",
      55 => "Dense drizzle",
      61 => "Slight rain",
      63 => "Moderate rain",
      65 => "Heavy rain",
      71 => "Slight snow fall",
      73 => "Moderate snow fall",
      75 => "Heavy snow fall",
      95 => "Thunderstorm",
      _ => "Unknown"
    }
}

// The main point of the Expression Laguage here is to wrap
// tools somewhat nicely, and to provide a compound GetWeather
// implementation that can be tested in the playground.

// In future examples, we will try to lift more of the state-updating
// logic into the Expression Language.