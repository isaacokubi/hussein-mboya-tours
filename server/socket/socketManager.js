// server/socket/socketManager.js


let io = null;


// Store online users
const onlineUsers = new Map();




// ============================================================
// INITIALIZE SOCKET SERVER
// ============================================================

export const initSocket = (socketServer)=>{


io = socketServer;


io.on(

"connection",

(socket)=>{


console.log(
"🔌 Socket connected:",
socket.id
);





socket.on(

"disconnect",

()=>{


for(const [userId, socketId] of onlineUsers.entries()){


if(socketId === socket.id){


onlineUsers.delete(userId);


console.log(

`🧹 Removed user ${userId}`

);


}


}


console.log(

"❌ Socket disconnected:",

socket.id

);


}

);


}

);


return io;


};









// ============================================================
// REGISTER USER SOCKET
// ============================================================

export const registerSocket = (

userId,

socketId

)=>{


onlineUsers.set(

userId.toString(),

socketId

);


};









// ============================================================
// REMOVE USER SOCKET
// ============================================================

export const removeSocket = (

userId

)=>{


onlineUsers.delete(

userId.toString()

);


};









// ============================================================
// GET USER ID BY SOCKET ID
// ============================================================

export const getUserIdBySocketId = (

socketId

)=>{


for(const [userId, id] of onlineUsers.entries()){


if(id === socketId){


return userId;


}


}



return null;


};









// ============================================================
// GET SOCKET INSTANCE
// ============================================================

export const getIO = ()=>{


if(!io){


throw new Error(

"Socket.io not initialized"

);


}


return io;


};









// ============================================================
// SEND NOTIFICATION TO USER
// ============================================================

export const sendNotificationToUser = (

userId,

event,

data

)=>{


if(!io){

return;

}



const socketId = onlineUsers.get(

userId.toString()

);



if(socketId){


const socket = io.sockets.sockets.get(

socketId

);



if(socket){


socket.emit(

event,

data

);


}


}


};