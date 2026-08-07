// client/src/hooks/useNotifications.js

import { useEffect, useState } from "react";
import socket from "../socket/socket.js";
import { toast } from "react-toastify";


export const useNotifications = ()=>{


    const [notifications,setNotifications] = useState([]);



    useEffect(()=>{


        const handleNotification = (notification)=>{


            if(!notification) return;



            setNotifications((prev)=>[
                notification,
                ...prev
            ]);



            switch(notification.type){


                case "SUCCESS":

                    toast.success(
                        notification.title || "Success"
                    );

                    break;



                case "ERROR":

                    toast.error(
                        notification.title || "Error"
                    );

                    break;



                case "WARNING":

                    toast.warning(
                        notification.title || "Warning"
                    );

                    break;



                default:

                    toast.info(
                        notification.title || "New notification"
                    );

                    break;


            }


        };



        socket.on(
            "notification",
            handleNotification
        );



        return ()=>{


            socket.off(
                "notification",
                handleNotification
            );


        };



    },[]);



    return {

        notifications

    };


};