#!/bin/bash

# 🎯 Script Maestro - Gestión Robusta de Servicios
# Uso: ./start-app.sh [start|stop|restart|status|logs]

set -e

PROJECT_ROOT="/home/runner/workspace"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_LOG="$PROJECT_ROOT/backend.log"
FRONTEND_LOG="$PROJECT_ROOT/frontend.log"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# 🧹 LIMPIEZA TOTAL
cleanup() {
    log_info "Limpiando procesos anteriores..."
    pkill -9 -f "uvicorn" 2>/dev/null || true
    pkill -9 -f "vite" 2>/dev/null || true
    pkill -9 -f "node.*vite" 2>/dev/null || true
    sleep 2
    
    # Verificar puertos libres
    if lsof -ti:8000 >/dev/null 2>&1; then
        log_warn "Puerto 8000 ocupado, liberando..."
        kill -9 $(lsof -ti:8000) 2>/dev/null || true
    fi
    if lsof -ti:5173 >/dev/null 2>&1; then
        log_warn "Puerto 5173 ocupado, liberando..."
        kill -9 $(lsof -ti:5173) 2>/dev/null || true
    fi
    
    sleep 1
    log_info "Limpieza completa ✓"
}

# 🚀 INICIAR BACKEND
start_backend() {
    log_info "Iniciando Backend..."
    cd "$BACKEND_DIR"
    
    # SIN auto-reload para estabilidad
    nohup python -m uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --log-level info \
        > "$BACKEND_LOG" 2>&1 &
    
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"
    
    # Esperar inicio
    for i in {1..10}; do
        sleep 1
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            log_info "Backend OK (PID: $BACKEND_PID) ✓"
            return 0
        fi
    done
    
    log_error "Backend falló al iniciar"
    tail -20 "$BACKEND_LOG"
    return 1
}

# 🎨 INICIAR FRONTEND
start_frontend() {
    log_info "Iniciando Frontend..."
    cd "$FRONTEND_DIR"
    
    nohup npm run dev -- --host \
        > "$FRONTEND_LOG" 2>&1 &
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"
    
    # Esperar inicio
    for i in {1..15}; do
        sleep 1
        if curl -s http://localhost:5173 >/dev/null 2>&1; then
            log_info "Frontend OK (PID: $FRONTEND_PID) ✓"
            return 0
        fi
    done
    
    log_error "Frontend falló al iniciar"
    tail -20 "$FRONTEND_LOG"
    return 1
}

# 📊 ESTADO
status() {
    echo ""
    echo "=== 📊 ESTADO DE SERVICIOS ==="
    echo ""
    
    # Backend
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        log_info "Backend: CORRIENDO ✓"
        if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
            echo "  PID: $(cat $PROJECT_ROOT/.backend.pid)"
        fi
    else
        log_error "Backend: CAÍDO ✗"
    fi
    
    # Frontend
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        log_info "Frontend: CORRIENDO ✓"
        if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
            echo "  PID: $(cat $PROJECT_ROOT/.frontend.pid)"
        fi
    else
        log_error "Frontend: CAÍDO ✗"
    fi
    
    echo ""
    echo "URLs:"
    echo "  Backend:  http://localhost:8000"
    echo "  Frontend: http://localhost:5173"
    echo ""
}

# 📜 LOGS
show_logs() {
    case "$1" in
        backend)
            tail -f "$BACKEND_LOG"
            ;;
        frontend)
            tail -f "$FRONTEND_LOG"
            ;;
        *)
            echo "Últimas 20 líneas de cada servicio:"
            echo ""
            echo "=== BACKEND ==="
            tail -20 "$BACKEND_LOG"
            echo ""
            echo "=== FRONTEND ==="
            tail -20 "$FRONTEND_LOG"
            ;;
    esac
}

# 🎯 COMANDO PRINCIPAL
case "${1:-start}" in
    start)
        cleanup
        start_backend || exit 1
        start_frontend || exit 1
        status
        log_info "Todo iniciado correctamente ✓"
        ;;
    
    stop)
        cleanup
        log_info "Servicios detenidos"
        ;;
    
    restart)
        cleanup
        start_backend || exit 1
        start_frontend || exit 1
        status
        ;;
    
    status)
        status
        ;;
    
    logs)
        show_logs "$2"
        ;;
    
    *)
        echo "Uso: $0 {start|stop|restart|status|logs [backend|frontend]}"
        exit 1
        ;;
esac
