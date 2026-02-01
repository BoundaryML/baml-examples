defmodule ElixirStarterTest do
  use ExUnit.Case

  alias ElixirStarter.BamlClient

  describe "generated BAML types" do
    test "Resume struct is generated with correct fields" do
      resume = %BamlClient.Resume{
        name: "John Doe",
        education: [],
        skills: ["Python", "Elixir"]
      }

      assert resume.name == "John Doe"
      assert resume.skills == ["Python", "Elixir"]
      assert resume.education == []
    end

    test "Education struct is generated with correct fields" do
      education = %BamlClient.Education{
        school: "MIT",
        degree: "BS Computer Science",
        year: 2020
      }

      assert education.school == "MIT"
      assert education.degree == "BS Computer Science"
      assert education.year == 2020
    end

    test "Resume can contain Education structs" do
      education = %BamlClient.Education{
        school: "Stanford",
        degree: "MS",
        year: 2022
      }

      resume = %BamlClient.Resume{
        name: "Jane Doe",
        education: [education],
        skills: []
      }

      assert length(resume.education) == 1
      assert hd(resume.education).school == "Stanford"
    end

    test "MyEnum module is generated with correct values" do
      values = BamlClient.MyEnum.values()
      assert :VALUE1 in values
      assert :VALUE2 in values
      assert :VALUE3 in values
      assert length(values) == 3
      assert BamlClient.MyEnum.type() == :enum
    end
  end

  describe "ExtractResume function module" do
    test "ExtractResume module exists with call/2 function" do
      assert function_exported?(BamlClient.ExtractResume, :call, 1)
      assert function_exported?(BamlClient.ExtractResume, :call, 2)
    end

    test "ExtractResume module exists with stream/3 function" do
      assert function_exported?(BamlClient.ExtractResume, :stream, 2)
      assert function_exported?(BamlClient.ExtractResume, :stream, 3)
    end

    test "ExtractResume module exists with sync_stream/3 function" do
      assert function_exported?(BamlClient.ExtractResume, :sync_stream, 2)
      assert function_exported?(BamlClient.ExtractResume, :sync_stream, 3)
    end
  end

  describe "ResumeExtractor module functions" do
    test "call function exists" do
      exports = ElixirStarter.ResumeExtractor.__info__(:functions)
      assert {:call, 0} in exports
      assert {:call, 1} in exports
    end

    test "sync_stream function exists" do
      exports = ElixirStarter.ResumeExtractor.__info__(:functions)
      assert {:sync_stream, 1} in exports
      assert {:sync_stream, 2} in exports
    end

    test "stream_json function exists" do
      exports = ElixirStarter.ResumeExtractor.__info__(:functions)
      assert {:stream_json, 0} in exports
      assert {:stream_json, 1} in exports
    end
  end
end
