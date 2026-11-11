/**
 * Purpose: socket real-time socket module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/socket/socket.js

// Load socket.io-client so this module can use its exported dependencies.
import { io } from "socket.io-client";
// Load ../api/apiUrls so this module can use its exported dependencies.
import { socketUrl as SOCKET_URL } from "../api/apiUrls";





// Declare socket for use by the surrounding module or function.
const socket = io(

    SOCKET_URL,

    {


        transports:[

            "websocket",

            "polling"

        ],



        withCredentials:true,



        autoConnect:false,



        reconnection:true,



        reconnectionAttempts:10,



        reconnectionDelay:3000,


    }

);







// Perform the side effect or state update expressed on the following line.
socket.on(
    "connect",
    ()=>{

        // Perform the side effect or state update expressed on the following line.
        console.log(
            "Socket connected:",
            socket.id
        );

    }
);







// Perform the side effect or state update expressed on the following line.
socket.on(

    "disconnect",

    (reason)=>{


        // Perform the side effect or state update expressed on the following line.
        console.log(

            "Socket disconnected:",

            reason

        );


    }

);







// Perform the side effect or state update expressed on the following line.
socket.on(

    "connect_error",

    (error)=>{


        // Perform the side effect or state update expressed on the following line.
        console.error(

            "Socket connection error:",

            error.message

        );


    }

);







export default socket;
