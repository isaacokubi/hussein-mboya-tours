#!/bin/bash

set -e

echo "======================================"
echo "CLEAN TENANT BACKUP FILES"
echo "======================================"


rm -rf server/models_backup_before_superadmin_fix
rm -rf server/tenancy_backup_before_superadmin_fix
rm -rf server/tenant_backup
rm -rf server/tenant_backup_hooks
rm -rf server/tenant_backup_models
rm -rf server/tenant_backup_models_v2


rm -f server/middleware/tenantMiddleware.old.js


echo ""
echo "Adding cleanup"

git add .


git commit -m "Remove tenant migration backup files"


echo ""
echo "Cleanup complete"

