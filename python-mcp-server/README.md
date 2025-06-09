# Python BAML MCP Server

Welcome to the Python BAML MCP Server Project. This project demonstrates how to build and run an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server in Python, exposing weather tools to LLMs and clients like Claude for Desktop.

## Prerequisites

- Python 3.10+ (project uses 3.13; see `.python-version`)
- [Ollama](https://ollama.com) and Llama 3.1 (llama3.1) running (for BAML integration)
- [Claude for Desktop](https://modelcontextprotocol.io/quickstart/server) (optional, for client integration)
- [uv](https://github.com/astral-sh/uv) (recommended for fast Python dependency management)

## Getting Started

To set up and run the project, follow these steps:

1. **Set up your environment** (recommended: use `uv`):
   ```bash
   uv venv
   source .venv/bin/activate
   uv pip install -r requirements.txt  # or use `uv pip install .` if using pyproject.toml
   ```
   Or, if you prefer pip:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install .
   ```

2. **Install dependencies** (if not already done):
   ```bash
   pip install -r requirements.txt
   # or, if using pyproject.toml
   pip install .
   ```

3. **Run the MCP Server**:
   ```bash
   python weather.py
   ```
   This will launch the MCP server and expose weather tools over stdio.

## MCP Server Overview

This project uses [`mcp`](https://pypi.org/project/mcp/) and `FastMCP` to implement an MCP server that exposes two tools:

- `get_alerts`: Get weather alerts for a US state (two-letter code, e.g. CA, NY)
- `get_forecast`: Get weather forecast for a latitude/longitude (US only)

The server fetches data from the [US National Weather Service API](https://www.weather.gov/documentation/services-web-api) and formats it for LLM consumption. It also demonstrates BAML integration for LLM-powered alert summarization.

## Project Structure

- **weather.py**: Main MCP server implementation
- **baml_client/**: Generated BAML client for LLM integration
- **baml_src/**: BAML source files (clients, generators, weather)
- **pyproject.toml**: Project dependencies and metadata

## Integrating with Claude for Desktop

To use this MCP server with Claude for Desktop:

1. **Build and activate your environment** (see above).
2. **Configure Claude for Desktop**:
   - Open (or create) `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS/Linux.
   - Add the following configuration (replace `/ABSOLUTE/PATH/TO/PROJECT` with the absolute path to your `python-mcp-server` directory):

   ```json
   {
     "mcpServers": {
       "weather": {
         "command": "python",
         "args": ["weather.py"],
         "cwd": "/ABSOLUTE/PATH/TO/PROJECT"
       }
     }
   }
   ```

3. **Restart Claude for Desktop**. You should see the weather tools available in the Claude UI.

## Example Usage

- "What's the weather in Sacramento?"
- "What are the active weather alerts in Texas?"

These queries will trigger the MCP server tools and return real-time weather data from the US National Weather Service.

## Troubleshooting

- Check Claude logs at `~/Library/Logs/Claude/mcp*.log` for errors.
- Ensure the MCP server runs without errors (`python weather.py`).
- Make sure the path in your Claude config is absolute.
- Ensure your Python environment is activated and dependencies are installed.

For more details, see the [official MCP server quickstart](https://modelcontextprotocol.io/quickstart/server).
