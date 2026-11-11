/**
 * Purpose: use Admin Notifications reusable React hook. Main declarations: useAdminNotifications, handleNewBooking, handlePaymentReceived.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect } from "react";

// Load ../socket/socket so this module can use its exported dependencies.
import socket from "../socket/socket";


// Define useAdminNotifications; its parameters and body implement this operation.
export default function useAdminNotifications() {

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {

    // Declare handleNewBooking for use by the surrounding module or function.
    const handleNewBooking = (data) => {

      // Perform the side effect or state update expressed on the following line.
      console.log(
        "New booking:",
        data
      );

    };


    // Declare handlePaymentReceived for use by the surrounding module or function.
    const handlePaymentReceived = (data) => {

      // Perform the side effect or state update expressed on the following line.
      console.log(
        "Payment:",
        data
      );

    };


    // Perform the side effect or state update expressed on the following line.
    socket.on(
      "newBooking",
      handleNewBooking
    );


    // Perform the side effect or state update expressed on the following line.
    socket.on(
      "paymentReceived",
      handlePaymentReceived
    );


    // Return the expression shown below to the caller.
    return () => {

      // Perform the side effect or state update expressed on the following line.
      socket.off(
        "newBooking",
        handleNewBooking
      );


      // Perform the side effect or state update expressed on the following line.
      socket.off(
        "paymentReceived",
        handlePaymentReceived
      );

    };

  }, []);

}
