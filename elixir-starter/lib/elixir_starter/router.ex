defmodule ElixirStarter.Router do
  @moduledoc """
  HTTP Router for the ElixirStarter API.

  Equivalent to the FastAPI app in Python.
  """
  alias ElixirStarter.BamlClient
  use Plug.Router

  plug(Plug.Logger)
  plug(:match)
  plug(:dispatch)

  @resume_sample """
  John Doe
  1234 Elm Street
  Springfield, IL 62701
  (123) 456-7890

  Objective: To obtain a position as a software engineer.

  Education:
  Bachelor of Science in Computer Science
  University of Illinois at Urbana-Champaign
  May 2020 - May 2024

  Experience:
  Software Engineer Intern
  Google
  May 2022 - August 2022
  - Worked on the Google Search team
  - Developed new features for the search engine
  - Wrote code in Python and C++

  Software Engineer Intern
  Facebook
  May 2021 - August 2021
  - Worked on the Facebook Messenger team
  - Developed new features for the messenger app
  - Wrote code in Python and Java
  """

  # GET / - Stream resume extraction (equivalent to Python FastAPI endpoint)
  get "/" do
    conn =
      conn
      |> put_resp_content_type("text/event-stream")
      |> send_chunked(200)

    stream_resume(conn, @resume_sample)
  end

  # POST /extract - Extract from custom resume text
  post "/extract" do
    {:ok, body, conn} = Plug.Conn.read_body(conn)

    conn =
      conn
      |> put_resp_content_type("text/event-stream")
      |> send_chunked(200)

    stream_resume(conn, body)
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end

  defp stream_resume(conn, resume_text) do
    parent = self()
    ref = make_ref()

    # Start the BAML stream in a separate process
    spawn_link(fn ->
      BamlClient.ExtractResume.stream(
        %{raw_text: resume_text},
        fn
          {:partial, result} ->
            send(parent, {ref, {:chunk, result}})

          {:done, result} ->
            send(parent, {ref, {:done, result}})

          {:error, error} ->
            send(parent, {ref, {:error, error}})
        end
      )

      # Keep alive until streaming is done
      receive do
        :stop -> :ok
      after
        60_000 -> :ok
      end
    end)

    # Stream chunks to the HTTP response
    stream_loop(conn, ref)
  end

  defp stream_loop(conn, ref) do
    receive do
      {^ref, {:chunk, result}} ->
        json = result |> to_json_map() |> Jason.encode!()
        IO.puts("Got chunk: #{json}")

        case Plug.Conn.chunk(conn, json <> "\n") do
          {:ok, conn} -> stream_loop(conn, ref)
          {:error, _reason} -> conn
        end

      {^ref, {:done, result}} ->
        json = result |> to_json_map() |> Jason.encode!()
        IO.puts("Final result: #{json}")
        Plug.Conn.chunk(conn, json <> "\n")
        conn

      {^ref, {:error, error}} ->
        error_json = Jason.encode!(%{error: inspect(error)})
        Plug.Conn.chunk(conn, error_json <> "\n")
        conn
    after
      60_000 ->
        IO.puts("Timeout waiting for stream")
        conn
    end
  end

  # Convert struct to plain map for JSON encoding
  defp to_json_map(%{__struct__: _} = struct) do
    struct
    |> Map.from_struct()
    |> Map.new(fn {k, v} -> {k, to_json_map(v)} end)
  end

  defp to_json_map(list) when is_list(list) do
    Enum.map(list, &to_json_map/1)
  end

  defp to_json_map(value), do: value
end
