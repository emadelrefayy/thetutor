#!/bin/bash
echo "==> Stopping old processes..."
pkill -9 -f uvicorn
pkill -9 -f vite
pkill -9 -f node

echo "==> Starting Backend (FastAPI)..."
cd /root/thetutor_fresh/backend
/root/thetutor_fresh/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &

echo "==> Starting Frontend (Vite)..."
cd /root/thetutor_fresh/frontend
npm run dev -- --host 0.0.0.0 --port 3000 &

echo "==> Both services are running successfully!"
