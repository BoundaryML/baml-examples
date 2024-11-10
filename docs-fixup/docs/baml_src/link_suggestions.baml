class LocalLinkDest {
  type "docs.boundaryml.com"
  path string
}

class OtherLinkDest {
  type "other-website"
  url string
}

class LinkSuggestion {
  link_text string
  @description("Example: link_text='python' for 'For the [python] docs...'")
  current_dest string?
  suggested_link LocalLinkDest | OtherLinkDest
  // suggested_link_ref_id string?
  // @description("If the link should be a markdown reference link, use this as the link ID - allowed chars are a-z, 0-9, -, _")
  line_number int
}

// Create a function to extract the resume from a string.
function MakeLinkSuggestions(
  filepath_str: string,
  file_contents: string,
  sitemap_str: string,
) -> LinkSuggestion[] {
  // client "anthropic/claude-3-5-haiku-20241022"
  client "anthropic/claude-3-5-sonnet-latest"
  prompt #"
    For every link, show a suggestion in the specified format, based on the attached file and sitemap:

    <format>
    {{ ctx.output_format(prefix="") }}
    </format>

    <file path="{{filepath_str}}">
    {{file_contents}}
    </file path="{{filepath_str}}">

    <sitemap>
    {{sitemap_str}}
    </sitemap>
  "#
}

// Test the function with a sample resume. Open the VSCode playground to run this.
test suggest1 {
  functions [MakeLinkSuggestions]
  args {
    filepath_str #"01-guide/02-languages/python.mdx"#
    file_contents #"
10 | BAML can be used with Vercel's AI SDK to stream BAML functions to your UI.
11 | 
12 | The latest example code is found in our [NextJS starter], but this tutorial will guide you on how to add BAML step-by-step.
13 | 
14 | See the [live demo]
    "#
    sitemap_str #"
  - tab: home
    layout:
      - page: Welcome
        path: pages/welcome.mdx
  - tab: guides
    layout:
      - section: Introduction
        contents:
          - page: What is BAML?
            icon: fa-regular fa-question-circle
            path: 01-guide/what-are-function-definitions.mdx
          - page: What's the baml_src folder
            icon: fa-regular fa-folder
            path: 01-guide/what-is-baml_src.mdx
            slug: baml_src
          - page: What's baml_client
            icon: fa-regular fa-folder-gear
            path: 01-guide/what-is-baml_client.mdx
            slug: baml_client

    "#
  }
}
