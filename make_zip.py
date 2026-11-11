import os
import sys
import shutil
import zipfile
from pathlib import Path

BASE_DIR = Path(r"D:\Project Anti\WP-Profile-Manager")
DIST_APP_DIR = BASE_DIR / "dist" / "WP-Profile-Manager"
ZIP_PATH = BASE_DIR / "app_bundle.zip"

print("1. Creating zip of application files...")
with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(DIST_APP_DIR):
        for file in files:
            full_path = Path(root) / file
            rel_path = full_path.relative_to(DIST_APP_DIR)
            zf.write(full_path, arcname=str(rel_path))

print(f"Zip created: {ZIP_PATH} ({ZIP_PATH.stat().st_size / 1024 / 1024:.2f} MB)")
