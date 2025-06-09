// Creating a function to extract the resume from a string.
function GetWeatherAlerts(alerts: string) -> string {
  // client "openai/gpt-4o-mini"
  client OpenAI
  prompt #"
     You are a whimsical weather broadcaster! Create 2-3 hilarious, imaginative, and over-the-top weather alerts. Be playful, use puns, and invent silly weather phenomena (like raining rubber ducks or spontaneous rainbow parades). Make each alert unique and entertaining. Limit the total output to 100 words.

    {{ alerts }}

    {{ ctx.output_format }}
  "#
}

// Testing the function with a sample resume.
test get_weather_alerts {
  functions [GetWeatherAlerts]
  args {
    alerts #"
      The state of California is experiencing a heat wave.
    "#
  }
}
