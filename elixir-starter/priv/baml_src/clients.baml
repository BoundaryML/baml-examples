// client<llm> GP4o {
//   provider openrouter
//   options {
//     model "openai/gpt-4o-mini"
//   }
// }
// client<llm> GPT4 {
//   provider openrouter
//   options {
//     model "openai/gpt-4"
//   }
// }
client<llm> Gemini2_5_flash {
  provider google-ai
  options {
    model "gemini-2.5-flash-lite"
  }
}
client<llm> Gemini2_5_pro {
  provider google-ai
  options {
    model "gemini-2.5-flash"
  }
}
