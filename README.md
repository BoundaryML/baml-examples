# baml-examples

This repository contains BAML example code used in the Documentation [Tutorials](https://boundaryml.com/v3/guides/hello_world/level0). Check them out first to get started!

Clone the repo to see syntax highlights using the BAML VSCode extension!

### Requirements
1. BAML CLI, BAML VSCode extension
1. This repository uses ⚠️⚠️⚠️ Poetry ⚠️⚠️⚠️ as the python environment manager.
2. Python >=3.9 (Contact us if you have an older version).

**Contact us on Discord if you need help running the examples using Conda, pip or another dependency mgmt**.

### Setup
1. Clone the repo
2. Install [poetry](https://python-poetry.org/docs/)
3. Run `poetry shell` in the root
4. Run `poetry install`
5. Make sure you can ctrl + s one of the .baml files after you install the BAML VSCode extension to generate a baml_client dir.

## Troubleshooting

If you're having issues, reach out to us on Discord (https://discord.gg/yzaTpQ3tdT).

Some common steps that help fix things:
1. Make sure you also add `baml` pip package to the project dependencies if you are not using poetry (see pyproject.toml for dependency list).
1. Make sure you're in a poetry shell when you run the python main.py files.
2. Make sure environment variables are set (some baml files use an env.OPEN_AI_KEY). Add a .env file to the root dir, with the key set to fix this.
3. Restart VScode if the playground isn't working
4. Restart VSCode if you're not getting error highlights for baml-generated code, or ensure the right Python interpreter is set (Command + Shift + P -> Select interpreter)
