import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";

export default function WhyChooseUs() {

  const { tenant } = useTenant() || {};

  const { settings = {} } = useSettings() || {};

  const companyName =
    settings?.companyName ||
    tenant?.name ||
    tenant?.companyName ||
    "Your Travel Company";




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
