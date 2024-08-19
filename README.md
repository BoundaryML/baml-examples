# baml-examples

This repository contains BAML example code used in the Documentation [Tutorials](https://docs.boundaryml.com/docs/get-started/quickstart/python). Check them out first to get started!

Clone the repo to see syntax highlights using the BAML VSCode extension!

### Requirements

1. BAML VScode extension

## Troubleshooting

If you're having issues, reach out to us on Discord (https://discord.gg/yzaTpQ3tdT).

Some common steps that help fix things:

1. Make sure you also add `baml-py` pip package to the project dependencies if you are not using poetry (see pyproject.toml for dependency list).
1. Make sure you're in a poetry shell when you run the python main.py files.
1. Enable Python > Analysis: Type Checking Mode - Basic or greater.
1. Make sure environment variables are set in the playground (see gear settings icon)
1. Restart VScode if the playground isn't working
1. Restart VSCode if you're not getting error highlights for baml-generated code, or ensure the right Python interpreter is set (Command + Shift + P -> Select interpreter)
