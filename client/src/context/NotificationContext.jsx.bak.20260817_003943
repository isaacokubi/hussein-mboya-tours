/* eslint-disable react-refresh/only-export-components */
// client/src/context/NotificationContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";


import {
  io
} from "socket.io-client";

import { getNotifications } from "../api/notificationApi";


import {
  useAuth
} from "./AuthContext";






const NotificationContext =
  createContext();






export function NotificationProvider({

  children

}) {


  const {
    user,
    token
  } = useAuth();




  const [
    socket,
    setSocket
  ] = useState(null);




  const [
    notifications,
    setNotifications
  ] = useState([]);




  const [
    unreadCount,
    setUnreadCount
  ] = useState(0);

  useEffect(() => {
    if (!user?._id || !token) return;

    let cancelled = false;

    getNotifications({ limit: 30 })
      .then((response) => {
        if (cancelled) return;
        const items = response?.notifications || [];
        setNotifications(items);
        setUnreadCount(items.filter((item) => !item.read).length);
      })
      .catch((error) => {
        console.error("Failed to load notifications:", error?.message || error);
      });

    return () => {
      cancelled = true;
    };
  }, [user?._id, token]);







/*
|--------------------------------------------------------------------------
| SOCKET CONNECTION
|--------------------------------------------------------------------------
*/


useEffect(()=>{


  if(
    !user?._id ||
    !token
  ){

    return;

  }






  const newSocket =
    io(

      import.meta.env.VITE_SOCKET_URL
      ||
      "http://localhost:5000",

      {

        transports:[

          "websocket",

          "polling"

        ],


        withCredentials:true,


        auth:{

          token

        }

      }

    );







  queueMicrotask(() => {
    setSocket(newSocket);
  });







  newSocket.on(

    "connect",

    ()=>{


      console.log(

        "✅ Notification socket connected",

        newSocket.id

      );



      newSocket.emit(

        "join",

        user._id

      );


    }

  );








  newSocket.on(

    "notification",

    (notification)=>{


      console.log(

        "📩 Notification received",

        notification

      );




      setNotifications(

        prev=>[

          notification,

          ...prev

        ]

      );




      setUnreadCount(

        prev => prev + 1

      );


    }

  );









  newSocket.on(

    "connect_error",

    (error)=>{


      console.error(

        "Socket error:",

        error.message

      );


    }

  );









  return ()=>{


    newSocket.disconnect();


    setSocket(null);


  };



},[

user,

token

]);









/*
|--------------------------------------------------------------------------
| MARK NOTIFICATIONS READ
|--------------------------------------------------------------------------
*/


const markAllRead = ()=>{


  setUnreadCount(0);


};








return (

<NotificationContext.Provider

value={{

notifications,

setNotifications,

unreadCount,

markAllRead,

socket

}}

>


{children}


</NotificationContext.Provider>


);



}







export const useNotifications = ()=>


useContext(

  NotificationContext

);