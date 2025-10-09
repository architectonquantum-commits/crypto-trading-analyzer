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

# TEST 7: Crear entrada en Journal
echo "TEST 7: Guardar en Journal"
# TEST 7: Crear entrada en Journal (directo)
echo "TEST 7: Guardar en Journal"
curl -s -X POST http://localhost:8000/api/journal/entries \
-H "Content-Type: application/json" \
-d '{"activo":"ETH/USDT LONG","tipo_activo":"crypto","operacion":"LONG","precio_entrada":3500,"stop_loss":3450,"estado_emocional":"Excelente","sesion_trading":"Nueva York","razon_estado":"Test automatizado","riesgo_porcentaje":1.5}' > /tmp/test7.json

if grep -q "\"id\"" /tmp/test7.json; then
    ENTRY_ID=$(grep -o '"id":[0-9]*' /tmp/test7.json | grep -o '[0-9]*')
    echo "OK: Entrada creada (ID: $ENTRY_ID)"
    echo $ENTRY_ID > /tmp/test_entry_id.txt
    PASSED=$((PASSED + 1))
else
    echo "FAIL: No se pudo crear entrada"
    FAILED=$((FAILED + 1))
fi
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

# TEST 9: Cerrar trade
echo "TEST 9: Cerrar Trade"
if [ -f /tmp/test_entry_id.txt ]; then
    ENTRY_ID=$(cat /tmp/test_entry_id.txt)
    curl -s -X PUT "http://localhost:8000/api/journal/entries/$ENTRY_ID/close" \
    -H "Content-Type: application/json" \
    -d '{"precio_salida":3580,"resultado":"GANANCIA","notas_post_trade":"Test automatizado - TP alcanzado"}' > /tmp/test9.json
    
    if grep -q "pnl" /tmp/test9.json; then
        echo "OK: Trade cerrado (ID: $ENTRY_ID)"
        PASSED=$((PASSED + 1))
        rm -f /tmp/test_entry_id.txt
    else
        echo "FAIL: No se pudo cerrar trade"
        FAILED=$((FAILED + 1))
    fi
else
    echo "SKIP: No hay entrada para cerrar"
fi
echo ""

# RESUMEN
echo "========================================"
echo "RESUMEN FINAL"
echo "========================================"
echo "Tests ejecutados: 7/12"
echo "Pasados: $PASSED"
echo "Fallidos: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "TODOS LOS TESTS PASARON!"
    echo ""
    echo "Tests pendientes (manuales):"
    echo "  - TEST 3: Scanner (90 segundos)"
    echo "  - TEST 6: Backtesting 1000"
    echo "  - TEST 10: Graficas (visual)"
    echo "  - TEST 11: Responsive (navegador)"
    echo "  - TEST 12: Performance"
else
    echo "HAY TESTS FALLIDOS - Revisar arriba"
fi
