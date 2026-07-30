import { useEffect } from "react";
import socket from "../services/socket";
import { toast } from "react-toastify";

export const useNotifications = ()=>{

    useEffect(()=>{

        socket.on(
            "notification",
            notification=>{

                toast.info(
                    notification.title
                );

            }
        );

        return ()=>{

            socket.off(
                "notification"
            );

        };

    },[]);

};