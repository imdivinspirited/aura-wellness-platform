#!/usr/bin/env bash
set -euo pipefail

echo "Starting The AOLIC Bangalore (dev stack)..."
echo "Tip: create .env from .env.example first."

docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

echo ""
echo "Frontend:  http://localhost:8081"
echo "Backend:   http://localhost:3000/api/v1"
echo "Health:    http://localhost:3000/health"
echo ""

