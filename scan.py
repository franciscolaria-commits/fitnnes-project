import os
import re

# Patterns that indicate mojibake (UTF-8 read as latin-1/cp1252)
mojibake_map = {
    # Emojis commonly corrupted
    "\u00c3\u0083\u00e2\u0080\u0094": "\u2014",  # em dash
    "Ã\u0083": "Ã",
    "Ã\u00b3": "ó",
    "Ã\u00ba": "ú",
    "Ã\u00a9": "é",
    "Ã\u00a1": "á",
    "Ã\u00ad": "í",
    "Ã\u00bc": "ü",
    "Ã\u00b1": "ñ",
    "Ã\u0081": "Á",
    "Ã\u0089": "É",
    "Ã\u008d": "Í",
    "Ã\u0093": "Ó",
    "Ã\u009a": "Ú",
    "Ã\u0091": "Ñ",
    "\u00c2\u00a1": "¡",
    "\u00c2\u00bf": "¿",
    # Emoji mojibake patterns - these are the main culprits
    "ðŸŽ¥": "🎥",
    "ðŸ"š": "📚",
    "ðŸ'ª": "💪",
    "ðŸ‹ï¸": "🏋",
    "ðŸ"": "🔔",
    "ðŸ'": "👍",
    "ðŸŒ": "🌟",
    "âœ…": "✅",
    "â\u009d\u0097": "❗",
    "â\u009d\u0093": "❓",
    "ðŸš€": "🚀",
    "ðŸ"±": "📱",
    "ðŸ"ˆ": "📈",
    "ðŸŽ‰": "🎉",
    "ðŸ—"": "🗓",
    "ðŸ'°": "💰",
    "ðŸ"": "🔒",
    "â\u009c": "✌",
    "â­": "⭐",
    "ðŸ¤": "🤝",
    "ðŸ'¡": "💡",
    "ðŸ†": "🏆",
    "ðŸ": "🎯",
    "â\u009c\u008d": "✍",
    "ðŸŽ": "🎓",
    # Common sequence for emojis - detect and report
}

base_dir = "pwa/src"
affected = []

for root, dirs, files in os.walk(base_dir):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fn in files:
        if not fn.endswith(('.jsx', '.js', '.tsx', '.ts', '.css', '.html')):
            continue
        path = os.path.join(root, fn)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            # Check for common mojibake byte sequences
            if 'ðŸ' in content or 'ï¿½' in content or '\u00c3\u00a3' in content:
                affected.append(path)
                print(f"MOJIBAKE FOUND: {path}")
                # Show sample
                for line in content.split('\n'):
                    if 'ðŸ' in line or 'ï¿½' in line:
                        print(f"  -> {line.strip()[:100]}")
        except Exception as e:
            print(f"ERROR reading {path}: {e}")

if not affected:
    print("No mojibake found via ðŸ pattern - scanning for Ã pattern...")
    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
        for fn in files:
            if not fn.endswith(('.jsx', '.js', '.tsx', '.ts')):
                continue
            path = os.path.join(root, fn)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if 'ÃƒÂ' in content or 'Ã³' in content or 'Ã©' in content or 'Ãº' in content or 'Ã¡' in content or 'Ã±' in content:
                    affected.append(path)
                    print(f"MOJIBAKE FOUND: {path}")
            except:
                pass
