import Config

Dotenv.load!()

config :elixir_starter, :token, System.get_env("GOOGLE_API_KEY")
