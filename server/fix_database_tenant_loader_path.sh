#!/bin/bash

set -e

echo "======================================"
echo "FIX TENANT LOADER IMPORT PATHS"
echo "======================================"



echo ""
echo "Searching wrong imports..."

grep -R 'config/tenantPluginLoader' -n . || true



python3 <<'PY'
from pathlib import Path


files = [
    Path("config/database.js"),
    Path("config/db.js"),
]


for file in files:

    if file.exists():

        data=file.read_text()

        old='./config/tenantPluginLoader.js'
        new='./tenantPluginLoader.js'


        if old in data:

            data=data.replace(old,new)

            file.write_text(data)

            print("Fixed:",file)

        else:
            print("No change:",file)

PY



echo ""
echo "Checking remaining wrong paths"

grep -R 'config/config/tenantPluginLoader' -n . || true



echo ""
echo "Syntax check"

node --check config/database.js



echo ""
echo "======================================"
echo "TENANT LOADER PATH FIX COMPLETE"
echo "======================================"
