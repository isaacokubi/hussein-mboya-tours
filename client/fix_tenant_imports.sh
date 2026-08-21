#!/bin/bash

set -e

echo "======================================"
echo " FIXING TENANT CONTEXT IMPORT PATHS"
echo "======================================"

python3 <<'PY'

from pathlib import Path


for p in Path("src").rglob("*.jsx"):

    s=p.read_text()

    old='import { useTenant } from "../context/TenantContext";'

    if old in s:

        depth=len(p.relative_to("src").parts)-1

        if depth==1:
            # src/components/file.jsx
            new='import { useTenant } from "../context/TenantContext";'

        elif depth>=2:
            # src/components/home/file.jsx
            new='import { useTenant } from "../../context/TenantContext";'

        else:
            new=old


        s=s.replace(old,new)

        p.write_text(s)

        print("Fixed:",p)

PY


echo ""
echo "Checking imports..."

grep -R "TenantContext" -n src


echo ""
echo "Running build..."

npm run build


echo ""
echo "======================================"
echo " TENANT IMPORT FIX COMPLETE"
echo "======================================"
