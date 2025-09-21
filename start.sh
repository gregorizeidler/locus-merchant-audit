#!/bin/bash

# Locus Merchant Audit Startup Script

echo "📍 Starting Locus Merchant Audit - Merchant Validation Platform"
echo "=================================================="

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "⚠️  Backend .env file not found. Copying from example..."
    cp env.example .env
    echo "✅ Please edit .env with your Google Maps API key and database settings"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Copying from example..."
    cp frontend/env.example frontend/.env
    echo "✅ Please edit frontend/.env with your Google Maps API key"
fi

# Check if Google Maps API key is set
if grep -q "your_google_maps_api_key_here" .env; then
    echo "❌ Please set your Google Maps API key in .env file"
    echo "   Get your API key from: https://developers.google.com/maps/documentation/javascript/get-api-key"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required but not installed"
    exit 1
fi

echo "✅ All dependencies found"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Start services
echo "🚀 Starting services..."

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Locus Merchant Audit is now running!"
echo "=================================================="
echo "🔧 Backend API: http://localhost:8000"
echo "🎨 Frontend App: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for processes
wait
