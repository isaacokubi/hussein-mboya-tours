
export default function StatusCard({
 title,
 status,
 detail
}){

return (

<div className="bg-white rounded-xl border p-5">

<div className="flex justify-between">

<h3 className="font-semibold">
{title}
</h3>

<span className="text-green-600 text-sm font-bold">
{status}
</span>

</div>

<p className="text-sm text-gray-500 mt-3">
{detail}
</p>

</div>

);

}
