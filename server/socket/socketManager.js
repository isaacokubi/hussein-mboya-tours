// server/socket/socketManager.js

let io = null;

/*
|--------------------------------------------------------------------------
| ONLINE USERS
|--------------------------------------------------------------------------
|
| Map<UserId, Set<SocketId>>
|
*/

const onlineUsers = new Map();

/*
|--------------------------------------------------------------------------
| INITIALIZE SOCKET SERVER
|--------------------------------------------------------------------------
*/

export const initSocket = (socketServer) => {
    io = socketServer;

    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        /*
        |--------------------------------------------------------------------------
        | REGISTER USER
        |--------------------------------------------------------------------------
        */

        socket.on("register", (userId) => {
            if (!userId) return;

            const id = userId.toString();

            let sockets = onlineUsers.get(id);

            if (!sockets) {
                sockets = new Set();
                onlineUsers.set(id, sockets);
            }

            sockets.add(socket.id);

            socket.userId = id;

            console.log(`✅ User ${id} registered (${socket.id})`);
        });

        /*
        |--------------------------------------------------------------------------
        | JOIN ROOM
        |--------------------------------------------------------------------------
        */

        socket.on("join-room", (room) => {
            socket.join(room);

            console.log(`${socket.id} joined room ${room}`);
        });

        /*
        |--------------------------------------------------------------------------
        | LEAVE ROOM
        |--------------------------------------------------------------------------
        */

        socket.on("leave-room", (room) => {
            socket.leave(room);
        });

        /*
        |--------------------------------------------------------------------------
        | DISCONNECT
        |--------------------------------------------------------------------------
        */

        socket.on("disconnect", () => {
            if (socket.userId) {
                const sockets = onlineUsers.get(socket.userId);

                if (sockets) {
                    sockets.delete(socket.id);

                    if (sockets.size === 0) {
                        onlineUsers.delete(socket.userId);
                    }
                }

                console.log(`❌ User ${socket.userId} disconnected`);
            }

            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

/*
|--------------------------------------------------------------------------
| GET SOCKET SERVER
|--------------------------------------------------------------------------
*/

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};

/*
|--------------------------------------------------------------------------
| REGISTER SOCKET (MANUAL)
|--------------------------------------------------------------------------
*/

export const registerSocket = (userId, socketId) => {
    const id = userId.toString();

    let sockets = onlineUsers.get(id);

    if (!sockets) {
        sockets = new Set();
        onlineUsers.set(id, sockets);
    }

    sockets.add(socketId);
};

/*
|--------------------------------------------------------------------------
| REMOVE SOCKET
|--------------------------------------------------------------------------
*/

export const removeSocket = (userId, socketId = null) => {
    const id = userId.toString();

    if (!onlineUsers.has(id)) return;

    if (!socketId) {
        onlineUsers.delete(id);
        return;
    }

    const sockets = onlineUsers.get(id);

    sockets.delete(socketId);

    if (sockets.size === 0) {
        onlineUsers.delete(id);
    }
};

/*
|--------------------------------------------------------------------------
| GET FIRST SOCKET ID
|--------------------------------------------------------------------------
*/

export const getSocketId = (userId) => {
    const sockets = onlineUsers.get(userId.toString());

    if (!sockets || sockets.size === 0) {
        return null;
    }

    return [...sockets][0];
};

/*
|--------------------------------------------------------------------------
| GET ALL SOCKET IDS
|--------------------------------------------------------------------------
*/

export const getSocketIds = (userId) => {
    return [...(onlineUsers.get(userId.toString()) || [])];
};

/*
|--------------------------------------------------------------------------
| CHECK ONLINE
|--------------------------------------------------------------------------
*/

export const isUserOnline = (userId) => {
    return onlineUsers.has(userId.toString());
};

/*
|--------------------------------------------------------------------------
| GET ONLINE USERS
|--------------------------------------------------------------------------
*/

export const getOnlineUsers = () => {
    return [...onlineUsers.keys()];
};

/*
|--------------------------------------------------------------------------
| SEND EVENT TO USER
|--------------------------------------------------------------------------
*/

export const sendNotificationToUser = (
    userId,
    event,
    data
) => {
    if (!io) return;

    const sockets = onlineUsers.get(userId.toString());

    if (!sockets) return;

    sockets.forEach((socketId) => {
        io.to(socketId).emit(event, data);
    });
};

/*
|--------------------------------------------------------------------------
| BROADCAST EVENT
|--------------------------------------------------------------------------
*/

export const broadcast = (event, data) => {
    if (!io) return;

    io.emit(event, data);
};

/*
|--------------------------------------------------------------------------
| EMIT TO ROOM
|--------------------------------------------------------------------------
*/

export const emitToRoom = (
    room,
    event,
    data
) => {
    if (!io) return;

    io.to(room).emit(event, data);
};

/*
|--------------------------------------------------------------------------
| SOCKET FROM ID
|--------------------------------------------------------------------------
*/

export const getSocketById = (socketId) => {
    if (!io) return null;

    return io.sockets.sockets.get(socketId);
};

/*
|--------------------------------------------------------------------------
| USER FROM SOCKET
|--------------------------------------------------------------------------
*/

export const getUserIdBySocketId = (socketId) => {
    for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socketId)) {
            return userId;
        }
    }

    return null;
};