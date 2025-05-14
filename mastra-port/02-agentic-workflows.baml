// https://mastra.ai/en/examples/agents/agentic-workflows

template_string Instructions() #"
    You are a local activities and travel expert who excels at weather-based
    planning. Analyze the weather data and provide practical activity
    recommendations.
    For each day in the forecast, structure your response exactly as follows:
    📅 [Day, Month Date, Year]
    ═══════════════════════════
    🌡️ WEATHER SUMMARY
    • Conditions: [brief description]
    • Temperature: [X°C/Y°F to A°C/B°F]
    • Precipitation: [X% chance]
    🌅 MORNING ACTIVITIES
    Outdoor:
    • [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]
    🌞 AFTERNOON ACTIVITIES
    Outdoor:
    • [Activity Name] - [Brief description including specific location/route]
        Best timing: [specific time range]
        Note: [relevant weather consideration]
    🏠 INDOOR ALTERNATIVES
    • [Activity Name] - [Brief description including specific venue]
        Ideal for: [weather condition that would trigger this alternative]
    ⚠️ SPECIAL CONSIDERATIONS
    • [Any relevant weather warnings, UV index, wind conditions, etc.]
    Guidelines:
    - Suggest 2-3 time-specific outdoor activities per day
    - Include 1-2 indoor backup options
    - For precipitation >50%, lead with indoor activities
    - All activities must be specific to the location
    - Include specific venues, trails, or locations
    - Consider activity intensity based on temperature
    - Keep descriptions concise but informative
    Maintain this exact formatting for consistency, using the emoji and section headers as shown.
"#

class GeocodingData {
    name string
    latitude float
    longitude float
}

class WeatherAPIResponse {
    daily WeatherAPIDaily[]
}

class WeatherAPIDaily {
    temperature_2m_max float[]
    temperature_2m_min float[]
    precipitation_probability_mean float[]
    weathercode int[]
}

class DailyWeatherReport {
    date string
    maxTemp float
    minTemp float
    precipitationChance float
    condition int
}


function FetchWeather(city: string) -> DailyWeatherReport[] {
    let geocodingData = std::fetch_value<GeocodingData>(std::Request {
        base_url: #"https://geocoding-api.open-meteo.com/v1/search"#,
        method: "GET",
        query_params: {
            name: city,
            count: 1,
        }
    })[0];

    let weatherData = std::fetch_value<WeatherAPIResponse>(std::Request {
        base_url: #"https://api.open-meteo.com/v1/forecast"#,
        method: "GET",
        query_params: {
            latitude: geocodingData.latitude,
            longitude: geocodingData.longitude,
            daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode",
            timezone: "auto"
        }});
    
    let forecast = weatheData.daily.time.enumerate().map((date, i) => (DayForecast {
        date: date,
        maxTemp: weatheData.daily.temperature_2m_max[i],
        minTemp: weatheData.daily.temperature_2m_min[i],
        precipitationChance: weatheData.daily.precipitation_probability_mean[i],
        condition: GetWeatherCondition(weatherData.daily.weathercode[i]),
    }));

    forecast
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

function LLMPlanActivities(weather_report: DailyWeatherReport[]) -> string {
    client GPT4o
    prompt #"
        {{ _.role = "system" }}
        {{ Instructions() }}
        {{ _.role = "user" }}
        {{ _.content = weather_report }}
        
    "#
}


// Observations:
//
//  - In is nice in Mastra that we can inspect the API value as an
//    arbitarry JSON value. In BAML, we need to define the schema,
//    or provide a number of JSON functions.
//
//  - The Workflow formulation makes more sense for the given problem
//    than the Agent formulation, because there is a single query with
//    a fixed call graph (get the weather, LLM plans activities).
//
//  - Mastra requires more ceremony to lookup the agent by name, compared
//    to BAML, in which the client simply calls the generated function.