defmodule ElixirStarter.ResumeExtractor do
  @moduledoc """
  Resume extraction using BAML.

  Provides functions to extract structured resume data from raw text
  using the BAML ExtractResume function.
  """

  alias ElixirStarter.BamlClient

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

  @doc """
  Extract resume information synchronously.

  Returns `{:ok, %ElixirStarter.Resume{}}` on success or `{:error, reason}` on failure.

  ## Examples

      iex> {:ok, resume} = ElixirStarter.ResumeExtractor.call()
      iex> resume.name
      "John Doe"

  """
  def call(raw_text \\ @resume_sample) do
    BamlClient.ExtractResume.call(%{raw_text: raw_text})
  end

  @doc """
  Extract resume information with streaming via callback.

  Calls the callback with partial results as they arrive, then returns the final result.

  ## Examples

      ElixirStarter.ResumeExtractor.sync_stream(fn partial ->
        IO.puts("Got chunk: \#{inspect(partial)}")
      end)

  """
  def sync_stream(callback, raw_text \\ @resume_sample) do
    BamlClient.ExtractResume.sync_stream(%{raw_text: raw_text}, callback)
  end

  @doc """
  Stream resume extraction results as JSON strings.

  Returns a Stream that yields JSON-encoded partial results.

  ## Examples

      ElixirStarter.ResumeExtractor.stream_json()
      |> Enum.each(&IO.puts/1)

  """
  def stream_json(raw_text \\ @resume_sample) do
    Stream.resource(
      fn ->
        parent = self()
        ref = make_ref()

        pid =
          spawn_link(fn ->
            BamlClient.ExtractResume.stream(
              %{raw_text: raw_text},
              fn
                {:partial, result} ->
                  send(parent, {ref, {:chunk, result}})

                {:done, result} ->
                  send(parent, {ref, {:done, result}})

                {:error, error} ->
                  send(parent, {ref, {:error, error}})
              end
            )

            receive do
              :stop -> :ok
            end
          end)

        {ref, pid, :running}
      end,
      fn
        {ref, pid, :running} ->
          receive do
            {^ref, {:chunk, result}} ->
              json = result |> to_json_map() |> Jason.encode!()
              {[json], {ref, pid, :running}}

            {^ref, {:done, result}} ->
              json = result |> to_json_map() |> Jason.encode!()
              {[json], {ref, pid, :done}}

            {^ref, {:error, error}} ->
              {[Jason.encode!(%{error: error})], {ref, pid, :done}}
          after
            30_000 ->
              {:halt, {ref, pid, :timeout}}
          end

        {ref, pid, :done} ->
          {:halt, {ref, pid, :done}}

        {ref, pid, :timeout} ->
          {:halt, {ref, pid, :timeout}}
      end,
      fn {_ref, pid, _state} ->
        send(pid, :stop)
      end
    )
  end

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
