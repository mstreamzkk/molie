#!/bin/bash

# Frontend startup script for Molie Times Tables app
# Usage:
#   ./start_frontend.sh           # Start the dev server
#   ./start_frontend.sh --install # Install dependencies and start
#   ./start_frontend.sh --test    # Run tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "$1" in
    --install)
        echo "📦 Installing dependencies..."
        npm install
        echo "✅ Dependencies installed"
        echo ""
        echo "🚀 Starting development server..."
        npm run dev
        ;;
    --test)
        echo "🧪 Running tests..."
        npm test
        ;;
    *)
        echo "🚀 Starting development server..."
        npm run dev
        ;;
esac
