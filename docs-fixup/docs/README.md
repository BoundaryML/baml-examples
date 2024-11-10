# Docs tooling

Currently just the AI link suggestion tool and all the supporting code.

---

`uv run docs/run-app.py --reload` to run the Shiny app

---

`run-ai-lint.py` is the main entry point; it's meant to be run from `fern/` using `pnpm ai-lint`

---

`run-evals.py` is for testing link suggestions, it's meant to be run from `tools/` using

```
infisical run -- npx nodemon --ext py --exec 'uv run docs/run-evals.py'
```

Note that this runs two types of evals:

- with original links; this most closely mimics the actual user behavior

- with links stripped; this tests the LLM's ability to suggest links we've already specified, so these diffs may look wonky
