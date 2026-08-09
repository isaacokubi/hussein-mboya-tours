// services/socketService.js

/*
|--------------------------------------------------------------------------
| SOCKET.IO INSTANCE
|--------------------------------------------------------------------------
*/

let io = null;

/*
|--------------------------------------------------------------------------
| INITIALIZE SOCKET.IO
|--------------------------------------------------------------------------
*/

export const initializeSocket = (socketIO) => {
  io = socketIO;
};

/*
|--------------------------------------------------------------------------
| GET SOCKET INSTANCE
|--------------------------------------------------------------------------
*/

export const getSocket = () => io;

/*
|--------------------------------------------------------------------------
| SEND REALTIME NOTIFICATION
|--------------------------------------------------------------------------
*/

export const sendRealtimeNotification = (
  userId,
  data
) => {
  if (!io) {
    console.warn(
      "Socket.IO has not been initialized."
    );

    return false;
  }

  io.to(userId.toString()).emit(
    "notification",
    data
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| SEND CUSTOM EVENT
|--------------------------------------------------------------------------
*/

export const emitToUser = (
  userId,
  event,
  payload
) => {
  if (!io) return false;

  io.to(userId.toString()).emit(
    event,
    payload
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| BROADCAST EVENT
|--------------------------------------------------------------------------
*/

export const broadcast = (
  event,
  payload
) => {
  if (!io) return false;

  io.emit(event, payload);

  return true;
};