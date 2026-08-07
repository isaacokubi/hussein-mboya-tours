import {
    useEffect,
    useState
} from "react";


import {
    createVehicle,
    getDrivers,
    assignDriver
} from "../../api/vehicleApi";





export default function AddVehicleModal({

    close,

    refresh

}){


const [drivers,setDrivers]=useState([]);

const [loading,setLoading]=useState(false);


const [error,setError]=useState("");



const [form,setForm]=useState({

    name:"",

    registrationNumber:"",

    model:"",

    type:"SUV",

    capacity:"",

    driver:""

});






const loadDrivers = async () => {
    try {
        const res = await getDrivers();

        setDrivers(
            res.drivers || []
        );
    } catch (error) {
        console.error(error);

        setError(
            "Failed to load drivers"
        );
    }
};

useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDrivers();
}, []);

const handleChange = (e) => {
    setForm({
        ...form,
        [e.target.name]: e.target.value
    });
};

const submit = async (e) => {


e.preventDefault();


try{


setLoading(true);

setError("");



const response =
await createVehicle({

...form,

capacity:Number(form.capacity)

});





if(form.driver){


await assignDriver(

response.vehicle._id,

form.driver

);


}




refresh();

close();



}

catch(error){


console.error(error);


setError(

error.response?.data?.message ||

"Failed to create vehicle"

);


}

finally{


setLoading(false);


}



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



{
error &&

<p className="text-red-600 mb-3">

{error}

</p>

}





<form

onSubmit={submit}

className="space-y-4"

>





<input

name="name"

value={form.name}

className="border p-3 w-full"

placeholder="Vehicle Name"

onChange={handleChange}

/>








<input

name="registrationNumber"

value={form.registrationNumber}

className="border p-3 w-full"

placeholder="Registration Number"

onChange={handleChange}

/>








<input

name="model"

value={form.model}

className="border p-3 w-full"

placeholder="Model"

onChange={handleChange}

/>








<select

name="type"

value={form.type}

className="border p-3 w-full"

onChange={handleChange}

>


<option value="SUV">
SUV
</option>


<option value="VAN">
VAN
</option>


<option value="BUS">
BUS
</option>


<option value="Land Cruiser">
Land Cruiser
</option>


</select>








<input

name="capacity"

value={form.capacity}

type="number"

className="border p-3 w-full"

placeholder="Capacity"

onChange={handleChange}

/>









<select

name="driver"

value={form.driver}

className="border p-3 w-full"

onChange={handleChange}

>


<option value="">

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

disabled={loading}

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

disabled={loading}

className="
px-4
py-2
bg-green-700
text-white
rounded
"

>


{
loading
?
"Saving..."
:
"Save Vehicle"
}


</button>



</div>



</form>



</div>


</div>


);


}