import {
useEffect,
useState
} from "react";


import {

createVehicle,

getDrivers

} from "../../api/vehicleApi";



export default function AddVehicleModal({

close,

refresh

}){


const [drivers,setDrivers]=useState([]);



const [form,setForm]=useState({

name:"",

registrationNumber:"",

model:"",

type:"SUV",

capacity:"",

driver:""

});






useEffect(()=>{


loadDrivers();


},[]);





const loadDrivers = async()=>{


const res =
await getDrivers();


setDrivers(
res.data.drivers
);


};








const submit = async(e)=>{


e.preventDefault();



const response =
await createVehicle({

...form,

capacity:Number(form.capacity)

});





if(form.driver){


await fetch(

`/api/vehicles/${response.data.vehicle._id}/assign-driver`,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

driverId:form.driver

})

}

);


}





refresh();

close();


};






return (

<div
className="
fixed
inset-0
bg-black/50
flex
items-center
justify-center
"
>



<div
className="
bg-white
rounded-xl
p-6
w-[450px]
"
>


<h2
className="
text-2xl
font-bold
mb-5
"
>

Add Vehicle

</h2>





<form
onSubmit={submit}
className="space-y-4"
>



<input

className="border p-3 w-full"

placeholder="Vehicle Name"

onChange={
e=>setForm({

...form,

name:e.target.value

})
}

/>




<input

className="border p-3 w-full"

placeholder="Registration Number"

onChange={
e=>setForm({

...form,

registrationNumber:e.target.value

})
}

/>





<input

className="border p-3 w-full"

placeholder="Model"

onChange={
e=>setForm({

...form,

model:e.target.value

})
}

/>






<select

className="border p-3 w-full"

onChange={
e=>setForm({

...form,

type:e.target.value

})
}

>


<option>SUV</option>

<option>VAN</option>

<option>BUS</option>

<option>Land Cruiser</option>


</select>







<input

type="number"

className="border p-3 w-full"

placeholder="Capacity"

onChange={
e=>setForm({

...form,

capacity:e.target.value

})
}

/>







<select

className="border p-3 w-full"

onChange={
e=>setForm({

...form,

driver:e.target.value

})
}

>


<option>

Assign Driver

</option>



{
drivers.map(driver=>(


<option

key={driver._id}

value={driver._id}

>

{driver.name}


</option>


))

}



</select>








<div
className="
flex
justify-end
gap-3
"
>


<button

type="button"

onClick={close}

className="
px-4
py-2
bg-gray-300
rounded
"

>

Cancel

</button>





<button

className="
px-4
py-2
bg-green-700
text-white
rounded
"

>

Save Vehicle

</button>



</div>



</form>


</div>


</div>


);


}