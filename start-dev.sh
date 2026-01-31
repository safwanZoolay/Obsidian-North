#!/bin/bash

# Obsidian North - Development Server Startup Script
# This script pulls latest changes, installs dependencies, and starts the dev server

echo "============================================================"
echo "🚀 Obsidian North - Development Environment Setup"
echo "============================================================"
echo ""

# Navigate to project directory
PROJECT_DIR="/home/user/Obsidian-North"
cd "$PROJECT_DIR" || {
    echo "❌ Error: Could not navigate to $PROJECT_DIR"
    exit 1
}
echo "📁 Current directory: $(pwd)"
echo ""

# Pull latest changes from git
echo "🔄 Pulling latest changes from git..."
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 Current branch: $CURRENT_BRANCH"
git pull origin "$CURRENT_BRANCH"
echo ""

# Check if package.json exists and install dependencies if needed
if [ -f "package.json" ]; then
    echo "📦 Checking for dependencies..."
    if [ ! -d "node_modules" ]; then
        echo "⬇️  Installing dependencies (node_modules not found)..."
        npm install
    else
        echo "✅ node_modules exists, skipping npm install"
        echo "   (Run 'npm install' manually if you need to update dependencies)"
    fi
    echo ""
fi

# Kill any existing server on port 8000
echo "🔍 Checking for existing server on port 8000..."
EXISTING_PID=$(lsof -ti:8000)
if [ ! -z "$EXISTING_PID" ]; then
    echo "⚠️  Found existing process on port 8000 (PID: $EXISTING_PID)"
    echo "🛑 Stopping existing server..."
    kill -9 $EXISTING_PID 2>/dev/null
    sleep 1
fi
echo ""

# Start the development server in the background
echo "🚀 Starting development server..."
if [ -f "server.js" ]; then
    node server.js &
    SERVER_PID=$!
    echo "✅ Server started with PID: $SERVER_PID"
elif command -v python3 &> /dev/null; then
    python3 -m http.server 8000 &
    SERVER_PID=$!
    echo "✅ Python HTTP server started with PID: $SERVER_PID"
else
    echo "❌ Error: No server.js found and python3 not available"
    exit 1
fi
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 2

# Check if server is running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server is running on http://localhost:8000"
else
    echo "❌ Error: Server failed to start"
    exit 1
fi
echo ""

# Open browser
echo "🌐 Opening browser..."
SERVER_URL="http://localhost:8000"

if command -v xdg-open &> /dev/null; then
    xdg-open "$SERVER_URL" 2>/dev/null
elif command -v gnome-open &> /dev/null; then
    gnome-open "$SERVER_URL" 2>/dev/null
elif command -v open &> /dev/null; then
    open "$SERVER_URL" 2>/dev/null
else
    echo "⚠️  Could not detect browser opener. Please open manually:"
    echo "   $SERVER_URL"
fi
echo ""

echo "============================================================"
echo "✅ Development environment is ready!"
echo "============================================================"
echo ""
echo "📍 Server URL: $SERVER_URL"
echo "📍 Server PID: $SERVER_PID"
echo ""
echo "To stop the server, run:"
echo "   kill $SERVER_PID"
echo ""
echo "Or press Ctrl+C and run:"
echo "   lsof -ti:8000 | xargs kill -9"
echo "============================================================"
echo ""

# Keep script running to show server logs
wait $SERVER_PID
