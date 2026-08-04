from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parents[1]


def backup(file):
    backup_file = Path(str(file) + ".backup")

    if not backup_file.exists():
        shutil.copy(file, backup_file)
        print(f"Backup created: {backup_file}")


def write_file(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)

    if path.exists():
        print(f"Exists: {path}")
        return

    path.write_text(content.strip() + "\n")
    print(f"Created: {path}")


# --------------------------------------------------
# ADMIN PAYMENT CONTROLLER
# --------------------------------------------------

write_file(
ROOT / "controllers/adminPaymentController.js",
r'''
import Payment from "../models/Payment.js";


export const getPayments = async(req,res,next)=>{

try{

const page = Number(req.query.page)||1;
const limit = Number(req.query.limit)||20;


const payments =
await Payment.find()
.populate("customer","name email phone")
.populate("booking")
.sort({createdAt:-1})
.skip((page-1)*limit)
.limit(limit);



const total =
await Payment.countDocuments();



res.json({

success:true,

page,

limit,

total,

payments

});


}catch(error){

next(error);

}

};





export const getPaymentStats = async(req,res,next)=>{

try{


const stats =
await Payment.aggregate([

{
$group:{
_id:"$status",
count:{
$sum:1
},
amount:{
$sum:"$amount"
}
}
}

]);



res.json({

success:true,

stats

});


}catch(error){

next(error);

}

};





export const updatePaymentStatus = async(req,res,next)=>{

try{


const payment =
await Payment.findById(req.params.id);


if(!payment){

return res.status(404).json({

success:false,

message:"Payment not found"

});

}


payment.status=req.body.status;


await payment.save();


res.json({

success:true,

payment

});


}catch(error){

next(error);

}

};





export const getPayment = async(req,res,next)=>{

try{


const payment =
await Payment.findById(req.params.id)
.populate("customer")
.populate("booking");


res.json({

success:true,

payment

});


}catch(error){

next(error);

}

};
'''
)



# --------------------------------------------------
# ADMIN PAYMENT ROUTES
# --------------------------------------------------

write_file(
ROOT / "routes/adminPaymentRoutes.js",
r'''
import express from "express";

import {
getPayments,
getPaymentStats,
getPayment,
updatePaymentStatus
}
from "../controllers/adminPaymentController.js";

import {protect}
from "../middleware/authMiddleware.js";

import adminMiddleware
from "../middleware/adminMiddleware.js";


const router=express.Router();


router.use(protect);

router.use(adminMiddleware);



router.get(
"/",
getPayments
);


router.get(
"/stats",
getPaymentStats
);


router.get(
"/:id",
getPayment
);


router.patch(
"/:id/status",
updatePaymentStatus
);



export default router;
'''
)


# --------------------------------------------------
# ROUTE INDEX UPDATE
# --------------------------------------------------

index = ROOT / "routes/index.js"

backup(index)

text=index.read_text()


if 'adminPaymentRoutes' not in text:

    text=text.replace(
'import adminBookingRoutes from "./adminBookingRoutes.js";',
'import adminBookingRoutes from "./adminBookingRoutes.js";\nimport adminPaymentRoutes from "./adminPaymentRoutes.js";'
)


if '"/admin/payments"' not in text:

    text=text.replace(
'router.use(\n  "/admin/bookings",\n  adminBookingRoutes\n);',
'''router.use(
  "/admin/bookings",
  adminBookingRoutes
);


router.use(
  "/admin/payments",
  adminPaymentRoutes
);'''
)


index.write_text(text)


print("ADMIN PAYMENT PATCH COMPLETE")
