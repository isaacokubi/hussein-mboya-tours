#!/bin/bash

echo "======================================"
echo " FINAL TENANT BRANDING CLEANUP "
echo "======================================"

CLIENT="client"

echo "1. Fixing duplicate hooks..."

python3 <<'PY'

from pathlib import Path
import re


files = [
"client/src/components/home/HeroSlider.jsx",
"client/src/components/home/NewsletterSection.jsx",
"client/src/components/home/TestimonialsSection.jsx",
"client/src/components/home/WhyChooseUs.jsx"
]


for f in files:

    path=Path(f)

    if not path.exists():
        continue

    text=path.read_text()

    print("Cleaning",f)


    # remove duplicate useSettings declarations
    seen=False
    lines=[]

    for line in text.splitlines():

        if "const { settings" in line or "const { settings =" in line:

            if seen:
                continue

            seen=True


        lines.append(line)


    text="\n".join(lines)


    # remove duplicate useTenant declarations
    seen=False
    lines=[]

    for line in text.splitlines():

        if "const { tenant" in line:

            if seen:
                continue

            seen=True


        lines.append(line)


    text="\n".join(lines)


    path.write_text(text)


print("Duplicate cleanup complete")

PY



echo ""
echo "2. Fixing frontend environment..."

cd client


if [ -f .env ]; then

cp .env .env.backup.$(date +%s)

sed -i \
's#https://employee-darkroom-acquire.ngrok-free.dev/api#http://localhost:5000/api#g' \
.env


sed -i \
's#https://employee-darkroom-acquire.ngrok-free.dev#http://localhost:5000#g' \
.env

fi


echo ""
echo "Current environment:"

grep VITE .env



echo ""
echo "3. Clearing cache..."

rm -rf node_modules/.vite



echo ""
echo "4. Checking remaining hardcoded branding..."

grep -R "Coherent Tours" src \
--include="*.jsx" \
--include="*.js" \
|| echo "OK - no old branding"



echo ""
echo "5. Building frontend..."

npm run build


echo ""
echo "======================================"
echo " CLEANUP COMPLETE "
echo "======================================"
