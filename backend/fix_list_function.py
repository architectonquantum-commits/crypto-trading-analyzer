import re

with open('app/services/journal_service.py', 'r') as f:
    content = f.read()

# Asegurarse que json esté importado
if 'import json' not in content[:1000]:
    # Buscar la primera línea de import
    content = re.sub(
        r'("""[\s\S]*?""")\n',
        r'\1\nimport json\n',
        content,
        count=1
    )

# Reemplazar la sección donde se convierten rows a dict
old_code = """    # Convertir rows a dict
    entries = []
    for row in rows:
        entry = dict(row)
        entries.append(entry)"""

new_code = """    # Convertir rows a dict y parsear JSON
    entries = []
    for row in rows:
        entry = dict(row)
        # Parsear analisis_completo de JSON string a dict
        if entry.get('analisis_completo') and isinstance(entry['analisis_completo'], str):
            try:
                entry['analisis_completo'] = json.loads(entry['analisis_completo'])
            except json.JSONDecodeError:
                pass  # Mantener como string si falla el parsing
        entries.append(entry)"""

content = content.replace(old_code, new_code)

with open('app/services/journal_service.py', 'w') as f:
    f.write(content)

print("✅ JSON parsing agregado a list_trading_journal")
