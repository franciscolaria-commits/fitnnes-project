with open("pwa/src/views/StudentDashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()
import re
print("StudentDashboard:", re.findall(r'.{0,10}\ufffd.{0,10}', content))

with open("pwa/src/views/CoachDashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()
print("CoachDashboard:", re.findall(r'.{0,10}\ufffd.{0,10}', content))
