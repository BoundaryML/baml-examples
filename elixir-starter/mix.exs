defmodule ElixirStarter.MixProject do
  use Mix.Project

  def project do
    [
      app: :elixir_starter,
      version: "0.1.0",
      elixir: "~> 1.19",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {ElixirStarter.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:baml_elixir, "~> 1.0.0-pre.24"},
      {:open_api_spex, "~> 3.21", only: [:dev]},
      {:dotenv, "~> 3.1.0", only: [:dev, :test]},
      {:req, "~> 0.5.17"},
      {:jason, "~> 1.4"},
      {:plug, "~> 1.16"},
      {:bandit, "~> 1.6"}
    ]
  end
end
