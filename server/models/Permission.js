import mongoose from "mongoose";


const permissionSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true
    },


    label:{
        type:String,
        default:""
    },


    path:{
        type:String,
        default:""
    },


    icon:{
        type:String,
        default:""
    },


    module:{
        type:String,
        default:""
    },


    description:{
        type:String,
        default:""
    }


},{
    timestamps:true
});


export default mongoose.models.Permission ||
mongoose.model(
    "Permission",
    permissionSchema
);