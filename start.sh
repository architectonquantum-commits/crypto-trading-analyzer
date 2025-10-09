#!/bin/bash
echo "🚀 Iniciando Backend y Frontend..."

# Limpiar procesos anteriores
pkill -9 python 2>/dev/null
pkill -9 node 2>/dev/null
sleep 2

# Iniciar backend en background
cd backend
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!

# Iniciar frontend en background
cd ../frontend
nohup npm run dev -- --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!

cd ..

echo "✅ Backend corriendo (PID: $BACKEND_PID) - Log: backend.log"
echo "✅ Frontend corriendo (PID: $FRONTEND_PID) - Log: frontend.log"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs backend:  tail -f backend.log"
echo "   Ver logs frontend: tail -f frontend.log"
echo "   Detener todo:      pkill -9 python && pkill -9 node"
