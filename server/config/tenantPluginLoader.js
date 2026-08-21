import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";


let loaded = false;


export default function loadTenantPlugin(){


if(loaded){
    return;
}


mongoose.plugin(
    tenantIsolationPlugin
);


loaded = true;


console.log(
"✅ Global tenant isolation plugin loaded"
);


}
