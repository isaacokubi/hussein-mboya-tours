import {
createContext,
useContext,
useEffect,
useState
}
from "react";


import {io}
from "socket.io-client";


import {
useAuth
}
from "./AuthContext";



const NotificationContext =
createContext();



export function NotificationProvider({
children
}){


const {
user
}
=
useAuth();



const [
notifications,
setNotifications
]
=
useState([]);



useEffect(()=>{


if(!user)
return;



const socket =
io(
import.meta.env.VITE_SOCKET_URL
);



socket.emit(
"join",
user._id
);



socket.on(

"notification",

(data)=>{


setNotifications(
prev=>[
data,
...prev
]
);


}

);



return ()=>socket.disconnect();



},[user]);



return (

<NotificationContext.Provider

value={{

notifications

}}

>

{children}

</NotificationContext.Provider>

);


}



export const useNotifications =
()=>useContext(
NotificationContext
);