#!/bin/bash
echo "🔍 VERIFICANDO FASE 1 DEL FRONTEND..."
echo ""

# Verificar package.json
echo "1️⃣ Verificando ubicación del proyecto..."
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ ERROR: No estás en la carpeta correcta"
    exit 1
fi

# Verificar node_modules
echo ""
echo "2️⃣ Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules existe"
else
    echo "❌ node_modules no existe - ejecuta: npm install"
    exit 1
fi

# Verificar archivos clave
echo ""
echo "3️⃣ Verificando archivos de configuración..."
[ -f "tailwind.config.js" ] && echo "✅ tailwind.config.js" || echo "❌ tailwind.config.js"
[ -f "postcss.config.js" ] && echo "✅ postcss.config.js" || echo "❌ postcss.config.js"
[ -f ".env" ] && echo "✅ .env" || echo "❌ .env"
[ -f "src/config/apiConfig.js" ] && echo "✅ src/config/apiConfig.js" || echo "❌ src/config/apiConfig.js"

# Verificar carpetas
echo ""
echo "4️⃣ Verificando estructura de carpetas..."
[ -d "src/components/dashboard" ] && echo "✅ src/components/dashboard" || echo "❌ src/components/dashboard"
[ -d "src/components/validator" ] && echo "✅ src/components/validator" || echo "❌ src/components/validator"
[ -d "src/components/journal" ] && echo "✅ src/components/journal" || echo "❌ src/components/journal"
[ -d "src/components/shared" ] && echo "✅ src/components/shared" || echo "❌ src/components/shared"
[ -d "src/store" ] && echo "✅ src/store" || echo "❌ src/store"
[ -d "src/services" ] && echo "✅ src/services" || echo "❌ src/services"

echo ""
echo "============================================"
echo "Verificación completada!"
echo "Si todo está en ✅, puedes continuar con FASE 2"
echo "============================================"
