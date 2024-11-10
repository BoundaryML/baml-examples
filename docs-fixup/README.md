# LLM-powered doc fixes

This project points at a documentation directory (built using fern's `docs.yml`) and suggests
links to fill in link placeholders.

You'll need an `ANTHROPIC_API_KEY` and the `uv` package manager to run this:

```bash
uv run shiny run docs/run-app.py
```

The authoritative copy of this code lives in the BoundaryML monorepo, at [`BoundaryML/baml` in the `tools` directory](https://github.com/boundaryml/baml/tree/canary/tools).

Here's what this looks like in action:

![](screenshot.png)
