#!/bin/bash

echo "======================================"
echo " REPAIR WHY CHOOSE US COMPONENT "
echo "======================================"

FILE="client/src/components/home/WhyChooseUs.jsx"

if [ ! -f "$FILE" ]; then
    echo "ERROR: $FILE not found"
    exit 1
fi

cp "$FILE" "$FILE.backup.$(date +%s)"

python3 <<'PY'
from pathlib import Path

file = Path("client/src/components/home/WhyChooseUs.jsx")

content = file.read_text()

# remove broken injected code
start = content.find("export default function WhyChooseUs")

if start != -1:

    before = content[:start]

    # preserve imports and create clean component
    component = r'''
export default function WhyChooseUs() {

  const { settings = {} } = useSettings() || {};
  const { tenant } = useTenant() || {};

  const companyName =
    settings?.companyName ||
    tenant?.name ||
    "Safari Adventures Kenya";


  const features = [
    {
      title: "Expert Local Guides",
      text: "Our experienced guides provide authentic Kenyan experiences."
    },
    {
      title: "Safe Travel",
      text: "Your safety and comfort are our highest priority."
    },
    {
      title: "24/7 Support",
      text: "We are available throughout your journey."
    },
    {
      title: "Premium Experience",
      text: "Luxury accommodation and personalized service."
    }
  ];


  return (
    <section className="py-16">

      <div className="text-center mb-10">

        <h2 className="text-3xl font-bold">
          Why Choose {companyName}?
        </h2>

      </div>


      <div className="grid md:grid-cols-4 gap-6">

        {features.map((item,index)=>(

          <div 
            key={index}
            className="p-6 rounded-xl shadow"
          >

            <h3 className="font-bold text-xl">
              {item.title}
            </h3>

            <p className="mt-3">
              {item.text}
            </p>

          </div>

        ))}

      </div>


    </section>
  );
}
'''

    # ensure imports exist
    if "useTenant" not in before:
        before = (
            "import { useTenant } from '../../context/TenantContext';\n"
            + before
        )

    if "useSettings" not in before:
        before = (
            "import { useSettings } from '../../context/SettingsContext';\n"
            + before
        )

    file.write_text(before + component)

print("WhyChooseUs repaired")

PY


echo "Running syntax check..."

cd client

npm run build


echo "======================================"
echo " WHY CHOOSE US FIX COMPLETE "
echo "======================================"
