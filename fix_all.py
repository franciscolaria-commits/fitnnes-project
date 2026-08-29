import os

replacements = {
    "Ã¡": "á",
    "Ã©": "é",
    "Ã­": "í",
    "Ã³": "ó",
    "Ãº": "ú",
    "Ã±": "ñ",
    "Ã‘": "Ñ",
    "Ã‰": "É",
    "Ã“": "Ó",
    "Ã\x81": "Á",
    "Ã\x8d": "Í",
    "Ã\x9a": "Ú",
    "Â¿": "¿",
    "Â¡": "¡",
    "ðŸ’¬": "💬",
    "ðŸš€": "🚀",
    "â†’": "→",
    "âœ“": "✓",
    "âš ï¸": "⚠️",
    "âš ": "⚠",
    "â€Œ": "‌",
    "â€“": "–",
    "â€”": "—",
    "Â°": "°",
    "Â": ""
}

def fix_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Fixed", path)

for root, _, files in os.walk("pwa/src"):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".js"):
            fix_file(os.path.join(root, file))
