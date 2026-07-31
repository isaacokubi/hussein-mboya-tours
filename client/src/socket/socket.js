import { io } from "socket.io-client";



const SOCKET_URL =

  import.meta.env.VITE_SOCKET_URL ||

  "http://localhost:5000";





const socket = io(

  SOCKET_URL,

  {


    transports: [

      "websocket",

      "polling"

    ],



    withCredentials: true,



    autoConnect: true,



    reconnection: true,



    reconnectionAttempts: 10,



    reconnectionDelay: 3000,


  }

);







socket.on(
  "connect",
  ()=>{

    console.log(
      "Socket connected:",
      socket.id
    );

  }
);






socket.on(
  "disconnect",
  (reason)=>{


    console.log(
      "Socket disconnected:",
      reason
    );


  }
);







socket.on(
  "connect_error",
  (error)=>{


    console.error(
      "Socket connection error:",
      error.message
    );


  }
);







export default socket;