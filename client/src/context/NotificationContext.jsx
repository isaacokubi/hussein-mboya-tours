/* eslint-disable react-refresh/only-export-components */

// client/src/context/NotificationContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { getNotifications } from "../api/notificationApi";
import socket from "../socket/socket";

import { useAuth } from "./AuthContext";


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
    notifications,
    setNotifications
  ] = useState([]);


  const [
    unreadCount,
    setUnreadCount
  ] = useState(0);


  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      !user?._id ||
      !token
    ) {
      return;
    }


    let cancelled = false;


    getNotifications({
      limit: 30
    })

      .then((response) => {

        if (cancelled) {
          return;
        }


        const items =
          response?.notifications || [];


        setNotifications(items);


        setUnreadCount(
          items.filter(
            (item) => !item.read
          ).length
        );

      })

      .catch((error) => {

        console.error(
          "Failed to load notifications:",
          error?.message || error
        );

      });


    return () => {

      cancelled = true;

    };

  }, [
    user?._id,
    token
  ]);


  /*
  |--------------------------------------------------------------------------
  | SHARED SOCKET CONNECTION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      !user?._id ||
      !token
    ) {
      return;
    }


    const handleConnect = () => {

      console.log(
        "✅ Notification socket connected",
        socket.id
      );



    };


    const handleNotification = (
      notification
    ) => {

      console.log(
        "📩 Notification received",
        notification
      );


      setNotifications(
        (prev) => [
          notification,
          ...prev
        ]
      );


      setUnreadCount(
        (prev) => prev + 1
      );

    };


    const handleConnectError = (
      error
    ) => {

      console.error(
        "Socket connection error:",
        error?.message || error
      );

    };


    const handleDisconnect = (
      reason
    ) => {

      console.log(
        "Notification socket disconnected:",
        reason
      );

    };


    /*
    |--------------------------------------------------------------------------
    | SOCKET AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    socket.auth = {
      ...(socket.auth || {}),
      token,
      tenantId: localStorage.getItem("tenantId") || null,
    };


    /*
    |--------------------------------------------------------------------------
    | EVENT LISTENERS
    |--------------------------------------------------------------------------
    */

    socket.on(
      "connect",
      handleConnect
    );


    socket.on(
      "notification",
      handleNotification
    );


    socket.on(
      "connect_error",
      handleConnectError
    );


    socket.on(
      "disconnect",
      handleDisconnect
    );


    /*
    |--------------------------------------------------------------------------
    | CONNECT SHARED SOCKET
    |--------------------------------------------------------------------------
    */

    if (socket.connected) {

      handleConnect();

    } else {

      socket.connect();

    }


    /*
    |--------------------------------------------------------------------------
    | CLEANUP LISTENERS ONLY
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Do NOT disconnect the shared socket here.
    |
    */

    return () => {

      socket.off(
        "connect",
        handleConnect
      );


      socket.off(
        "notification",
        handleNotification
      );


      socket.off(
        "connect_error",
        handleConnectError
      );


      socket.off(
        "disconnect",
        handleDisconnect
      );

    };

  }, [
    user?._id,
    token
  ]);


  /*
  |--------------------------------------------------------------------------
  | MARK NOTIFICATIONS READ
  |--------------------------------------------------------------------------
  */

  const markAllRead = () => {

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


export const useNotifications = () =>
  useContext(
    NotificationContext
  );
