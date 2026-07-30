import {
useNotifications
}
from "../../context/NotificationContext";



export default function NotificationBell(){


const {
notifications
}
=
useNotifications();



return (

<div
className="
relative
"
>


<span
className="
text-2xl
"
>

🔔

</span>



{

notifications.length > 0 &&


<span
className="
absolute
top-0
right-0
bg-red-600
text-white
rounded-full
px-2
text-xs
"
>

{
notifications.length
}

</span>


}



</div>

);


}