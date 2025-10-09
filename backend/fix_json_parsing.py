import re

# Leer el archivo
with open('app/services/journal_service.py', 'r') as f:
    content = f.read()

# Buscar la función list_trading_journal y agregar json.loads después de fetchall
# Buscar el patrón donde se convierten los rows a dict
old_pattern = r'(async def list_trading_journal.*?)(for row in rows:\s+entries\.append\(dict\(row\)\))'

new_code = r'\1import json\n\n\2'

# Reemplazar
if 'import json' not in content[:500]:
    # Agregar import json al inicio si no existe
    content = 'import json\n' + content

# Ahora buscar y reemplazar la conversión de rows
content = re.sub(
    r'(for row in rows:)\s+(entries\.append\(dict\(row\)\))',
    r'\1\n        entry = dict(row)\n        # Parsear analisis_completo de JSON string a dict\n        if entry.get("analisis_completo") and isinstance(entry["analisis_completo"], str):\n            try:\n                entry["analisis_completo"] = json.loads(entry["analisis_completo"])\n            except:\n                pass\n        \2',
    content
)

# Guardar
with open('app/services/journal_service.py', 'w') as f:
    f.write(content)

print("✅ JSON parsing agregado")
