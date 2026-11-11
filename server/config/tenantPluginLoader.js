/**
 * Purpose: tenant Plugin Loader configuration module. Main declarations: loadTenantPlugin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../utils/tenantIsolationPlugin.js so this module can use its exported dependencies.
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";


// Declare loaded for use by the surrounding module or function.
let loaded = false;


// Define loadTenantPlugin; its parameters and body implement this operation.
export default function loadTenantPlugin(){


// Check the condition (loaded) and run the matching branch.
if(loaded){
    // Return the result to the caller.
    return;
}


// Perform the side effect or state update expressed on the following line.
mongoose.plugin(
    tenantIsolationPlugin
);


// Perform the side effect or state update expressed on the following line.
loaded = true;


// Perform the side effect or state update expressed on the following line.
console.log(
"✅ Global tenant isolation plugin loaded"
);


}
