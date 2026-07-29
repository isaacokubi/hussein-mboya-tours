// client/src/context/NotificationContext.jsx


import {
    createContext,
    useContext,
    useEffect,
    useState
}
from "react";


import {
    io
}
from "socket.io-client";


import {
    useAuth
}
from "./AuthContext";








/*
|--------------------------------------------------------------------------
| SOCKET.IO CONNECTION
|--------------------------------------------------------------------------
*/


const socket = io(

    import.meta.env.VITE_SOCKET_URL ||

    "http://localhost:5000",

    {

        transports: [

            "websocket",

            "polling"

        ],

        withCredentials: true

    }

);








socket.on(

    "connect",

    ()=>{

        console.log(

            "✅ Notification Socket Connected:",

            socket.id

        );

    }

);







socket.on(

    "connect_error",

    (err)=>{

        console.error(

            "❌ Notification Socket Error:",

            err.message

        );

    }

);







socket.on(

    "disconnect",

    (reason)=>{

        console.log(

            "🔌 Notification Socket Disconnected:",

            reason

        );

    }

);









/*
|--------------------------------------------------------------------------
| NOTIFICATION CONTEXT
|--------------------------------------------------------------------------
*/


const NotificationContext = createContext();









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









    /*
    |--------------------------------------------------------------------------
    | CONNECT USER TO NOTIFICATION ROOM
    |--------------------------------------------------------------------------
    */


    useEffect(()=>{


        if(!user?._id){

            return;

        }






        /*
        |--------------------------------------------------------------------------
        | CONNECT SOCKET
        |--------------------------------------------------------------------------
        */


        if(!socket.connected){

            socket.connect();

        }









        /*
        |--------------------------------------------------------------------------
        | JOIN USER ROOM
        |--------------------------------------------------------------------------
        */


        socket.emit(

            "join",

            user._id

        );





        console.log(

            "🔔 Joined notification room:",

            user._id

        );









        /*
        |--------------------------------------------------------------------------
        | RECEIVE NOTIFICATIONS
        |--------------------------------------------------------------------------
        */


        const handleNotification = (

            data

        )=>{


            console.log(

                "📩 New notification:",

                data

            );





            setNotifications(

                prev => [

                    data,

                    ...prev

                ]

            );


        };









        socket.on(

            "notification",

            handleNotification

        );









        /*
        |--------------------------------------------------------------------------
        | CLEANUP
        |--------------------------------------------------------------------------
        */


        return ()=>{


            socket.off(

                "notification",

                handleNotification

            );


        };




    },[user]);









    return (

        <NotificationContext.Provider

            value={{

                notifications,

                setNotifications,

                socket

            }}

        >

            {children}

        </NotificationContext.Provider>

    );


}









export const useNotifications =

()=>


useContext(

    NotificationContext

);