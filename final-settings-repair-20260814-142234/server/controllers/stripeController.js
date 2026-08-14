import { getSystemSettings } from "../services/settingsService.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

const stripeRequest = async (path, body) => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method:"POST", headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Stripe request failed");
  return data;
};

export const createStripeSession = async (req,res,next)=>{
  try{
    const booking=await Booking.findOne({_id:req.body.bookingId,$or:[{user:req.user._id},{"customerSnapshot.email":req.user.email}]});
    if(!booking) return res.status(404).json({success:false,message:"Booking not found."});
    const amount=Math.max(0,Number(req.body.amount || booking.balanceAmount || booking.totalAmount || 0));
    if(!amount) return res.status(400).json({success:false,message:"No amount is due for this booking."});
    const currency=String(req.body.currency||"kes").toLowerCase();
    const origin=String(req.body.origin||process.env.CLIENT_URL||"").replace(/\/$/,"");
    const session=await stripeRequest("checkout/sessions",{
      mode:"payment", currency,
      "line_items[0][price_data][currency]":currency,
      "line_items[0][price_data][product_data][name]":`Tour booking ${booking.bookingNumber}`,
      "line_items[0][price_data][unit_amount]":String(Math.round(amount*100)),
      "line_items[0][quantity]":"1",
      success_url:`${origin}/payment-status/${booking._id}?stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url:`${origin}/checkout/${booking.tour}`,
      "metadata[bookingId]":String(booking._id),
      "metadata[userId]":String(req.user._id),
    });
    await Payment.create({customer:req.user._id,user:req.user._id,booking:booking._id,provider:"STRIPE",method:"card",paymentMethod:"Card",amount,currency:currency.toUpperCase(),transactionReference:session.id,notes:"Stripe Checkout session",status:"pending"});
    res.json({success:true,sessionId:session.id,url:session.url});
  }catch(error){next(error);}
};

export const verifyStripeSession = async (req,res,next)=>{
  try{
    const key=process.env.STRIPE_SECRET_KEY; if(!key) return res.status(503).json({success:false,message:"Stripe is not configured."});
    const id=req.params.sessionId;
    const response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${key}`} });
    const session=await response.json(); if(!response.ok) return res.status(400).json({success:false,message:session?.error?.message||"Unable to verify Stripe payment."});
    const booking=await Booking.findOne({_id:session?.metadata?.bookingId,$or:[{user:req.user._id},{"customerSnapshot.email":req.user.email}]});
    if(!booking) return res.status(404).json({success:false,message:"Booking not found."});
    if(session.payment_status==="paid"){
      await Payment.findOneAndUpdate({transactionReference:id},{status:"completed",paidAt:new Date()},{new:true});
      booking.paymentStatus="paid"; booking.status="confirmed"; await booking.save();
    }
    res.json({success:true,paid:session.payment_status==="paid",session});
  }catch(error){next(error);}
};

export const createBankTransferPayment=async(req,res,next)=>{
  try{
    const booking=await Booking.findOne({_id:req.body.bookingId,$or:[{user:req.user._id},{"customerSnapshot.email":req.user.email}]});
    if(!booking) return res.status(404).json({success:false,message:"Booking not found."});
    const amount=Math.max(0,Number(req.body.amount||booking.balanceAmount||booking.totalAmount||0));
    const payment=await Payment.create({customer:req.user._id,user:req.user._id,booking:booking._id,provider:"BANK",method:"bank",paymentMethod:"Bank",amount,currency:settings.currency || "KES",transactionReference:String(req.body.reference||""),notes:String(req.body.notes||"Bank transfer payment awaiting administrator verification"),status:"pending"});
    res.status(201).json({success:true,message:"Bank transfer recorded. The company will verify the transfer and confirm your booking.",payment});
  }catch(error){next(error);}
};