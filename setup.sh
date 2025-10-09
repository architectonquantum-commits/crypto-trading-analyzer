#!/bin/bash

echo "🧹 Limpiando directorio raíz..."
echo "⚠️  ADVERTENCIA: Esto eliminará todos los archivos y carpetas existentes"
echo "Presiona Ctrl+C en los próximos 3 segundos para cancelar..."
sleep 3

# Eliminar todo excepto el script setup.sh y archivos ocultos de sistema
find . -mindepth 1 -maxdepth 1 ! -name 'setup.sh' ! -name '.git' ! -name '.replit' ! -name '.config' -exec rm -rf {} +

echo "✅ Directorio limpiado"
echo ""
echo "🏗️  Creando estructura de carpetas..."

# Crear estructura de carpetas del proyecto
mkdir -p backend/app/api/endpoints
mkdir -p backend/app/core
mkdir -p backend/app/models
mkdir -p backend/app/services/modules
mkdir -p backend/app/utils
mkdir -p backend/tests
mkdir -p frontend

# Crear archivos __init__.py para Python
touch backend/app/__init__.py
touch backend/app/api/__init__.py
touch backend/app/api/endpoints/__init__.py
touch backend/app/core/__init__.py
touch backend/app/models/__init__.py
touch backend/app/services/__init__.py
touch backend/app/services/modules/__init__.py
touch backend/app/utils/__init__.py

echo "✅ Estructura de carpetas creada exitosamente"
echo ""
echo "📋 Estructura creada:"
tree -L 3 backend/ 2>/dev/null || find backend -type d
echo ""
echo "🎯 Próximos pasos:"
echo "1. Crea requirements.txt con las dependencias"
echo "2. Crea los archivos Python según los scripts 3-7"
echo "3. Ejecuta 'Run' en Replit"