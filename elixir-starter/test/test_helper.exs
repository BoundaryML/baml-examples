# Exclude integration tests by default (they require OPENAI_API_KEY)
# Run integration tests with: mix test --include integration
ExUnit.start(exclude: [:integration])
