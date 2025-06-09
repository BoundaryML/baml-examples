# Node.js TypeScript BAML MCP Server

Welcome to the Node.js TypeScript BAML MCP Server Project. This project demonstrates how to build and run an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server in Node.js/TypeScript, exposing weather tools to LLMs and clients like Claude for Desktop.

## Prerequisites

- Node.js 18+
- [Ollama](https://ollama.com) and Llama 3.1 (llama3.1) running (for BAML integration)
- [Claude for Desktop](https://modelcontextprotocol.io/quickstart/server) (optional, for client integration)

## Getting Started

To set up and run the project, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Project**:
   ```bash
   npm run build
   ```

3. **Start the MCP Server**:
   ```bash
   npm run start
   ```
   This will launch the MCP server and expose weather tools over stdio.

## MCP Server Overview

This project uses the [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) to implement an MCP server that exposes two tools:

- `get-alerts`: Get weather alerts for a US state (two-letter code, e.g. CA, NY)
- `get-forecast`: Get weather forecast for a latitude/longitude (US only)

The server fetches data from the [US National Weather Service API](https://www.weather.gov/documentation/services-web-api) and formats it for LLM consumption. It also demonstrates BAML integration for LLM-powered alert summarization.

## Project Structure

- **src/**: TypeScript source files, including the MCP server and BAML client
- **build/**: Compiled JavaScript files
- **package.json**: Project dependencies and scripts
- **tsconfig.json**: TypeScript configuration

## Scripts

- `npm install`: Installs dependencies
- `npm run build`: Compiles TypeScript to JavaScript
- `npm run start`: Starts the MCP server (using ts-node-dev for development)

## Integrating with Claude for Desktop

To use this MCP server with Claude for Desktop:

1. **Build the project** (see above).
2. **Configure Claude for Desktop**:
   - Open (or create) `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS/Linux.
   - Add the following configuration (replace `/ABSOLUTE/PATH/TO/PROJECT` with the absolute path to your `nodejs-mcp-server` directory):

   ```json
   {
     "mcpServers": {
       "weather": {
         "command": "npm",
         "args": ["run", "start", "--prefix", "/ABSOLUTE/PATH/TO/PROJECT"]
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
- Ensure the MCP server builds and runs without errors (`npm run build && npm run start`).
- Make sure the path in your Claude config is absolute.

For more details, see the [official MCP server quickstart](https://modelcontextprotocol.io/quickstart/server).
