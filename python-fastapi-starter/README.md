## Setup

Open this project up in VSCode (we recommend only opening this folder, and not at the root, or VSCode may not detect the python environment and you may not get type completions for BAML functions).

Ensure your `settings.json` has:

```
{
  "python.analysis.typeCheckingMode": "basic"
}
```

1. Run `poetry install`
2. Run `poetry shell`
3. Add your env vars to a .env file (OPENAI_API_KEY, or you can switch the client in clients.baml)
4. Open up vscode command palette (command + shift + p, and select the .venv folder that was created in this directory as the interpreter)
5. Run `uvicorn fast_api_starter.app:app --reload`
6. Curl the streaming endpoint:
   ```
   curl -X GET -H "Content-Type: application/json" http://localhost:8000
   ```
