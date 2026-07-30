import {
useState
}
from "react";


import api from "../../api/axios";


import {
toast
}
from "react-toastify";



export default function ReviewForm({
tourId
}){


const [
form,
setForm
]
=
useState({

rating:5,

comment:""

});



const submit =
async(e)=>{

e.preventDefault();


await api.post(
"/reviews",
{

tourId,

...form

}
);



toast.success(
"Review submitted"
);


};



return (

<form
onSubmit={submit}
className="
space-y-4
"
>


<select

onChange={
e=>
setForm({

...form,

rating:e.target.value

})

}

>

<option>
5
</option>

<option>
4
</option>

<option>
3
</option>

<option>
2
</option>

<option>
1
</option>


</select>



<textarea

className="
border
p-3
w-full
"

placeholder="
Share your experience
"

onChange={
e=>
setForm({

...form,

comment:e.target.value

})

}

/>



<button

className="
bg-yellow-600
text-white
px-5
py-3
rounded
"

>

Submit Review

</button>


</form>

);

}