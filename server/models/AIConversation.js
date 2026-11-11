/**
 * Purpose: AIConversation database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


// Declare messageSchema for use by the surrounding module or function.
const messageSchema =
new mongoose.Schema({

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
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


// Declare aiConversationSchema for use by the surrounding module or function.
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









export default aiConversationSchema.plugin(tenantPlugin);

// Perform the side effect or state update expressed on the following line.
mongoose.model(
  "AIConversation",
  aiConversationSchema
);
