"""
Database connection and initialization for SQLite.
"""

import aiosqlite
from pathlib import Path
from typing import AsyncGenerator

DATABASE_PATH = Path(__file__).parent.parent.parent / "crypto_analyzer.db"


async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Get database connection."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        db.row_factory = aiosqlite.Row
        yield db


async def init_db():
    """Initialize database with schema."""
    schema_path = Path(__file__).parent / "schema.sql"

    async with aiosqlite.connect(DATABASE_PATH) as db:
        with open(schema_path, 'r') as f:
            schema_sql = f.read()

        await db.executescript(schema_sql)
        await db.commit()

        print(f"✅ Database initialized at: {DATABASE_PATH}")


async def close_db():
    """Close database connections."""
    pass
    async def init_journal_table():
        """Crea la tabla trading_journal si no existe"""
        async for db in get_db():
            query = (
                "CREATE TABLE IF NOT EXISTS trading_journal ("
                "id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))), "
                "user_id TEXT NOT NULL DEFAULT 'default_user', "
                "estado_emocional TEXT NOT NULL, "
                "razon_estado TEXT NOT NULL, "
                "sesion TEXT, "
                "riesgo_diario_permitido REAL DEFAULT 2.0, "
                "activo TEXT NOT NULL, "
                "tipo_activo TEXT DEFAULT 'crypto', "
                "operacion TEXT NOT NULL, "
                "fecha_operacion TEXT DEFAULT (date('now')), "
                "precio_entrada REAL NOT NULL, "
                "stop_loss REAL NOT NULL, "
                "take_profit_1 REAL, "
                "take_profit_2 REAL, "
                "take_profit_3 REAL, "
                "beneficio_esperado_porcentaje REAL, "
                "capital_usado REAL, "
                "riesgo_porcentaje REAL, "
                "tamano_posicion TEXT, "
                "apalancamiento_usado REAL, "
                "margen_bloqueado REAL, "
                "rr_ratio REAL, "
                "score_tecnico INTEGER, "
                "score_estructura INTEGER, "
                "score_riesgo INTEGER, "
                "score_macro INTEGER, "
                "score_sentimiento INTEGER, "
                "score_total INTEGER, "
                "confluencia_porcentaje REAL, "
                "recomendacion TEXT, "
                "analisis_completo TEXT, "
                "estatus TEXT DEFAULT 'Abierto', "
                "fecha_finalizacion TEXT, "
                "resultado TEXT, "
                "tp_alcanzado TEXT, "
                "ganancia_perdida_real REAL, "
                "observaciones_cierre TEXT, "
                "estado_emocional_post TEXT, "
                "created_at TEXT DEFAULT (datetime('now')), "
                "updated_at TEXT DEFAULT (datetime('now'))"
                ")"
            )

            await db.execute(query)
            await db.execute("CREATE INDEX IF NOT EXISTS idx_user_fecha ON trading_journal(user_id, fecha_operacion DESC)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_activo ON trading_journal(activo)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_resultado ON trading_journal(resultado)")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_estatus ON trading_journal(estatus)")
            await db.commit()
            break