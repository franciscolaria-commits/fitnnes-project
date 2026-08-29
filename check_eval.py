with open("pwa/src/views/StudentEvaluations.jsx", "r", encoding="utf-8") as f:
    content = f.read()
import re
print(re.findall(r'.{0,5}sculo.{0,5}', content))
print(re.findall(r'.{0,5}metros.{0,5}', content))
