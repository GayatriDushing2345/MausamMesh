import os
import re

FORBIDDEN_PATTERNS = [
    re.compile(r"MausamSetu", re.IGNORECASE),
    re.compile(r"मौसमसेतु"),
    re.compile(r"VarshaVistaar", re.IGNORECASE),
    re.compile(r"वर्षा-विस्तार")
]

def test_no_forbidden_brand_names_in_repo():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    scan_dirs = [
        os.path.join(root_dir, "backend", "app"),
        os.path.join(root_dir, "frontend", "src")
    ]
    
    violations = []
    
    for scan_dir in scan_dirs:
        for root, dirs, files in os.walk(scan_dir):
            if "node_modules" in root or ".next" in root or "__pycache__" in root:
                continue
            for f in files:
                if f.endswith((".py", ".ts", ".tsx", ".json", ".md")):
                    f_path = os.path.join(root, f)
                    with open(f_path, "r", encoding="utf-8", errors="ignore") as handle:
                        for line_idx, line in enumerate(handle, 1):
                            for pattern in FORBIDDEN_PATTERNS:
                                if pattern.search(line):
                                    rel = os.path.relpath(f_path, root_dir)
                                    violations.append(f"{rel}:{line_idx}: {line.strip()}")
                                    
    assert len(violations) == 0, f"Found deprecated brand names:\n" + "\n".join(violations)
