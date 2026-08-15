import mongoose from "mongoose";


const messageSchema =
new mongoose.Schema({

  role:{
    type:String,
    enum:[
      "user",
      "assistant"
    ],
    required:true
  },


  content:{
    type:String,
    required:true
  },


  createdAt:{
    type:Date,
    default:Date.now
  }

},
{
  _id:false
});


const aiConversationSchema =
new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:false,
    index:true
  },


  sessionId:{
    type:String,
    required:true,
    index:true
  },


  intent:{
    type:String,
    default:"travel"
  },


  selectedTour:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Tour",
    default:null
  },


  bookingStatus:{
    type:String,
    enum:[
      "none",
      "collecting_details",
      "ready",
      "completed"
    ],
    default:"none"
  },


  messages:[
    messageSchema
  ]

},
{
  timestamps:true
});


export default mongoose.model(
  "AIConversation",
  aiConversationSchema
);
