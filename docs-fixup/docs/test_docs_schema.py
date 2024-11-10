import pytest

from docs.retrieve_fern import normalize_slug


@pytest.mark.parametrize(
    "path_str, expected_slug",
    [
        ("@alias / @@alias", "alias-alias"),
        ("@description / @@description", "description-description"),
        ("@skip", "skip"),
        ("template_string", "template-string"),
        ("map (dictionary)", "map-dictionary"),
        ("openai-generic: Groq", "openai-generic-groq"),
        ("ctx.output_format", "ctx-output-format"),
        ("_.role", "role"),
        ("What is jinja?", "what-is-jinja"),
        ("camelCase", "camel-case"),
        ("VSCode Workspace", "vs-code-workspace"),
    ],
)
def test_normalize_slug(path_str: str, expected_slug: str):
    result = normalize_slug(path_str)
    assert (
        result == expected_slug
    ), f"Failed for input '{path_str}': expected '{expected_slug}', got '{result}'"
