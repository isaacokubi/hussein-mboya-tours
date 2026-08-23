#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SERVER="$ROOT/server"

echo
echo "============================================================"
echo " COHERENT TOURS - FINAL SYSTEM SETTINGS REPAIR"
echo "============================================================"
echo

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.repair-backups/final-settings-$STAMP"
mkdir -p "$BACKUP"

backup_file() {
  local file="$1"

  if [[ -f "$file" ]]; then
    mkdir -p "$BACKUP/$(dirname "${file#$ROOT/}")"
    cp -p "$file" "$BACKUP/${file#$ROOT/}"
    echo "BACKUP: ${file#$ROOT/}"
  fi
}

echo "------------------------------------------------------------"
echo "1. BACKING UP TARGET FILES"
echo "------------------------------------------------------------"

backup_file "$SERVER/controllers/agentController.js"
backup_file "$SERVER/controllers/bookingController.js"
backup_file "$SERVER/services/commissionService.js"
backup_file "$SERVER/scripts/migrateSystemSettingsCanonical.js"
backup_file "$SERVER/scripts/settings-rbac-audit.js"

echo
echo "Backup:"
echo "  $BACKUP"

echo
echo "------------------------------------------------------------"
echo "2. CHECKING CANONICAL MODEL"
echo "------------------------------------------------------------"

if [[ ! -f "$SERVER/models/SystemSetting.js" ]]; then
  echo "ERROR: canonical SystemSetting.js does not exist."
  exit 1
fi

echo "OK: server/models/SystemSetting.js exists."

echo
echo "------------------------------------------------------------"
echo "3. INSPECTING SYSTEM SETTING MODEL EXPORT"
echo "------------------------------------------------------------"

grep -nE \
  'mongoose\.model|export default|model\(' \
  "$SERVER/models/SystemSetting.js" \
  || true

echo
echo "------------------------------------------------------------"
echo "4. FIXING AGENT CONTROLLER"
echo "------------------------------------------------------------"

AGENT="$SERVER/controllers/agentController.js"

if grep -q 'SystemSetting.findOne({ key: "default" })' "$AGENT"; then

  python3 - "$AGENT" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()

old = 'const settings = await SystemSetting.findOne({ key: "default" }).select("defaultCommissionRate").lean();'

new = '''const settings = await getSystemSettings({
      req,
      tenantId: req.tenantId || req.user?.tenantId || null,
    });'''

if old not in s:
    raise SystemExit("Expected agentController settings query not found.")

s = s.replace(old, new)

# Ensure settingsService import exists.
if 'from "../services/settingsService.js"' not in s:
    lines = s.splitlines()
    insert_at = 0

    while insert_at < len(lines) and (
        lines[insert_at].startswith("import ") or
        lines[insert_at].strip() == ""
    ):
        insert_at += 1

    lines.insert(
        insert_at,
        'import { getSystemSettings } from "../services/settingsService.js";'
    )

    s = "\n".join(lines) + ("\n" if s.endswith("\n") else "")

# Remove obsolete direct SystemSetting import if present.
import re
s = re.sub(
    r'^import\s+SystemSetting\s+from\s+["\'][^"\']*SystemSetting\.js["\'];\s*\n',
    '',
    s,
    flags=re.MULTILINE
)

p.write_text(s)
print("FIXED:", p)
PY

else
  echo "Agent controller already fixed."
fi

echo
echo "------------------------------------------------------------"
echo "5. FIXING BOOKING CONTROLLER"
echo "------------------------------------------------------------"

BOOKING="$SERVER/controllers/bookingController.js"

if grep -q 'SystemSetting.findOne({ key: "default" })' "$BOOKING"; then

  python3 - "$BOOKING" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text()

old = 'const systemSettings = await SystemSetting.findOne({ key: "default" }).lean().catch(() => null);'

new = '''const systemSettings = await getSystemSettings({
        req,
        tenantId: req.tenantId || req.user?.tenantId || null,
      });'''

if old not in s:
    raise SystemExit("Expected bookingController settings query not found.")

s = s.replace(old, new)

# Remove obsolete direct model import.
import re
s = re.sub(
    r'^import\s+SystemSetting\s+from\s+["\'][^"\']*SystemSetting\.js["\'];\s*\n',
    '',
    s,
    flags=re.MULTILINE
)

# Ensure service import.
if 'from "../services/settingsService.js"' not in s:
    lines = s.splitlines()
    insert_at = 0

    while insert_at < len(lines) and (
        lines[insert_at].startswith("import ") or
        lines[insert_at].strip() == ""
    ):
        insert_at += 1

    lines.insert(
        insert_at,
        'import { getSystemSettings } from "../services/settingsService.js";'
    )

    s = "\n".join(lines) + ("\n" if s.endswith("\n") else "")

p.write_text(s)
print("FIXED:", p)
PY

else
  echo "Booking controller already fixed."
fi

echo
echo "------------------------------------------------------------"
echo "6. FIXING COMMISSION SERVICE"
echo "------------------------------------------------------------"

COMMISSION="$SERVER/services/commissionService.js"

if grep -q 'SystemSetting.findOne({ key: "default" })' "$COMMISSION"; then

  python3 - "$COMMISSION" <<'PY'
from pathlib import Path
import sys
import re

p = Path(sys.argv[1])
s = p.read_text()

old = 'const settings = await SystemSetting.findOne({ key: "default" }).select("defaultCommissionRate").lean();'

new = '''const settings = await getSystemSettings({
    tenantId: options?.tenantId || null,
  });'''

if old not in s:
    raise SystemExit("Expected commissionService settings query not found.")

s = s.replace(old, new)

# Remove obsolete direct SystemSetting import.
s = re.sub(
    r'^import\s+SystemSetting\s+from\s+["\'][^"\']*SystemSetting\.js["\'];\s*\n',
    '',
    s,
    flags=re.MULTILINE
)

# Ensure settingsService import.
if 'from "./settingsService.js"' not in s:
    lines = s.splitlines()
    insert_at = 0

    while insert_at < len(lines) and (
        lines[insert_at].startswith("import ") or
        lines[insert_at].strip() == ""
    ):
        insert_at += 1

    lines.insert(
        insert_at,
        'import { getSystemSettings } from "./settingsService.js";'
    )

    s = "\n".join(lines) + ("\n" if s.endswith("\n") else "")

p.write_text(s)
print("FIXED:", p)
PY

else
  echo "Commission service already fixed."
fi

echo
echo "------------------------------------------------------------"
echo "7. FIXING MIGRATION SCRIPT MODEL IMPORT"
echo "------------------------------------------------------------"

MIGRATION="$SERVER/scripts/migrateSystemSettingsCanonical.js"

if [[ -f "$MIGRATION" ]]; then

  python3 - "$MIGRATION" <<'PY'
from pathlib import Path
import sys
import re

p = Path(sys.argv[1])
s = p.read_text()

# Replace legacy model import with canonical model.
s = re.sub(
    r'import\s+SystemSettings\s+from\s+["\']\.\./models/SystemSettings\.js["\'];',
    'import SystemSetting from "../models/SystemSetting.js";',
    s
)

# Replace old identifier everywhere in executable migration code.
s = re.sub(r'\bSystemSettings\.collection\b', 'SystemSetting.collection', s)
s = re.sub(r'\bSystemSettings\b', 'SystemSetting', s)

p.write_text(s)
print("FIXED:", p)
PY

else
  echo "WARNING: migration script does not exist."
fi

echo
echo "------------------------------------------------------------"
echo "8. FIXING RBAC AUDIT MODEL IMPORTS"
echo "------------------------------------------------------------"

AUDIT="$SERVER/scripts/settings-rbac-audit.js"

if [[ -f "$AUDIT" ]]; then

  python3 - "$AUDIT" <<'PY'
from pathlib import Path
import sys
import re

p = Path(sys.argv[1])
s = p.read_text()

s = re.sub(
    r'import\s+SystemSettings\s+from\s+["\']\.\./models/SystemSettings\.js["\'];',
    'import SystemSetting from "../models/SystemSetting.js";',
    s
)

s = re.sub(r'\bSystemSettings\b', 'SystemSetting', s)

p.write_text(s)
print("FIXED:", p)
PY

fi

echo
echo "------------------------------------------------------------"
echo "9. VERIFYING NO LIVE UNSAFE QUERIES REMAIN"
echo "------------------------------------------------------------"

UNSAFE_FOUND=0

if grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  --exclude-dir=models_backup_before_superadmin_fix \
  -E 'SystemSetting\.find(One|ById|)\(\{[[:space:]]*key:[[:space:]]*["'\'']default' \
  "$SERVER" 2>/dev/null
