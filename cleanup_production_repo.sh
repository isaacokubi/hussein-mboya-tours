#!/bin/bash

set -e

echo "Cleaning production repository..."

rm -rf \
tenant_backup \
tenant_backup_hooks \
tenant_backup_models \
tenant_backup_models_v2 \
before_tenant_hardening_backup_2026-08-21_17-12.tar.gz

echo "Adding gitignore protection"

cat >> .gitignore <<EOF

# tenant backups
tenant_backup*
*.tar.gz
*.backup

# temporary repair scripts
*_backup*
*.old.js

EOF

git status

echo "Cleanup complete"

