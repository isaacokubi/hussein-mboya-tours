import Quotation from "../models/Quotation.js";

import {
  calculateQuotation
} from "../services/quotationCalculator.js";



/**
 * Create quotation
 * POST /api/agent/quotations
 */
export const createQuotation = async (req, res) => {

  try {


    const agent = req.user.agent;


    if (!agent) {

      return res.status(403).json({

        success:false,
        message:"Agent profile not found"

      });

    }



    const {

      customer,

      tourPackage,

      items,

      discount = 0,

      taxRate = 0,

      notes,

      validUntil


    } = req.body;




    if (
      !customer ||
      !tourPackage ||
      !items ||
      !items.length
    ) {

      return res.status(400).json({

        success:false,

        message:
        "Customer, tour package and items are required"

      });

    }



    const totals = calculateQuotation(

      items,

      discount,

      taxRate

    );




    const quotation = await Quotation.create({

      agent,

      customer,

      tourPackage,

      items,

      ...totals,

      discount,

      taxRate,

      notes,

      validUntil,

      status:"draft"

    });



    res.status(201).json({

      success:true,

      quotation

    });



  }

  catch(error){


    console.error(
      "CREATE QUOTATION ERROR:",
      error
    );


    res.status(500).json({

      success:false,

      message:error.message

    });


  }

};







/**
 * Get agent quotations
 * GET /api/agent/quotations
 */
export const getAgentQuotations = async(req,res)=>{


  try {


    const quotations = await Quotation.find({

      agent:req.user.agent

    })


    .populate(
      "customer",
      "name email phone"
    )


    .populate(
      "tourPackage",
      "name destination price"
    )


    .sort({

      createdAt:-1

    });




    res.json({

      success:true,

      count:quotations.length,

      quotations

    });



  }


  catch(error){


    console.error(
      "GET QUOTATIONS ERROR:",
      error
    );


    res.status(500).json({

      success:false,

      message:error.message

    });


  }


};







/**
 * Get single quotation
 * GET /api/agent/quotations/:id
 */
export const getQuotationById = async(req,res)=>{


try {


const quotation = await Quotation.findOne({

_id:req.params.id,

agent:req.user.agent

})


.populate("customer")

.populate("tourPackage");



if(!quotation){

return res.status(404).json({

success:false,

message:"Quotation not found"

});

}



res.json({

success:true,

quotation

});


}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};







/**
 * Update quotation status
 * PATCH /api/agent/quotations/:id/status
 */
export const updateQuotationStatus = async(req,res)=>{


try {


const allowedStatuses=[

"draft",

"sent",

"approved",

"rejected",

"expired"

];



const {
status
}=req.body;




if(!allowedStatuses.includes(status)){


return res.status(400).json({

success:false,

message:
"Invalid quotation status"

});


}




const quotation = await Quotation.findOneAndUpdate(

{

_id:req.params.id,

agent:req.user.agent

},

{

status

},

{

new:true,

runValidators:true

}

);




if(!quotation){


return res.status(404).json({

success:false,

message:"Quotation not found"

});


}




res.json({

success:true,

quotation

});



}


catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};