then
  UNSAFE_FOUND=1
fi

if [[ "$UNSAFE_FOUND" -eq 0 ]]; then
  echo "OK: no unsafe SystemSetting default queries found."
else
  echo
  echo "ERROR: unsafe SystemSetting queries still exist."
  exit 1
fi

echo
echo "------------------------------------------------------------"
echo "10. VERIFYING LEGACY MODEL REFERENCES"
echo "------------------------------------------------------------"

LEGACY_FOUND=0

grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  --exclude-dir=models_backup_before_superadmin_fix \
  -E 'models/SystemSettings\.js|import .*SystemSettings' \
  "$SERVER" 2>/dev/null && LEGACY_FOUND=1 || true

if [[ "$LEGACY_FOUND" -eq 0 ]]; then
  echo "OK: no live SystemSettings model imports found."
else
  echo
  echo "WARNING: legacy model references remain."
  echo "These should be reviewed before deleting the legacy model."
fi

echo
echo "------------------------------------------------------------"
echo "11. VERIFYING SETTINGS SERVICE"
echo "------------------------------------------------------------"

grep -nE \
  'SystemSetting|getSystemSettings|updateSystemSettings|tenantId' \
  "$SERVER/services/settingsService.js" \
  | head -80

echo
echo "------------------------------------------------------------"
echo "12. NODE SYNTAX CHECK"
echo "------------------------------------------------------------"

