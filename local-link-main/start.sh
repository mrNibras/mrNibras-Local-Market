#!/bin/bash

###############################################################################
# Local Link - Quick Start Script
# 
# This script starts both backend and frontend servers for local testing
#
# Usage: ./start.sh
###############################################################################

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🚀 Local Link - Quick Start                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER_DIR="$SCRIPT_DIR/server"

# Check if MongoDB is running
echo -e "${YELLOW}Checking MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    # Check if MongoDB is running in Docker
    if ! docker ps 2>/dev/null | grep -q "mongo"; then
        echo -e "${RED}❌ MongoDB is not running!${NC}"
        echo "Starting MongoDB in Docker..."
        docker start local-link-mongo 2>/dev/null || \
            docker run -d -p 27017:27017 --name local-link-mongo mongo:7
        sleep 3
        echo -e "${GREEN}✅ MongoDB started in Docker${NC}"
    else
        echo -e "${GREEN}✅ MongoDB is running in Docker${NC}"
    fi
else
    echo -e "${GREEN}✅ MongoDB is running${NC}"
fi

# Check if server .env exists
if [ ! -f "$SERVER_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Server .env not found. Creating from .env.example...${NC}"
    cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please update $SERVER_DIR/.env with your configuration${NC}"
fi

# Install dependencies if needed
echo -e "${BLUE}Checking dependencies...${NC}"

if [ ! -d "$SERVER_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing server dependencies...${NC}"
    cd "$SERVER_DIR" && npm install
    echo -e "${GREEN}✅ Server dependencies installed${NC}"
fi

if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$SCRIPT_DIR" && npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                   Starting Servers                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Start backend in background
echo -e "${YELLOW}Starting backend server...${NC}"
cd "$SERVER_DIR"
npm run dev > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to start
echo -e "${BLUE}Waiting for backend to be ready...${NC}"
sleep 5

# Check if backend is running
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check logs:${NC}"
    echo -e "${RED}$SCRIPT_DIR/backend.log${NC}"
    cat "$SCRIPT_DIR/backend.log"
    kill $BACKEND_PID
    exit 1
fi
echo -e "${GREEN}✅ Backend is ready at http://localhost:5000${NC}"

# Start frontend in background
echo -e "${YELLOW}Starting frontend application...${NC}"
cd "$SCRIPT_DIR"
npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to start
sleep 5

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  🎉 Servers Ready!                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}✅ Backend:  ${BLUE}http://localhost:5000${NC}"
echo -e "${GREEN}✅ Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "${GREEN}✅ API Docs: ${BLUE}http://localhost:5000/api${NC}"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  $SCRIPT_DIR/backend.log"
echo "  Frontend: $SCRIPT_DIR/frontend.log"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${YELLOW}Or press Ctrl+C to stop all servers${NC}"
echo ""

# Open browser (optional)
if command -v xdg-open &> /dev/null; then
    echo -e "${BLUE}Opening browser...${NC}"
    xdg-open http://localhost:5173 &
fi

# Keep script running
wait
