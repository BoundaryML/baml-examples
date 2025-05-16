Python Chatbot Example
======================

This project demonstrates how to build an AI Agent in BAML
in a Python FastAPI server, and stream its responses to a
React frontend.

The Agent has access to 2 tools: a weather-fetching tool and
an arithmetic calculator, as well as a streaming communication
channel to the user. The agent is able to serve queries
that require both tools, for example: "Tell me a creative story
about the number that is equal to 15 plus the current weather
in New York City."

Multi-tool composition works via logic that
is coordinated between the Agent definition in BAML, and the
client running in Python. BAML specifies individual tool
calls (GetWeather, Calculate, MesasgeToUser). The LLM Function
reads the query and produces a list of tool calls for the
client to interprete and implement. When the full chain of
required tools can't be known from the query alone (for example,
because the LLM doesn't yet know the weather), then the LLM can
invoke the "Resume" tool at the end of the list of tools it
is currently able to use. Resume is interpreted by the client
by fulfilling all the prior Tool calls, and then re-running the
LLM function with the updated Tool call results.


## Dependencies

The following tools will fetch all other needed dependencies:

 - pnpm
 - uv
 - uvicorn

Nix users should use `nix-shell` to get the right versions of these
tools and to tell `uv` where to find Python.

## Building the project

The scripts in `package.json` handle building the server and the
frontend:

```bash
pnpm install
pnpm run setup:frontend
pnpm run setup:server
pnpm run build:baml
pnpm run build:frontend
pnpm run start:prod
```

After running these commands, browse to localhost:8000 to interact
with the chatbot.

## Project Structure

### Server

The `server` directory contains the BAML code (`baml_src`), the generated
BAML Python client (`baml_client`), and tool implementations,
and the FastAPI HTTP server.

### Frontend

The `frontend` directory contains the React code that serves as a
frontend for the Chatbot. In development mode, is is built and
served by Vite. In production mode, it is compiled to static assets
and served by the FastAPI server. No LLM client logic lives under
`frontend` in this example - all LLM logic is contained in `server`.