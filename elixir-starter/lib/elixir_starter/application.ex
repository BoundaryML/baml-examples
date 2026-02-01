defmodule ElixirStarter.Application do
  @moduledoc """
  OTP Application for ElixirStarter.

  Starts the HTTP server on port 4000.
  """
  use Application

  @impl true
  def start(_type, _args) do
    port = String.to_integer(System.get_env("PORT") || "4000")

    children = [
      {Bandit, plug: ElixirStarter.Router, port: port}
    ]

    opts = [strategy: :one_for_one, name: ElixirStarter.Supervisor]

    IO.puts("Starting ElixirStarter server on http://localhost:#{port}")

    Supervisor.start_link(children, opts)
  end
end
