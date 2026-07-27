import {
useState
}
from "react";


import {
createTour
}
from "../../api/adminTourApi";


import {
toast
}
from "react-toastify";



export default function AddTour(){


const [
form,
setForm
]
=
useState({

title:"",
description:"",
country:"",
category:"",
price:""

});



const [
images,
setImages
]
=
useState([]);



const submit =
async(e)=>{

e.preventDefault();



const data =
new FormData();



Object.keys(form)
.forEach(
key=>
data.append(
key,
form[key]
)
);



Array.from(images)
.forEach(
image=>
data.append(
"images",
image
)
);



await createTour(
data
);



toast.success(
"Tour created"
);


};



return (

<form
onSubmit={submit}
className="
space-y-5
"
>


<input

className="input"

placeholder="Tour title"

onChange={
e=>
setForm({

...form,

title:e.target.value

})
}

/>



<textarea

className="input"

placeholder="Description"

onChange={
e=>
setForm({

...form,

description:e.target.value

})
}

/>



<input

className="input"

placeholder="Country"

onChange={
e=>
setForm({

...form,

country:e.target.value

})
}

/>



<input

className="input"

placeholder="Price"

type="number"

onChange={
e=>
setForm({

...form,

price:e.target.value

})
}

/>



<input

type="file"

multiple

onChange={
e=>
setImages(
e.target.files
)
}

/>



<button

className="
bg-yellow-600
text-white
px-6
py-3
rounded
"

>

Create Tour

</button>


</form>

);

}