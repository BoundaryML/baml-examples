### How to set up these tutorials.

These tutorials use a single baml_src. We recommend copy pasting the prompts / functions /models you need into your own project that you initialized via `baml init` so that you can run this using TypeScript or Python setup of your choice.

Otherwise, if you already use python and `poetry` as your package management solution, you should be able to clone this and run the commands below:

1. Install the [poetry CLI](https://python-poetry.org/docs/)
2. `poetry install --no-root`
3. Run `baml test` to see the list of tests
4. Run `baml test run -i Classify to run classifcation tests or add any other matching name to the -i argument.
5. Make sure to open the playground by opening this in VSCode and running tests there!
