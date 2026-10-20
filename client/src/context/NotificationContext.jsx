

// client/src/context/NotificationContext.jsx

// Import React primitives for sharing notification state and running lifecycle effects.
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

// Load persisted notifications from the backend.
import { getNotifications } from "../api/notificationApi";
// Reuse the application's shared Socket.IO connection for live notifications.
import socket from "../socket/socket";

// Read the authenticated user and token before loading private notifications.
import { useAuth } from "./AuthContext";


// Create a context for notification records, unread count and actions.
const NotificationContext =
  createContext();


// Provide notification state and socket event handlers to descendant components.
export function NotificationProvider({
  children
}) {

  // Read identity and authentication token from the auth provider.
  const {
    user,
    token
  } = useAuth();


  // Store the current notification list and its state setter.
  const [
    notifications,
    setNotifications
  ] = useState([]);


  // Store the number of notifications the user has not read.
  const [
    unreadCount,
    setUnreadCount
  ] = useState(0);


  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  // Fetch the latest notifications when the signed-in identity/token changes.
  useEffect(() => {
    // Do not request private notifications when the user is signed out.
    if (
      !user?._id ||
      !token
    ) {
      return;
    }


    // Track cleanup so a late response cannot update an unmounted effect.


    // Request the most recent thirty notifications from the API.
    getNotifications({
      limit: 30
    })

      .then((response) => {

        if (cancelled) {
          return;
        }


        // Read the response list, defaulting to an empty array when absent.
        const items =
          response?.notifications || [];


        // Replace the local list with the server response.
        setNotifications(items);


        // Count only records whose read flag is false.
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


    // Mark this request effect inactive when dependencies change or the provider unmounts.
    // Remove only this provider's listeners during cleanup; the socket is shared.
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

  // Attach live socket listeners only for an authenticated user.
  useEffect(() => {
    // Do not subscribe to private events while signed out.
    if (
      !user?._id ||
      !token
    ) {
      return;
    }


    // Log a successful socket connection for diagnostics.
    const handleConnect = () => {

      console.log(
        "✅ Notification socket connected",
        socket.id
      );



    };


    // Process each incoming notification event from the server.
    const handleNotification = (
      notification
    ) => {

      console.log(
        "📩 Notification received",
        notification
      );


      // Prepend the new item so the newest notification appears first.
      setNotifications(
        (prev) => [
          notification,
          ...prev
        ]
      );


      // Increase the unread count for the newly received notification.
      setUnreadCount(
        (prev) => prev + 1
      );

    };


    // Log socket connection errors so failures can be diagnosed.
    const handleConnectError = (
      error
    ) => {

      console.error(
        "Socket connection error:",
        error?.message || error
      );

    };


    // Log why the shared notification socket disconnected.
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

    // Provide the current auth token to Socket.IO's handshake configuration.
    socket.auth = {
      ...(socket.auth || {}),
      token
    };


    /*
    |--------------------------------------------------------------------------
    | EVENT LISTENERS
    |--------------------------------------------------------------------------
    */

    // Register the connection lifecycle handler.
    socket.on(
      "connect",
      handleConnect
    );


    // Register the handler for live notification payloads.
    socket.on(
      "notification",
      handleNotification
    );


    // Register the handler for connection failures.
    socket.on(
      "connect_error",
      handleConnectError
    );


    // Register the handler for disconnect events.
    socket.on(
      "disconnect",
      handleDisconnect
    );


    /*
    |--------------------------------------------------------------------------
    | CONNECT SHARED SOCKET
    |--------------------------------------------------------------------------
    */

    // Reuse an already-connected socket; otherwise start its connection.
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

  // Mark the displayed notifications as read in local unread-count state.
  const markAllRead = () => {

    setUnreadCount(0);

  };


  // Publish notification state and actions to the component subtree.
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


// Expose the notification context through a reusable React hook.
export const useNotifications = () =>
  useContext(
    NotificationContext
  );
