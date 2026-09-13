import crypto from "crypto";
import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const account = async (tenantId, code) => ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
const ensure = async (tenantId) => {
  const defaults = [
    ["1000","Cash on Hand","asset","cash"],["1010","Bank Account","asset","bank"],["1020","M-Pesa","asset","mobile_money"],["1030","Card / Gateway Clearing","asset","payment_clearing"],["1100","Accounts Receivable","asset","receivable"],["1600","Accumulated Depreciation","asset","contra_asset"],["2000","Accounts Payable","liability","payable"],["2100","VAT / Tax Payable","liability","tax"],["2110","Output VAT","liability","vat_output"],["2120","Input VAT","asset","vat_input"],["2130","Withholding Tax Payable","liability","withholding_tax"],["3000","Owner Equity","equity","equity"],["3100","Retained Earnings","equity","retained_earnings"],["4000","Tour Revenue","revenue","sales"],["4010","Hotel Revenue","revenue","sales"],["4020","Airport Transfer Revenue","revenue","sales"],["4100","Other Revenue","revenue","sales"],["5000","Tour Direct Costs","expense","cost_of_sales"],["5100","Commissions","expense","commission"],["5200","Operating Expenses","expense","operating"],["5300","Depreciation Expense","expense","depreciation"]
  ];
  for (const [code,name,type,subtype] of defaults) await ChartOfAccount.updateOne({tenantId,code},{$setOnInsert:{tenantId,code,name,type,subtype,currency:"KES",active:true,system:true}},{upsert:true});
};

export async function postFinanceEntry({tenantId,sourceType,sourceId,description,reference="",date=new Date(),lines}) {
  if(!tenantId||!sourceId||!sourceType||!description)return null;
  if(!Array.isArray(lines)||lines.length<2)throw new Error("Finance journal entry requires at least two lines.");
  const existing=await JournalEntry.findOne({tenantId,sourceType,sourceId}).lean();if(existing)return existing;
  await ensure(tenantId);const resolved=[];
  for(const line of lines){const acc=await account(tenantId,line.code);if(!acc)throw new Error(`Account ${line.code} is unavailable.`);const debit=money(line.debit),credit=money(line.credit);if(debit<0||credit<0||(debit>0&&credit>0))throw new Error(`Invalid debit/credit values for account ${line.code}.`);resolved.push({account:acc._id,description:line.description||description,debit,credit});}
  const debit=money(resolved.reduce((s,l)=>s+l.debit,0)),credit=money(resolved.reduce((s,l)=>s+l.credit,0));if(debit<=0||Math.abs(debit-credit)>0.01)throw new Error("Finance journal entry is not balanced.");
  try{return await JournalEntry.create({tenantId,sourceType,sourceId,entryDate:date,description,reference,status:"posted",lines:resolved,postedAt:new Date()});}catch(error){if(error?.code===11000)return JournalEntry.findOne({tenantId,sourceType,sourceId}).lean();throw error;}
}
export const postSupplierPayable=(payable)=>postFinanceEntry({tenantId:payable.tenantId,sourceType:"supplier_payable",sourceId:payable._id,description:`Supplier payable ${payable.payableNumber||payable._id}`,reference:payable.paymentReference||payable.payableNumber||"",date:payable.createdAt||new Date(),lines:[{code:"5000",debit:payable.amount,credit:0,description:"Supplier cost accrued"},{code:"2000",debit:0,credit:payable.amount,description:"Accounts payable"}]});
export const postSupplierPayment=({payable,amount,paymentReference})=>{const key=`${payable._id}:${money(amount)}:${String(paymentReference||"").trim()}`,sourceId=crypto.createHash("sha256").update(key).digest("hex").slice(0,24);return postFinanceEntry({tenantId:payable.tenantId,sourceType:"supplier_payable_payment",sourceId,description:`Supplier payable settlement ${paymentReference||payable.payableNumber||payable._id}`,reference:paymentReference||"",lines:[{code:"2000",debit:amount,credit:0,description:"Accounts payable settlement"},{code:"1010",debit:0,credit:amount,description:"Bank settlement"}]});};
export const postCreditDebitNote=(note)=>{const credit=note.type==="credit";const lines=credit?[{code:"4000",debit:note.amount,credit:0,description:"Revenue reversal"},...(Number(note.taxAmount)>0?[{code:"2110",debit:note.taxAmount,credit:0,description:"Output VAT reversal"}]:[]),{code:"1100",debit:0,credit:note.totalAmount,description:"Accounts receivable credit"}]:[{code:"1100",debit:note.totalAmount,credit:0,description:"Accounts receivable debit"},{code:"4000",debit:0,credit:note.amount,description:"Debit note revenue"},...(Number(note.taxAmount)>0?[{code:"2110",debit:0,credit:note.taxAmount,description:"Output VAT"}]:[])];return postFinanceEntry({tenantId:note.tenantId,sourceType:"credit_debit_note",sourceId:note._id,description:`${credit?"Credit":"Debit"} note ${note.noteNumber}`,reference:note.noteNumber,date:note.issuedAt||new Date(),lines});};
