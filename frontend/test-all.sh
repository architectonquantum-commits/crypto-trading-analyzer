#!/bin/bash

echo "========================================"
echo "CRYPTO ANALYZER - TEST SUITE COMPLETO"
echo "========================================"
echo ""
PASSED=0
FAILED=0

# TEST 1: Servicios
echo "TEST 1: Verificacion de Servicios"
if ps aux | grep -q "[u]vicorn" && ps aux | grep -q "[v]ite"; then
    echo "OK: Servicios corriendo"
    PASSED=$((PASSED + 1))
else
    echo "FAIL: Servicios NO corriendo"
    FAILED=$((FAILED + 1))
fi
echo ""

# TEST 2: Stats
echo "TEST 2: Dashboard Stats"
if curl -s http://localhost:8000/api/journal/stats | grep -q "total_trades"; then
    echo "OK: Stats funcionan"
    PASSED=$((PASSED + 1))
else
    echo "FAIL: Stats fallaron"
    FAILED=$((FAILED + 1))
fi
echo ""

# TEST 4: Validacion
echo "TEST 4: Validacion Manual"
curl -s -X POST http://localhost:8000/api/validator/validate-signal \
-H "Content-Type: application/json" \
-d '{"symbol":"BTC/USDT","direction":"LONG","entry_price":67500,"stop_loss":66800,"take_profit":68900,"timeframe":"4h"}' > /tmp/test4.json
if grep -q "scores" /tmp/test4.json; then
    echo "OK: Validacion funciona"
    PASSED=$((PASSED + 1))
else
    echo "FAIL: Validacion no funciona"
    FAILED=$((FAILED + 1))
fi
echo ""

# TEST 5: Backtesting 100
echo "TEST 5: Backtesting 100 Ops"
curl -s -X POST http://localhost:8000/api/backtest/run \
-H "Content-Type: application/json" \
-d '{"symbol":"BTC/USDT","direction":"LONG","entry_price":67500,"stop_loss":66800,"take_profit":68900,"timeframe":"4h","num_simulations":100}' > /tmp/test5.json
if grep -q "total_trades" /tmp/test5.json; then
    echo "OK: Backtesting 100 funciona"
    PASSED=$((PASSED + 1))
else
    echo "FAIL: Backtesting 100 fallo"
    FAILED=$((FAILED + 1))
fi
echo ""

# TEST 7: MANUAL - SE EJECUTA APARTE
echo "TEST 7: Guardar en Journal (MANUAL)"
echo "SKIP: Ejecutar manualmente con comandos separados"
echo ""

# TEST 8: Listar entradas
echo "TEST 8: Listar Entradas"
if curl -s "http://localhost:8000/api/journal/entries?limit=10" | grep -q "entries"; then
    echo "OK: Listado funciona"
    PASSED=$((PASSED + 1))
else
    echo "FAIL: Listado fallo"
    FAILED=$((FAILED + 1))
fi
echo ""

# RESUMEN
echo "========================================"
echo "RESUMEN FINAL"
echo "========================================"
echo "Tests ejecutados: 5/12"
echo "Pasados: $PASSED"
echo "Fallidos: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "TODOS LOS TESTS PASARON!"
else
    echo "HAY TESTS FALLIDOS - Revisar arriba"
fi
