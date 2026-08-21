#!/bin/bash

set -e

echo "======================================"
echo "FIX ALL MISSING TENANT IDS V2"
echo "======================================"

cd server

BACKUP="../tenant_backup_models_v2"

mkdir -p "$BACKUP"

cp models/*.js "$BACKUP/"

FILES="
AIConversation.js
AITask.js
AuditLog.js
Campaign.js
Currency.js
CustomerProfile.js
CustomTourRequest.js
DatabaseBackup.js
Loyalty.js
Media.js
Promotion.js
Referral.js
RefundAudit.js
Role.js
SecurityLog.js
StaffProfile.js
SystemSetting.js
SystemSettings.js
TourCategory.js
TourGallery.js
TourPackage.js
TourReport.js
UserPreference.js
Permission.js
Organization.js
"

for FILE in $FILES
do

if [ -f models/$FILE ]
then

echo ""
echo "Processing $FILE"

python3 <<PY

from pathlib import Path
import re

path=Path("models/$FILE")

data=path.read_text()


if "tenantId" in data:
    print("Already has tenantId")
    exit()


patterns=[
r"(new mongoose\\.Schema\\(\\s*\\{)",
r"(new Schema\\(\\s*\\{)"
]


insert='''\\n
    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },'''


changed=False


for pattern in patterns:

    match=re.search(pattern,data)

    if match:

        data=re.sub(
            pattern,
            r"\\1"+insert,
            data,
            count=1
        )

        changed=True
        break


if changed:

    path.write_text(data)
    print("UPDATED")

else:

    print("NO MATCH FOUND")


PY

fi

done


echo ""
echo "=============================="
echo "VERIFYING TENANT FIELDS"
echo "=============================="


for FILE in $FILES
do

if grep -q "tenantId" models/$FILE
then
echo "OK $FILE"
else
echo "FAILED $FILE"
fi

done


echo ""
echo "=============================="
echo "NODE SYNTAX CHECK"
echo "=============================="


for FILE in models/*.js
do

node --check "$FILE" 2>/dev/null || echo "Syntax issue: $FILE"

done


echo ""
echo "COMPLETE"
echo "Backup:"
echo "$BACKUP"

