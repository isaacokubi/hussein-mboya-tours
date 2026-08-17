export default function AITaskManager({
tasks=[]
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Admin Task Manager
</h2>


<div className="space-y-3">

{
tasks.map(task=>(

<div
key={task._id}
className="border rounded-lg p-4"
>


<div className="flex justify-between">

<h3 className="font-bold">
{task.title}
</h3>


<span>
{task.priority}
</span>


</div>


<p className="text-gray-600">
{task.description}
</p>


<p className="mt-2 text-sm">
Status: {task.status}
</p>


</div>

))
}


</div>


</div>

);

}
