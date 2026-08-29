with open("pwa/src/views/StudentEvaluations.jsx", "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "Composici\ufffdn": "Composición",
    "F\ufffdsica": "Física",
    "f\ufffdsicos": "físicos",
    "F\ufffdsico": "Físico",
    "M\ufffdsculo": "Músculo",
    "Per\ufffdmetros": "Perímetros",
    "\ufffdndices": "Índices",
    "\ufffdsea": "Ósea",
    "Evaluaci\ufffdn": "Evaluación"
}

for bad, good in replacements.items():
    content = content.replace(bad, good)

with open("pwa/src/views/StudentEvaluations.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed StudentEvaluations.jsx again")
