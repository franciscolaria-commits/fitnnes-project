with open("pwa/src/views/StudentEvaluations.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = re.findall(r'.{0,10}.{0,10}', content)
for m in set(matches):
    print("Match:", repr(m))
