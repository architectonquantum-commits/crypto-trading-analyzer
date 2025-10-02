#!/bin/bash

# Instalar dependencias del backend
cd backend
pip install -r requirements.txt

# Inicializar base de datos si no existe
python -c "from app.database import init_db; init_db()"

# Iniciar backend en segundo plano
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Instalar dependencias del frontend
cd ../frontend
npm install

# Iniciar frontend
npm run dev -- --host 0.0.0.0 --port 3000