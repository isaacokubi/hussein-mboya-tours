import {
useState
}
from "react";


import {
useNavigate
}
from "react-router-dom";



export default function TravelSearch(){


const navigate =
useNavigate();



const [
search,
setSearch
]
=
useState("");



const submit =
(e)=>{

e.preventDefault();


navigate(

`/tours?search=${search}`

);

};



return (

<form

onSubmit={submit}

className="
bg-white
shadow-xl
rounded-xl
p-5
flex
gap-3
"

>


<input

className="
flex-1
border
p-3
rounded
"

placeholder="
Where do you want to go?
"

onChange={
e=>
setSearch(
e.target.value
)
}

/>



<button

className="
bg-yellow-600
text-white
px-6
rounded
"

>

Search

</button>


</form>

);

}