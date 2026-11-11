/**
 * Purpose: etims Note Service business-logic service. Main declarations: adapterUrl, getEtimsNoteConfirmation, isPrivateAddress, assertAdapterUrl, isRetryableEtimsHttpStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load dns/promises so this module can use its exported dependencies.
import dns from "dns/promises";
// Load net so this module can use its exported dependencies.
import net from "net";
// Load ../models/CreditDebitNote.js so this module can use its exported dependencies.
import CreditDebitNote from "../models/CreditDebitNote.js";
// Load ../models/TaxProfile.js so this module can use its exported dependencies.
import TaxProfile from "../models/TaxProfile.js";
// Load ../models/EtimsCredential.js so this module can use its exported dependencies.
import EtimsCredential, { decryptEtimsSecret } from "../models/EtimsCredential.js";
// Load ../models/EtimsSubmission.js so this module can use its exported dependencies.
import EtimsSubmission from "../models/EtimsSubmission.js";
// Load ./jobQueueService.js so this module can use its exported dependencies.
import { enqueueJob } from "./jobQueueService.js";
// Load ./jobRetryService.js so this module can use its exported dependencies.
import { retryDeadJob } from "./jobRetryService.js";

// Declare adapterUrl for use by the surrounding module or function.
const adapterUrl = (profile) => String(profile?.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");
// Define getEtimsNoteConfirmation; its parameters and body implement this operation.
export function getEtimsNoteConfirmation(httpOk, body) {
  // Check the condition (!httpOk || body?.success !== true) and run the matching branch.
  if (!httpOk || body?.success !== true) return null;
  // Declare reference for use by the surrounding module or function.
  const reference = String(body.reference || body.noteNumber || body.etimsReference || "").trim();
  // Declare receiptNumber for use by the surrounding module or function.
  const receiptNumber = String(body.receiptNumber || body.etimsReceiptNumber || "").trim();
  // Return the expression shown below to the caller.
  return reference && receiptNumber ? { reference, receiptNumber } : null;
}
// Declare isPrivateAddress for use by the surrounding module or function.
const isPrivateAddress = (address) => {
  // Check the condition (net.isIPv4(address)) and run the matching branch.
  if (net.isIPv4(address)) { const [a,b] = address.split(".").map(Number); return a===0 || a===10 || a===127 || (a===100&&b>=64&&b<=127) || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&b===0) || (a===192&&b===168) || (a===198&&(b===18||b===19)); }
  // Check the condition (net.isIPv6(address)) and run the matching branch.
  if (net.isIPv6(address)) { const v=address.toLowerCase(); return v==="::" || v==="::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:") || v.startsWith("ff"); }
  // Return the expression shown below to the caller.
  return true;
};
// Declare assertAdapterUrl for use by the surrounding module or function.
const assertAdapterUrl = async (rawUrl) => {
  // Declare parsed for use by the surrounding module or function.
  let parsed; try { parsed = new URL(rawUrl); } catch { throw new Error("Invalid eTIMS adapter URL."); }
  // Check the condition (!["https:","http:"].includes(parsed.protocol)) and run the matching branch.
  if (!["https:","http:"].includes(parsed.protocol)) throw new Error("eTIMS adapter URL must use HTTP(S).");
  // Check the condition (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") and run the matching branch.
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Production eTIMS adapter must use HTTPS.");
  // Check the condition (parsed.username || parsed.password) and run the matching branch.
  if (parsed.username || parsed.password) throw new Error("eTIMS adapter URL must not contain credentials.");
  // Declare host for use by the surrounding module or function.
  const host=parsed.hostname.toLowerCase().replace(/^\[|\]$/g,"");
  // Check the condition (["localhost","localhost.localdomain","metadata.google.internal","metad) and run the matching branch.
  if (["localhost","localhost.localdomain","metadata.google.internal","metadata","host.docker.internal"].includes(host) || (net.isIP(host)&&isPrivateAddress(host))) throw new Error("eTIMS adapter cannot target a private or local address.");
  // Check the condition (!net.isIP(host)) and run the matching branch.
  if (!net.isIP(host)) { const records=await dns.lookup(host,{all:true,verbatim:true}); if(!records.length || records.some(({address})=>isPrivateAddress(address))) throw new Error("eTIMS adapter hostname resolves to a private or local address."); }
  // Return the result of parsed.toString().replace() to the caller.
  return parsed.toString().replace(/\/$/,"");
};
// Declare isRetryableEtimsHttpStatus for use by the surrounding module or function.
const isRetryableEtimsHttpStatus = (status) => {
  // Declare code for use by the surrounding module or function.
  const code = Number(status);
  // Return the expression shown below to the caller.
  return code === 408 || code === 429 || code >= 500;
};
// Declare nextEtimsRetryAt for use by the surrounding module or function.
const nextEtimsRetryAt = (attempt) =>
  new Date(Date.now() + Math.min(1440, 5 * (2 ** Math.min(Number(attempt || 1) - 1, 8))) * 60 * 1000);
// Declare adapterToken for use by the surrounding module or function.
const adapterToken = async (tenantId, environment) => { const credential=await EtimsCredential.findOne({tenantId,environment}).select("+adapterTokenEncrypted").lean(); return credential?.adapterTokenEncrypted ? decryptEtimsSecret(credential.adapterTokenEncrypted) : String(process.env.ETIMS_ADAPTER_TOKEN || ""); };
// Declare enqueueNoteForEtims for use by the surrounding module or function.
export const enqueueNoteForEtims = async (noteId, tenantId, { manualRetry=false }={}) => { if(!noteId||!tenantId) throw new Error("Note and tenant are required for eTIMS queueing."); const idempotencyKey=`etims-note:${noteId}`; if(manualRetry) await retryDeadJob({tenantId,idempotencyKey}); return enqueueJob("etims.credit_debit_note.submit",{noteId:String(noteId),tenantId:String(tenantId)},{tenantId,idempotencyKey}); };

// Declare createSubmissionAudit for use by the surrounding module or function.
const createSubmissionAudit = async ({tenantId,note,attempt,requestHash,idempotencyKey}) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { return await EtimsSubmission.create({tenantId,documentType:note.type,documentId:note._id,documentNumber:note.noteNumber,attempt,status:"pending",idempotencyKey,requestHash}); }
  // Handle the error raised by the preceding protected operation.
  catch(error) { if(error?.code!==11000) throw error; return EtimsSubmission.findOne({tenantId,documentType:note.type,documentId:note._id,attempt}); }
};

// Define processEtimsNoteJob; its parameters and body implement this operation.
export async function processEtimsNoteJob(payload) {
  // Declare note for use by the surrounding module or function.
  const note=await CreditDebitNote.findOne({tenantId:payload.tenantId,_id:payload.noteId}); if(!note) return; if(note.etimsStatus==="synced"&&note.etimsReference) return;
  // Declare profile for use by the surrounding module or function.
  const profile=await TaxProfile.findOne({tenantId:payload.tenantId}).lean(); if(!profile?.etimsEnabled){note.etimsStatus="not_submitted";await note.save();return;}
  // Check the condition (note.type==="credit"&&note.originalInvoiceNumber&&note.etimsSolution&&) and run the matching branch.
  if(note.type==="credit"&&note.originalInvoiceNumber&&note.etimsSolution&&profile.etimsSolution&&note.etimsSolution!==profile.etimsSolution){note.etimsStatus="failed";note.etimsLastError="Credit notes must be generated through the same eTIMS solution used for the original invoice.";await note.save();throw new Error(note.etimsLastError);}
  // Declare configuredUrl for use by the surrounding module or function.
  const configuredUrl=adapterUrl(profile); if(!configuredUrl){note.etimsStatus="failed";note.etimsLastError="No eTIMS adapter is configured.";await note.save();throw new Error(note.etimsLastError);} const url=await assertAdapterUrl(configuredUrl);
  // Declare token for use by the surrounding module or function.
  const token=await adapterToken(payload.tenantId,profile.etimsEnvironment||"sandbox"); note.etimsStatus="pending";note.etimsLastAttemptAt=new Date();note.etimsSubmissionAttempts=Number(note.etimsSubmissionAttempts||0)+1;await note.save();
  // Declare requestPayload for use by the surrounding module or function.
  const requestPayload={noteId:String(note._id),noteNumber:note.noteNumber,type:note.type,originalInvoiceNumber:note.originalInvoiceNumber,originalEtimsInvoiceNumber:note.originalEtimsInvoiceNumber,reason:note.reason,amounts:{amount:note.amount,taxAmount:note.taxAmount,totalAmount:note.totalAmount},taxRate:note.taxRate,seller:{kraPin:profile.kraPin||"",branchId:profile.etimsBranchId||"",branchName:profile.etimsBranchName||"Head Office",deviceId:profile.etimsDeviceId||"",tillId:profile.etimsTillId||""}};
  // Declare requestHash for use by the surrounding module or function.
  const requestHash=crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex"); const attempt=note.etimsSubmissionAttempts; const idempotencyKey=`etims-note:${note._id}`; const audit=await createSubmissionAudit({tenantId:payload.tenantId,note,attempt,requestHash,idempotencyKey});
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare response for use by the surrounding module or function.
    const response=await fetch(`${url}/credit-debit-notes`,{method:"POST",headers:{"content-type":"application/json","x-idempotency-key":idempotencyKey,...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(requestPayload),signal:AbortSignal.timeout(15000)});
    // Declare body for use by the surrounding module or function.
    const body=await response.json().catch(()=>({})); audit.httpStatus=response.status;audit.response=body;
    // Declare confirmation for use by the surrounding module or function.
    const confirmation=getEtimsNoteConfirmation(response.ok,body);
    // Check the condition (!confirmation) and run the matching branch.
    if(!confirmation){note.etimsStatus="failed";note.etimsLastError=String(body?.message||body?.error||(!response.ok?`Adapter returned HTTP ${response.status}`:"Adapter response did not include explicit success and official eTIMS note and receipt references.")).slice(0,2000);const retryable=!response.ok&&isRetryableEtimsHttpStatus(response.status);note.etimsNextRetryAt=retryable?nextEtimsRetryAt(note.etimsSubmissionAttempts):null;audit.status="failed";audit.error=note.etimsLastError;await Promise.all([note.save(),audit.save()]);if(retryable)throw new Error(note.etimsLastError);return;}
    // Perform the side effect or state update expressed on the following line.
    note.etimsStatus="synced";note.etimsReference=confirmation.reference;note.etimsReceiptNumber=confirmation.receiptNumber;note.etimsSubmittedAt=new Date();note.etimsNextRetryAt=null;note.etimsLastError="";note.etimsResponse=body;audit.status="synced";audit.submittedAt=note.etimsSubmittedAt;audit.etimsReference=note.etimsReference;audit.etimsReceiptNumber=note.etimsReceiptNumber;await Promise.all([note.save(),audit.save()]);
  } catch(error){if(audit.status==="pending"){note.etimsStatus="failed";note.etimsLastError=String(error?.message||error||"eTIMS note submission failed").slice(0,2000);note.etimsNextRetryAt=nextEtimsRetryAt(note.etimsSubmissionAttempts);await note.save().catch(()=>undefined);audit.status="failed";audit.error=note.etimsLastError;await audit.save().catch(()=>undefined);}throw error;}
}
