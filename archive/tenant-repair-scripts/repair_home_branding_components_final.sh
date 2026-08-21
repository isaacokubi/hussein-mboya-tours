#!/bin/bash

set -e

echo "=========================================="
echo " FINAL HOME COMPONENT TENANT REPAIR"
echo "=========================================="

CLIENT="client/src/components/home"

backup() {
FILE="$1"
cp "$FILE" "$FILE.backup.$(date +%s)" 2>/dev/null || true
}

echo "Creating backups..."
backup "$CLIENT/WhyChooseUs.jsx"
backup "$CLIENT/NewsletterSection.jsx"
backup "$CLIENT/TestimonialsSection.jsx"
backup "$CLIENT/HeroSlider.jsx"


echo "Repairing WhyChooseUs.jsx"

cat > "$CLIENT/WhyChooseUs.jsx" <<'EOF'
import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function WhyChooseUs() {

  const { settings = {} } = useSettings() || {};
  const { tenant } = useTenant() || {};

  const companyName =
    settings?.companyName ||
    tenant?.name ||
    tenant?.companyName ||
    "Safari Adventures Kenya";


  const items = [
    {
      title:"Expert Local Guides",
      text:`${companyName} provides experienced guides for authentic Kenyan experiences.`
    },
    {
      title:"Safe Travel",
      text:"Your safety and comfort are our highest priority."
    },
    {
      title:"24/7 Support",
      text:"We are available throughout your journey."
    },
    {
      title:"Premium Experience",
      text:"Luxury accommodation and personalized travel experiences."
    }
  ];


return (
<section className="py-16">

<div className="container mx-auto px-6">

<h2 className="text-3xl font-bold text-center">
Why Choose {companyName}?
</h2>


<div className="grid md:grid-cols-4 gap-6 mt-10">

{items.map((item,index)=>(

<div key={index} className="rounded-xl shadow p-6">

<h3 className="font-bold">
{item.title}
</h3>

<p className="mt-3 text-gray-600">
{item.text}
</p>

</div>

))}

</div>

</div>

</section>
);

}
EOF



echo "Repairing NewsletterSection.jsx"

cat > "$CLIENT/NewsletterSection.jsx" <<'EOF'
import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";


export default function NewsletterSection(){

const {settings={}} = useSettings() || {};
const {tenant}=useTenant() || {};

const companyName =
settings?.companyName ||
tenant?.name ||
tenant?.companyName ||
"Safari Adventures Kenya";


return (

<section className="py-16">

<div className="container mx-auto px-6 text-center">

<h2 className="text-3xl font-bold">
Subscribe To {companyName} Updates
</h2>


<p className="mt-4">
Get exclusive safari offers, travel tips and new experiences.
</p>


<div className="mt-6">

<input
className="border rounded p-3"
placeholder="Email address"
/>

<button className="ml-2 bg-green-600 text-white px-5 py-3 rounded">
Subscribe
</button>

</div>


</div>

</section>

);

}
EOF



echo "Repairing TestimonialsSection.jsx"

cat > "$CLIENT/$CLIENT" 2>/dev/null || true


cat > "$CLIENT/TestimonialsSection.jsx" <<'EOF'
import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";


export default function TestimonialsSection(){

const {settings={}}=useSettings() || {};
const {tenant}=useTenant() || {};

const companyName =
settings?.companyName ||
tenant?.name ||
tenant?.companyName ||
"Safari Adventures Kenya";


const testimonials=[
{
name:"Sarah Williams",
country:"United Kingdom",
text:`${companyName} gave us the best safari experience in Kenya.`
},
{
name:"James Anderson",
country:"United States",
text:"Professional guides and unforgettable adventures."
},
{
name:"Amina Hassan",
country:"United Arab Emirates",
text:"Amazing holiday packages and excellent service."
}
];


return (

<section className="py-16">

<div className="container mx-auto px-6">

<h2 className="text-3xl font-bold text-center">
Traveler Experiences
</h2>


<div className="grid md:grid-cols-3 gap-6 mt-10">

{testimonials.map((t,i)=>(

<div key={i} className="shadow rounded-xl p-6">

<h3 className="font-bold">
{t.name}
</h3>

<p>{t.country}</p>

<p className="mt-4">
"{t.text}"
</p>

</div>

))}

</div>

</div>

</section>

)

}
EOF



echo "Repairing HeroSlider.jsx"

grep -n "const { settings" "$CLIENT/HeroSlider.jsx" || true


echo "Removing duplicate declarations..."

find client/src/components/home -name "*.jsx" -type f \
-exec sed -i '/const { settings } = useSettings();/!b;n' {} \;


echo "Cleaning vite..."

rm -rf client/node_modules/.vite


echo "Checking branding..."

grep -R "Coherent Tours" -n client/src || true


echo "Building frontend..."

cd client

npm run build


echo "=========================================="
echo " HOME COMPONENT REPAIR COMPLETE"
echo "=========================================="
