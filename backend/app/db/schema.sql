-- ==========================================
-- TABLA: trading_journal
-- Bitácora de operaciones ultra-simplificada
-- ==========================================

CREATE TABLE IF NOT EXISTS trading_journal (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT DEFAULT 'default_user',

    estado_emocional TEXT NOT NULL CHECK(estado_emocional IN ('Excelente', 'Bien', 'Normal', 'Cansado', 'Estresado')),
    razon_estado TEXT NOT NULL,
    sesion TEXT CHECK(sesion IN ('Asia', 'Londres', 'Nueva York', 'Overlap', NULL)),
    riesgo_diario_permitido REAL DEFAULT 2.0,

    signal_validation_id TEXT,
    activo TEXT NOT NULL,
    tipo_activo TEXT DEFAULT 'crypto',
    operacion TEXT NOT NULL CHECK(operacion IN ('LONG', 'SHORT')),
    fecha_operacion DATE DEFAULT (date('now')),

    precio_entrada REAL NOT NULL,
    stop_loss REAL NOT NULL,
    take_profit_1 REAL,
    take_profit_2 REAL,
    take_profit_3 REAL,
    beneficio_esperado_porcentaje REAL,

    capital_usado REAL,
    riesgo_porcentaje REAL,
    tamano_posicion REAL,
    apalancamiento_usado REAL,
    margen_bloqueado REAL,
    rr_ratio REAL,

    score_tecnico INTEGER CHECK(score_tecnico BETWEEN 0 AND 7),
    score_estructura INTEGER CHECK(score_estructura BETWEEN 0 AND 5),
    score_riesgo INTEGER CHECK(score_riesgo BETWEEN 0 AND 4),
    score_macro INTEGER CHECK(score_macro BETWEEN 0 AND 5),
    score_sentimiento INTEGER CHECK(score_sentimiento BETWEEN 0 AND 4),
    score_total INTEGER CHECK(score_total BETWEEN 0 AND 25),
    confluencia_porcentaje REAL CHECK(confluencia_porcentaje BETWEEN 0 AND 100),
    recomendacion TEXT CHECK(recomendacion IN ('OPERAR', 'OPERAR CON CAUTELA', 'CONSIDERAR', 'EVITAR')),

    analisis_completo TEXT NOT NULL CHECK(json_valid(analisis_completo)),

    estatus TEXT DEFAULT 'Abierto' CHECK(estatus IN ('Abierto', 'Cerrado')),
    fecha_finalizacion DATE,
    resultado TEXT CHECK(resultado IN ('Ganado', 'Perdido', 'Breakeven', NULL)),
    tp_alcanzado TEXT CHECK(tp_alcanzado IN ('TP1', 'TP2', 'TP3', 'SL', 'Manual', NULL)),
    ganancia_perdida_real REAL,
    observaciones_cierre TEXT,
    estado_emocional_post TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journal_activo ON trading_journal(activo);
CREATE INDEX IF NOT EXISTS idx_journal_resultado ON trading_journal(resultado);
CREATE INDEX IF NOT EXISTS idx_journal_estatus ON trading_journal(estatus);
CREATE INDEX IF NOT EXISTS idx_journal_confluencia ON trading_journal(confluencia_porcentaje DESC);

CREATE TRIGGER IF NOT EXISTS update_journal_timestamp 
AFTER UPDATE ON trading_journal
FOR EACH ROW
BEGIN
    UPDATE trading_journal SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;