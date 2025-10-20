#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting BAML Python Chatbot in Development Mode${NC}"
echo ""

# Check for API keys
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: No API keys detected!${NC}"
    echo "Please set one of the following environment variables:"
    echo "  export OPENAI_API_KEY='your-openai-api-key'"
    echo "  export ANTHROPIC_API_KEY='your-anthropic-api-key'"
    echo ""
    echo "The app will still run but won't be able to process messages."
    echo ""
fi

# Function to kill both processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to call cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend
echo -e "${GREEN}Starting backend server on port 8000...${NC}"
cd server && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend
echo -e "${GREEN}Starting frontend dev server on port 3000...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Both servers are starting!${NC}"
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000 (opens automatically)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID