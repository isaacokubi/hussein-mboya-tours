#!/bin/bash

echo "=========================================="
echo " FINAL TENANT BRANDING COMPONENT SYNTAX FIX"
echo "=========================================="

CLIENT="client/src/components/home"

FILES=(
"WhyChooseUs.jsx"
"NewsletterSection.jsx"
"TestimonialsSection.jsx"
"HeroSlider.jsx"
)

for FILE in "${FILES[@]}"
do

TARGET="$CLIENT/$FILE"

if [ -f "$TARGET" ]; then

echo "Repairing $TARGET"

cp "$TARGET" "$TARGET.syntax_backup"

python3 <<PY
from pathlib import Path

p=Path("$TARGET")
text=p.read_text()

# Fix broken function declarations

text=text.replace(
"export default function WhyChooseUs(",
"export default function WhyChooseUs() {"
)

text=text.replace(
"export default function NewsletterSection(",
"export default function NewsletterSection() {"
)

text=text.replace(
"export default function TestimonialsSection(",
"export default function TestimonialsSection() {"
)

text=text.replace(
"export default function HeroSlider(",
"export default function HeroSlider() {"
)


# Remove duplicated hook blocks before opening brace

text=text.replace(
"export default function WhyChooseUs()\\n\\n  const",
"export default function WhyChooseUs() {\\n\\n  const"
)

text=text.replace(
"export default function NewsletterSection()\\n\\n  const",
"export default function NewsletterSection() {\\n\\n  const"
)

text=text.replace(
"export default function TestimonialsSection()\\n\\n  const",
"export default function TestimonialsSection() {\\n\\n  const"
)

text=text.replace(
"export default function HeroSlider()\\n\\n  const",
"export default function HeroSlider() {\\n\\n  const"
)


# Remove duplicate companyName declarations

lines=text.splitlines()

seen=False
out=[]

for line in lines:

    if "const companyName =" in line:

        if seen:
            continue

        seen=True

    out.append(line)

text="\\n".join(out)

p.write_text(text)

PY

echo "Fixed $FILE"

fi

done


echo ""
echo "Cleaning vite cache..."

rm -rf client/node_modules/.vite


echo ""
echo "Searching syntax problems..."

grep -R "export default function.*(" -n client/src/components/home


echo ""
echo "Building frontend..."

cd client

npm run build


echo ""
echo "=========================================="
echo " BRANDING COMPONENT REPAIR COMPLETE"
echo "=========================================="
