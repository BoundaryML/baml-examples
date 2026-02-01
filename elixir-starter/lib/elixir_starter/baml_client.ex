defmodule ElixirStarter.BamlClient do
  # {:my_app, "priv/baml_src"} Will be expanded to Application.app_dir(:my_app, "priv/baml_src")
  use BamlElixir.Client, path: {:elixir_starter, "priv/baml_src"}

end
