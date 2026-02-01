# Elixir BAML Starter

An example Elixir project demonstrating how to use [BAML](https://docs.boundaryml.com/) (Boundary AI Markup Language) with the [`baml_elixir`](https://github.com/emilsoman/baml_elixir) library for type-safe LLM function calls.

## Setup

### 1. Prerequisites

- Elixir 1.19+
- An API key for your chosen LLM provider (this project uses Google AI by default)

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
GOOGLE_API_KEY=your_google_ai_api_key
```

The project uses [`dotenv`](https://hex.pm/packages/dotenv) to load environment variables in dev/test.

### 3. Install Dependencies

```bash
mix deps.get
mix compile
```

### 4. Run the Application

```bash
mix run --no-halt
```

The server starts on http://localhost:4000.

## Project Structure

```
├── lib/
│   └── elixir_starter/
│       ├── application.ex      # OTP application
│       ├── baml_client.ex      # BAML client module
│       ├── resume_extractor.ex # Example usage
│       └── router.ex           # HTTP endpoints
├── priv/
│   └── baml_src/               # BAML source files
│       ├── clients.baml        # LLM client definitions
│       ├── extract_resume.baml # Resume extraction function
│       └── ...
└── config/
    └── runtime.exs             # Runtime configuration
```

## Usage

### Defining a BAML Client

```elixir
defmodule MyApp.BamlClient do
  use BamlElixir.Client, path: {:my_app, "priv/baml_src"}
end
```

### Calling BAML Functions

```elixir
# Synchronous call
{:ok, result} = MyApp.BamlClient.ExtractResume.call(%{raw_text: "..."})

# Streaming with callback
MyApp.BamlClient.ExtractResume.sync_stream(%{raw_text: "..."}, fn partial ->
  IO.inspect(partial)
end)
```

## baml_elixir Limitations

> **Warning**: `baml_elixir` is in pre-release (`1.0.0-pre.24`). The maintainer notes: *"It's way too early for you if you expect stable APIs and things to not break at all."*

### Current Limitations

| Feature | Status |
|---------|--------|
| Synchronous function calls | ✅ Working |
| Streaming responses | ✅ Working |
| Class/Enum type generation | ✅ Working |
| Type aliases | ❌ Not supported |
| Dynamic types | ⚠️ Partial support |
| Stream cancellation | ❌ Not supported |
| Audio/PDF/Video output | ❌ Not supported |
| Structured error handling | ❌ Not supported |
| Auto-generated `baml_client` files | ❌ Not available (uses compile-time macros instead) |

### Supported Platforms

Precompiled binaries are available for:
- `aarch64-apple-darwin` (Apple Silicon)
- `x86_64-unknown-linux-gnu` (Linux x86_64)
- `aarch64-unknown-linux-gnu` (Linux ARM64)

For other platforms, set `BAML_ELIXIR_BUILD=1` to compile the Rust NIF from source (requires Rust toolchain).

### API Stability

- Expect breaking changes between versions
- Pin to specific versions in production
- Monitor the [baml_elixir GitHub](https://github.com/emilsoman/baml_elixir) for updates

## Changing LLM Providers

Edit `priv/baml_src/clients.baml` to configure different providers:

```baml
// Google AI (default)
client<llm> Gemini2_5_flash {
  provider google-ai
  options {
    model "gemini-2.5-flash-lite"
  }
}

// OpenRouter example (commented out)
// client<llm> GPT4 {
//   provider openrouter
//   options {
//     model "openai/gpt-4"
//   }
// }
```

Update the `client` reference in your BAML function definitions accordingly.

## Resources

- [BAML Documentation](https://docs.boundaryml.com/)
- [baml_elixir GitHub](https://github.com/emilsoman/baml_elixir)
- [BAML Playground](https://docs.boundaryml.com/playground)
