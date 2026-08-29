with open("pwa/src/components/TutorialPanel.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = re.findall(r'.{0,10}\ufffd.{0,10}', content)
print("Matches in TutorialPanel:", matches)
