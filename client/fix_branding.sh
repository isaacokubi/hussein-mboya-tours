#!/bin/bash

set -e

echo "======================================"
echo " FIXING MULTI-TENANT BRANDING"
echo "======================================"

cd "$(dirname "$0")"

# Backup
echo "Creating backup..."
mkdir -p branding_backup
cp -r src/pages src/components branding_backup/ 2>/dev/null || true


echo "Replacing hardcoded company names..."


python3 <<'PY'

from pathlib import Path

files = [

"src/pages/Tours.jsx",
"src/pages/About.jsx",
"src/pages/Destinations.jsx",
"src/pages/MyCustomTours.jsx",
"src/pages/BookingDetails.jsx",
"src/pages/Contact.jsx",
"src/pages/superadmin/SuperAdminSettings.jsx",
"src/components/home/WhyChooseUs.jsx",
"src/components/home/HeroSlider.jsx",
"src/components/home/NewsletterSection.jsx",
"src/components/home/TestimonialsSection.jsx"

]


for file in files:

    p=Path(file)

    if not p.exists():
        print("Skipping missing:",file)
        continue


    s=p.read_text()


    s=s.replace(
        "Coherent Tours",
        "{settings?.companyName || tenant?.name || 'Safari Adventures Kenya'}"
    )


    s=s.replace(
        "Why Choose {settings?.companyName || tenant?.name || 'Safari Adventures Kenya'}?",
        "Why Choose {settings?.companyName || tenant?.name || 'Safari Adventures Kenya'}?"
    )


    p.write_text(s)

    print("Updated:",file)


PY


echo ""
echo "Searching remaining references..."

grep -R "Coherent Tours" -n src || echo "No hardcoded Coherent Tours found"


echo ""
echo "Branding replacement complete"
