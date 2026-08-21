#!/bin/bash

echo "=========================================="
echo " REMOVE DUPLICATE TENANT BRANDING VARIABLES"
echo "=========================================="

python3 <<'PY'

from pathlib import Path
import re


files = [
"client/src/components/home/WhyChooseUs.jsx",
"client/src/components/home/NewsletterSection.jsx",
"client/src/components/home/TestimonialsSection.jsx",
"client/src/components/home/HeroSlider.jsx",
]


for file in files:

    path = Path(file)

    if not path.exists():
        continue

    print("Repairing:", file)

    text = path.read_text()


    # Remove duplicate companyName declarations
    pattern = r'\n\s*const companyName\s*=\s*[\s\S]*?;\n'

    matches = list(re.finditer(pattern,text))


    if len(matches) > 1:

        first = matches[0]

        new_text = text[:first.end()]

        remaining = text[first.end():]

        remaining = re.sub(pattern,"",remaining)

        text = new_text + remaining


    # Remove duplicate settings hooks
    lines=[]
    seen_settings=False

    for line in text.splitlines():

        if "const { settings" in line:

            if seen_settings:
                continue

            seen_settings=True

        lines.append(line)


    text="\n".join(lines)


    # Remove duplicate tenant hooks
    lines=[]
    seen_tenant=False

    for line in text.splitlines():

        if "const { tenant" in line:

            if seen_tenant:
                continue

            seen_tenant=True

        lines.append(line)


    text="\n".join(lines)



    path.write_text(text)


print("Duplicate variable cleanup complete")

PY



echo ""
echo "Checking duplicate declarations..."

grep -R "const companyName" client/src/components/home || true

echo ""
echo "Clearing vite cache..."

rm -rf client/node_modules/.vite


echo ""
echo "Building frontend..."

cd client

npm run build


echo ""
echo "=========================================="
echo " REPAIR FINISHED "
echo "=========================================="
