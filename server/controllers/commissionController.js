import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Commission from "../models/Commission.js";



/*
|--------------------------------------------------------------------------
| GET ALL COMMISSIONS
|--------------------------------------------------------------------------
*/

export const getCommissions = async(req,res)=>{
  requireTenantId();

try{


const commissions =
await Commission.find(tenantFilter(req))

.populate({
path:"agent",
populate:{
path:"user",
select:"name email"
}
})

.populate(
"booking"
)

.sort({
createdAt:-1
});



res.json({

success:true,

data:commissions

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};





/*
|--------------------------------------------------------------------------
| GET AGENT COMMISSIONS
|--------------------------------------------------------------------------
*/

export const getAgentCommissions = async(req,res)=>{

try{


const commissions =
await Commission.find({

agent:req.params.agentId

})

.populate("booking")

.sort({
createdAt:-1
});



res.json({

success:true,

data:commissions

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};


export const approveCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });

    commission.status = "approved";
    commission.approvedBy = req.user._id;
    commission.approvedAt = new Date();
    commission.updatedBy = req.user._id;
    await commission.save();

    return res.json({ success: true, message: "Commission approved.", data: commission });
  } catch (error) {
    next(error);
  }
};

export const payCommission = async (req, res, next) => {
  try {
    const { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } = req.body || {};
    const allowedMethods = ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid commission payment method." });
    }

    const commission = await Commission.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });
    if (!["approved", "processing", "pending"].includes(commission.status)) {
      return res.status(400).json({ success: false, message: "Only an active commission can be paid." });
    }

    commission.status = "paid";
    commission.paymentMethod = paymentMethod;
    commission.paymentReference = String(paymentReference || "").trim();
    commission.transactionId = String(transactionId || "").trim();
    commission.paidAt = new Date();
    commission.updatedBy = req.user._id;
    if (notes) commission.financeNotes = String(notes).trim();
    await commission.save();

    const Agent = (await import("../models/Agent.js")).default;
    const agent = await Agent.findById(commission.agent);
    if (agent) {
      const amount = Number(commission.amount || 0);
      agent.paidCommission = Number(agent.paidCommission || 0) + amount;
      agent.pendingCommission = Math.max(0, Number(agent.pendingCommission || 0) - amount);
      agent.walletBalance = Math.max(0, Number(agent.walletBalance || 0) - amount);
      await agent.save();
    }

    return res.json({ success: true, message: "Commission payment confirmed and recorded.", data: commission });
  } catch (error) {
    next(error);
  }
};
