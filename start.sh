#!/bin/bash

echo "🚀 Iniciando Trading App..."

# Inicializar base de datos
echo "🗄️  Inicializando base de datos..."
cd backend
python -c "from app.database import init_db; init_db()"

# Iniciar backend en segundo plano
echo "🔧 Iniciando backend..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --ws none &

cd ../frontend
echo "🎨 Iniciando frontend..."
npm run dev -- --host 0.0.0.0 --port 5000