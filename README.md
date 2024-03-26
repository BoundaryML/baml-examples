# baml-examples

This repository contains BAML example code used in the Documentation [Tutorials](https://boundaryml.com/v3/guides/hello_world/level0). Check them out first to get started!

Clone the repo to see syntax highlights using the BAML VSCode extension!

### Requirements

1. BAML CLI,
2. BAML VSCode extension
3. OPENAI_API_KEY is set in your .env file. See .env.example at the root.

**Contact us on Discord if you need help running the examples using Conda, pip or another dependency mgmt**.

### Setup

We recommend running `baml init` in your own project (unless you just want to clone the NextJS or FastAPI starter projects). Then just copy the .baml files and functions you want.

Make sure you can ctrl + s one of the .baml files after you install the BAML VSCode extension to generate a baml_client dir.

## Troubleshooting

If you're having issues, reach out to us on Discord (https://discord.gg/yzaTpQ3tdT).

Some common steps that help fix things:

1. Make sure you also add `baml` pip package to the project dependencies if you are not using poetry (see pyproject.toml for dependency list).
1. Make sure you're in a poetry shell when you run the python main.py files.
1. Enable Python > Analysis: Type Checking Mode - Basic or greater.
1. Make sure environment variables are set (some baml files use an env.OPEN_AI_KEY). Add a .env file to the root dir with the appropriate api key set to fix this.
1. Restart VScode if the playground isn't working
1. Restart VSCode if you're not getting error highlights for baml-generated code, or ensure the right Python interpreter is set (Command + Shift + P -> Select interpreter)
