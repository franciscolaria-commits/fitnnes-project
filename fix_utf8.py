import sys
import codecs

def replace_in_file(filepath, target, replacement):
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()
    content = content.replace(target, replacement)
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)

# 1. schemas.py
replace_in_file('api/app/schemas.py', 
    '    tipo_banda: Optional[str] = None', 
    '    tipo_banda: Optional[str] = None\n    has_custom_media: Optional[bool] = False')

# 2. exercises.py
replace_in_file('api/app/routers/exercises.py',
    '"id_entrenador": ex.id_entrenador',
    '"id_entrenador": ex.id_entrenador,\n            "has_custom_media": str(ex.id_ejercicio) in override_map')

# 3. CoachDashboard.jsx
replace_in_file('pwa/src/views/CoachDashboard.jsx',
    "{exe.url_media?.includes('youtube') ? 'Editar mi Video 🎥' : 'Añadir mi Video 🎥'}",
    "{exe.url_media ? 'Editar mi Video 🎥' : 'Añadir mi Video 🎥'}")

print("Fixed")
