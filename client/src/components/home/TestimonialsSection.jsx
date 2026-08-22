import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";


export default function TestimonialsSection() {

  const { tenant } = useTenant() || {};

  const { settings = {} } = useSettings() || {};

  const companyName =
    settings?.companyName ||
    tenant?.name ||
    tenant?.companyName ||
    "Your Travel Company";




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