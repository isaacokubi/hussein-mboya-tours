#!/usr/bin/env python3

from pathlib import Path
import re
import subprocess
import shutil
from datetime import datetime

ROOT = Path.cwd()

BACKUP = ROOT / f".fix-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
BACKUP.mkdir()

changed = []


def backup(path):
    target = BACKUP / path.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)


def save(path, content):
    backup(path)
    path.write_text(content, encoding="utf-8")
    changed.append(str(path.relative_to(ROOT)))
    print("FIXED:", path.relative_to(ROOT))


# --------------------------------------------------
# Fix auditService duplicate createAuditLog
# --------------------------------------------------

audit = ROOT / "server/services/auditService.js"

if audit.exists():

    text = audit.read_text(encoding="utf-8")

    matches = list(
        re.finditer(
            r"export const createAuditLog\s*=\s*async\s*\([^)]*\)\s*=>\s*\{.*?\};",
            text,
            re.S
        )
    )

    if len(matches) > 1:

        first = matches[0]

        new = (
            text[:first.end()]
            +
            re.sub(
                r"export const createAuditLog\s*=\s*async\s*\([^)]*\)\s*=>\s*\{.*?\};",
                "",
                text[first.end():],
                count=len(matches)-1,
                flags=re.S
            )
        )

        save(audit, new)


# --------------------------------------------------
# Add missing axios imports
# --------------------------------------------------

for file in [
    ROOT / "client/src/api/commissionApi.js",
    ROOT / "client/src/api/userApi.js"
]:

    if file.exists():

        text = file.read_text(encoding="utf-8")

        if "import api from \"./axios\";" not in text:

            text = (
                'import api from "./axios";\n\n'
                + text
            )

            save(file, text)


# --------------------------------------------------
# Remove fake generated API helpers
# --------------------------------------------------

for file in (ROOT/"client/src/api").rglob("*.js"):

    text = file.read_text(encoding="utf-8")

    pattern = re.compile(
        r"""
        /\*
        Auto completed API helpers
        \*/

        export const getAll\s*=\s*async\s*\(\)\s*=>\s*\{
        .*?
        \};
        """,
        re.S | re.X
    )

    new = pattern.sub("", text)

    if new != text:
        save(file, new.rstrip()+"\n")


# --------------------------------------------------
# Run backend syntax check
# --------------------------------------------------

print("\nChecking backend syntax...")

result = subprocess.run(
    "find server -name '*.js' -not -path '*/node_modules/*' -exec node --check {} \\;",
    shell=True,
    cwd=ROOT
)

if result.returncode != 0:
    print("Backend syntax still has errors.")
    exit(1)


# --------------------------------------------------
# Run frontend lint
# --------------------------------------------------

print("\nRunning frontend lint...")

result = subprocess.run(
    ["npm", "run", "lint"],
    cwd=ROOT/"client"
)

if result.returncode != 0:
    print("Frontend lint failed.")
    exit(1)


# --------------------------------------------------
# Git commit and push
# --------------------------------------------------

print("\nPreparing git push...")

subprocess.run(
    ["git", "add", "."],
    cwd=ROOT,
    check=True
)

subprocess.run(
    [
        "git",
        "commit",
        "-m",
        "Fix module completion generated errors"
    ],
    cwd=ROOT
)

subprocess.run(
    [
        "git",
        "push",
        "origin",
        "main"
    ],
    cwd=ROOT,
    check=True
)


print("\n================================")
print("REPAIR + GITHUB PUSH COMPLETE")
print("================================")
print("Backup created:")
print(BACKUP)

print("\nChanged files:")
for f in changed:
    print("-", f)
