#!/usr/bin/env bash
set -euo pipefail
echo "This script will install dependencies for services locally. Run each command manually if you prefer."

echo "Node services: run these in separate terminals or use tmux"
echo "cd services/payment && npm install"
echo "cd services/ai-queue-node && npm install"
echo "cd services/notification-service && npm install"
echo "cd services/media-service && npm install"
echo "cd services/discovery-service && npm install"
echo "cd services/blockchain-service && npm install"
echo "cd gateway/bff-web && npm install"
echo "cd admin-dashboard && npm install"

echo "Python services: create venv and pip install"
echo "cd services/ai-service && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
echo "cd services/analytics-service && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"

echo "Run the install commands above in your dev machine to populate node_modules and python venvs."
