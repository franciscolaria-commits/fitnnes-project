with open("pwa/src/views/StudentEvaluations.jsx", "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "Composicin": "Composición",
    "Fsica": "Física",
    "fsicos": "físicos",
    "Fsico": "Físico",
    "Msculo": "Músculo",
    "Permetros": "Perímetros",
    "ndices": "Índices",
    "sea": "Ósea",
    "Evaluacin": "Evaluación"
}

for bad, good in replacements.items():
    content = content.replace(bad, good)

with open("pwa/src/views/StudentEvaluations.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed StudentEvaluations.jsx")
