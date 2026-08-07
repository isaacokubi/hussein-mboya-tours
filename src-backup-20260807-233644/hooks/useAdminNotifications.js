import {
useEffect
} from "react";

import socket from "../socket/socket";


export default function useAdminNotifications(){



useEffect(()=>{


socket.on(
"newBooking",
(data)=>{


console.log(
"New booking:",
data
);


}
);



socket.on(
"paymentReceived",
(data)=>{


console.log(
"Payment:",
data
);


}
);



return ()=>{


socket.off(
"newBooking"
);


socket.off(
"paymentReceived"
);


};


},[]);



}