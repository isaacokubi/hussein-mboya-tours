// socket/socketManager.js

const onlineUsers = new Map();

export const registerSocket = (userId,socketId)=>{
    onlineUsers.set(userId,socketId);
};

export const removeSocket = (userId)=>{
    onlineUsers.delete(userId);
};

export const getSocket = (userId)=>{
    return onlineUsers.get(userId);
};