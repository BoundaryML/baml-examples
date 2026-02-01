defmodule ElixirStarter.RouterTest do
  @moduledoc """
  Tests for the HTTP router.

  Unit tests check routing without calling BAML.
  Integration tests (tagged :integration) require OPENAI_API_KEY.
  """
  use ExUnit.Case, async: true

  import Plug.Test
  import Plug.Conn

  alias ElixirStarter.Router

  describe "routing" do
    test "GET / returns 200 with chunked response" do
      # This will start streaming but we can check the initial response
      conn =
        conn(:get, "/")
        |> Router.call([])

      # Should start a chunked response
      assert conn.status == 200
      assert {"content-type", "text/event-stream; charset=utf-8"} in conn.resp_headers
      assert conn.state == :chunked
    end

    test "POST /extract returns 200 with chunked response" do
      conn =
        conn(:post, "/extract", "Test resume content")
        |> put_req_header("content-type", "text/plain")
        |> Router.call([])

      assert conn.status == 200
      assert {"content-type", "text/event-stream; charset=utf-8"} in conn.resp_headers
      assert conn.state == :chunked
    end

    test "unknown route returns 404" do
      conn =
        conn(:get, "/unknown")
        |> Router.call([])

      assert conn.status == 404
      assert conn.resp_body == "Not found"
    end

    test "PUT / returns 404" do
      conn =
        conn(:put, "/")
        |> Router.call([])

      assert conn.status == 404
    end
  end
end

defmodule ElixirStarter.RouterIntegrationTest do
  @moduledoc """
  Integration tests for the HTTP router that call actual BAML functions.

  Run with: OPENAI_API_KEY=your_key mix test --only integration
  """
  use ExUnit.Case

  import Plug.Test
  import Plug.Conn

  @moduletag :integration

  alias ElixirStarter.Router

  @sample_resume """
  Test User
  123 Test Street

  Education:
  BS Computer Science
  Test University
  2020

  Skills: Testing, Elixir
  """

  describe "GET / integration" do
    @tag timeout: 120_000
    test "streams JSON chunks for resume extraction" do
      # Start the request in a separate process to handle streaming
      parent = self()

      spawn(fn ->
        conn =
          conn(:get, "/")
          |> Router.call([])

        send(parent, {:done, conn})
      end)

      # Wait for completion (with timeout)
      assert_receive {:done, conn}, 120_000

      assert conn.status == 200

      # The response should contain JSON data
      # Note: In a real streaming scenario, we'd need to capture chunks differently
      # This test mainly verifies the endpoint doesn't crash
    end
  end

  describe "POST /extract integration" do
    @tag timeout: 120_000
    test "extracts from custom resume text" do
      parent = self()

      spawn(fn ->
        conn =
          conn(:post, "/extract", @sample_resume)
          |> put_req_header("content-type", "text/plain")
          |> Router.call([])

        send(parent, {:done, conn})
      end)

      assert_receive {:done, conn}, 120_000
      assert conn.status == 200
    end
  end
end
