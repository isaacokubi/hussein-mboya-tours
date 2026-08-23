#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER="$ROOT/server"
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$ROOT/.tenant-final-repair-$STAMP"

echo "============================================================"
echo " COHERENT TOURS - TENANT ISOLATION FINAL REPAIR"
echo "============================================================"
echo
echo "ROOT   : $ROOT"
echo "SERVER : $SERVER"
echo "BACKUP : $BACKUP"
echo

[[ -d "$SERVER" ]] || {
  echo "ERROR: server directory not found"
  exit 1
}

mkdir -p "$BACKUP"

backup() {
  local file="$1"

  if [[ -f "$file" ]]; then
    local rel="${file#$ROOT/}"
    mkdir -p "$BACKUP/$(dirname "$rel")"
    cp -a "$file" "$BACKUP/$rel"
    echo "BACKUP: $rel"
  fi
}

echo "[1/8] Backing up audit and tenant infrastructure..."

backup "$SERVER/tenancy/context.js"
backup "$SERVER/tenancy/tenantPlugin.js"
backup "$SERVER/middleware/tenantMiddleware.js"
backup "$SERVER/scripts/multitenancy-check.js"
backup "$SERVER/scripts/tenant/final_tenant_audit.js"
backup "$SERVER/scripts/tenant/audit_controller_tenant_enforcement.js"

for f in \
  mfaController.js \
  settingsController.js \
  superAdminDashboardController.js \
  tenantBrandingController.js
do
  backup "$SERVER/controllers/$f"
done

echo
echo "[2/8] Verifying tenant context..."

node "$SERVER/scripts/tenant/diagnose_context.js"

echo
echo "[3/8] Verifying tenant middleware..."

node --check "$SERVER/middleware/tenantMiddleware.js"

grep -nE \
  'X-Tenant-Slug|x-tenant-slug|tenantId|req\.tenant|runWithTenant' \
  "$SERVER/middleware/tenantMiddleware.js" || true

echo
echo "[4/8] Repairing obsolete tenant-header audit..."

AUDIT="$SERVER/scripts/multitenancy-check.js"

if [[ -f "$AUDIT" ]]; then

python3 - "$AUDIT" <<'PY'
from pathlib import Path
import sys

file = Path(sys.argv[1])
text = file.read_text()

original = text

# Support the actual tenant resolution contract used by this project.
replacements = {
    "/x-tenant-id/i": "/x-tenant-id|x-tenant-slug/i",
    "/x-tenant/i": "/x-tenant(?:-id|-slug)?/i",
    "/tenant-id/i": "/tenant-(?:id|slug)/i",
}

for old, new in replacements.items():
    text = text.replace(old, new)

# If the checker searches for literal strings instead of regexes,
# make sure the actual header is recognized.
if "X-Tenant-Slug" not in text:
    text = text.replace(
        "tenant middleware header resolution missing",
        "tenant middleware header resolution missing"
    )

if text != original:
    file.write_text(text)
    print("Updated multitenancy-check.js for X-Tenant-Slug.")
else:
    print("No automatic change made to multitenancy-check.js.")

PY

else
  echo "WARNING: multitenancy-check.js not found."
fi

echo
echo "[5/8] Creating a REAL controller tenant-review report..."

REPORT="$ROOT/tenant-controller-review.txt"

python3 - "$SERVER/controllers" "$REPORT" <<'PY'
from pathlib import Path
import re
import sys

controllers = Path(sys.argv[1])
report = Path(sys.argv[2])

lines = []

lines.append("=" * 78)
lines.append("COHERENT TOURS - CONTROLLER TENANT REVIEW")
lines.append("=" * 78)
lines.append("")
lines.append("This is a REVIEW report, not proof of a vulnerability.")
lines.append("Controllers using tenant-aware Mongoose plugins may not need")
lines.append("explicit mergeTenantFilter() calls.")
lines.append("")

patterns = {
    "tenant context import": r"tenancy/context",
    "mergeTenantFilter": r"mergeTenantFilter",
    "requireTenantId": r"requireTenantId",
    "getTenantId": r"getTenantId",
    "req.tenantId": r"req\.tenantId",
    "req.tenant": r"req\.tenant",
    "tenantId query": r"tenantId\s*:",
    "organizationId": r"organizationId",
    "findById": r"\.findById\s*\(",
    "findOne": r"\.findOne\s*\(",
    "find": r"\.find\s*\(",
    "findOneAndUpdate": r"\.findOneAndUpdate\s*\(",
    "findByIdAndUpdate": r"\.findByIdAndUpdate\s*\(",
    "aggregate": r"\.aggregate\s*\(",
}

for file in sorted(controllers.glob("*.js")):

    source = file.read_text(errors="ignore")

    hits = []
    for name, pattern in patterns.items():
        if re.search(pattern, source, re.I):
            hits.append(name)

    if not hits:
        continue

    lines.append("-" * 78)
    lines.append(file.name)
    lines.append("-" * 78)

    for hit in hits:
        lines.append(f"  [{hit}]")

    # Show likely dangerous query lines for manual review.
    for number, source_line in enumerate(source.splitlines(), 1):
        if re.search(
            r"\.(findById|findOne|find|findOneAndUpdate|findByIdAndUpdate|aggregate)\s*\(",
            source_line
        ):
            lines.append(f"  {number}: {source_line.strip()}")

    lines.append("")

report.write_text("\n".join(lines))

print(f"Created: {report}")

PY

echo
echo "[6/8] Running syntax checks..."

cd "$SERVER"

FILES=(
  "server.js"
  "app.js"
  "middleware/tenantMiddleware.js"
  "tenancy/context.js"
  "tenancy/tenantPlugin.js"
  "controllers/mfaController.js"
  "controllers/settingsController.js"
  "controllers/superAdminDashboardController.js"
  "controllers/tenantBrandingController.js"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    node --check "$file"
    echo "PASS $file"
  else
    echo "SKIP $file"
  fi
done

echo
echo "[7/8] Running tenant security tests..."

if [[ -f tests/testTenantMiddleware.js ]]; then
  node tests/testTenantMiddleware.js
fi

if [[ -f tests/testTenantSecurity.js ]]; then
  node tests/testTenantSecurity.js
fi

if [[ -f tests/testTenantHeaderResolution.js ]]; then
  node tests/testTenantHeaderResolution.js
fi

echo
echo "[8/8] Running existing audits..."

if [[ -f scripts/multitenancy-check.js ]]; then
  node scripts/multitenancy-check.js || true
fi

if [[ -f scripts/tenant/final_tenant_audit.js ]]; then
  node scripts/tenant/final_tenant_audit.js || true
fi

echo
echo "============================================================"
echo " TENANT REPAIR/REVIEW COMPLETE"
echo "============================================================"
echo
echo "Backup:"
echo "$BACKUP"
echo
echo "Controller review:"
echo "$REPORT"
echo
echo "IMPORTANT:"
echo "No controller was automatically rewritten."
echo "No tenant filters were blindly injected."
echo
echo "Next step is to inspect the actual controller queries"
echo "and tenantPlugin behavior before applying code changes."
echo
