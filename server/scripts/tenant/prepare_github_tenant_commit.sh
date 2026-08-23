#!/bin/bash

set -e

echo "======================================"
echo "PREPARE TENANT SAAS COMMIT"
echo "======================================"

echo ""
echo "Removing temporary backups..."

rm -rf tenant_backup

find . -name "*.backup" -delete
find . -name "*.before*" -delete


echo ""
echo "Checking git status"

git status


echo ""
echo "Adding changes..."

git add .


echo ""
echo "Creating commit..."

git commit -m "Implement global multi tenant isolation architecture"

echo ""
echo "======================================"
echo "COMMIT READY"
echo "======================================"

echo ""
echo "Next:"
echo "git push origin main"
