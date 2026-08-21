#!/bin/bash

echo "=========================================="
echo " REPAIR ALL TENANT BRANDING COMPONENTS "
echo "=========================================="

CLIENT="client"

FILES="
src/components/home/NewsletterSection.jsx
src/components/home/TestimonialsSection.jsx
src/components/home/HeroSlider.jsx
src/components/home/WhyChooseUs.jsx
"

for FILE in $FILES
do

FULL="$CLIENT/$FILE"

if [ -f "$FULL" ]; then

echo "Fixing $FULL"

cp "$FULL" "$FULL.backup.$(date +%s)"

python3 - "$FULL" <<'PY'

import sys
from pathlib import Path

file = Path(sys.argv[1])

text=file.read_text()

# add imports
if "useTenant" not in text:

    text = (
        "import { useTenant } from '../../context/TenantContext';\n"
        + text
    )


if "useSettings" not in text:

    text = (
        "import { useSettings } from '../../context/SettingsContext';\n"
        + text
    )


# Find first component function
lines=text.splitlines()

new=[]

inserted=False

for line in lines:

    new.append(line)

    if not inserted and (
        line.strip().startswith("export default function")
        or line.strip().startswith("function ")
    ):

        # avoid arrow functions
        if "(" in line:

            new.append("")
            new.append("  const { settings = {} } = useSettings() || {};")
            new.append("  const { tenant } = useTenant() || {};")
            new.append("")
            new.append(
            '  const companyName = settings?.companyName || tenant?.name || "Safari Adventures Kenya";'
            )
            new.append("")

            inserted=True


text="\n".join(new)


# replace known leaks
text=text.replace(
"Coherent Tours",
"{companyName}"
)


file.write_text(text)

print("fixed",file)

PY

else

echo "Skipped missing $FULL"

fi

done



echo ""
echo "Searching remaining leaks..."

grep -R "Coherent Tours" "$CLIENT/src" \
--include="*.jsx" \
--include="*.js" || echo "No Coherent Tours found"



echo ""
echo "Clearing Vite cache..."

rm -rf "$CLIENT/node_modules/.vite"



echo ""
echo "Building..."

cd "$CLIENT"

npm run build


echo ""
echo "=========================================="
echo " COMPLETE BRANDING REPAIR FINISHED "
echo "=========================================="
