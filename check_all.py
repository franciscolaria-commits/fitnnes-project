import os
import re

bad_patterns = [r'Ã¡', r'Ã©', r'Ã­', r'Ã³', r'Ãº', r'Ã±', r'Ã‘', r'Ã‰', r'Ã“', r'Ã\x81', r'Ã\x8d', r'Ã\x9a', r'Â¿', r'Â¡', r'ðŸ’¬', r'ðŸš€', r'â†’', r'âœ“', r'âš ï¸', r'âš ', r'\ufffd']

for root, _, files in os.walk("pwa/src"):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".js"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            for p in bad_patterns:
                if re.search(p, content):
                    print(f"Bad pattern {repr(p)} found in {path}")
                    break
print("Done checking all files.")
