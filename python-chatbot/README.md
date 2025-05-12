Python Chatbot Example
======================

This project demonstrates how to build an AI Agent in BAML
in a Python FastAPI server, and stream its responses to a
React frontend.

## Dependencies

The following tools will fetch all other needed dependencies:

 - pnpm
 - uv
 - uvicorn

## Building the project

The scripts in `package.json` handle building the server and the
frontend:

```bash
pnpm install
pnpm dev
```

After running these commands, browse to localhost:8080 to interact
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
and served by the FastAPI server.