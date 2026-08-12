export default function SuperAdminSettings(){

return (

<section className="p-8">

<h1 className="text-3xl font-bold">
Platform Settings
</h1>


<div className="
mt-6
grid
md:grid-cols-3
gap-6
">


<div className="bg-white shadow rounded-xl p-6">
<h2 className="font-bold">
Email Configuration
</h2>

<p>
SMTP and notification settings
</p>
</div>


<div className="bg-white shadow rounded-xl p-6">
<h2 className="font-bold">
Security Policy
</h2>

<p>
Password and authentication rules
</p>
</div>


<div className="bg-white shadow rounded-xl p-6">
<h2 className="font-bold">
System Preferences
</h2>

<p>
Global application settings
</p>
</div>


</div>


</section>

);

}