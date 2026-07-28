import {
useState
}
from "react";


import {
useNavigate
}
from "react-router-dom";


import axios from "axios";



export default function AdminLogin(){


const navigate =
useNavigate();



const [form,setForm]=useState({

email:"",
password:""

});



const submit=async(e)=>{

e.preventDefault();



const {data}=await axios.post(

`${import.meta.env.VITE_API_URL}/api/admin/auth/login`,

form

);



localStorage.setItem(
"token",
data.token
);



localStorage.setItem(
"user",
JSON.stringify(data.user)
);



navigate("/admin");

};





return (

<form

onSubmit={submit}

className="
max-w-md
mx-auto
mt-20
space-y-5
"

>


<input

placeholder="Email"

className="input"

onChange={
e=>setForm({
...form,
email:e.target.value
})
}

/>



<input

type="password"

placeholder="Password"

className="input"

onChange={
e=>setForm({
...form,
password:e.target.value
})
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

Login

</button>


</form>

)

}