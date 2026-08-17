import { useEffect } from "react";

import socket from "../socket/socket";


export default function useAdminNotifications() {

  useEffect(() => {

    const handleNewBooking = (data) => {

      console.log(
        "New booking:",
        data
      );

    };


    const handlePaymentReceived = (data) => {

      console.log(
        "Payment:",
        data
      );

    };


    socket.on(
      "newBooking",
      handleNewBooking
    );


    socket.on(
      "paymentReceived",
      handlePaymentReceived
    );


    return () => {

      socket.off(
        "newBooking",
        handleNewBooking
      );


      socket.off(
        "paymentReceived",
        handlePaymentReceived
      );

    };

  }, []);

}
