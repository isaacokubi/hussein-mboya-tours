import { useSettings } from "../../../context/SettingsContext";
export default function DashboardHeader(){

const { settings } = useSettings();


return (

<div>


<h1 className="
text-3xl
font-bold
">

{settings.companyName || 'Company'} Admin Center

</h1>


<p className="
text-gray-500
mt-2
">

Complete business intelligence and management dashboard

</p>


</div>

);


}