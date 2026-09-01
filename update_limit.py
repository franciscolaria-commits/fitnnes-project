with open("pwa/src/views/SuperAdminPanel.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old_str = '<div className="text-xs text-gray-500 mb-1">{coach.nombre || "Sin nombre"} • {coach.total_alumnos}/{coach.limite_alumnos} Alumnos</div>'
new_str = '''<div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <span>{coach.nombre || "Sin nombre"} • {coach.total_alumnos} /</span>
                          <input 
                            type="number" 
                            min="1"
                            defaultValue={coach.limite_alumnos}
                            onBlur={(e) => updateCoach(coach.id_usuario, { limite_alumnos: parseInt(e.target.value) || 1 })}
                            className="bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-white w-12 text-center focus:border-emerald-500 outline-none"
                          />
                          <span>Alumnos</span>
                        </div>'''

if old_str in content:
    content = content.replace(old_str, new_str)
    with open("pwa/src/views/SuperAdminPanel.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated Clientes SuperAdminPanel")
else:
    print("String not found in Clientes")

with open("../Sin Clientes/fitness-platform-Green/pwa/src/views/SuperAdminPanel.jsx", "r", encoding="utf-8") as f:
    content2 = f.read()
if old_str in content2:
    content2 = content2.replace(old_str, new_str)
    with open("../Sin Clientes/fitness-platform-Green/pwa/src/views/SuperAdminPanel.jsx", "w", encoding="utf-8") as f:
        f.write(content2)
    print("Updated Sin Clientes SuperAdminPanel")
else:
    print("String not found in Sin Clientes")
