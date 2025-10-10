"""
Script de testing para BreakoutValidatorModule
"""

import sys
sys.path.append('/home/runner/workspace/backend')

import pandas as pd
from pathlib import Path
from app.services.modules.breakout_validator import breakout_validator

def test_breakout_validation():
    """Prueba el módulo con datos reales de ADA/USDT"""
    
    print("=" * 60)
    print("🧪 TEST: Breakout Validator Module")
    print("=" * 60)
    
    # 1. Cargar datos históricos
    data_file = Path('/home/runner/workspace/backend/data/historical/ADA_USDT_1h_730d_REAL.csv')
    
    if not data_file.exists():
        print(f"❌ Archivo no encontrado: {data_file}")
        return
    
    print(f"\n📂 Cargando datos: {data_file.name}")
    df = pd.read_csv(data_file)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    print(f"✅ {len(df)} velas cargadas")
    print(f"📅 Rango: {df['timestamp'].min()} a {df['timestamp'].max()}")
    
    # 2. Definir parámetros de prueba
    current_price = df['close'].iloc[-1]
    resistance_price = df['high'].tail(50).max()
    
    print(f"\n💰 Precio actual: ${current_price:.4f}")
    print(f"🚧 Resistencia: ${resistance_price:.4f}")
    print(f"📊 Diferencia: {((current_price - resistance_price) / resistance_price * 100):.2f}%")
    
    # 3. Ejecutar validación
    print(f"\n⚙️ Ejecutando validación de ruptura...")
    print("-" * 60)
    
    result = breakout_validator.validate_breakout(
        df=df,
        current_price=current_price,
        resistance_price=resistance_price
    )
    
    # 4. Mostrar resultados
    print(f"\n{'='*60}")
    print(f"📊 RESULTADO GENERAL")
    print(f"{'='*60}")
    print(f"Score Total: {result['total_score']}/{result['max_score']} ({result['score_percentage']:.1f}%)")
    print(f"Recomendación: {result['recommendation']}")
    print(f"Confianza: {result['confidence']}")
    print(f"\n{result['summary']}")
    
    # 5. Desglose por criterio
    print(f"\n{'='*60}")
    print(f"🔍 DESGLOSE POR CRITERIO")
    print(f"{'='*60}")
    
    criteria = result['criteria']
    
    # Criterio 1
    c1 = criteria['criterion_1_resistance_breakout']
    print(f"\n1️⃣ Ruptura de Resistencia con Volumen: {c1['score']}/2")
    for detail in c1['details']:
        print(f"   {detail}")
    
    # Criterio 2
    c2 = criteria['criterion_2_rsi']
    print(f"\n2️⃣ RSI (50-70): {c2['score']}/2")
    for detail in c2['details']:
        print(f"   {detail}")
    
    # Criterio 3
    c3 = criteria['criterion_3_macd']
    print(f"\n3️⃣ MACD Cruce Alcista: {c3['score']}/2")
    for detail in c3['details']:
        print(f"   {detail}")
    
    # Criterio 4
    c4 = criteria['criterion_4_ema']
    print(f"\n4️⃣ Precio > EMA 21: {c4['score']}/2")
    for detail in c4['details']:
        print(f"   {detail}")
    
    # Criterio 5
    c5 = criteria['criterion_5_volume_trend']
    print(f"\n5️⃣ Volumen > Promedio: {c5['score']}/2")
    for detail in c5['details']:
        print(f"   {detail}")
    
    print(f"\n{'='*60}")
    print(f"✅ TEST COMPLETADO")
    print(f"{'='*60}\n")
    
    return result


if __name__ == "__main__":
    try:
        result = test_breakout_validation()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
