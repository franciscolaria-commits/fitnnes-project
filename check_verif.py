with open("pwa/src/views/StudentDashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()
import re
print("Matches:", re.findall(r'.{0,10}Autom.{0,10}', content))
print("Matches2:", re.findall(r'.{0,10}T.cnica.{0,10}', content))
