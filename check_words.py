with open("pwa/src/views/StudentEvaluations.jsx", "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "Evaluacin": "Evaluación",
    "Fsica": "Física",
    "Composicin": "Composición",
    "Msculo": "Músculo",
    "Permetros": "Perímetros",
    "Tcnica": "Técnica",
    "": "í" # Fallback if any others are missed, though dangerous. Let's see what else is there.
}

import re
matches = re.findall(r'\b\w*\w*\b', content)
print("Words with missing char:", set(matches))
