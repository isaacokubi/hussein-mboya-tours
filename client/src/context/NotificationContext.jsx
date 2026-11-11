/**
 * Purpose: Notification Context React context/provider. Main declarations: NotificationProvider, handleConnect, handleNotification, handleConnectError, handleDisconnect.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */


// client/src/context/NotificationContext.jsx

// Load react so this module can use its exported dependencies.
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

// Load ../api/notificationApi so this module can use its exported dependencies.
import { getNotifications } from "../api/notificationApi";
// Load ../socket/socket so this module can use its exported dependencies.
import socket from "../socket/socket";

// Load ./AuthContext so this module can use its exported dependencies.
import { useAuth } from "./AuthContext";


// Declare NotificationContext for use by the surrounding module or function.
const NotificationContext =
  createContext();


// Define NotificationProvider; its parameters and body implement this operation.
export function NotificationProvider({
  children
}) {

  // Declare { user, token } for use by the surrounding module or function.
  const {
    user,
    token
  } = useAuth();


  // Declare [ notifications, setNotifications ] for use by the surrounding module or function.
  const [
    notifications,
    setNotifications
  ] = useState([]);


  // Declare [ unreadCount, setUnreadCount ] for use by the surrounding module or function.
  const [
    unreadCount,
    setUnreadCount
  ] = useState(0);


  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {

    // Check the condition (!user?._id || !token) and run the matching branch.
    if (
      !user?._id ||
      !token
    ) {
      // Return the result to the caller.
      return;
    }


    // Declare cancelled for use by the surrounding module or function.
    let cancelled = false;


    // Perform the side effect or state update expressed on the following line.
    getNotifications({
      limit: 30
    })

      .then((response) => {

        // Check the condition (cancelled) and run the matching branch.
        if (cancelled) {
          // Return the result to the caller.
          return;
        }


        // Declare items for use by the surrounding module or function.
        const items =
          response?.notifications || [];


        // Perform the side effect or state update expressed on the following line.
        setNotifications(items);


        // Perform the side effect or state update expressed on the following line.
        setUnreadCount(
          items.filter(
            (item) => !item.read
          ).length
        );

      })

      .catch((error) => {

        // Perform the side effect or state update expressed on the following line.
        console.error(
          "Failed to load notifications:",
          error?.message || error
        );

      });


    // Return the expression shown below to the caller.
    return () => {

      // Perform the side effect or state update expressed on the following line.
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

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {

    // Check the condition (!user?._id || !token) and run the matching branch.
    if (
      !user?._id ||
      !token
    ) {
      // Return the result to the caller.
      return;
    }


    // Declare handleConnect for use by the surrounding module or function.
    const handleConnect = () => {

      // Perform the side effect or state update expressed on the following line.
      console.log(
        "✅ Notification socket connected",
        socket.id
      );



    };


    // Declare handleNotification for use by the surrounding module or function.
    const handleNotification = (
      notification
    ) => {

      // Perform the side effect or state update expressed on the following line.
      console.log(
        "📩 Notification received",
        notification
      );


      // Perform the side effect or state update expressed on the following line.
      setNotifications(
        (prev) => [
          notification,
          ...prev
        ]
      );


      // Perform the side effect or state update expressed on the following line.
      setUnreadCount(
        (prev) => prev + 1
      );

    };


    // Declare handleConnectError for use by the surrounding module or function.
    const handleConnectError = (
      error
    ) => {

      // Perform the side effect or state update expressed on the following line.
      console.error(
        "Socket connection error:",
        error?.message || error
      );

    };


    // Declare handleDisconnect for use by the surrounding module or function.
    const handleDisconnect = (
      reason
    ) => {

      // Perform the side effect or state update expressed on the following line.
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

    // Perform the side effect or state update expressed on the following line.
    socket.auth = {
      ...(socket.auth || {}),
      token
    };


    /*
    |--------------------------------------------------------------------------
    | EVENT LISTENERS
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    socket.on(
      "connect",
      handleConnect
    );


    // Perform the side effect or state update expressed on the following line.
    socket.on(
      "notification",
      handleNotification
    );


    // Perform the side effect or state update expressed on the following line.
    socket.on(
      "connect_error",
      handleConnectError
    );


    // Perform the side effect or state update expressed on the following line.
    socket.on(
      "disconnect",
      handleDisconnect
    );


    /*
    |--------------------------------------------------------------------------
    | CONNECT SHARED SOCKET
    |--------------------------------------------------------------------------
    */

    // Check the condition (socket.connected) and run the matching branch.
    if (socket.connected) {

      // Perform the side effect or state update expressed on the following line.
      handleConnect();

    } else {

      // Perform the side effect or state update expressed on the following line.
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

    // Return the expression shown below to the caller.
    return () => {

      // Perform the side effect or state update expressed on the following line.
      socket.off(
        "connect",
        handleConnect
      );


      // Perform the side effect or state update expressed on the following line.
      socket.off(
        "notification",
        handleNotification
      );


      // Perform the side effect or state update expressed on the following line.
      socket.off(
        "connect_error",
        handleConnectError
      );


      // Perform the side effect or state update expressed on the following line.
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

  // Declare markAllRead for use by the surrounding module or function.
  const markAllRead = () => {

    // Perform the side effect or state update expressed on the following line.
    setUnreadCount(0);

  };


  // Return the expression shown below to the caller.
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


// Declare useNotifications for use by the surrounding module or function.
export const useNotifications = () =>
  useContext(
    NotificationContext
  );
