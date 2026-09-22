import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


const messageSchema =
new firestore.Schema({

    tenantId:{
        type: firestore.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },

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
new firestore.Schema({

  user:{
    type:firestore.Schema.Types.ObjectId,
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
    type:firestore.Schema.Types.ObjectId,
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









export default aiConversationSchema.plugin(tenantPlugin);

firestore.model(
  "AIConversation",
  aiConversationSchema
);
