CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    
    -- Info del Trade
    activo TEXT NOT NULL,
    operacion TEXT NOT NULL,
    fecha_operacion TEXT NOT NULL,
    
    -- Precios
    precio_entrada REAL NOT NULL,
    stop_loss REAL NOT NULL,
    take_profit_1 REAL NOT NULL,
    take_profit_2 REAL,
    take_profit_3 REAL,
    
    -- Confluencias
    confluencia_porcentaje INTEGER NOT NULL,
    score_total INTEGER NOT NULL,
    
    -- Contexto Pre-Trade
    estado_emocional TEXT NOT NULL,
    razon_estado TEXT NOT NULL,
    sesion TEXT NOT NULL,
    riesgo_diario_permitido REAL NOT NULL,
    recomendacion TEXT NOT NULL,
    
    -- Post-Trade (opcionales)
    estatus TEXT DEFAULT 'Abierto',
    resultado TEXT,
    ganancia_perdida_real REAL,
    razon_salida TEXT,
    lecciones_aprendidas TEXT,
    
    -- Timestamps
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_fecha ON journal_entries(fecha_operacion);
CREATE INDEX IF NOT EXISTS idx_journal_estatus ON journal_entries(estatus);
CREATE INDEX IF NOT EXISTS idx_journal_resultado ON journal_entries(resultado);
CREATE INDEX IF NOT EXISTS idx_journal_confluencia ON journal_entries(confluencia_porcentaje);
