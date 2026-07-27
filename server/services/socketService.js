export const sendRealtimeNotification =
(userId,data)=>{


if(global.io){


global.io
.to(
userId.toString()
)
.emit(

"notification",

data

);


}


};