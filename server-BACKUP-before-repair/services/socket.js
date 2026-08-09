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
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

socket.on("reconnect", (attempt) => {
  console.log(`🔄 Reconnected after ${attempt} attempt(s)`);
});

export default socket;