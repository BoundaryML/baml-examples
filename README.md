# baml-examples

This repository contains BAML example code used in the Documentation [Tutorials](https://docs.boundaryml.com/docs/get-started/quickstart/python). Check them out first to get started!

Clone the repo to see syntax highlights using the BAML VSCode extension!

### Requirements

1. BAML VScode extension - https://marketplace.visualstudio.com/items?itemName=Boundary.baml-extension

## Troubleshooting

If you're having issues, reach out to us on Discord (https://discord.gg/yzaTpQ3tdT).

Some common steps that help fix things:

The python projects use [uv](https://docs.astral.sh/uv/getting-started/installation/) python environment manager. We highly highly recommend it as it manages python installations, and it just works.

1. Ensure versions match in the generator config in the baml file, the vscode extension, and the baml package dependency.
2. Make sure you also add `baml-py` pip package to the project dependencies if you are not using poetry (see pyproject.toml for dependency list).
3. Enable Python > Analysis: Type Checking Mode - Basic or greater.
4. Make sure environment variables are set in the playground (see gear settings icon)
5. Restart VScode if the playground isn't working
6. Restart VSCode if you're not getting error highlights for baml-generated code, or ensure the right Python interpreter is set (Command + Shift + P -> Select interpreter)
