#!/bin/bash

echo "======================================"
echo " FIX HOME TENANT IMPORTS"
echo "======================================"

FILES=(
"src/components/home/WhyChooseUs.jsx"
"src/components/home/NewsletterSection.jsx"
"src/components/home/TestimonialsSection.jsx"
)

for file in "${FILES[@]}"
do

if [ -f "$file" ]; then

echo "Fixing $file"

sed -i \
's#../../../context/TenantContext#../../context/TenantContext#g' \
"$file"

fi

done


echo ""
echo "Checking..."

grep -R "TenantContext" -n src/components/home


echo ""
echo "Running build..."

npm run build


echo ""
echo "======================================"
echo " COMPLETE"
echo "======================================"
