// services/socket.js

import { io } from "socket.io-client";

/*
|--------------------------------------------------------------------------
| SOCKET.IO CLIENT
|--------------------------------------------------------------------------
|
| autoConnect: false
| The app connects only after the user logs in.
|
*/

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,

  transports: ["websocket"],

  reconnection: true,

  reconnectionAttempts: 10,

  reconnectionDelay: 1000,

  timeout: 20000,
});

/*
|--------------------------------------------------------------------------
| CONNECTION EVENTS
|--------------------------------------------------------------------------
*/

socket.on("connect", () => {
  // debug removed
});

socket.on("disconnect", (reason) => {
  // debug removed
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

socket.on("reconnect", (attempt) => {
  // debug removed`);
});

export default socket;