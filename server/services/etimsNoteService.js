import crypto from "crypto";
import dns from "dns/promises";
import net from "net";
import CreditDebitNote from "../models/CreditDebitNote.js";
import TaxProfile from "../models/TaxProfile.js";
import EtimsCredential, { decryptEtimsSecret } from "../models/EtimsCredential.js";
import EtimsSubmission from "../models/EtimsSubmission.js";
import { enqueueJob } from "./jobQueueService.js";
import { retryDeadJob } from "./jobRetryService.js";

const adapterUrl = (profile) => String(profile?.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");
const isPrivateAddress = (address) => {
  if (net.isIPv4(address)) { const [a,b] = address.split(".").map(Number); return a===0 || a===10 || a===127 || (a===100&&b>=64&&b<=127) || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&b===0) || (a===192&&b===168) || (a===198&&(b===18||b===19)); }
  if (net.isIPv6(address)) { const v=address.toLowerCase(); return v==="::" || v==="::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:") || v.startsWith("ff"); }
  return true;
};
const assertAdapterUrl = async (rawUrl) => {
  let parsed; try { parsed = new URL(rawUrl); } catch { throw new Error("Invalid eTIMS adapter URL."); }
  if (!["https:","http:"].includes(parsed.protocol)) throw new Error("eTIMS adapter URL must use HTTP(S).");
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Production eTIMS adapter must use HTTPS.");
  if (parsed.username || parsed.password) throw new Error("eTIMS adapter URL must not contain credentials.");
  const host=parsed.hostname.toLowerCase().replace(/^\[|\]$/g,"");
  if (["localhost","localhost.localdomain","metadata.google.internal","metadata","host.docker.internal"].includes(host) || (net.isIP(host)&&isPrivateAddress(host))) throw new Error("eTIMS adapter cannot target a private or local address.");
  if (!net.isIP(host)) { const records=await dns.lookup(host,{all:true,verbatim:true}); if(!records.length || records.some(({address})=>isPrivateAddress(address))) throw new Error("eTIMS adapter hostname resolves to a private or local address."); }
  return parsed.toString().replace(/\/$/,"");
};
const adapterToken = async (tenantId, environment) => { const credential=await EtimsCredential.findOne({tenantId,environment}).select("+adapterTokenEncrypted").lean(); return credential?.adapterTokenEncrypted ? decryptEtimsSecret(credential.adapterTokenEncrypted) : String(process.env.ETIMS_ADAPTER_TOKEN || ""); };
export const enqueueNoteForEtims = async (noteId, tenantId, { manualRetry=false }={}) => { if(!noteId||!tenantId) throw new Error("Note and tenant are required for eTIMS queueing."); const idempotencyKey=`etims-note:${noteId}`; if(manualRetry) await retryDeadJob({tenantId,idempotencyKey}); return enqueueJob("etims.credit_debit_note.submit",{noteId:String(noteId),tenantId:String(tenantId)},{tenantId,idempotencyKey}); };

const createSubmissionAudit = async ({tenantId,note,attempt,requestHash,idempotencyKey}) => {
  try { return await EtimsSubmission.create({tenantId,documentType:note.type,documentId:note._id,documentNumber:note.noteNumber,attempt,status:"pending",idempotencyKey,requestHash}); }
  catch(error) { if(error?.code!==11000) throw error; return EtimsSubmission.findOne({tenantId,documentType:note.type,documentId:note._id,attempt}); }
};

export async function processEtimsNoteJob(payload) {
  const note=await CreditDebitNote.findOne({tenantId:payload.tenantId,_id:payload.noteId}); if(!note) return; if(note.etimsStatus==="synced"&&note.etimsReference) return;
  const profile=await TaxProfile.findOne({tenantId:payload.tenantId}).lean(); if(!profile?.etimsEnabled){note.etimsStatus="not_submitted";await note.save();return;}
  if(note.type==="credit"&&note.originalInvoiceNumber&&note.etimsSolution&&profile.etimsSolution&&note.etimsSolution!==profile.etimsSolution){note.etimsStatus="failed";note.etimsLastError="Credit notes must be generated through the same eTIMS solution used for the original invoice.";await note.save();throw new Error(note.etimsLastError);}
  const configuredUrl=adapterUrl(profile); if(!configuredUrl){note.etimsStatus="failed";note.etimsLastError="No eTIMS adapter is configured.";await note.save();throw new Error(note.etimsLastError);} const url=await assertAdapterUrl(configuredUrl);
  const token=await adapterToken(payload.tenantId,profile.etimsEnvironment||"sandbox"); note.etimsStatus="pending";note.etimsLastAttemptAt=new Date();note.etimsSubmissionAttempts=Number(note.etimsSubmissionAttempts||0)+1;await note.save();
  const requestPayload={noteId:String(note._id),noteNumber:note.noteNumber,type:note.type,originalInvoiceNumber:note.originalInvoiceNumber,originalEtimsInvoiceNumber:note.originalEtimsInvoiceNumber,reason:note.reason,amounts:{amount:note.amount,taxAmount:note.taxAmount,totalAmount:note.totalAmount},taxRate:note.taxRate,seller:{kraPin:profile.kraPin||"",branchId:profile.etimsBranchId||"",branchName:profile.etimsBranchName||"Head Office",deviceId:profile.etimsDeviceId||"",tillId:profile.etimsTillId||""}};
  const requestHash=crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex"); const attempt=note.etimsSubmissionAttempts; const idempotencyKey=`etims-note:${note._id}`; const audit=await createSubmissionAudit({tenantId:payload.tenantId,note,attempt,requestHash,idempotencyKey});
  try {
    const response=await fetch(`${url}/credit-debit-notes`,{method:"POST",headers:{"content-type":"application/json","x-idempotency-key":idempotencyKey,...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(requestPayload),signal:AbortSignal.timeout(15000)});
    const body=await response.json().catch(()=>({})); audit.httpStatus=response.status;audit.response=body;
    if(!response.ok){note.etimsStatus="failed";note.etimsLastError=String(body?.message||body?.error||`Adapter returned HTTP ${response.status}`).slice(0,2000);const delayMinutes=Math.min(1440,5*(2**Math.min(note.etimsSubmissionAttempts-1,8)));note.etimsNextRetryAt=new Date(Date.now()+delayMinutes*60000);audit.status="failed";audit.error=note.etimsLastError;await Promise.all([note.save(),audit.save()]);throw new Error(note.etimsLastError);}
    note.etimsStatus="synced";note.etimsReference=String(body?.reference||body?.noteNumber||body?.etimsReference||"");note.etimsReceiptNumber=String(body?.receiptNumber||body?.etimsReceiptNumber||"");note.etimsSubmittedAt=new Date();note.etimsNextRetryAt=null;note.etimsLastError="";note.etimsResponse=body;audit.status="synced";audit.submittedAt=note.etimsSubmittedAt;audit.etimsReference=note.etimsReference;audit.etimsReceiptNumber=note.etimsReceiptNumber;await Promise.all([note.save(),audit.save()]);
  } catch(error){if(audit.status==="pending"){audit.status="failed";audit.error=String(error?.message||error).slice(0,2000);await audit.save().catch(()=>undefined);}throw error;}
}
