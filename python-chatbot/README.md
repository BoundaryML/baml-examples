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

The following tools are required:

 - pnpm (for workspace management)
 - npm (for frontend dependencies)
 - uv (for Python package management)

Nix users should use `nix-shell` to get the right versions of these
tools and to tell `uv` where to find Python.

## Quick Start

### 1. Set up API Keys

The chatbot requires at least one LLM API key. Set one of the following environment variables:

```bash
export OPENAI_API_KEY="your-openai-api-key"
# OR
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 2. Install Dependencies & Generate BAML Client

```bash
# Backend setup
cd server
uv sync
uv add baml-py==0.207.1  # Ensure correct BAML version
uv run baml-cli generate

# Frontend setup
cd ../frontend
npm install
```

### 3. Development Mode (Recommended)

**Option A: Single Command (Easiest)**
```bash
# Using npm/pnpm
npm run dev
# OR
pnpm run dev

# Using bash script
./dev.sh
```

**Option B: Separate Terminals**

Terminal 1 - Backend:
```bash
cd server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Then browse to http://localhost:3000 (frontend dev server with hot reload)

### 4. Production Mode (Optional)

If you want to serve the frontend from the backend:

```bash
# Build frontend
cd frontend
npm run build
cp -r out/* ../server/app/static/

# Run server (serves both API and frontend)
cd ../server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then browse to http://localhost:8000

## Project Structure

### Server

The `server` directory contains the BAML code (`baml_src`), the generated
BAML Python client (`baml_client`), and tool implementations,
and the FastAPI HTTP server.

### Frontend

The `frontend` directory contains the React code that serves as a
frontend for the Chatbot. In development mode, it is built and
served by Next.js dev server. In production mode, it is compiled to static assets
and served by the FastAPI server. No LLM client logic lives under
`frontend` in this example - all LLM logic is contained in `server`.

## Configuration

### Weather Tool
The weather tool can work in two modes:

1. **Mock Mode (Default)**: Returns realistic mock weather data without external API calls
   - Enabled by default or when `USE_MOCK_WEATHER=true`
   - Includes temperature variations based on time of day
   - Supports major cities worldwide with realistic weather patterns

2. **Real API Mode**: Uses Open-Meteo API for actual weather data
   - Set `USE_MOCK_WEATHER=false` to enable
   - Falls back to mock data if API fails or location not found

## Troubleshooting

- **Missing API Keys**: The application will display a warning banner if API keys are not configured. Set the required environment variables and restart the server.

- **Import Error**: If you see `ModuleNotFoundError: No module named 'baml_client.partial_types'`, the import has been fixed to use `baml_client.stream_types` instead.

- **Version Mismatch**: Ensure baml-py version matches the version in `server/baml_src/generators.baml` (currently 0.207.1)

- **Frontend Not Loading**: If running in development mode, make sure both the backend (port 8000) and frontend (port 3000) servers are running.

- **CORS Issues**: The backend is configured to accept requests from `http://localhost:3000` for development mode.

- **API Errors**: Backend exceptions are now properly displayed in the chat interface with helpful error messages.