#!/bin/bash

set -e

echo "======================================"
echo "ADDING MISSING TENANT FIELDS"
echo "======================================"

cd server

mkdir -p ../tenant_backup_models

cp models/*.js ../tenant_backup_models/

MODELS="
AIConversation.js
AITask.js
AuditLog.js
Campaign.js
CustomerProfile.js
CustomTourRequest.js
DatabaseBackup.js
Loyalty.js
Media.js
Promotion.js
Referral.js
RefundAudit.js
SecurityLog.js
StaffProfile.js
TourCategory.js
TourGallery.js
TourPackage.js
TourReport.js
UserPreference.js
"

for FILE in $MODELS
do

if [ -f models/$FILE ]; then

echo "Processing $FILE"

python3 <<PY
from pathlib import Path

file=Path("models/$FILE")

data=file.read_text()

if "tenantId" not in data:

    marker="const schema = new mongoose.Schema({"

    if marker in data:

        replacement=marker+"""

    tenantId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true
    },"""

        data=data.replace(marker,replacement)

        file.write_text(data)

        print("UPDATED $FILE")

    else:
        print("SKIPPED NO SCHEMA $FILE")

else:
    print("ALREADY HAS TENANT $FILE")

PY

fi

done


echo ""
echo "Running syntax checks"

for f in models/*.js
do
node --check "$f" 2>/dev/null || echo "CHECK FAILED $f"
done


echo ""
echo "======================================"
echo "TENANT FIELDS COMPLETE"
echo "Backup:"
echo "../tenant_backup_models"
echo "======================================"

