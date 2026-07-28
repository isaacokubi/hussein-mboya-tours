import {
useState
}
from "react";


import {
createTour
}
from "../../api/adminTourApi";


import {
useNavigate
}
from "react-router-dom";



export default function AddTour(){


const navigate =
useNavigate();



const [form,setForm]=useState({

title:"",
description:"",
location:"",
duration:"",
price:"",
category:"Safari",
featured:false

});



const [images,setImages]=useState([]);




const submit=async(e)=>{


e.preventDefault();



const data =
new FormData();



Object.keys(form)
.forEach(key=>{

data.append(
key,
form[key]
);

});



for(
let img of images
){

data.append(
"images",
img
);

}




await createTour(data);



navigate(
"/admin/tours"
);


};






return (

<form

onSubmit={submit}

className="
max-w-xl
space-y-5
"

>


<input

placeholder="Tour title"

className="input"

onChange={
e=>setForm({
...form,
title:e.target.value
})
}

/>



<textarea

placeholder="Description"

className="input"

onChange={
e=>setForm({
...form,
description:e.target.value
})
}

/>




<input

placeholder="Location"

className="input"

onChange={
e=>setForm({
...form,
location:e.target.value
})
}

/>



<input

placeholder="Duration"

className="input"

onChange={
e=>setForm({
...form,
duration:e.target.value
})
}

/>




<input

placeholder="Price"

className="input"

onChange={
e=>setForm({
...form,
price:e.target.value
})
}

/>




<input

type="file"

multiple

onChange={
e=>setImages(
[
...e.target.files
]
)
}

/>



<button

className="
bg-green-600
text-white
px-8
py-3
rounded
"

>

Save Tour

</button>


</form>

)

}