from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parents[1]


def backup(file):

    backup_file = Path(str(file) + ".backup")

    if not backup_file.exists():
        shutil.copy(file, backup_file)
        print("Backup created:", backup_file)



def write_file(path, content):

    path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    if path.exists():
        print("Already exists:", path)
        return

    path.write_text(
        content.strip() + "\n"
    )

    print("Created:", path)





# ==================================================
# SYSTEM HEALTH CONTROLLER
# ==================================================

write_file(

ROOT / "controllers/systemHealthController.js",

r'''
import mongoose from "mongoose";



export const getSystemHealth = async(req,res)=>{

try{


const memory =
process.memoryUsage();



const dbStatus =
mongoose.connection.readyState === 1
? "connected"
: "disconnected";



res.json({

success:true,


system:{


server:"online",


database:dbStatus,


uptime:
Math.floor(process.uptime())+" seconds",



nodeVersion:
process.version,



memory:{


rss:
Math.round(
memory.rss / 1024 / 1024
)+" MB",


heapUsed:
Math.round(
memory.heapUsed / 1024 / 1024
)+" MB"


}



}


});



}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}

};
'''
)






# ==================================================
# SYSTEM HEALTH ROUTES
# ==================================================

write_file(

ROOT / "routes/systemHealthRoutes.js",

r'''
import express from "express";


import {
getSystemHealth
}
from "../controllers/systemHealthController.js";


import {
protect
}
from "../middleware/authMiddleware.js";


import adminMiddleware
from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.use(protect);

router.use(adminMiddleware);



router.get(
"/",
getSystemHealth
);



export default router;
'''
)







# ==================================================
# DASHBOARD ENHANCEMENT
# ==================================================

dashboard = ROOT / "controllers/adminDashboardController.js"


backup(dashboard)


text = dashboard.read_text()



if 'import mongoose from "mongoose";' not in text:

    text = (
        'import mongoose from "mongoose";\n'
        +
        text
    )



if 'recentBookings' not in text:


    insert = r'''




/*
|--------------------------------------------------------------------------
| EXTRA DASHBOARD ANALYTICS
|--------------------------------------------------------------------------
*/


const recentBookings =
await Booking.find()
.sort({
createdAt:-1
})
.limit(5)
.populate(
"customer",
"name email"
)
.populate(
"tour",
"title"
);



const recentUsers =
await User.find()
.sort({
createdAt:-1
})
.limit(5)
.select(
"name email role"
);



const topTours =
await Booking.aggregate([

{
$group:{
_id:"$tour",
bookings:{
$sum:1
}
}
},

{
$sort:{
bookings:-1
}
},

{
$limit:5
}

]);




const monthlyRevenue =
await Payment.aggregate([

{
$match:{
status:{
$in:[
"completed",
"paid"
]
}
}
},

{
$group:{
_id:{
month:{
$month:"$createdAt"
}
},
revenue:{
$sum:"$amount"
}
}
}

]);

'''

    text = text.replace(

"res.status(200).json({",

insert + "\n\nres.status(200).json({"

)



    text = text.replace(

"success:true,",

"success:true,\n\nrecentBookings,\n\nrecentUsers,\n\ntopTours,\n\nmonthlyRevenue,",

1

)



dashboard.write_text(text)



# ==================================================
# UPDATE INDEX
# ==================================================

index = ROOT / "routes/index.js"


backup(index)


text=index.read_text()



if "systemHealthRoutes" not in text:


    text=text.replace(

'import adminRoleRoutes from "./adminRoleRoutes.js";',

'import adminRoleRoutes from "./adminRoleRoutes.js";\nimport systemHealthRoutes from "./systemHealthRoutes.js";'

)



if '"/admin/system-health"' not in text:


    text=text.replace(

'router.use(\n  "/admin/roles",\n  adminRoleRoutes\n);',

'''router.use(
  "/admin/roles",
  adminRoleRoutes
);


router.use(
  "/admin/system-health",
  systemHealthRoutes
);'''

)



index.write_text(text)



print("SYSTEM HEALTH AND DASHBOARD PATCH COMPLETE")
