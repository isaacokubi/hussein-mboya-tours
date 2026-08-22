import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";


export default function NewsletterSection() {

  const { tenant } = useTenant() || {};

  const { settings = {} } = useSettings() || {};

  const companyName =
    settings?.companyName ||
    tenant?.name ||
    tenant?.companyName ||
    "Your Travel Company";




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