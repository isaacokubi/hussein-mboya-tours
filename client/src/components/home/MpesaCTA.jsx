import { Link } from "react-router-dom";


export default function MpesaCTA(){


return (

<section className="
py-20
bg-black
text-white
text-center
">


<h2 className="
text-4xl
font-bold
">

Ready To Explore Kenya?

</h2>



<p className="
mt-5
text-xl
">

Book your adventure today and pay securely using M-Pesa.

</p>



<Link

to="/tours"

className="
inline-block
mt-8
bg-green-600
px-10
py-4
rounded-full
font-bold
hover:bg-green-700
"

>

Book With M-Pesa

</Link>


</section>

)

}