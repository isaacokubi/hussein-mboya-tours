#!/bin/bash

set -e

cd server

echo "===================================="
echo "REPAIR app.js TENANT MIDDLEWARE ORDER"
echo "===================================="

python3 <<'PY'
from pathlib import Path
import re

file = Path("app.js")

data = file.read_text()

# Remove every tenant middleware mounting line
data = re.sub(
    r'^\s*app\.use\(resolveTenant\);\s*$',
    '',
    data,
    flags=re.MULTILINE
)

# Find express initialization
match = re.search(
    r'const\s+app\s*=\s*express\(\);',
    data
)

if not match:
    raise Exception("Could not find const app = express();")

insert = match.end()

middleware = """

// Multi Tenant Resolution Middleware
app.use(resolveTenant);
"""

data = data[:insert] + middleware + data[insert:]

file.write_text(data)

print("Tenant middleware moved after app initialization")

PY


echo ""
echo "Checking app.js syntax"
node --check app.js


echo ""
echo "Current app.js beginning:"
nl -ba app.js | head -40


echo ""
echo "===================================="
echo "DONE"
echo "===================================="

