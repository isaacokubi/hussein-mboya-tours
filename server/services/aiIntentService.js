/**
 * Purpose: ai Intent Service business-logic service. Main declarations: detectIntent.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Declare detectIntent for use by the surrounding module or function.
export const detectIntent = (message = "") => {

  // Declare text for use by the surrounding module or function.
  const text = message.toLowerCase();


  // Check the condition (text.includes("book") || text.includes("reserve") || text.includes("bo) and run the matching branch.
  if(
    text.includes("book") ||
    text.includes("reserve") ||
    text.includes("booking")
  ){
    // Return a configured text value to the caller.
    return "BOOKING";
  }


  // Check the condition (text.includes("price") || text.includes("cost") || text.includes("budg) and run the matching branch.
  if(
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("budget")
  ){
    // Return a configured text value to the caller.
    return "PRICE";
  }


  // Check the condition (text.includes("recommend") || text.includes("suggest") || text.include) and run the matching branch.
  if(
    text.includes("recommend") ||
    text.includes("suggest") ||
    text.includes("best")
  ){
    // Return a configured text value to the caller.
    return "RECOMMENDATION";
  }


  // Check the condition (text.includes("where") || text.includes("destination") || text.include) and run the matching branch.
  if(
    text.includes("where") ||
    text.includes("destination") ||
    text.includes("place")
  ){
    // Return a configured text value to the caller.
    return "DESTINATION";
  }


  // Check the condition (text.includes("visa") || text.includes("passport")) and run the matching branch.
  if(
    text.includes("visa") ||
    text.includes("passport")
  ){
    // Return a configured text value to the caller.
    return "TRAVEL_INFO";
  }


  // Return a configured text value to the caller.
  return "GENERAL";

};