FILES=(
  "$SERVER/models/SystemSetting.js"
  "$SERVER/services/settingsService.js"
  "$SERVER/controllers/agentController.js"
  "$SERVER/controllers/bookingController.js"
  "$SERVER/services/commissionService.js"
  "$SERVER/scripts/migrateSystemSettingsCanonical.js"
  "$SERVER/scripts/settings-rbac-audit.js"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "CHECK: ${file#$ROOT/}"
    node --check "$file"
  fi
done

echo
echo "OK: syntax checks passed."

echo
echo "------------------------------------------------------------"
echo "13. IMPORT / EXPORT CHECK"
echo "------------------------------------------------------------"

node --input-type=module <<'NODE'
import("./server/models/SystemSetting.js")
  .then(() => {
    console.log("OK: SystemSetting model imports.");
  })
  .catch((err) => {
    console.error("ERROR: SystemSetting model import failed.");
    console.error(err);
    process.exit(1);
  });
NODE

echo
echo "------------------------------------------------------------"
echo "14. RBAC AUDIT SCRIPT CHECK"
echo "------------------------------------------------------------"

if [[ -f "$SERVER/scripts/settings-rbac-audit.js" ]]; then
  node --check "$SERVER/scripts/settings-rbac-audit.js"
  echo "OK: RBAC audit script syntax valid."
fi

echo
echo "------------------------------------------------------------"
echo "15. FINAL SETTINGS REFERENCES"
echo "------------------------------------------------------------"

grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  --exclude-dir=models_backup_before_superadmin_fix \
  'getSystemSettings' \
  "$SERVER" 2>/dev/null \
  | head -100 || true

echo
echo "------------------------------------------------------------"
echo "16. GIT STATUS"
echo "------------------------------------------------------------"

git status --short 2>/dev/null || true

echo
echo "============================================================"
echo " FINAL SETTINGS REPAIR COMPLETE"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "IMPORTANT:"
echo "  Do NOT delete the legacy SystemSettings collection yet."
echo
echo "NEXT:"
echo
echo "  node server/scripts/migrateSystemSettingsCanonical.js"
echo
echo "Then:"
echo
echo "  node server/scripts/settings-rbac-audit.js"
echo
